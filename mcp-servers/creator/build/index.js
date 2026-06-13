// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z as z7 } from "zod";

// src/social/twitter.ts
import { z } from "zod";
var tweets = /* @__PURE__ */ new Map();
var threads = /* @__PURE__ */ new Map();
var rateLimits = {
  tweets: { limit: 50, remaining: 50, resetAt: Date.now() + 15 * 60 * 1e3 },
  reads: { limit: 180, remaining: 180, resetAt: Date.now() + 15 * 60 * 1e3 }
};
function checkRateLimit(type) {
  const limit = rateLimits[type];
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 15 * 60 * 1e3;
  }
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1e3);
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  limit.remaining--;
  return { allowed: true, resetIn };
}
async function postTweet(params) {
  const rateCheck = checkRateLimit("tweets");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${rateCheck.resetIn} seconds.`
    };
  }
  if (params.text.length > 280) {
    return {
      success: false,
      error: `Tweet exceeds 280 characters (${params.text.length} characters)`
    };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const tweet = {
    id,
    text: params.text,
    authorId: "user",
    // Replace with actual user ID
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    replyToId: params.replyToId,
    metrics: {
      impressions: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      engagementRate: 0
    }
  };
  tweets.set(id, tweet);
  return { success: true, tweet };
}
async function createThread(params) {
  if (params.tweets.length === 0) {
    return { success: false, error: "Thread must contain at least one tweet" };
  }
  for (let i = 0; i < params.tweets.length; i++) {
    if (params.tweets[i].length > 280) {
      return {
        success: false,
        error: `Tweet ${i + 1} exceeds 280 characters (${params.tweets[i].length} characters)`
      };
    }
  }
  const threadId = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const threadTweets = [];
  for (let i = 0; i < params.tweets.length; i++) {
    const tweetId = crypto.randomUUID();
    const tweet = {
      id: tweetId,
      text: params.tweets[i],
      authorId: "user",
      createdAt: now,
      scheduledFor: params.scheduledFor,
      status: params.scheduledFor ? "scheduled" : "published",
      replyToId: i > 0 ? threadTweets[i - 1].id : void 0,
      threadId,
      metrics: {
        impressions: 0,
        likes: 0,
        retweets: 0,
        replies: 0,
        engagementRate: 0
      }
    };
    tweets.set(tweetId, tweet);
    threadTweets.push(tweet);
  }
  const thread = {
    id: threadId,
    tweets: threadTweets,
    status: params.scheduledFor ? "scheduled" : "published",
    createdAt: now,
    scheduledFor: params.scheduledFor
  };
  threads.set(threadId, thread);
  return { success: true, thread };
}
async function getTweetAnalytics(tweetId) {
  const rateCheck = checkRateLimit("reads");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${rateCheck.resetIn} seconds.`
    };
  }
  const tweet = tweets.get(tweetId);
  if (!tweet) {
    return { success: false, error: "Tweet not found" };
  }
  const analytics = tweet.metrics || {
    impressions: Math.floor(Math.random() * 1e4),
    likes: Math.floor(Math.random() * 500),
    retweets: Math.floor(Math.random() * 100),
    replies: Math.floor(Math.random() * 50),
    engagementRate: 0
  };
  analytics.engagementRate = (analytics.likes + analytics.retweets + analytics.replies) / analytics.impressions * 100;
  tweet.metrics = analytics;
  tweets.set(tweetId, tweet);
  return { success: true, analytics };
}
var postTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text (max 280 characters)"),
  mediaUrls: z.array(z.string().url()).optional().describe("Media URLs to attach"),
  replyToId: z.string().optional().describe("Tweet ID to reply to"),
  scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};
var createThreadSchema = {
  tweets: z.array(z.string().min(1).max(280)).min(1).describe("Array of tweet texts"),
  scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};
var getTweetAnalyticsSchema = {
  tweetId: z.string().describe("Tweet ID")
};
var getThreadAnalyticsSchema = {
  threadId: z.string().describe("Thread ID")
};
var scheduleTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text"),
  scheduledFor: z.string().describe("ISO date string for scheduling"),
  mediaUrls: z.array(z.string().url()).optional().describe("Media URLs")
};
var deleteTweetSchema = {
  tweetId: z.string().describe("Tweet ID to delete")
};

// src/social/linkedin.ts
import { z as z2 } from "zod";
var posts = /* @__PURE__ */ new Map();
var articles = /* @__PURE__ */ new Map();
var rateLimits2 = {
  posts: { limit: 100, remaining: 100, resetAt: Date.now() + 24 * 60 * 60 * 1e3 },
  reads: { limit: 500, remaining: 500, resetAt: Date.now() + 24 * 60 * 60 * 1e3 }
};
function checkRateLimit2(type) {
  const limit = rateLimits2[type];
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 24 * 60 * 60 * 1e3;
  }
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1e3);
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  limit.remaining--;
  return { allowed: true, resetIn };
}
async function createPost(params) {
  const rateCheck = checkRateLimit2("posts");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  if (params.text.length > 3e3) {
    return {
      success: false,
      error: `Post exceeds 3000 characters (${params.text.length} characters)`
    };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const post = {
    id,
    text: params.text,
    authorId: "user",
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    visibility: params.visibility || "public",
    metrics: {
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clickThroughRate: 0
    }
  };
  posts.set(id, post);
  return { success: true, post };
}
async function createArticle(params) {
  const rateCheck = checkRateLimit2("posts");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  if (params.title.length > 150) {
    return {
      success: false,
      error: `Title exceeds 150 characters (${params.title.length} characters)`
    };
  }
  if (params.content.length > 125e3) {
    return {
      success: false,
      error: `Content exceeds 125,000 characters (${params.content.length} characters)`
    };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const wordCount = params.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  const article = {
    id,
    title: params.title,
    content: params.content,
    authorId: "user",
    createdAt: now,
    publishedAt: params.publishNow ? now : void 0,
    status: params.publishNow ? "published" : "draft",
    coverImageUrl: params.coverImageUrl,
    tags: params.tags || [],
    metrics: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      readTime
    }
  };
  articles.set(id, article);
  return { success: true, article };
}
async function getPostAnalytics(postId) {
  const rateCheck = checkRateLimit2("reads");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  const post = posts.get(postId);
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  const analytics = post.metrics || {
    impressions: Math.floor(Math.random() * 5e4),
    likes: Math.floor(Math.random() * 2e3),
    comments: Math.floor(Math.random() * 200),
    shares: Math.floor(Math.random() * 500),
    clickThroughRate: 0
  };
  analytics.clickThroughRate = (analytics.likes + analytics.comments + analytics.shares) / analytics.impressions * 100;
  post.metrics = analytics;
  posts.set(postId, post);
  return { success: true, analytics };
}
var createPostSchema = {
  text: z2.string().min(1).max(3e3).describe("Post text (max 3000 characters)"),
  mediaUrls: z2.array(z2.string().url()).optional().describe("Media URLs to attach"),
  visibility: z2.enum(["public", "connections", "private"]).optional().describe("Post visibility"),
  scheduledFor: z2.string().optional().describe("ISO date string for scheduling")
};
var createArticleSchema = {
  title: z2.string().min(1).max(150).describe("Article title (max 150 characters)"),
  content: z2.string().min(1).max(125e3).describe("Article content (max 125,000 characters)"),
  coverImageUrl: z2.string().url().optional().describe("Cover image URL"),
  tags: z2.array(z2.string()).optional().describe("Article tags"),
  publishNow: z2.boolean().optional().describe("Publish immediately")
};
var publishArticleSchema = {
  articleId: z2.string().describe("Article ID to publish")
};
var getPostAnalyticsSchema = {
  postId: z2.string().describe("Post ID")
};
var getArticleAnalyticsSchema = {
  articleId: z2.string().describe("Article ID")
};
var schedulePostSchema = {
  text: z2.string().min(1).max(3e3).describe("Post text"),
  scheduledFor: z2.string().describe("ISO date string for scheduling"),
  mediaUrls: z2.array(z2.string().url()).optional().describe("Media URLs"),
  visibility: z2.enum(["public", "connections", "private"]).optional().describe("Post visibility")
};
var deletePostSchema = {
  postId: z2.string().describe("Post ID to delete")
};
var deleteArticleSchema = {
  articleId: z2.string().describe("Article ID to delete")
};

// src/social/instagram.ts
import { z as z3 } from "zod";
var posts2 = /* @__PURE__ */ new Map();
var stories = /* @__PURE__ */ new Map();
var rateLimits3 = {
  posts: { limit: 25, remaining: 25, resetAt: Date.now() + 24 * 60 * 60 * 1e3 },
  stories: { limit: 100, remaining: 100, resetAt: Date.now() + 24 * 60 * 60 * 1e3 },
  reads: { limit: 200, remaining: 200, resetAt: Date.now() + 60 * 60 * 1e3 }
};
function checkRateLimit3(type) {
  const limit = rateLimits3[type];
  if (Date.now() > limit.resetAt) {
    const resetDuration = type === "reads" ? 60 * 60 * 1e3 : 24 * 60 * 60 * 1e3;
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + resetDuration;
  }
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1e3);
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  limit.remaining--;
  return { allowed: true, resetIn };
}
async function createPost2(params) {
  const rateCheck = checkRateLimit3("posts");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  if (params.caption.length > 2200) {
    return {
      success: false,
      error: `Caption exceeds 2200 characters (${params.caption.length} characters)`
    };
  }
  if (params.mediaUrls.length === 0) {
    return { success: false, error: "At least one media URL is required" };
  }
  const type = params.type || (params.mediaUrls.length > 1 ? "carousel" : "feed");
  if (type === "carousel" && params.mediaUrls.length > 10) {
    return { success: false, error: "Carousel posts can have maximum 10 media items" };
  }
  if (type === "reel" && params.mediaUrls.length > 1) {
    return { success: false, error: "Reels can only have one video" };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const post = {
    id,
    caption: params.caption,
    authorId: "user",
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    type,
    location: params.location,
    tags: params.tags,
    metrics: {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      engagementRate: 0
    }
  };
  posts2.set(id, post);
  return { success: true, post };
}
async function createStory(params) {
  const rateCheck = checkRateLimit3("stories");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
  const story = {
    id,
    authorId: "user",
    createdAt: now,
    expiresAt,
    mediaUrl: params.mediaUrl,
    type: params.type,
    link: params.link,
    stickers: params.stickers,
    metrics: {
      impressions: 0,
      reach: 0,
      replies: 0,
      exits: 0,
      taps_forward: 0,
      taps_back: 0
    }
  };
  stories.set(id, story);
  return { success: true, story };
}
async function getPostAnalytics2(postId) {
  const rateCheck = checkRateLimit3("reads");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  const post = posts2.get(postId);
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  const analytics = post.metrics || {
    impressions: Math.floor(Math.random() * 1e5),
    reach: Math.floor(Math.random() * 8e4),
    likes: Math.floor(Math.random() * 5e3),
    comments: Math.floor(Math.random() * 500),
    saves: Math.floor(Math.random() * 1e3),
    shares: Math.floor(Math.random() * 200),
    engagementRate: 0
  };
  analytics.engagementRate = (analytics.likes + analytics.comments + analytics.saves + analytics.shares) / analytics.reach * 100;
  post.metrics = analytics;
  posts2.set(postId, post);
  return { success: true, analytics };
}
var createPostSchema2 = {
  caption: z3.string().min(1).max(2200).describe("Post caption (max 2200 characters)"),
  mediaUrls: z3.array(z3.string().url()).min(1).max(10).describe("Media URLs (1-10 items)"),
  type: z3.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
  location: z3.string().optional().describe("Location tag"),
  tags: z3.array(z3.string()).optional().describe("Hashtags and mentions"),
  scheduledFor: z3.string().optional().describe("ISO date string for scheduling")
};
var createStorySchema = {
  mediaUrl: z3.string().url().describe("Story media URL"),
  type: z3.enum(["image", "video"]).describe("Media type"),
  link: z3.string().url().optional().describe("Swipe-up link"),
  stickers: z3.array(z3.object({
    type: z3.enum(["mention", "hashtag", "location", "poll", "question"]),
    data: z3.any()
  })).optional().describe("Story stickers")
};
var getPostAnalyticsSchema2 = {
  postId: z3.string().describe("Post ID")
};
var getStoryAnalyticsSchema = {
  storyId: z3.string().describe("Story ID")
};
var schedulePostSchema2 = {
  caption: z3.string().min(1).max(2200).describe("Post caption"),
  mediaUrls: z3.array(z3.string().url()).min(1).max(10).describe("Media URLs"),
  scheduledFor: z3.string().describe("ISO date string for scheduling"),
  type: z3.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
  location: z3.string().optional().describe("Location tag"),
  tags: z3.array(z3.string()).optional().describe("Hashtags and mentions")
};
var deletePostSchema2 = {
  postId: z3.string().describe("Post ID to delete")
};

// src/social/farcaster.ts
import { z as z4 } from "zod";
var casts = /* @__PURE__ */ new Map();
var frames = /* @__PURE__ */ new Map();
var rateLimits4 = {
  casts: { limit: 100, remaining: 100, resetAt: Date.now() + 60 * 60 * 1e3 },
  reads: { limit: 1e3, remaining: 1e3, resetAt: Date.now() + 60 * 60 * 1e3 }
};
function checkRateLimit4(type) {
  const limit = rateLimits4[type];
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 60 * 60 * 1e3;
  }
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1e3);
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  limit.remaining--;
  return { allowed: true, resetIn };
}
async function createCast(params) {
  const rateCheck = checkRateLimit4("casts");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  if (params.text.length > 320) {
    return {
      success: false,
      error: `Cast exceeds 320 characters (${params.text.length} characters)`
    };
  }
  if (params.embeds && params.embeds.length > 2) {
    return { success: false, error: "Maximum 2 embeds per cast" };
  }
  const id = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const cast = {
    id,
    text: params.text,
    authorFid: 1,
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    parentCastId: params.parentCastId,
    channelId: params.channelId,
    embeds: params.embeds,
    mentions: params.mentions,
    metrics: {
      reactions: 0,
      recasts: 0,
      replies: 0,
      watches: 0
    }
  };
  casts.set(id, cast);
  return { success: true, cast };
}
async function createThread2(params) {
  if (params.casts.length === 0) {
    return { success: false, error: "Thread must contain at least one cast" };
  }
  for (let i = 0; i < params.casts.length; i++) {
    if (params.casts[i].length > 320) {
      return {
        success: false,
        error: `Cast ${i + 1} exceeds 320 characters (${params.casts[i].length} characters)`
      };
    }
  }
  const thread = [];
  for (let i = 0; i < params.casts.length; i++) {
    const result = await createCast({
      text: params.casts[i],
      parentCastId: i > 0 ? thread[i - 1].id : void 0,
      channelId: params.channelId,
      scheduledFor: params.scheduledFor
    });
    if (!result.success || !result.cast) {
      return { success: false, error: result.error };
    }
    thread.push(result.cast);
  }
  return { success: true, thread };
}
async function createFrame(params) {
  const cast = casts.get(params.castId);
  if (!cast) {
    return { success: false, error: "Cast not found" };
  }
  if (params.buttons.length === 0 || params.buttons.length > 4) {
    return { success: false, error: "Frame must have 1-4 buttons" };
  }
  const id = crypto.randomUUID();
  const frame = {
    id,
    castId: params.castId,
    version: "vNext",
    imageUrl: params.imageUrl,
    buttons: params.buttons,
    inputText: params.inputText,
    postUrl: params.postUrl,
    state: params.state
  };
  frames.set(id, frame);
  return { success: true, frame };
}
async function getCastAnalytics(castId) {
  const rateCheck = checkRateLimit4("reads");
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  const cast = casts.get(castId);
  if (!cast) {
    return { success: false, error: "Cast not found" };
  }
  const analytics = cast.metrics || {
    reactions: Math.floor(Math.random() * 1e3),
    recasts: Math.floor(Math.random() * 200),
    replies: Math.floor(Math.random() * 100),
    watches: Math.floor(Math.random() * 5e3)
  };
  cast.metrics = analytics;
  casts.set(castId, cast);
  return { success: true, analytics };
}
var createCastSchema = {
  text: z4.string().min(1).max(320).describe("Cast text (max 320 characters)"),
  parentCastId: z4.string().optional().describe("Parent cast ID for replies"),
  channelId: z4.string().optional().describe("Channel ID to post in"),
  embeds: z4.array(z4.object({
    type: z4.enum(["url", "image", "video", "frame"]),
    url: z4.string().url()
  })).max(2).optional().describe("Embeds (max 2)"),
  mentions: z4.array(z4.number()).optional().describe("FIDs to mention"),
  scheduledFor: z4.string().optional().describe("ISO date string for scheduling")
};
var createThreadSchema2 = {
  casts: z4.array(z4.string().min(1).max(320)).min(1).describe("Array of cast texts"),
  channelId: z4.string().optional().describe("Channel ID to post in"),
  scheduledFor: z4.string().optional().describe("ISO date string for scheduling")
};
var createFrameSchema = {
  castId: z4.string().describe("Cast ID to attach frame to"),
  imageUrl: z4.string().url().describe("Frame image URL"),
  buttons: z4.array(z4.object({
    label: z4.string(),
    action: z4.enum(["post", "post_redirect", "link", "mint"]),
    target: z4.string().optional()
  })).min(1).max(4).describe("Frame buttons (1-4)"),
  inputText: z4.string().optional().describe("Input field placeholder"),
  postUrl: z4.string().url().optional().describe("Post action URL"),
  state: z4.string().optional().describe("Frame state")
};
var getCastAnalyticsSchema = {
  castId: z4.string().describe("Cast ID")
};
var createChannelSchema = {
  name: z4.string().min(1).max(50).describe("Channel name (max 50 characters)"),
  description: z4.string().describe("Channel description"),
  imageUrl: z4.string().url().optional().describe("Channel image URL")
};
var postToChannelSchema = {
  channelId: z4.string().describe("Channel ID"),
  text: z4.string().min(1).max(320).describe("Cast text"),
  embeds: z4.array(z4.object({
    type: z4.enum(["url", "image", "video", "frame"]),
    url: z4.string().url()
  })).max(2).optional().describe("Embeds")
};
var scheduleCastSchema = {
  text: z4.string().min(1).max(320).describe("Cast text"),
  scheduledFor: z4.string().describe("ISO date string for scheduling"),
  channelId: z4.string().optional().describe("Channel ID"),
  embeds: z4.array(z4.object({
    type: z4.enum(["url", "image", "video", "frame"]),
    url: z4.string().url()
  })).max(2).optional().describe("Embeds")
};
var deleteCastSchema = {
  castId: z4.string().describe("Cast ID to delete")
};

// src/social/analytics.ts
import { z as z5 } from "zod";
async function getAggregatedAnalytics(params) {
  const platforms = params.platforms || ["twitter", "linkedin", "instagram", "farcaster"];
  const platformMetrics = [];
  let totalPosts = 0;
  let totalImpressions = 0;
  let totalEngagements = 0;
  for (const platform of platforms) {
    const metrics = {
      platform,
      totalPosts: Math.floor(Math.random() * 100),
      totalImpressions: Math.floor(Math.random() * 1e5),
      totalEngagements: Math.floor(Math.random() * 5e3),
      avgEngagementRate: Math.random() * 10,
      topPost: {
        id: crypto.randomUUID(),
        text: `Top post on ${platform}`,
        engagementRate: Math.random() * 15
      }
    };
    platformMetrics.push(metrics);
    totalPosts += metrics.totalPosts;
    totalImpressions += metrics.totalImpressions;
    totalEngagements += metrics.totalEngagements;
  }
  const bestPlatform = platformMetrics.reduce(
    (best, current) => current.avgEngagementRate > best.avgEngagementRate ? current : best,
    platformMetrics[0]
  );
  const recommendations = generateRecommendations(platformMetrics);
  const analytics = {
    period: {
      start: params.startDate,
      end: params.endDate
    },
    platforms: platformMetrics,
    totals: {
      posts: totalPosts,
      impressions: totalImpressions,
      engagements: totalEngagements,
      avgEngagementRate: totalImpressions > 0 ? totalEngagements / totalImpressions * 100 : 0
    },
    bestPerformingPlatform: bestPlatform.platform,
    recommendations
  };
  return { success: true, analytics };
}
function generateRecommendations(metrics) {
  const recommendations = [];
  const sortedByEngagement = [...metrics].sort(
    (a, b) => b.avgEngagementRate - a.avgEngagementRate
  );
  if (sortedByEngagement.length > 0) {
    const best = sortedByEngagement[0];
    recommendations.push(
      `Focus more on ${best.platform} - it has the highest engagement rate at ${best.avgEngagementRate.toFixed(2)}%`
    );
  }
  const lowPerformers = metrics.filter((m) => m.avgEngagementRate < 2);
  if (lowPerformers.length > 0) {
    recommendations.push(
      `Consider improving content strategy for: ${lowPerformers.map((p) => p.platform).join(", ")}`
    );
  }
  const highImpressionLowEngagement = metrics.filter(
    (m) => m.totalImpressions > 1e4 && m.avgEngagementRate < 3
  );
  if (highImpressionLowEngagement.length > 0) {
    recommendations.push(
      `High reach but low engagement on ${highImpressionLowEngagement[0].platform} - try more interactive content`
    );
  }
  return recommendations;
}
async function getBestPostingTimes(params) {
  const times = [
    { dayOfWeek: "Monday", hour: 9, score: 8.5 },
    { dayOfWeek: "Monday", hour: 12, score: 7.2 },
    { dayOfWeek: "Tuesday", hour: 10, score: 9.1 },
    { dayOfWeek: "Wednesday", hour: 14, score: 8.8 },
    { dayOfWeek: "Thursday", hour: 11, score: 9.3 },
    { dayOfWeek: "Friday", hour: 15, score: 7.9 }
  ];
  return { success: true, times };
}
async function getEngagementTrends(params) {
  const trends = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = params.days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const impressions = Math.floor(Math.random() * 1e4) + 1e3;
    const engagements = Math.floor(Math.random() * 500) + 50;
    trends.push({
      date,
      impressions,
      engagements,
      rate: engagements / impressions * 100
    });
  }
  return { success: true, trends };
}
var getAggregatedAnalyticsSchema = {
  startDate: z5.string().describe("Start date (ISO format)"),
  endDate: z5.string().describe("End date (ISO format)"),
  platforms: z5.array(z5.enum(["twitter", "linkedin", "instagram", "farcaster"])).optional().describe("Platforms to include")
};
var compareContentPerformanceSchema = {
  platforms: z5.array(z5.enum(["twitter", "linkedin", "instagram", "farcaster"])).describe("Platforms to compare"),
  contentTypes: z5.array(z5.string()).optional().describe("Content types to analyze")
};
var getBestPostingTimesSchema = {
  platform: z5.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform to analyze"),
  timezone: z5.string().optional().describe("Timezone (e.g., 'America/New_York')")
};
var getEngagementTrendsSchema = {
  platform: z5.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform to analyze"),
  days: z5.number().min(1).max(90).describe("Number of days to analyze")
};

// src/social/scheduler.ts
import { z as z6 } from "zod";
var scheduledContent = /* @__PURE__ */ new Map();
async function scheduleContent(params) {
  if (params.scheduledFor <= /* @__PURE__ */ new Date()) {
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
  const now = /* @__PURE__ */ new Date();
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
function checkScheduleConflicts(params) {
  const conflicts = [];
  const targetTime = params.scheduledFor.getTime();
  const windowMs = params.windowMinutes * 60 * 1e3;
  const conflictingContent = Array.from(scheduledContent.values()).filter((sc) => {
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
async function bulkSchedule(params) {
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
        scheduledFor = new Date(scheduledFor.getTime() + conflictGap * 60 * 1e3);
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
    failed: failed.length > 0 ? failed : void 0
  };
}
async function cancelScheduledContent(contentId) {
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
async function rescheduleContent(params) {
  const content = scheduledContent.get(params.contentId);
  if (!content) {
    return { success: false, error: "Scheduled content not found" };
  }
  if (content.status !== "pending") {
    return { success: false, error: `Cannot reschedule ${content.status} content` };
  }
  if (params.newScheduledFor <= /* @__PURE__ */ new Date()) {
    return { success: false, error: "New scheduled time must be in the future" };
  }
  content.scheduledFor = params.newScheduledFor;
  scheduledContent.set(params.contentId, content);
  return { success: true, scheduled: content };
}
function getScheduledContent(params) {
  let result = Array.from(scheduledContent.values());
  if (params?.platform) {
    result = result.filter((c) => c.platform === params.platform);
  }
  if (params?.status) {
    result = result.filter((c) => c.status === params.status);
  }
  if (params?.startDate) {
    result = result.filter((c) => c.scheduledFor >= params.startDate);
  }
  if (params?.endDate) {
    result = result.filter((c) => c.scheduledFor <= params.endDate);
  }
  return result.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}
function getUpcomingContent(hours = 24) {
  const now = /* @__PURE__ */ new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1e3);
  return getScheduledContent({
    status: "pending",
    startDate: now,
    endDate: future
  });
}
var scheduleContentSchema = {
  platform: z6.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform"),
  type: z6.enum(["post", "thread", "article", "story", "cast"]).describe("Content type"),
  content: z6.any().describe("Content data (platform-specific)"),
  scheduledFor: z6.string().describe("ISO date string for scheduling"),
  checkConflicts: z6.boolean().optional().describe("Check for scheduling conflicts")
};
var bulkScheduleSchema = {
  posts: z6.array(z6.object({
    platform: z6.enum(["twitter", "linkedin", "instagram", "farcaster"]),
    type: z6.enum(["post", "thread", "article", "story", "cast"]),
    content: z6.any(),
    scheduledFor: z6.string()
  })).describe("Array of posts to schedule"),
  autoResolveConflicts: z6.boolean().optional().describe("Automatically resolve conflicts"),
  conflictGapMinutes: z6.number().optional().describe("Minutes between posts to avoid conflicts")
};
var cancelScheduledContentSchema = {
  contentId: z6.string().describe("Scheduled content ID")
};
var rescheduleContentSchema = {
  contentId: z6.string().describe("Scheduled content ID"),
  newScheduledFor: z6.string().describe("New ISO date string for scheduling")
};
var getScheduledContentSchema = {
  platform: z6.enum(["twitter", "linkedin", "instagram", "farcaster"]).optional().describe("Filter by platform"),
  status: z6.enum(["pending", "published", "failed", "cancelled"]).optional().describe("Filter by status"),
  startDate: z6.string().optional().describe("Filter by start date"),
  endDate: z6.string().optional().describe("Filter by end date")
};
var getUpcomingContentSchema = {
  hours: z6.number().optional().describe("Hours ahead to look (default 24)")
};

// src/index.ts
var server = new McpServer({
  name: "creator",
  version: "1.0.0"
});
var articles2 = /* @__PURE__ */ new Map();
var clients = /* @__PURE__ */ new Map();
var projects = /* @__PURE__ */ new Map();
server.registerTool(
  "create_article",
  {
    title: "Create Article",
    description: "Create a new article for blog or content",
    inputSchema: {
      title: z7.string().min(1).describe("Article title"),
      content: z7.string().describe("Article content"),
      tags: z7.array(z7.string()).optional().describe("Article tags")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ title, content, tags = [] }) => {
    const id = crypto.randomUUID();
    const article = {
      id,
      title,
      content,
      status: "draft",
      tags,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    articles2.set(id, article);
    return {
      content: [{ type: "text", text: `Created article: ${title} (${id})` }],
      structuredContent: { article }
    };
  }
);
server.registerTool(
  "update_article",
  {
    title: "Update Article",
    description: "Update an existing article",
    inputSchema: {
      id: z7.string().describe("Article ID"),
      title: z7.string().optional().describe("New title"),
      content: z7.string().optional().describe("New content"),
      status: z7.enum(["draft", "published", "archived"]).optional().describe("New status"),
      tags: z7.array(z7.string()).optional().describe("New tags"),
      seoTitle: z7.string().optional().describe("SEO title"),
      seoDescription: z7.string().optional().describe("SEO description")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ id, title, content, status, tags, seoTitle, seoDescription }) => {
    const article = articles2.get(id);
    if (!article) {
      return {
        content: [{ type: "text", text: `Article not found: ${id}` }],
        isError: true
      };
    }
    if (title) article.title = title;
    if (content) article.content = content;
    if (status) article.status = status;
    if (tags) article.tags = tags;
    if (seoTitle) article.seoTitle = seoTitle;
    if (seoDescription) article.seoDescription = seoDescription;
    article.updatedAt = /* @__PURE__ */ new Date();
    articles2.set(id, article);
    return {
      content: [{ type: "text", text: `Updated article: ${article.title}` }],
      structuredContent: { article }
    };
  }
);
server.registerTool(
  "get_article",
  {
    title: "Get Article",
    description: "Get an article by ID",
    inputSchema: {
      id: z7.string().describe("Article ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ id }) => {
    const article = articles2.get(id);
    if (!article) {
      return {
        content: [{ type: "text", text: `Article not found: ${id}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(article, null, 2) }],
      structuredContent: { article }
    };
  }
);
server.registerTool(
  "list_articles",
  {
    title: "List Articles",
    description: "List all articles with optional filtering",
    inputSchema: {
      status: z7.enum(["draft", "published", "archived"]).optional().describe("Filter by status"),
      limit: z7.number().max(100).default(50).describe("Maximum number of articles")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ status, limit }) => {
    let result = Array.from(articles2.values());
    if (status) {
      result = result.filter((a) => a.status === status);
    }
    result = result.slice(0, limit);
    return {
      content: [{ type: "text", text: `Found ${result.length} articles` }],
      structuredContent: { articles: result }
    };
  }
);
server.registerTool(
  "create_client",
  {
    title: "Create Client",
    description: "Create a new client",
    inputSchema: {
      name: z7.string().min(1).describe("Client name"),
      email: z7.string().email().describe("Client email"),
      company: z7.string().optional().describe("Company name")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ name, email, company }) => {
    const id = crypto.randomUUID();
    const client = {
      id,
      name,
      email,
      company,
      status: "active",
      projects: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    clients.set(id, client);
    return {
      content: [{ type: "text", text: `Created client: ${name} (${id})` }],
      structuredContent: { client }
    };
  }
);
server.registerTool(
  "get_client",
  {
    title: "Get Client",
    description: "Get a client by ID",
    inputSchema: {
      id: z7.string().describe("Client ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ id }) => {
    const client = clients.get(id);
    if (!client) {
      return {
        content: [{ type: "text", text: `Client not found: ${id}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(client, null, 2) }],
      structuredContent: { client }
    };
  }
);
server.registerTool(
  "list_clients",
  {
    title: "List Clients",
    description: "List all clients",
    inputSchema: {},
    annotations: {
      readOnlyHint: true
    }
  },
  async () => {
    const allClients = Array.from(clients.values());
    return {
      content: [{ type: "text", text: `Found ${allClients.length} clients` }],
      structuredContent: { clients: allClients }
    };
  }
);
server.registerTool(
  "create_project",
  {
    title: "Create Project",
    description: "Create a new project for a client",
    inputSchema: {
      name: z7.string().min(1).describe("Project name"),
      clientId: z7.string().describe("Client ID"),
      budget: z7.number().optional().describe("Project budget"),
      deadline: z7.string().optional().describe("Project deadline (ISO date)")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ name, clientId, budget, deadline }) => {
    const client = clients.get(clientId);
    if (!client) {
      return {
        content: [{ type: "text", text: `Client not found: ${clientId}` }],
        isError: true
      };
    }
    const id = crypto.randomUUID();
    const project = {
      id,
      name,
      clientId,
      status: "planning",
      budget,
      deadline: deadline ? new Date(deadline) : void 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    projects.set(id, project);
    client.projects.push(id);
    clients.set(clientId, client);
    return {
      content: [{ type: "text", text: `Created project: ${name} for ${client.name}` }],
      structuredContent: { project }
    };
  }
);
server.registerTool(
  "get_project",
  {
    title: "Get Project",
    description: "Get a project by ID",
    inputSchema: {
      id: z7.string().describe("Project ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ id }) => {
    const project = projects.get(id);
    if (!project) {
      return {
        content: [{ type: "text", text: `Project not found: ${id}` }],
        isError: true
      };
    }
    const client = clients.get(project.clientId);
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
      structuredContent: { project, client: client ? { id: client.id, name: client.name } : null }
    };
  }
);
server.registerTool(
  "list_projects",
  {
    title: "List Projects",
    description: "List all projects with optional filtering",
    inputSchema: {
      status: z7.enum(["planning", "active", "completed", "on_hold"]).optional().describe("Filter by status"),
      clientId: z7.string().optional().describe("Filter by client")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ status, clientId }) => {
    let result = Array.from(projects.values());
    if (status) {
      result = result.filter((p) => p.status === status);
    }
    if (clientId) {
      result = result.filter((p) => p.clientId === clientId);
    }
    return {
      content: [{ type: "text", text: `Found ${result.length} projects` }],
      structuredContent: { projects: result }
    };
  }
);
server.registerTool(
  "update_project_status",
  {
    title: "Update Project Status",
    description: "Update a project's status",
    inputSchema: {
      id: z7.string().describe("Project ID"),
      status: z7.enum(["planning", "active", "completed", "on_hold"]).describe("New status")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ id, status }) => {
    const project = projects.get(id);
    if (!project) {
      return {
        content: [{ type: "text", text: `Project not found: ${id}` }],
        isError: true
      };
    }
    project.status = status;
    projects.set(id, project);
    return {
      content: [{ type: "text", text: `Updated project status to: ${status}` }],
      structuredContent: { project }
    };
  }
);
server.registerTool(
  "generate_article_summary",
  {
    title: "Generate Article Summary",
    description: "Generate a summary of an article",
    inputSchema: {
      articleId: z7.string().describe("Article ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ articleId }) => {
    const article = articles2.get(articleId);
    if (!article) {
      return {
        content: [{ type: "text", text: `Article not found: ${articleId}` }],
        isError: true
      };
    }
    const wordCount = article.content.split(/\s+/).length;
    const sentences = article.content.split(/[.!?]+/).filter((s) => s.trim());
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    return {
      content: [{ type: "text", text: `Summary for: ${article.title}` }],
      structuredContent: {
        title: article.title,
        status: article.status,
        tags: article.tags,
        wordCount,
        sentenceCount: sentences.length,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }
    };
  }
);
server.registerTool(
  "twitter_post",
  {
    title: "Post Tweet",
    description: "Post a tweet to Twitter/X",
    inputSchema: postTweetSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await postTweet({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `Tweet posted: ${result.tweet?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "twitter_thread",
  {
    title: "Create Twitter Thread",
    description: "Create a thread of tweets",
    inputSchema: createThreadSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createThread({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `Thread created with ${result.thread?.tweets.length} tweets` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "twitter_analytics",
  {
    title: "Get Tweet Analytics",
    description: "Get analytics for a specific tweet",
    inputSchema: getTweetAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getTweetAnalytics(params.tweetId);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.analytics, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "linkedin_post",
  {
    title: "Create LinkedIn Post",
    description: "Create a post on LinkedIn",
    inputSchema: createPostSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createPost({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `LinkedIn post created: ${result.post?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "linkedin_article",
  {
    title: "Create LinkedIn Article",
    description: "Create an article on LinkedIn",
    inputSchema: createArticleSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createArticle(params);
    return {
      content: [{ type: "text", text: result.success ? `LinkedIn article created: ${result.article?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "linkedin_analytics",
  {
    title: "Get LinkedIn Post Analytics",
    description: "Get analytics for a LinkedIn post",
    inputSchema: getPostAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getPostAnalytics(params.postId);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.analytics, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "instagram_post",
  {
    title: "Create Instagram Post",
    description: "Create a post on Instagram (feed, carousel, or reel)",
    inputSchema: createPostSchema2,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createPost2({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `Instagram post created: ${result.post?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "instagram_story",
  {
    title: "Create Instagram Story",
    description: "Create a story on Instagram",
    inputSchema: createStorySchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createStory(params);
    return {
      content: [{ type: "text", text: result.success ? `Instagram story created: ${result.story?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "instagram_analytics",
  {
    title: "Get Instagram Post Analytics",
    description: "Get analytics for an Instagram post",
    inputSchema: getPostAnalyticsSchema2,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getPostAnalytics2(params.postId);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.analytics, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "farcaster_cast",
  {
    title: "Create Farcaster Cast",
    description: "Create a cast on Farcaster",
    inputSchema: createCastSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createCast({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `Farcaster cast created: ${result.cast?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "farcaster_thread",
  {
    title: "Create Farcaster Thread",
    description: "Create a thread of casts on Farcaster",
    inputSchema: createThreadSchema2,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createThread2({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : void 0
    });
    return {
      content: [{ type: "text", text: result.success ? `Farcaster thread created with ${result.thread?.length} casts` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "farcaster_frame",
  {
    title: "Create Farcaster Frame",
    description: "Create an interactive frame for a Farcaster cast",
    inputSchema: createFrameSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await createFrame(params);
    return {
      content: [{ type: "text", text: result.success ? `Farcaster frame created: ${result.frame?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "farcaster_analytics",
  {
    title: "Get Farcaster Cast Analytics",
    description: "Get analytics for a Farcaster cast",
    inputSchema: getCastAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getCastAnalytics(params.castId);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.analytics, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "analytics_aggregated",
  {
    title: "Get Aggregated Analytics",
    description: "Get aggregated analytics across all social platforms",
    inputSchema: getAggregatedAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getAggregatedAnalytics({
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      platforms: params.platforms
    });
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.analytics, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "analytics_best_times",
  {
    title: "Get Best Posting Times",
    description: "Get recommended best times to post for a platform",
    inputSchema: getBestPostingTimesSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getBestPostingTimes(params);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.times, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "analytics_trends",
  {
    title: "Get Engagement Trends",
    description: "Get engagement trends over time for a platform",
    inputSchema: getEngagementTrendsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await getEngagementTrends(params);
    return {
      content: [{ type: "text", text: result.success ? JSON.stringify(result.trends, null, 2) : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "schedule_content",
  {
    title: "Schedule Content",
    description: "Schedule content to be posted on a specific platform",
    inputSchema: scheduleContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await scheduleContent({
      ...params,
      scheduledFor: new Date(params.scheduledFor)
    });
    return {
      content: [{ type: "text", text: result.success ? `Content scheduled: ${result.scheduled?.id}` : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "schedule_bulk",
  {
    title: "Bulk Schedule Content",
    description: "Schedule multiple pieces of content at once",
    inputSchema: bulkScheduleSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await bulkSchedule({
      ...params,
      posts: params.posts.map((p) => ({
        ...p,
        scheduledFor: new Date(p.scheduledFor)
      }))
    });
    return {
      content: [{ type: "text", text: result.success ? `Scheduled ${result.scheduled?.length} posts` : `Scheduled ${result.scheduled?.length}, failed ${result.failed?.length}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "schedule_list",
  {
    title: "List Scheduled Content",
    description: "List all scheduled content with optional filtering",
    inputSchema: getScheduledContentSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const content = getScheduledContent({
      ...params,
      startDate: params.startDate ? new Date(params.startDate) : void 0,
      endDate: params.endDate ? new Date(params.endDate) : void 0
    });
    return {
      content: [{ type: "text", text: `Found ${content.length} scheduled items` }],
      structuredContent: { content }
    };
  }
);
server.registerTool(
  "schedule_upcoming",
  {
    title: "Get Upcoming Content",
    description: "Get content scheduled for the next N hours",
    inputSchema: getUpcomingContentSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const content = getUpcomingContent(params.hours);
    return {
      content: [{ type: "text", text: `Found ${content.length} upcoming items` }],
      structuredContent: { content }
    };
  }
);
server.registerTool(
  "schedule_cancel",
  {
    title: "Cancel Scheduled Content",
    description: "Cancel a scheduled post",
    inputSchema: cancelScheduledContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await cancelScheduledContent(params.contentId);
    return {
      content: [{ type: "text", text: result.success ? "Content cancelled" : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
server.registerTool(
  "schedule_reschedule",
  {
    title: "Reschedule Content",
    description: "Change the scheduled time for a post",
    inputSchema: rescheduleContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await rescheduleContent({
      contentId: params.contentId,
      newScheduledFor: new Date(params.newScheduledFor)
    });
    return {
      content: [{ type: "text", text: result.success ? "Content rescheduled" : `Error: ${result.error}` }],
      structuredContent: result,
      isError: !result.success
    };
  }
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);
