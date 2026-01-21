import { z } from "zod";
const scheduledContent = new Map();
export async function scheduleContent(params) {
    if (params.scheduledFor <= new Date()) {
        return { success: false, error: "Scheduled time must be in the future" };
    }
    if (params.checkConflicts) {
        const conflicts = checkScheduleConflicts({
            platform: params.platform,
            scheduledFor: params.scheduledFor,
            windowMinutes: 15
        });
        if (conflicts.length > 0) {
            return { success: false, conflicts, error: "Schedule conflicts detected" };
        }
    }
    const id = crypto.randomUUID();
    const now = new Date();
    const scheduled = {
        id,
        platform: params.platform,
        type: params.type,
        content: params.content,
        scheduledFor: params.scheduledFor,
        status: "pending",
        createdAt: now
    };
    scheduledContent.set(id, scheduled);
    return { success: true, scheduled };
}
export function checkScheduleConflicts(params) {
    const conflicts = [];
    const targetTime = params.scheduledFor.getTime();
    const windowMs = params.windowMinutes * 60 * 1000;
    const conflictingContent = Array.from(scheduledContent.values()).filter(sc => {
        if (sc.platform !== params.platform || sc.status !== "pending") {
            return false;
        }
        const scheduledTime = sc.scheduledFor.getTime();
        return Math.abs(scheduledTime - targetTime) < windowMs;
    });
    if (conflictingContent.length > 0) {
        conflicts.push({
            time: params.scheduledFor,
            platform: params.platform,
            existingContent: conflictingContent,
            reason: `${conflictingContent.length} post(s) scheduled within ${params.windowMinutes} minutes`
        });
    }
    return conflicts;
}
export async function bulkSchedule(params) {
    const scheduled = [];
    const failed = [];
    const conflictGap = params.conflictGapMinutes || 15;
    for (let i = 0; i < params.posts.length; i++) {
        const post = params.posts[i];
        let scheduledFor = post.scheduledFor;
        if (params.autoResolveConflicts) {
            const conflicts = checkScheduleConflicts({
                platform: post.platform,
                scheduledFor,
                windowMinutes: conflictGap
            });
            while (conflicts.length > 0) {
                scheduledFor = new Date(scheduledFor.getTime() + conflictGap * 60 * 1000);
                conflicts.length = 0;
                conflicts.push(...checkScheduleConflicts({
                    platform: post.platform,
                    scheduledFor,
                    windowMinutes: conflictGap
                }));
            }
        }
        const result = await scheduleContent({
            ...post,
            scheduledFor,
            checkConflicts: !params.autoResolveConflicts
        });
        if (result.success && result.scheduled) {
            scheduled.push(result.scheduled);
        }
        else {
            failed.push({ index: i, error: result.error || "Unknown error" });
        }
    }
    return {
        success: failed.length === 0,
        scheduled,
        failed: failed.length > 0 ? failed : undefined
    };
}
export async function publishScheduledContent(contentId) {
    const content = scheduledContent.get(contentId);
    if (!content) {
        return { success: false, error: "Scheduled content not found" };
    }
    if (content.status !== "pending") {
        return { success: false, error: `Content is ${content.status}` };
    }
    content.status = "published";
    content.publishedAt = new Date();
    scheduledContent.set(contentId, content);
    return { success: true };
}
export async function cancelScheduledContent(contentId) {
    const content = scheduledContent.get(contentId);
    if (!content) {
        return { success: false, error: "Scheduled content not found" };
    }
    if (content.status !== "pending") {
        return { success: false, error: `Cannot cancel ${content.status} content` };
    }
    content.status = "cancelled";
    scheduledContent.set(contentId, content);
    return { success: true };
}
export async function rescheduleContent(params) {
    const content = scheduledContent.get(params.contentId);
    if (!content) {
        return { success: false, error: "Scheduled content not found" };
    }
    if (content.status !== "pending") {
        return { success: false, error: `Cannot reschedule ${content.status} content` };
    }
    if (params.newScheduledFor <= new Date()) {
        return { success: false, error: "New scheduled time must be in the future" };
    }
    content.scheduledFor = params.newScheduledFor;
    scheduledContent.set(params.contentId, content);
    return { success: true, scheduled: content };
}
export function getScheduledContent(params) {
    let result = Array.from(scheduledContent.values());
    if (params?.platform) {
        result = result.filter(c => c.platform === params.platform);
    }
    if (params?.status) {
        result = result.filter(c => c.status === params.status);
    }
    if (params?.startDate) {
        result = result.filter(c => c.scheduledFor >= params.startDate);
    }
    if (params?.endDate) {
        result = result.filter(c => c.scheduledFor <= params.endDate);
    }
    return result.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}
export function getUpcomingContent(hours = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return getScheduledContent({
        status: "pending",
        startDate: now,
        endDate: future
    });
}
export async function processScheduledQueue() {
    const now = new Date();
    const dueContent = Array.from(scheduledContent.values()).filter(c => c.status === "pending" && c.scheduledFor <= now);
    let published = 0;
    let failed = 0;
    for (const content of dueContent) {
        const result = await publishScheduledContent(content.id);
        if (result.success) {
            published++;
        }
        else {
            failed++;
        }
    }
    return {
        processed: dueContent.length,
        published,
        failed
    };
}
export const scheduleContentSchema = {
    platform: z.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform"),
    type: z.enum(["post", "thread", "article", "story", "cast"]).describe("Content type"),
    content: z.any().describe("Content data (platform-specific)"),
    scheduledFor: z.string().describe("ISO date string for scheduling"),
    checkConflicts: z.boolean().optional().describe("Check for scheduling conflicts")
};
export const bulkScheduleSchema = {
    posts: z.array(z.object({
        platform: z.enum(["twitter", "linkedin", "instagram", "farcaster"]),
        type: z.enum(["post", "thread", "article", "story", "cast"]),
        content: z.any(),
        scheduledFor: z.string()
    })).describe("Array of posts to schedule"),
    autoResolveConflicts: z.boolean().optional().describe("Automatically resolve conflicts"),
    conflictGapMinutes: z.number().optional().describe("Minutes between posts to avoid conflicts")
};
export const cancelScheduledContentSchema = {
    contentId: z.string().describe("Scheduled content ID")
};
export const rescheduleContentSchema = {
    contentId: z.string().describe("Scheduled content ID"),
    newScheduledFor: z.string().describe("New ISO date string for scheduling")
};
export const getScheduledContentSchema = {
    platform: z.enum(["twitter", "linkedin", "instagram", "farcaster"]).optional().describe("Filter by platform"),
    status: z.enum(["pending", "published", "failed", "cancelled"]).optional().describe("Filter by status"),
    startDate: z.string().optional().describe("Filter by start date"),
    endDate: z.string().optional().describe("Filter by end date")
};
export const getUpcomingContentSchema = {
    hours: z.number().optional().describe("Hours ahead to look (default 24)")
};
//# sourceMappingURL=scheduler.js.map