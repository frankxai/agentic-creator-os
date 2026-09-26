import { z } from "zod";

export interface ScheduledContent {
  id: string;
  platform: "twitter" | "linkedin" | "instagram" | "farcaster";
  type: "post" | "thread" | "article" | "story" | "cast";
  content: any;
  scheduledFor: Date;
  status: "pending" | "published" | "failed" | "cancelled";
  createdAt: Date;
  publishedAt?: Date;
  error?: string;
}

export interface ScheduleConflict {
  time: Date;
  platform: string;
  existingContent: ScheduledContent[];
  reason: string;
}

const scheduledContent = new Map<string, ScheduledContent>();

export async function scheduleContent(params: {
  platform: "twitter" | "linkedin" | "instagram" | "farcaster";
  type: "post" | "thread" | "article" | "story" | "cast";
  content: any;
  scheduledFor: Date;
  checkConflicts?: boolean;
}): Promise<{ 
  success: boolean; 
  scheduled?: ScheduledContent; 
  conflicts?: ScheduleConflict[];
  error?: string 
}> {
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
  
  const scheduled: ScheduledContent = {
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

export function checkScheduleConflicts(params: {
  platform: string;
  scheduledFor: Date;
  windowMinutes: number;
}): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
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

export async function bulkSchedule(params: {
  posts: Array<{
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    type: "post" | "thread" | "article" | "story" | "cast";
    content: any;
    scheduledFor: Date;
  }>;
  autoResolveConflicts?: boolean;
  conflictGapMinutes?: number;
}): Promise<{
  success: boolean;
  scheduled?: ScheduledContent[];
  failed?: Array<{ index: number; error: string }>;
}> {
  const scheduled: ScheduledContent[] = [];
  const failed: Array<{ index: number; error: string }> = [];
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
    } else {
      failed.push({ index: i, error: result.error || "Unknown error" });
    }
  }
  
  return {
    success: failed.length === 0,
    scheduled,
    failed: failed.length > 0 ? failed : undefined
  };
}

export async function publishScheduledContent(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
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

export async function cancelScheduledContent(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
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

export async function rescheduleContent(params: {
  contentId: string;
  newScheduledFor: Date;
}): Promise<{ success: boolean; scheduled?: ScheduledContent; error?: string }> {
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

export function getScheduledContent(params?: {
  platform?: "twitter" | "linkedin" | "instagram" | "farcaster";
  status?: "pending" | "published" | "failed" | "cancelled";
  startDate?: Date;
  endDate?: Date;
}): ScheduledContent[] {
  let result = Array.from(scheduledContent.values());
  
  if (params?.platform) {
    result = result.filter(c => c.platform === params.platform);
  }
  
  if (params?.status) {
    result = result.filter(c => c.status === params.status);
  }
  
  if (params?.startDate) {
    result = result.filter(c => c.scheduledFor >= params.startDate!);
  }
  
  if (params?.endDate) {
    result = result.filter(c => c.scheduledFor <= params.endDate!);
  }
  
  return result.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}

export function getUpcomingContent(hours: number = 24): ScheduledContent[] {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  return getScheduledContent({
    status: "pending",
    startDate: now,
    endDate: future
  });
}

export async function processScheduledQueue(): Promise<{
  processed: number;
  published: number;
  failed: number;
}> {
  const now = new Date();
  const dueContent = Array.from(scheduledContent.values()).filter(
    c => c.status === "pending" && c.scheduledFor <= now
  );
  
  let published = 0;
  let failed = 0;
  
  for (const content of dueContent) {
    const result = await publishScheduledContent(content.id);
    if (result.success) {
      published++;
    } else {
      failed++;
    }
  }
  
  return {
    processed: dueContent.length,
    published,
    failed
  };
}

const platform = () => z.enum(["twitter", "linkedin", "instagram", "farcaster"]);
const contentType = () => z.enum(["post", "thread", "article", "story", "cast"]);
const isoDate = () => z.string().max(40);
const contentBody = () => z.string().min(1).max(125000);

export const scheduleContentSchema = {
  platform: platform().describe("Platform the content is for"),
  type: contentType().describe("Content type"),
  content: contentBody().describe("The post text, or a JSON-encoded platform payload"),
  scheduledFor: isoDate().describe("ISO 8601 date-time in the future"),
  checkConflicts: z.boolean().optional().describe("Refuse when another item is queued within 15 minutes on the same platform")
};

export const bulkScheduleSchema = {
  posts: z.array(z.object({
    platform: platform().describe("Platform the content is for"),
    type: contentType().describe("Content type"),
    content: contentBody().describe("The post text, or a JSON-encoded platform payload"),
    scheduledFor: isoDate().describe("ISO 8601 date-time in the future")
  })).min(1).max(100).describe("Items to schedule (1-100)"),
  autoResolveConflicts: z.boolean().optional().describe("Shift items that collide with queued content instead of failing them"),
  conflictGapMinutes: z.number().int().min(1).max(1440).optional().describe("Minimum minutes between items on one platform; default 15")
};

export const cancelScheduledContentSchema = {
  contentId: z.string().min(1).max(100).describe("Scheduled content ID")
};

export const rescheduleContentSchema = {
  contentId: z.string().min(1).max(100).describe("Scheduled content ID"),
  newScheduledFor: isoDate().describe("New ISO 8601 date-time in the future")
};

export const getScheduledContentSchema = {
  platform: platform().optional().describe("Only this platform"),
  status: z.enum(["pending", "published", "failed", "cancelled"]).optional().describe("Only this status"),
  startDate: isoDate().optional().describe("Only items scheduled at or after this ISO 8601 date-time"),
  endDate: isoDate().optional().describe("Only items scheduled at or before this ISO 8601 date-time"),
  limit: z.number().int().min(1).max(500).default(50).describe("Maximum items to return")
};

export const getUpcomingContentSchema = {
  hours: z.number().int().min(1).max(720).default(24).describe("Hours ahead to look, 1-720")
};
