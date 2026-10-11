import test from "node:test";
import assert from "node:assert/strict";
import {
  generateSocialWorkflow,
  getUnsentPacket
} from "../mcp-servers/creator/src/social/producer.ts";

test("generateSocialWorkflow creates source-linked complete drafts in a durable unsent packet", async () => {
  const result = await generateSocialWorkflow({
    sourceId: "article-103",
    content: "Building autonomous AI creator OS workflows with GenCreator.",
    revisionSha: "abc123sha",
    platforms: ["twitter", "linkedin"]
  });

  assert.equal(result.success, true);
  assert.ok(result.packet);
  assert.equal(result.packet.status, "unsent");
  assert.equal(result.packet.sourceLink.sourceId, "article-103");
  assert.equal(result.packet.sourceLink.revisionSha, "abc123sha");
  assert.ok(result.packet.drafts.twitter);
  assert.ok(result.packet.drafts.linkedin);

  // Dynamic relative target pathing
  assert.equal(result.packet.drafts.twitter.targetPath, "drafts/social/article-103/twitter.json");

  // Durable store lookup
  const retrieved = getUnsentPacket(result.packet.packetId);
  assert.deepEqual(retrieved, result.packet);
});

test("generateSocialWorkflow verifies exact revision matching", async () => {
  const mismatch = await generateSocialWorkflow({
    sourceId: "article-103",
    content: "Sample content",
    revisionSha: "rev-2",
    expectedRevisionSha: "rev-1"
  });

  assert.equal(mismatch.success, false);
  assert.match(mismatch.error, /Revision mismatch/);

  const match = await generateSocialWorkflow({
    sourceId: "article-103",
    content: "Sample content",
    revisionSha: "rev-1",
    expectedRevisionSha: "rev-1"
  });

  assert.equal(match.success, true);
  assert.ok(match.packet);
});

test("generateSocialWorkflow uses relative paths and dynamic scheduling without hardcoded values", async () => {
  const baseDate = new Date("2026-11-01T12:00:00Z");
  const result = await generateSocialWorkflow({
    sourceId: "custom-doc",
    content: "Custom workflow text",
    revisionSha: "rev-100",
    targetPath: "custom/output/dir",
    baseScheduledDate: baseDate,
    platforms: ["twitter", "linkedin"]
  });

  assert.equal(result.success, true);
  assert.ok(result.packet);
  assert.equal(result.packet.drafts.twitter.targetPath, "custom/output/dir/twitter_draft.json");
  assert.equal(result.packet.drafts.twitter.scheduledFor, "2026-11-01T12:00:00.000Z");
  assert.equal(result.packet.drafts.linkedin.scheduledFor, "2026-11-01T12:30:00.000Z");
});
