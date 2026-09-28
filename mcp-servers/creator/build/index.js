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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const tweet = {
    id: id6,
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
  tweets.set(id6, tweet);
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
  analytics.engagementRate = analytics.impressions > 0 ? (analytics.likes + analytics.retweets + analytics.replies) / analytics.impressions * 100 : 0;
  tweet.metrics = analytics;
  tweets.set(tweetId, tweet);
  return { success: true, analytics };
}
var id = () => z.string().min(1).max(100);
var isoDate = () => z.string().max(40);
var url = () => z.string().url().max(2048);
var postTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text (max 280 characters)"),
  mediaUrls: z.array(url()).max(4).optional().describe("Media URLs to attach (max 4)"),
  replyToId: id().optional().describe("Local tweet ID this replies to"),
  scheduledFor: isoDate().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};
var createThreadSchema = {
  tweets: z.array(z.string().min(1).max(280)).min(1).max(25).describe("Tweet texts in thread order (1-25, max 280 characters each)"),
  scheduledFor: isoDate().optional().describe("ISO 8601 date-time to schedule the thread for")
};
var getTweetAnalyticsSchema = {
  tweetId: id().describe("Local tweet ID returned by creator_twitter_post or creator_twitter_thread")
};
var getThreadAnalyticsSchema = {
  threadId: id().describe("Local thread ID")
};
var scheduleTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text"),
  scheduledFor: isoDate().describe("ISO 8601 date-time to schedule for"),
  mediaUrls: z.array(url()).max(4).optional().describe("Media URLs (max 4)")
};
var deleteTweetSchema = {
  tweetId: id().describe("Local tweet ID to delete")
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const post = {
    id: id6,
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
  posts.set(id6, post);
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const wordCount = params.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  const article = {
    id: id6,
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
  articles.set(id6, article);
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
  analytics.clickThroughRate = analytics.impressions > 0 ? (analytics.likes + analytics.comments + analytics.shares) / analytics.impressions * 100 : 0;
  post.metrics = analytics;
  posts.set(postId, post);
  return { success: true, analytics };
}
var id2 = () => z2.string().min(1).max(100);
var isoDate2 = () => z2.string().max(40);
var url2 = () => z2.string().url().max(2048);
var createPostSchema = {
  text: z2.string().min(1).max(3e3).describe("Post text (max 3000 characters)"),
  mediaUrls: z2.array(url2()).max(9).optional().describe("Media URLs to attach (max 9)"),
  visibility: z2.enum(["public", "connections", "private"]).optional().describe("Who can see the post; default public"),
  scheduledFor: isoDate2().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};
var createArticleSchema = {
  title: z2.string().min(1).max(150).describe("Article title (max 150 characters)"),
  content: z2.string().min(1).max(125e3).describe("Article body (max 125,000 characters)"),
  coverImageUrl: url2().optional().describe("Cover image URL"),
  tags: z2.array(z2.string().max(50)).max(20).optional().describe("Article tags (max 20)"),
  publishNow: z2.boolean().optional().describe("Record as published instead of draft")
};
var publishArticleSchema = {
  articleId: id2().describe("Local article ID to publish")
};
var getPostAnalyticsSchema = {
  postId: id2().describe("Local post ID returned by creator_linkedin_post")
};
var getArticleAnalyticsSchema = {
  articleId: id2().describe("Local article ID")
};
var schedulePostSchema = {
  text: z2.string().min(1).max(3e3).describe("Post text"),
  scheduledFor: isoDate2().describe("ISO 8601 date-time to schedule for"),
  mediaUrls: z2.array(url2()).max(9).optional().describe("Media URLs (max 9)"),
  visibility: z2.enum(["public", "connections", "private"]).optional().describe("Post visibility")
};
var deletePostSchema = {
  postId: id2().describe("Local post ID to delete")
};
var deleteArticleSchema = {
  articleId: id2().describe("Local article ID to delete")
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const post = {
    id: id6,
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
  posts2.set(id6, post);
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
  const story = {
    id: id6,
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
  stories.set(id6, story);
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
  analytics.engagementRate = analytics.reach > 0 ? (analytics.likes + analytics.comments + analytics.saves + analytics.shares) / analytics.reach * 100 : 0;
  post.metrics = analytics;
  posts2.set(postId, post);
  return { success: true, analytics };
}
var id3 = () => z3.string().min(1).max(100);
var isoDate3 = () => z3.string().max(40);
var url3 = () => z3.string().url().max(2048);
var createPostSchema2 = {
  caption: z3.string().min(1).max(2200).describe("Post caption (max 2200 characters)"),
  mediaUrls: z3.array(url3()).min(1).max(10).describe("Media URLs (1-10 items)"),
  type: z3.enum(["feed", "carousel", "reel"]).optional().describe("Post type; default feed"),
  location: z3.string().max(200).optional().describe("Location tag"),
  tags: z3.array(z3.string().max(100)).max(30).optional().describe("Hashtags and mentions (max 30)"),
  scheduledFor: isoDate3().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};
var createStorySchema = {
  mediaUrl: url3().describe("Story image or video URL"),
  type: z3.enum(["image", "video"]).describe("Media type"),
  link: url3().optional().describe("Link sticker URL"),
  stickers: z3.array(z3.object({
    type: z3.enum(["mention", "hashtag", "location", "poll", "question"]).describe("Sticker kind"),
    data: z3.string().max(500).describe("Sticker text: the handle, hashtag, place, poll question or prompt")
  })).max(10).optional().describe("Interactive stickers (max 10)")
};
var getPostAnalyticsSchema2 = {
  postId: id3().describe("Local post ID returned by creator_instagram_post")
};
var getStoryAnalyticsSchema = {
  storyId: id3().describe("Local story ID")
};
var schedulePostSchema2 = {
  caption: z3.string().min(1).max(2200).describe("Post caption"),
  mediaUrls: z3.array(url3()).min(1).max(10).describe("Media URLs"),
  scheduledFor: isoDate3().describe("ISO 8601 date-time to schedule for"),
  type: z3.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
  location: z3.string().max(200).optional().describe("Location tag"),
  tags: z3.array(z3.string().max(100)).max(30).optional().describe("Hashtags and mentions")
};
var deletePostSchema2 = {
  postId: id3().describe("Local post ID to delete")
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const cast = {
    id: id6,
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
  casts.set(id6, cast);
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
  const id6 = crypto.randomUUID();
  const frame = {
    id: id6,
    castId: params.castId,
    version: "vNext",
    imageUrl: params.imageUrl,
    buttons: params.buttons,
    inputText: params.inputText,
    postUrl: params.postUrl,
    state: params.state
  };
  frames.set(id6, frame);
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
var id4 = () => z4.string().min(1).max(100);
var isoDate4 = () => z4.string().max(40);
var url4 = () => z4.string().url().max(2048);
var embeds = () => z4.array(z4.object({
  type: z4.enum(["url", "image", "video", "frame"]).describe("Embed kind"),
  url: url4().describe("Embed URL")
})).max(2);
var createCastSchema = {
  text: z4.string().min(1).max(320).describe("Cast text (max 320 characters)"),
  parentCastId: id4().optional().describe("Local cast ID this replies to"),
  channelId: id4().optional().describe("Channel ID to post in"),
  embeds: embeds().optional().describe("Embeds (max 2)"),
  mentions: z4.array(z4.number().int().min(1).max(Number.MAX_SAFE_INTEGER)).max(10).optional().describe("FIDs to mention (max 10)"),
  scheduledFor: isoDate4().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};
var createThreadSchema2 = {
  casts: z4.array(z4.string().min(1).max(320)).min(1).max(25).describe("Cast texts in thread order (1-25, max 320 characters each)"),
  channelId: id4().optional().describe("Channel ID to post in"),
  scheduledFor: isoDate4().optional().describe("ISO 8601 date-time to schedule the thread for")
};
var createFrameSchema = {
  castId: id4().describe("Local cast ID to attach the frame to"),
  imageUrl: url4().describe("Frame image URL"),
  buttons: z4.array(z4.object({
    label: z4.string().min(1).max(40).describe("Button label"),
    action: z4.enum(["post", "post_redirect", "link", "mint"]).describe("What the button does"),
    target: z4.string().max(2048).optional().describe("Target URL or mint address")
  })).min(1).max(4).describe("Frame buttons (1-4)"),
  inputText: z4.string().max(100).optional().describe("Input field placeholder"),
  postUrl: url4().optional().describe("URL that receives button posts"),
  state: z4.string().max(4096).optional().describe("Opaque frame state")
};
var getCastAnalyticsSchema = {
  castId: id4().describe("Local cast ID returned by creator_farcaster_cast")
};
var createChannelSchema = {
  name: z4.string().min(1).max(50).describe("Channel name (max 50 characters)"),
  description: z4.string().max(500).describe("Channel description"),
  imageUrl: url4().optional().describe("Channel image URL")
};
var postToChannelSchema = {
  channelId: id4().describe("Channel ID"),
  text: z4.string().min(1).max(320).describe("Cast text"),
  embeds: embeds().optional().describe("Embeds (max 2)")
};
var scheduleCastSchema = {
  text: z4.string().min(1).max(320).describe("Cast text"),
  scheduledFor: isoDate4().describe("ISO 8601 date-time to schedule for"),
  channelId: id4().optional().describe("Channel ID"),
  embeds: embeds().optional().describe("Embeds (max 2)")
};
var deleteCastSchema = {
  castId: id4().describe("Local cast ID to delete")
};

// src/social/analytics.ts
import { z as z5 } from "zod";
async function getAggregatedAnalytics(params) {
  const platforms2 = params.platforms || ["twitter", "linkedin", "instagram", "farcaster"];
  const platformMetrics = [];
  let totalPosts = 0;
  let totalImpressions = 0;
  let totalEngagements = 0;
  for (const platform2 of platforms2) {
    const metrics = {
      platform: platform2,
      totalPosts: Math.floor(Math.random() * 100),
      totalImpressions: Math.floor(Math.random() * 1e5),
      totalEngagements: Math.floor(Math.random() * 5e3),
      avgEngagementRate: Math.random() * 10,
      topPost: {
        id: crypto.randomUUID(),
        text: `Top post on ${platform2}`,
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
var platforms = () => z5.array(z5.enum(["twitter", "linkedin", "instagram", "farcaster"])).max(4);
var getAggregatedAnalyticsSchema = {
  startDate: z5.string().max(40).describe("Start of the period, ISO 8601 date"),
  endDate: z5.string().max(40).describe("End of the period, ISO 8601 date"),
  platforms: platforms().optional().describe("Platforms to include; default all four")
};
var compareContentPerformanceSchema = {
  platforms: platforms().describe("Platforms to compare"),
  contentTypes: z5.array(z5.string().max(50)).max(20).optional().describe("Content types to analyze")
};
var getBestPostingTimesSchema = {
  platform: z5.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform to analyze"),
  timezone: z5.string().max(64).optional().describe("IANA timezone, e.g. America/New_York (currently not applied)")
};
var getEngagementTrendsSchema = {
  platform: z5.enum(["twitter", "linkedin", "instagram", "farcaster"]).describe("Platform to analyze"),
  days: z5.number().int().min(1).max(90).describe("Number of days to return, 1-90")
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
  const id6 = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const scheduled = {
    id: id6,
    platform: params.platform,
    type: params.type,
    content: params.content,
    scheduledFor: params.scheduledFor,
    status: "pending",
    createdAt: now
  };
  scheduledContent.set(id6, scheduled);
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
var platform = () => z6.enum(["twitter", "linkedin", "instagram", "farcaster"]);
var contentType = () => z6.enum(["post", "thread", "article", "story", "cast"]);
var isoDate5 = () => z6.string().max(40);
var contentBody = () => z6.string().min(1).max(125e3);
var scheduleContentSchema = {
  platform: platform().describe("Platform the content is for"),
  type: contentType().describe("Content type"),
  content: contentBody().describe("The post text, or a JSON-encoded platform payload"),
  scheduledFor: isoDate5().describe("ISO 8601 date-time in the future"),
  checkConflicts: z6.boolean().optional().describe("Refuse when another item is queued within 15 minutes on the same platform")
};
var bulkScheduleSchema = {
  posts: z6.array(z6.object({
    platform: platform().describe("Platform the content is for"),
    type: contentType().describe("Content type"),
    content: contentBody().describe("The post text, or a JSON-encoded platform payload"),
    scheduledFor: isoDate5().describe("ISO 8601 date-time in the future")
  })).min(1).max(100).describe("Items to schedule (1-100)"),
  autoResolveConflicts: z6.boolean().optional().describe("Shift items that collide with queued content instead of failing them"),
  conflictGapMinutes: z6.number().int().min(1).max(1440).optional().describe("Minimum minutes between items on one platform; default 15")
};
var cancelScheduledContentSchema = {
  contentId: z6.string().min(1).max(100).describe("Scheduled content ID")
};
var rescheduleContentSchema = {
  contentId: z6.string().min(1).max(100).describe("Scheduled content ID"),
  newScheduledFor: isoDate5().describe("New ISO 8601 date-time in the future")
};
var getScheduledContentSchema = {
  platform: platform().optional().describe("Only this platform"),
  status: z6.enum(["pending", "published", "failed", "cancelled"]).optional().describe("Only this status"),
  startDate: isoDate5().optional().describe("Only items scheduled at or after this ISO 8601 date-time"),
  endDate: isoDate5().optional().describe("Only items scheduled at or before this ISO 8601 date-time"),
  limit: z6.number().int().min(1).max(500).default(50).describe("Maximum items to return")
};
var getUpcomingContentSchema = {
  hours: z6.number().int().min(1).max(720).default(24).describe("Hours ahead to look, 1-720")
};

// src/index.ts
var server = new McpServer({
  name: "creator",
  version: "1.1.0"
});
var articles2 = /* @__PURE__ */ new Map();
var clients = /* @__PURE__ */ new Map();
var projects = /* @__PURE__ */ new Map();
var ARTICLE_STATUSES = ["draft", "published", "archived"];
var PROJECT_STATUSES = ["planning", "active", "completed", "on_hold"];
var SIMULATED = "Simulated: stored in this server's memory only (lost on restart); no platform API is called and nothing is published.";
var SIMULATED_METRICS = "Simulated: the numbers are randomly generated sample data, not real platform analytics.";
var LOCAL_CREATE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
var LOCAL_OVERWRITE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
var LOCAL_READ = { readOnlyHint: true, openWorldHint: false };
var id5 = () => z7.string().min(1).max(100);
var record = (shape) => z7.object(shape).passthrough();
var articleShape = record({
  id: z7.string(),
  title: z7.string(),
  content: z7.string(),
  status: z7.enum(ARTICLE_STATUSES),
  tags: z7.array(z7.string()),
  createdAt: z7.string(),
  updatedAt: z7.string()
});
var clientShape = record({
  id: z7.string(),
  name: z7.string(),
  email: z7.string(),
  status: z7.enum(["active", "inactive"]),
  projects: z7.array(z7.string()),
  createdAt: z7.string()
});
var projectShape = record({
  id: z7.string(),
  name: z7.string(),
  clientId: z7.string(),
  status: z7.enum(PROJECT_STATUSES),
  createdAt: z7.string()
});
var postShape = record({ id: z7.string(), status: z7.string(), createdAt: z7.string() });
var scheduledShape = record({
  id: z7.string(),
  platform: z7.string(),
  type: z7.string(),
  content: z7.unknown(),
  scheduledFor: z7.string(),
  status: z7.string()
});
var simulated = z7.literal(true).describe("Always true: this is an in-memory simulation, not a live platform call");
function ok(data) {
  const plain = JSON.parse(JSON.stringify(data));
  return { content: [{ type: "text", text: JSON.stringify(plain, null, 2) }], structuredContent: plain };
}
function fail(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}
function social(result) {
  return result.success ? ok({ simulated: true, ...result }) : fail(`Error: ${result.error}`);
}
function parseDate(value, field) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} '${value}' is not an ISO 8601 date-time, e.g. 2026-10-01T09:00:00Z`);
  return date;
}
function optionalDate(value, field) {
  return value === void 0 ? void 0 : parseDate(value, field);
}
async function guarded(run) {
  try {
    return await run();
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}
server.registerTool(
  "creator_create_article",
  {
    title: "Create article",
    description: "Start a new article draft in the creator workspace (in-memory, lost on restart; use database_create_article to persist). Each call creates a new draft with a fresh ID. Returns the full article record including its ID and timestamps.",
    inputSchema: {
      title: z7.string().min(1).max(500).describe("Article title"),
      content: z7.string().max(5e5).describe("Article body, usually Markdown"),
      tags: z7.array(z7.string().max(100)).max(50).default([]).describe("Tags for filtering and SEO")
    },
    outputSchema: { article: articleShape.describe("The new draft") },
    annotations: LOCAL_CREATE
  },
  async ({ title, content, tags }) => {
    const now = /* @__PURE__ */ new Date();
    const article = { id: crypto.randomUUID(), title, content, status: "draft", tags, createdAt: now, updatedAt: now };
    articles2.set(article.id, article);
    return ok({ article });
  }
);
server.registerTool(
  "creator_update_article",
  {
    title: "Update article",
    description: "Overwrite fields of an in-memory article: title, body, status, tags or SEO title and description. Omitted fields are kept; previous values are not versioned. Returns the updated article, or an error when the ID is unknown.",
    inputSchema: {
      id: id5().describe("Article ID from creator_create_article or creator_list_articles"),
      title: z7.string().min(1).max(500).optional().describe("New title"),
      content: z7.string().max(5e5).optional().describe("New body, replacing the old one"),
      status: z7.enum(ARTICLE_STATUSES).optional().describe("New status"),
      tags: z7.array(z7.string().max(100)).max(50).optional().describe("New tags, replacing the old list"),
      seoTitle: z7.string().max(70).optional().describe("SEO title (max 70 characters)"),
      seoDescription: z7.string().max(160).optional().describe("SEO meta description (max 160 characters)")
    },
    outputSchema: { article: articleShape.describe("The updated article") },
    annotations: LOCAL_OVERWRITE
  },
  async ({ id: articleId, title, content, status, tags, seoTitle, seoDescription }) => {
    const article = articles2.get(articleId);
    if (!article) return fail(`Article not found: ${articleId}. Use creator_list_articles to find IDs.`);
    if (title !== void 0) article.title = title;
    if (content !== void 0) article.content = content;
    if (status !== void 0) article.status = status;
    if (tags !== void 0) article.tags = tags;
    if (seoTitle !== void 0) article.seoTitle = seoTitle;
    if (seoDescription !== void 0) article.seoDescription = seoDescription;
    article.updatedAt = /* @__PURE__ */ new Date();
    return ok({ article });
  }
);
server.registerTool(
  "creator_get_article",
  {
    title: "Get article",
    description: "Fetch one in-memory article by ID, as returned by creator_create_article or creator_list_articles. Returns the full record including body, status, tags and SEO fields, or an error when the ID is unknown. Instant, local only.",
    inputSchema: {
      id: id5().describe("Article ID")
    },
    outputSchema: { article: articleShape.describe("The article") },
    annotations: LOCAL_READ
  },
  async ({ id: articleId }) => {
    const article = articles2.get(articleId);
    if (!article) return fail(`Article not found: ${articleId}. Use creator_list_articles to find IDs.`);
    return ok({ article });
  }
);
server.registerTool(
  "creator_list_articles",
  {
    title: "List articles",
    description: "List in-memory articles in creation order, optionally only one status (draft, published, archived). Use it to find an article ID. Returns up to limit articles (default 50, max 100) including full bodies, plus the total matching.",
    inputSchema: {
      status: z7.enum(ARTICLE_STATUSES).optional().describe("Only articles with this status"),
      limit: z7.number().int().min(1).max(100).default(50).describe("Maximum number of articles")
    },
    outputSchema: {
      articles: z7.array(articleShape).describe("Articles in this page"),
      total: z7.number().describe("Articles matching the filter")
    },
    annotations: LOCAL_READ
  },
  async ({ status, limit }) => {
    const matching = Array.from(articles2.values()).filter((a) => !status || a.status === status);
    return ok({ articles: matching.slice(0, limit), total: matching.length });
  }
);
server.registerTool(
  "creator_create_client",
  {
    title: "Create client",
    description: "Add a client record (name, email, optional company) to the in-memory creator CRM for tracking projects. Each call creates a new client, even for a repeated email. Returns the client record with its ID for creator_create_project.",
    inputSchema: {
      name: z7.string().min(1).max(200).describe("Client name"),
      email: z7.string().email().max(254).describe("Client email"),
      company: z7.string().max(200).optional().describe("Company name")
    },
    outputSchema: { client: clientShape.describe("The new client") },
    annotations: LOCAL_CREATE
  },
  async ({ name, email, company }) => {
    const client = { id: crypto.randomUUID(), name, email, company, status: "active", projects: [], createdAt: /* @__PURE__ */ new Date() };
    clients.set(client.id, client);
    return ok({ client });
  }
);
server.registerTool(
  "creator_get_client",
  {
    title: "Get client",
    description: "Fetch one client record by ID, as returned by creator_create_client or creator_list_clients. Returns name, email, company, status and the IDs of the client's projects, or an error when the ID is unknown. Instant, local only.",
    inputSchema: {
      id: id5().describe("Client ID")
    },
    outputSchema: { client: clientShape.describe("The client") },
    annotations: LOCAL_READ
  },
  async ({ id: clientId }) => {
    const client = clients.get(clientId);
    if (!client) return fail(`Client not found: ${clientId}. Use creator_list_clients to find IDs.`);
    return ok({ client });
  }
);
server.registerTool(
  "creator_list_clients",
  {
    title: "List clients",
    description: "List client records in the in-memory creator CRM, in creation order, optionally only active or inactive ones. Use it to find a client ID before creator_get_client or creator_create_project. Returns up to limit clients and the total.",
    inputSchema: {
      status: z7.enum(["active", "inactive"]).optional().describe("Only clients with this status"),
      limit: z7.number().int().min(1).max(500).default(100).describe("Maximum clients to return")
    },
    outputSchema: {
      clients: z7.array(clientShape).describe("Clients in this page"),
      total: z7.number().describe("Clients matching the filter")
    },
    annotations: LOCAL_READ
  },
  async ({ status, limit }) => {
    const matching = Array.from(clients.values()).filter((c) => !status || c.status === status);
    return ok({ clients: matching.slice(0, limit), total: matching.length });
  }
);
server.registerTool(
  "creator_create_project",
  {
    title: "Create project",
    description: "Create a project for an existing client in the in-memory creator CRM, starting in planning status, with optional budget and deadline. Each call creates a new project. Returns the project record, or an error when the client ID is unknown.",
    inputSchema: {
      name: z7.string().min(1).max(200).describe("Project name"),
      clientId: id5().describe("Client ID from creator_create_client"),
      budget: z7.number().min(0).max(1e12).optional().describe("Budget in your currency"),
      deadline: z7.string().max(40).optional().describe("Deadline, ISO 8601 date")
    },
    outputSchema: { project: projectShape.describe("The new project") },
    annotations: LOCAL_CREATE
  },
  async ({ name, clientId, budget, deadline }) => guarded(async () => {
    const client = clients.get(clientId);
    if (!client) return fail(`Client not found: ${clientId}. Use creator_list_clients to find IDs.`);
    const project = {
      id: crypto.randomUUID(),
      name,
      clientId,
      status: "planning",
      budget,
      deadline: optionalDate(deadline, "deadline"),
      createdAt: /* @__PURE__ */ new Date()
    };
    projects.set(project.id, project);
    client.projects.push(project.id);
    return ok({ project });
  })
);
server.registerTool(
  "creator_get_project",
  {
    title: "Get project",
    description: "Fetch one project by ID from the in-memory creator CRM, including status, budget, deadline and the owning client's ID and name. Use it to check a project before updating it. Returns an error when the ID is unknown. Instant, local only.",
    inputSchema: {
      id: id5().describe("Project ID")
    },
    outputSchema: {
      project: projectShape.describe("The project"),
      client: record({ id: z7.string(), name: z7.string() }).nullable().describe("Owning client, or null if it was removed")
    },
    annotations: LOCAL_READ
  },
  async ({ id: projectId }) => {
    const project = projects.get(projectId);
    if (!project) return fail(`Project not found: ${projectId}. Use creator_list_projects to find IDs.`);
    const client = clients.get(project.clientId);
    return ok({ project, client: client ? { id: client.id, name: client.name } : null });
  }
);
server.registerTool(
  "creator_list_projects",
  {
    title: "List projects",
    description: "List projects in the in-memory creator CRM, in creation order, optionally filtered by status and/or client. Use it for a pipeline overview or to find a project ID. Returns up to limit projects (default 100, max 500) and the total matching.",
    inputSchema: {
      status: z7.enum(PROJECT_STATUSES).optional().describe("Only projects with this status"),
      clientId: id5().optional().describe("Only projects for this client"),
      limit: z7.number().int().min(1).max(500).default(100).describe("Maximum projects to return")
    },
    outputSchema: {
      projects: z7.array(projectShape).describe("Projects in this page"),
      total: z7.number().describe("Projects matching the filters")
    },
    annotations: LOCAL_READ
  },
  async ({ status, clientId, limit }) => {
    const matching = Array.from(projects.values()).filter((p) => (!status || p.status === status) && (!clientId || p.clientId === clientId));
    return ok({ projects: matching.slice(0, limit), total: matching.length });
  }
);
server.registerTool(
  "creator_update_project_status",
  {
    title: "Update project status",
    description: "Set a project's status to planning, active, completed or on_hold in the in-memory creator CRM, replacing the previous status. Repeating the same call changes nothing further. Returns the updated project, or an error for an unknown ID.",
    inputSchema: {
      id: id5().describe("Project ID"),
      status: z7.enum(PROJECT_STATUSES).describe("New status")
    },
    outputSchema: { project: projectShape.describe("The updated project") },
    annotations: LOCAL_OVERWRITE
  },
  async ({ id: projectId, status }) => {
    const project = projects.get(projectId);
    if (!project) return fail(`Project not found: ${projectId}. Use creator_list_projects to find IDs.`);
    project.status = status;
    return ok({ project });
  }
);
server.registerTool(
  "creator_generate_article_summary",
  {
    title: "Summarise article stats",
    description: "Compute quick statistics for an in-memory article: word count, sentence count and average sentence length, with its title, status and tags. It does not write prose; use it to check length before publishing. Instant, local only.",
    inputSchema: {
      articleId: id5().describe("Article ID")
    },
    outputSchema: {
      title: z7.string().describe("Article title"),
      status: z7.enum(ARTICLE_STATUSES).describe("Article status"),
      tags: z7.array(z7.string()).describe("Article tags"),
      wordCount: z7.number().describe("Words in the body"),
      sentenceCount: z7.number().describe("Sentences in the body"),
      avgSentenceLength: z7.number().describe("Average words per sentence, one decimal"),
      createdAt: z7.string().describe("Creation time"),
      updatedAt: z7.string().describe("Last update time")
    },
    annotations: LOCAL_READ
  },
  async ({ articleId }) => {
    const article = articles2.get(articleId);
    if (!article) return fail(`Article not found: ${articleId}. Use creator_list_articles to find IDs.`);
    const wordCount = article.content.split(/\s+/).filter(Boolean).length;
    const sentences = article.content.split(/[.!?]+/).filter((s) => s.trim());
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    return ok({
      title: article.title,
      status: article.status,
      tags: article.tags,
      wordCount,
      sentenceCount: sentences.length,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    });
  }
);
server.registerTool(
  "creator_twitter_post",
  {
    title: "Draft tweet (simulated)",
    description: `Record a tweet (max 280 characters), optionally scheduled or as a reply, to rehearse an X/Twitter posting flow. ${SIMULATED} Returns the stored tweet with its local ID and status.`,
    inputSchema: postTweetSchema,
    outputSchema: { simulated, success: z7.boolean(), tweet: postShape.describe("The stored tweet") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await postTweet({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_twitter_thread",
  {
    title: "Draft Twitter thread (simulated)",
    description: `Record a thread of up to 25 tweets, each max 280 characters, linked as replies in order. ${SIMULATED} Returns the thread with its local ID and the stored tweets.`,
    inputSchema: createThreadSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      thread: record({ id: z7.string(), tweets: z7.array(postShape), status: z7.string() }).describe("The stored thread")
    },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await createThread({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_twitter_analytics",
  {
    title: "Get tweet analytics (simulated)",
    description: `Read impressions, likes, retweets, replies and engagement rate for a tweet recorded by creator_twitter_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: getTweetAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      analytics: record({ impressions: z7.number(), likes: z7.number(), retweets: z7.number(), replies: z7.number(), engagementRate: z7.number() }).describe("Tweet metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await getTweetAnalytics(params.tweetId))
);
server.registerTool(
  "creator_linkedin_post",
  {
    title: "Draft LinkedIn post (simulated)",
    description: `Record a LinkedIn post (max 3000 characters) with optional media, visibility and schedule, to rehearse a LinkedIn flow. ${SIMULATED} Returns the stored post with its local ID and status.`,
    inputSchema: createPostSchema,
    outputSchema: { simulated, success: z7.boolean(), post: postShape.describe("The stored post") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await createPost({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_linkedin_article",
  {
    title: "Draft LinkedIn article (simulated)",
    description: `Record a long-form LinkedIn article (title max 150, body max 125,000 characters) as a draft or published. ${SIMULATED} Returns the stored article with its local ID and status.`,
    inputSchema: createArticleSchema,
    outputSchema: { simulated, success: z7.boolean(), article: postShape.describe("The stored article") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await createArticle(params))
);
server.registerTool(
  "creator_linkedin_analytics",
  {
    title: "Get LinkedIn post analytics (simulated)",
    description: `Read impressions, likes, comments, shares and click-through rate for a post recorded by creator_linkedin_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: getPostAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      analytics: record({ impressions: z7.number(), likes: z7.number(), comments: z7.number(), shares: z7.number(), clickThroughRate: z7.number() }).describe("Post metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await getPostAnalytics(params.postId))
);
server.registerTool(
  "creator_instagram_post",
  {
    title: "Draft Instagram post (simulated)",
    description: `Record an Instagram feed post, carousel or reel with caption (max 2200 characters), 1-10 media URLs, tags and optional schedule. ${SIMULATED} Returns the stored post with its local ID.`,
    inputSchema: createPostSchema2,
    outputSchema: { simulated, success: z7.boolean(), post: postShape.describe("The stored post") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await createPost2({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_instagram_story",
  {
    title: "Draft Instagram story (simulated)",
    description: `Record an Instagram story from one image or video URL, with an optional link and up to 10 stickers; stories expire after 24 hours. ${SIMULATED} Returns the stored story with its local ID.`,
    inputSchema: createStorySchema,
    outputSchema: { simulated, success: z7.boolean(), story: record({ id: z7.string(), mediaUrl: z7.string(), expiresAt: z7.string() }).describe("The stored story") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await createStory(params))
);
server.registerTool(
  "creator_instagram_analytics",
  {
    title: "Get Instagram post analytics (simulated)",
    description: `Read impressions, reach, likes, comments, saves, shares and engagement rate for a post recorded by creator_instagram_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: getPostAnalyticsSchema2,
    outputSchema: { simulated, success: z7.boolean(), analytics: record({ reach: z7.number(), engagementRate: z7.number() }).describe("Post metrics") },
    annotations: LOCAL_READ
  },
  async (params) => social(await getPostAnalytics2(params.postId))
);
server.registerTool(
  "creator_farcaster_cast",
  {
    title: "Draft Farcaster cast (simulated)",
    description: `Record a Farcaster cast (max 320 characters) with optional channel, reply target, embeds, mentions and schedule. ${SIMULATED} Returns the stored cast with its local ID and status.`,
    inputSchema: createCastSchema,
    outputSchema: { simulated, success: z7.boolean(), cast: postShape.describe("The stored cast") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await createCast({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_farcaster_thread",
  {
    title: "Draft Farcaster thread (simulated)",
    description: `Record a thread of up to 25 Farcaster casts (max 320 characters each), linked as replies, optionally in a channel or scheduled. ${SIMULATED} Returns the stored casts in order.`,
    inputSchema: createThreadSchema2,
    outputSchema: { simulated, success: z7.boolean(), thread: z7.array(postShape).describe("The stored casts in order") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await createThread2({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_farcaster_frame",
  {
    title: "Draft Farcaster frame (simulated)",
    description: `Record an interactive frame (image plus 1-4 buttons, optional input and post URL) attached to a cast from creator_farcaster_cast. ${SIMULATED} Returns the stored frame with its local ID.`,
    inputSchema: createFrameSchema,
    outputSchema: { simulated, success: z7.boolean(), frame: record({ id: z7.string(), castId: z7.string(), imageUrl: z7.string() }).describe("The stored frame") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await createFrame(params))
);
server.registerTool(
  "creator_farcaster_analytics",
  {
    title: "Get Farcaster cast analytics (simulated)",
    description: `Read reactions, recasts, replies and watches for a cast recorded by creator_farcaster_cast. ${SIMULATED_METRICS} Returns the metrics object, or an error for an unknown cast ID.`,
    inputSchema: getCastAnalyticsSchema,
    outputSchema: { simulated, success: z7.boolean(), analytics: z7.object({}).passthrough().describe("Cast metrics") },
    annotations: LOCAL_READ
  },
  async (params) => social(await getCastAnalytics(params.castId))
);
server.registerTool(
  "creator_analytics_aggregated",
  {
    title: "Get cross-platform analytics (simulated)",
    description: `Summarise posts, impressions and engagement per platform and in total for a date range, with the best platform and recommendations. ${SIMULATED_METRICS} Do not report these figures as real results.`,
    inputSchema: getAggregatedAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      analytics: record({
        platforms: z7.array(z7.object({}).passthrough()),
        totals: z7.object({}).passthrough(),
        bestPerformingPlatform: z7.string(),
        recommendations: z7.array(z7.string())
      }).describe("Aggregated metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => guarded(async () => social(await getAggregatedAnalytics({
    startDate: parseDate(params.startDate, "startDate"),
    endDate: parseDate(params.endDate, "endDate"),
    platforms: params.platforms
  })))
);
server.registerTool(
  "creator_analytics_best_times",
  {
    title: "Get best posting times (sample)",
    description: "Return a fixed table of generally strong weekday posting slots (day, hour, score out of 10) for a platform. It is a static rule of thumb, not computed from your account's data, and the timezone is not applied. Instant, local only.",
    inputSchema: getBestPostingTimesSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      times: z7.array(z7.object({ dayOfWeek: z7.string(), hour: z7.number(), score: z7.number() })).describe("Suggested slots")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await getBestPostingTimes(params))
);
server.registerTool(
  "creator_analytics_trends",
  {
    title: "Get engagement trends (simulated)",
    description: `Return one row per day for the last 1-90 days with impressions, engagements and engagement rate for a platform. ${SIMULATED_METRICS} Useful only to prototype charts or reports.`,
    inputSchema: getEngagementTrendsSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      trends: z7.array(z7.object({ date: z7.string(), impressions: z7.number(), engagements: z7.number(), rate: z7.number() })).describe("Daily rows, oldest first")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await getEngagementTrends(params))
);
server.registerTool(
  "creator_schedule_content",
  {
    title: "Schedule content (simulated)",
    description: `Queue one piece of content for a platform at a future time, optionally refusing when another item is queued within 15 minutes. ${SIMULATED} Nothing is ever posted when the time arrives. Returns the queued item.`,
    inputSchema: scheduleContentSchema,
    outputSchema: { simulated, success: z7.boolean(), scheduled: scheduledShape.describe("The queued item") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await scheduleContent({ ...params, scheduledFor: parseDate(params.scheduledFor, "scheduledFor") })))
);
server.registerTool(
  "creator_schedule_bulk",
  {
    title: "Bulk schedule content (simulated)",
    description: `Queue up to 100 items at once, optionally shifting items that collide with queued content by conflictGapMinutes. ${SIMULATED} Returns the queued items and, if any failed, their indexes and errors.`,
    inputSchema: bulkScheduleSchema,
    outputSchema: {
      simulated,
      success: z7.boolean(),
      scheduled: z7.array(scheduledShape).describe("Items queued"),
      failed: z7.array(z7.object({ index: z7.number(), error: z7.string() })).optional().describe("Items that could not be queued")
    },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => {
    const result = await bulkSchedule({
      ...params,
      posts: params.posts.map((post, index) => ({ ...post, scheduledFor: parseDate(post.scheduledFor, `posts[${index}].scheduledFor`) }))
    });
    return ok({ simulated: true, ...result });
  })
);
server.registerTool(
  "creator_schedule_list",
  {
    title: "List scheduled content",
    description: "List queued content sorted by scheduled time, filtered by platform, status (pending, published, failed, cancelled) and/or a date range. Use it to review the calendar or find an item ID. Returns up to limit items (default 50, max 500) and the total.",
    inputSchema: getScheduledContentSchema,
    outputSchema: {
      content: z7.array(scheduledShape).describe("Items in this page, earliest first"),
      total: z7.number().describe("Items matching the filters")
    },
    annotations: LOCAL_READ
  },
  async ({ limit, ...params }) => guarded(async () => {
    const content = getScheduledContent({
      ...params,
      startDate: optionalDate(params.startDate, "startDate"),
      endDate: optionalDate(params.endDate, "endDate")
    });
    return ok({ content: content.slice(0, limit), total: content.length });
  })
);
server.registerTool(
  "creator_schedule_upcoming",
  {
    title: "Get upcoming content",
    description: "Return pending queued content due within the next N hours (default 24, max 720), earliest first. Use it for a daily or weekly publishing check. Returns the items and their count; reads the in-memory queue only, instant.",
    inputSchema: getUpcomingContentSchema,
    outputSchema: {
      content: z7.array(scheduledShape).describe("Pending items due in the window, earliest first"),
      count: z7.number().describe("Number of items")
    },
    annotations: LOCAL_READ
  },
  async ({ hours }) => {
    const content = getUpcomingContent(hours);
    return ok({ content, count: content.length });
  }
);
server.registerTool(
  "creator_schedule_cancel",
  {
    title: "Cancel scheduled content",
    description: "Mark a pending queued item as cancelled so it will not be treated as due. Only pending items can be cancelled, and it cannot be undone (re-schedule instead). Returns success, or an error for an unknown or non-pending ID.",
    inputSchema: cancelScheduledContentSchema,
    outputSchema: { simulated, success: z7.boolean() },
    annotations: LOCAL_OVERWRITE
  },
  async (params) => social(await cancelScheduledContent(params.contentId))
);
server.registerTool(
  "creator_schedule_reschedule",
  {
    title: "Reschedule content",
    description: "Move a pending queued item to a new future time, replacing its previous time. Only pending items can be moved. Returns the updated item, or an error when the ID is unknown, the item is not pending or the time is in the past.",
    inputSchema: rescheduleContentSchema,
    outputSchema: { simulated, success: z7.boolean(), scheduled: scheduledShape.describe("The updated item") },
    annotations: LOCAL_OVERWRITE
  },
  async (params) => guarded(async () => social(await rescheduleContent({
    contentId: params.contentId,
    newScheduledFor: parseDate(params.newScheduledFor, "newScheduledFor")
  })))
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);
