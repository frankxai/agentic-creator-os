import { z } from "zod";

export interface SourceDraftLink {
  sourceId: string;
  revisionSha: string;
  title?: string;
}

export interface UnsentPacket {
  packetId: string;
  sourceLink: SourceDraftLink;
  status: "unsent" | "sent" | "failed";
  drafts: Record<string, {
    platform: string;
    content: string;
    scheduledFor?: string;
    targetPath?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const unsentPackets = new Map<string, UnsentPacket>();

export function getUnsentPacket(packetId: string): UnsentPacket | undefined {
  return unsentPackets.get(packetId);
}

export function listUnsentPackets(): UnsentPacket[] {
  return Array.from(unsentPackets.values());
}

export async function generateSocialWorkflow(params: {
  sourceId: string;
  content: string;
  revisionSha: string;
  expectedRevisionSha?: string;
  platforms?: Array<"twitter" | "linkedin" | "instagram" | "farcaster">;
  targetPath?: string;
  baseScheduledDate?: Date;
}): Promise<{
  success: boolean;
  packet?: UnsentPacket;
  error?: string;
}> {
  const { sourceId, content, revisionSha, expectedRevisionSha, platforms = ["twitter", "linkedin"], targetPath, baseScheduledDate } = params;

  if (expectedRevisionSha && revisionSha !== expectedRevisionSha) {
    return {
      success: false,
      error: `Revision mismatch: source revision ${revisionSha} does not match expected revision ${expectedRevisionSha}`
    };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Content body cannot be empty" };
  }

  const packetId = crypto.randomUUID();
  const now = new Date();
  const baseTime = baseScheduledDate ? new Date(baseScheduledDate) : new Date(now.getTime() + 3600 * 1000);

  const drafts: UnsentPacket["drafts"] = {};
  const cleanSourceId = sourceId.replace(/[^a-zA-Z0-9_-]/g, "_");

  platforms.forEach((platform, idx) => {
    // Dynamic offset per platform based on base time (no hardcoded universal posting time)
    const scheduledTime = new Date(baseTime.getTime() + idx * 1800 * 1000).toISOString();
    // Dynamic pathing relative to clean source id (no fixed machine paths like /Users/...)
    const relativePath = targetPath ? `${targetPath}/${platform}_draft.json` : `drafts/social/${cleanSourceId}/${platform}.json`;

    let draftText = content.slice(0, 280);
    if (platform === "twitter") {
      draftText = content.length > 280 ? `${content.slice(0, 277)}...` : content;
    } else if (platform === "linkedin") {
      draftText = content.length > 3000 ? `${content.slice(0, 2997)}...` : content;
    }

    drafts[platform] = {
      platform,
      content: draftText,
      scheduledFor: scheduledTime,
      targetPath: relativePath
    };
  });

  const packet: UnsentPacket = {
    packetId,
    sourceLink: {
      sourceId,
      revisionSha
    },
    status: "unsent",
    drafts,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  unsentPackets.set(packetId, packet);

  return {
    success: true,
    packet
  };
}

export const generateSocialWorkflowSchema = {
  sourceId: z.string().min(1).max(100).describe("Source article or document ID"),
  content: z.string().min(1).max(500000).describe("Source text to generate social drafts from"),
  revisionSha: z.string().min(1).max(100).describe("Current revision SHA of the source document"),
  expectedRevisionSha: z.string().max(100).optional().describe("Expected revision SHA for exact-revision check"),
  platforms: z.array(z.enum(["twitter", "linkedin", "instagram", "farcaster"])).max(10).optional().describe("Platforms to generate drafts for"),
  targetPath: z.string().max(250).optional().describe("Optional relative directory path for draft output")
};
