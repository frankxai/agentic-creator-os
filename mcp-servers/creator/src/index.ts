import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as Twitter from "./social/twitter.js";
import * as LinkedIn from "./social/linkedin.js";
import * as Instagram from "./social/instagram.js";
import * as Farcaster from "./social/farcaster.js";
import * as Analytics from "./social/analytics.js";
import * as Scheduler from "./social/scheduler.js";

const server = new McpServer({
  name: "creator",
  version: "1.1.0"
});

interface Article {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "active" | "inactive";
  projects: string[];
  createdAt: Date;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  status: "planning" | "active" | "completed" | "on_hold";
  budget?: number;
  deadline?: Date;
  createdAt: Date;
}

const articles: Map<string, Article> = new Map();
const clients: Map<string, Client> = new Map();
const projects: Map<string, Project> = new Map();

const ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
const PROJECT_STATUSES = ["planning", "active", "completed", "on_hold"] as const;

// Tool metadata shared by the surface. Social tools are simulations: they keep records in this
// process's memory and never call a platform API, so they are closed-world and non-publishing.
const SIMULATED = "Simulated: stored in this server's memory only (lost on restart); no platform API is called and nothing is published.";
const SIMULATED_METRICS = "Simulated: the numbers are randomly generated sample data, not real platform analytics.";
const LOCAL_CREATE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const LOCAL_OVERWRITE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
const LOCAL_READ = { readOnlyHint: true, openWorldHint: false };

const id = () => z.string().min(1).max(100);
const record = <T extends z.ZodRawShape>(shape: T) => z.object(shape).passthrough();

const articleShape = record({
  id: z.string(), title: z.string(), content: z.string(), status: z.enum(ARTICLE_STATUSES), tags: z.array(z.string()),
  createdAt: z.string(), updatedAt: z.string()
});
const clientShape = record({
  id: z.string(), name: z.string(), email: z.string(), status: z.enum(["active", "inactive"]), projects: z.array(z.string()), createdAt: z.string()
});
const projectShape = record({
  id: z.string(), name: z.string(), clientId: z.string(), status: z.enum(PROJECT_STATUSES), createdAt: z.string()
});
const postShape = record({ id: z.string(), status: z.string(), createdAt: z.string() });
const scheduledShape = record({
  id: z.string(), platform: z.string(), type: z.string(), content: z.unknown(), scheduledFor: z.string(), status: z.string()
});
const simulated = z.literal(true).describe("Always true: this is an in-memory simulation, not a live platform call");

/** JSON round trip: Dates become ISO strings, so the text block and structuredContent match exactly. */
function ok<T extends Record<string, unknown>>(data: T) {
  const plain = JSON.parse(JSON.stringify(data)) as T;
  return { content: [{ type: "text" as const, text: JSON.stringify(plain, null, 2) }], structuredContent: plain };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

function social<T extends { success: boolean; error?: string }>(result: T) {
  return result.success ? ok({ simulated: true as const, ...result }) : fail(`Error: ${result.error}`);
}

function parseDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} '${value}' is not an ISO 8601 date-time, e.g. 2026-10-01T09:00:00Z`);
  return date;
}

function optionalDate(value: string | undefined, field: string): Date | undefined {
  return value === undefined ? undefined : parseDate(value, field);
}

async function guarded<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

// ---------------------------------------------------------------------------
// Articles, clients and projects (in-memory creator CRM)
// ---------------------------------------------------------------------------

server.registerTool(
  "creator_create_article",
  {
    title: "Create article",
    description: "Start a new article draft in the creator workspace (in-memory, lost on restart; use database_create_article to persist). Each call creates a new draft with a fresh ID. Returns the full article record including its ID and timestamps.",
    inputSchema: {
      title: z.string().min(1).max(500).describe("Article title"),
      content: z.string().max(500_000).describe("Article body, usually Markdown"),
      tags: z.array(z.string().max(100)).max(50).default([]).describe("Tags for filtering and SEO")
    },
    outputSchema: { article: articleShape.describe("The new draft") },
    annotations: LOCAL_CREATE
  },
  async ({ title, content, tags }) => {
    const now = new Date();
    const article: Article = { id: crypto.randomUUID(), title, content, status: "draft", tags, createdAt: now, updatedAt: now };
    articles.set(article.id, article);
    return ok({ article });
  }
);

server.registerTool(
  "creator_update_article",
  {
    title: "Update article",
    description: "Overwrite fields of an in-memory article: title, body, status, tags or SEO title and description. Omitted fields are kept; previous values are not versioned. Returns the updated article, or an error when the ID is unknown.",
    inputSchema: {
      id: id().describe("Article ID from creator_create_article or creator_list_articles"),
      title: z.string().min(1).max(500).optional().describe("New title"),
      content: z.string().max(500_000).optional().describe("New body, replacing the old one"),
      status: z.enum(ARTICLE_STATUSES).optional().describe("New status"),
      tags: z.array(z.string().max(100)).max(50).optional().describe("New tags, replacing the old list"),
      seoTitle: z.string().max(70).optional().describe("SEO title (max 70 characters)"),
      seoDescription: z.string().max(160).optional().describe("SEO meta description (max 160 characters)")
    },
    outputSchema: { article: articleShape.describe("The updated article") },
    annotations: LOCAL_OVERWRITE
  },
  async ({ id: articleId, title, content, status, tags, seoTitle, seoDescription }) => {
    const article = articles.get(articleId);
    if (!article) return fail(`Article not found: ${articleId}. Use creator_list_articles to find IDs.`);

    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (status !== undefined) article.status = status;
    if (tags !== undefined) article.tags = tags;
    if (seoTitle !== undefined) article.seoTitle = seoTitle;
    if (seoDescription !== undefined) article.seoDescription = seoDescription;
    article.updatedAt = new Date();

    return ok({ article });
  }
);

server.registerTool(
  "creator_get_article",
  {
    title: "Get article",
    description: "Fetch one in-memory article by ID, as returned by creator_create_article or creator_list_articles. Returns the full record including body, status, tags and SEO fields, or an error when the ID is unknown. Instant, local only.",
    inputSchema: {
      id: id().describe("Article ID")
    },
    outputSchema: { article: articleShape.describe("The article") },
    annotations: LOCAL_READ
  },
  async ({ id: articleId }) => {
    const article = articles.get(articleId);
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
      status: z.enum(ARTICLE_STATUSES).optional().describe("Only articles with this status"),
      limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of articles")
    },
    outputSchema: {
      articles: z.array(articleShape).describe("Articles in this page"),
      total: z.number().describe("Articles matching the filter")
    },
    annotations: LOCAL_READ
  },
  async ({ status, limit }) => {
    const matching = Array.from(articles.values()).filter((a) => !status || a.status === status);
    return ok({ articles: matching.slice(0, limit), total: matching.length });
  }
);

server.registerTool(
  "creator_create_client",
  {
    title: "Create client",
    description: "Add a client record (name, email, optional company) to the in-memory creator CRM for tracking projects. Each call creates a new client, even for a repeated email. Returns the client record with its ID for creator_create_project.",
    inputSchema: {
      name: z.string().min(1).max(200).describe("Client name"),
      email: z.string().email().max(254).describe("Client email"),
      company: z.string().max(200).optional().describe("Company name")
    },
    outputSchema: { client: clientShape.describe("The new client") },
    annotations: LOCAL_CREATE
  },
  async ({ name, email, company }) => {
    const client: Client = { id: crypto.randomUUID(), name, email, company, status: "active", projects: [], createdAt: new Date() };
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
      id: id().describe("Client ID")
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
      status: z.enum(["active", "inactive"]).optional().describe("Only clients with this status"),
      limit: z.number().int().min(1).max(500).default(100).describe("Maximum clients to return")
    },
    outputSchema: {
      clients: z.array(clientShape).describe("Clients in this page"),
      total: z.number().describe("Clients matching the filter")
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
      name: z.string().min(1).max(200).describe("Project name"),
      clientId: id().describe("Client ID from creator_create_client"),
      budget: z.number().min(0).max(1e12).optional().describe("Budget in your currency"),
      deadline: z.string().max(40).optional().describe("Deadline, ISO 8601 date")
    },
    outputSchema: { project: projectShape.describe("The new project") },
    annotations: LOCAL_CREATE
  },
  async ({ name, clientId, budget, deadline }) => guarded(async () => {
    const client = clients.get(clientId);
    if (!client) return fail(`Client not found: ${clientId}. Use creator_list_clients to find IDs.`);

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      clientId,
      status: "planning",
      budget,
      deadline: optionalDate(deadline, "deadline"),
      createdAt: new Date()
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
      id: id().describe("Project ID")
    },
    outputSchema: {
      project: projectShape.describe("The project"),
      client: record({ id: z.string(), name: z.string() }).nullable().describe("Owning client, or null if it was removed")
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
      status: z.enum(PROJECT_STATUSES).optional().describe("Only projects with this status"),
      clientId: id().optional().describe("Only projects for this client"),
      limit: z.number().int().min(1).max(500).default(100).describe("Maximum projects to return")
    },
    outputSchema: {
      projects: z.array(projectShape).describe("Projects in this page"),
      total: z.number().describe("Projects matching the filters")
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
      id: id().describe("Project ID"),
      status: z.enum(PROJECT_STATUSES).describe("New status")
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
      articleId: id().describe("Article ID")
    },
    outputSchema: {
      title: z.string().describe("Article title"),
      status: z.enum(ARTICLE_STATUSES).describe("Article status"),
      tags: z.array(z.string()).describe("Article tags"),
      wordCount: z.number().describe("Words in the body"),
      sentenceCount: z.number().describe("Sentences in the body"),
      avgSentenceLength: z.number().describe("Average words per sentence, one decimal"),
      createdAt: z.string().describe("Creation time"),
      updatedAt: z.string().describe("Last update time")
    },
    annotations: LOCAL_READ
  },
  async ({ articleId }) => {
    const article = articles.get(articleId);
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

// ---------------------------------------------------------------------------
// Social platforms (simulated)
// ---------------------------------------------------------------------------

server.registerTool(
  "creator_twitter_post",
  {
    title: "Draft tweet (simulated)",
    description: `Record a tweet (max 280 characters), optionally scheduled or as a reply, to rehearse an X/Twitter posting flow. ${SIMULATED} Returns the stored tweet with its local ID and status.`,
    inputSchema: Twitter.postTweetSchema,
    outputSchema: { simulated, success: z.boolean(), tweet: postShape.describe("The stored tweet") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Twitter.postTweet({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_twitter_thread",
  {
    title: "Draft Twitter thread (simulated)",
    description: `Record a thread of up to 25 tweets, each max 280 characters, linked as replies in order. ${SIMULATED} Returns the thread with its local ID and the stored tweets.`,
    inputSchema: Twitter.createThreadSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      thread: record({ id: z.string(), tweets: z.array(postShape), status: z.string() }).describe("The stored thread")
    },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Twitter.createThread({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_twitter_analytics",
  {
    title: "Get tweet analytics (simulated)",
    description: `Read impressions, likes, retweets, replies and engagement rate for a tweet recorded by creator_twitter_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: Twitter.getTweetAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      analytics: record({ impressions: z.number(), likes: z.number(), retweets: z.number(), replies: z.number(), engagementRate: z.number() }).describe("Tweet metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await Twitter.getTweetAnalytics(params.tweetId))
);

server.registerTool(
  "creator_linkedin_post",
  {
    title: "Draft LinkedIn post (simulated)",
    description: `Record a LinkedIn post (max 3000 characters) with optional media, visibility and schedule, to rehearse a LinkedIn flow. ${SIMULATED} Returns the stored post with its local ID and status.`,
    inputSchema: LinkedIn.createPostSchema,
    outputSchema: { simulated, success: z.boolean(), post: postShape.describe("The stored post") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await LinkedIn.createPost({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_linkedin_article",
  {
    title: "Draft LinkedIn article (simulated)",
    description: `Record a long-form LinkedIn article (title max 150, body max 125,000 characters) as a draft or published. ${SIMULATED} Returns the stored article with its local ID and status.`,
    inputSchema: LinkedIn.createArticleSchema,
    outputSchema: { simulated, success: z.boolean(), article: postShape.describe("The stored article") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await LinkedIn.createArticle(params))
);

server.registerTool(
  "creator_linkedin_analytics",
  {
    title: "Get LinkedIn post analytics (simulated)",
    description: `Read impressions, likes, comments, shares and click-through rate for a post recorded by creator_linkedin_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: LinkedIn.getPostAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      analytics: record({ impressions: z.number(), likes: z.number(), comments: z.number(), shares: z.number(), clickThroughRate: z.number() }).describe("Post metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await LinkedIn.getPostAnalytics(params.postId))
);

server.registerTool(
  "creator_instagram_post",
  {
    title: "Draft Instagram post (simulated)",
    description: `Record an Instagram feed post, carousel or reel with caption (max 2200 characters), 1-10 media URLs, tags and optional schedule. ${SIMULATED} Returns the stored post with its local ID.`,
    inputSchema: Instagram.createPostSchema,
    outputSchema: { simulated, success: z.boolean(), post: postShape.describe("The stored post") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Instagram.createPost({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_instagram_story",
  {
    title: "Draft Instagram story (simulated)",
    description: `Record an Instagram story from one image or video URL, with an optional link and up to 10 stickers; stories expire after 24 hours. ${SIMULATED} Returns the stored story with its local ID.`,
    inputSchema: Instagram.createStorySchema,
    outputSchema: { simulated, success: z.boolean(), story: record({ id: z.string(), mediaUrl: z.string(), expiresAt: z.string() }).describe("The stored story") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await Instagram.createStory(params as Parameters<typeof Instagram.createStory>[0]))
);

server.registerTool(
  "creator_instagram_analytics",
  {
    title: "Get Instagram post analytics (simulated)",
    description: `Read impressions, reach, likes, comments, saves, shares and engagement rate for a post recorded by creator_instagram_post. ${SIMULATED_METRICS} Returns the metrics object.`,
    inputSchema: Instagram.getPostAnalyticsSchema,
    outputSchema: { simulated, success: z.boolean(), analytics: record({ reach: z.number(), engagementRate: z.number() }).describe("Post metrics") },
    annotations: LOCAL_READ
  },
  async (params) => social(await Instagram.getPostAnalytics(params.postId))
);

server.registerTool(
  "creator_farcaster_cast",
  {
    title: "Draft Farcaster cast (simulated)",
    description: `Record a Farcaster cast (max 320 characters) with optional channel, reply target, embeds, mentions and schedule. ${SIMULATED} Returns the stored cast with its local ID and status.`,
    inputSchema: Farcaster.createCastSchema,
    outputSchema: { simulated, success: z.boolean(), cast: postShape.describe("The stored cast") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Farcaster.createCast({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") } as Parameters<typeof Farcaster.createCast>[0])))
);

server.registerTool(
  "creator_farcaster_thread",
  {
    title: "Draft Farcaster thread (simulated)",
    description: `Record a thread of up to 25 Farcaster casts (max 320 characters each), linked as replies, optionally in a channel or scheduled. ${SIMULATED} Returns the stored casts in order.`,
    inputSchema: Farcaster.createThreadSchema,
    outputSchema: { simulated, success: z.boolean(), thread: z.array(postShape).describe("The stored casts in order") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Farcaster.createThread({ ...params, scheduledFor: optionalDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_farcaster_frame",
  {
    title: "Draft Farcaster frame (simulated)",
    description: `Record an interactive frame (image plus 1-4 buttons, optional input and post URL) attached to a cast from creator_farcaster_cast. ${SIMULATED} Returns the stored frame with its local ID.`,
    inputSchema: Farcaster.createFrameSchema,
    outputSchema: { simulated, success: z.boolean(), frame: record({ id: z.string(), castId: z.string(), imageUrl: z.string() }).describe("The stored frame") },
    annotations: LOCAL_CREATE
  },
  async (params) => social(await Farcaster.createFrame(params as Parameters<typeof Farcaster.createFrame>[0]))
);

server.registerTool(
  "creator_farcaster_analytics",
  {
    title: "Get Farcaster cast analytics (simulated)",
    description: `Read reactions, recasts, replies and watches for a cast recorded by creator_farcaster_cast. ${SIMULATED_METRICS} Returns the metrics object, or an error for an unknown cast ID.`,
    inputSchema: Farcaster.getCastAnalyticsSchema,
    outputSchema: { simulated, success: z.boolean(), analytics: z.object({}).passthrough().describe("Cast metrics") },
    annotations: LOCAL_READ
  },
  async (params) => social(await Farcaster.getCastAnalytics(params.castId))
);

server.registerTool(
  "creator_analytics_aggregated",
  {
    title: "Get cross-platform analytics (simulated)",
    description: `Summarise posts, impressions and engagement per platform and in total for a date range, with the best platform and recommendations. ${SIMULATED_METRICS} Do not report these figures as real results.`,
    inputSchema: Analytics.getAggregatedAnalyticsSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      analytics: record({
        platforms: z.array(z.object({}).passthrough()),
        totals: z.object({}).passthrough(),
        bestPerformingPlatform: z.string(),
        recommendations: z.array(z.string())
      }).describe("Aggregated metrics")
    },
    annotations: LOCAL_READ
  },
  async (params) => guarded(async () => social(await Analytics.getAggregatedAnalytics({
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
    inputSchema: Analytics.getBestPostingTimesSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      times: z.array(z.object({ dayOfWeek: z.string(), hour: z.number(), score: z.number() })).describe("Suggested slots")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await Analytics.getBestPostingTimes(params))
);

server.registerTool(
  "creator_analytics_trends",
  {
    title: "Get engagement trends (simulated)",
    description: `Return one row per day for the last 1-90 days with impressions, engagements and engagement rate for a platform. ${SIMULATED_METRICS} Useful only to prototype charts or reports.`,
    inputSchema: Analytics.getEngagementTrendsSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      trends: z.array(z.object({ date: z.string(), impressions: z.number(), engagements: z.number(), rate: z.number() })).describe("Daily rows, oldest first")
    },
    annotations: LOCAL_READ
  },
  async (params) => social(await Analytics.getEngagementTrends(params))
);

server.registerTool(
  "creator_schedule_content",
  {
    title: "Schedule content (simulated)",
    description: `Queue one piece of content for a platform at a future time, optionally refusing when another item is queued within 15 minutes. ${SIMULATED} Nothing is ever posted when the time arrives. Returns the queued item.`,
    inputSchema: Scheduler.scheduleContentSchema,
    outputSchema: { simulated, success: z.boolean(), scheduled: scheduledShape.describe("The queued item") },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => social(await Scheduler.scheduleContent({ ...params, scheduledFor: parseDate(params.scheduledFor, "scheduledFor") })))
);

server.registerTool(
  "creator_schedule_bulk",
  {
    title: "Bulk schedule content (simulated)",
    description: `Queue up to 100 items at once, optionally shifting items that collide with queued content by conflictGapMinutes. ${SIMULATED} Returns the queued items and, if any failed, their indexes and errors.`,
    inputSchema: Scheduler.bulkScheduleSchema,
    outputSchema: {
      simulated,
      success: z.boolean(),
      scheduled: z.array(scheduledShape).describe("Items queued"),
      failed: z.array(z.object({ index: z.number(), error: z.string() })).optional().describe("Items that could not be queued")
    },
    annotations: LOCAL_CREATE
  },
  async (params) => guarded(async () => {
    const result = await Scheduler.bulkSchedule({
      ...params,
      posts: params.posts.map((post, index) => ({ ...post, scheduledFor: parseDate(post.scheduledFor, `posts[${index}].scheduledFor`) }))
    } as Parameters<typeof Scheduler.bulkSchedule>[0]);
    return ok({ simulated: true as const, ...result });
  })
);

server.registerTool(
  "creator_schedule_list",
  {
    title: "List scheduled content",
    description: "List queued content sorted by scheduled time, filtered by platform, status (pending, published, failed, cancelled) and/or a date range. Use it to review the calendar or find an item ID. Returns up to limit items (default 50, max 500) and the total.",
    inputSchema: Scheduler.getScheduledContentSchema,
    outputSchema: {
      content: z.array(scheduledShape).describe("Items in this page, earliest first"),
      total: z.number().describe("Items matching the filters")
    },
    annotations: LOCAL_READ
  },
  async ({ limit, ...params }) => guarded(async () => {
    const content = Scheduler.getScheduledContent({
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
    inputSchema: Scheduler.getUpcomingContentSchema,
    outputSchema: {
      content: z.array(scheduledShape).describe("Pending items due in the window, earliest first"),
      count: z.number().describe("Number of items")
    },
    annotations: LOCAL_READ
  },
  async ({ hours }) => {
    const content = Scheduler.getUpcomingContent(hours);
    return ok({ content, count: content.length });
  }
);

server.registerTool(
  "creator_schedule_cancel",
  {
    title: "Cancel scheduled content",
    description: "Mark a pending queued item as cancelled so it will not be treated as due. Only pending items can be cancelled, and it cannot be undone (re-schedule instead). Returns success, or an error for an unknown or non-pending ID.",
    inputSchema: Scheduler.cancelScheduledContentSchema,
    outputSchema: { simulated, success: z.boolean() },
    annotations: LOCAL_OVERWRITE
  },
  async (params) => social(await Scheduler.cancelScheduledContent(params.contentId))
);

server.registerTool(
  "creator_schedule_reschedule",
  {
    title: "Reschedule content",
    description: "Move a pending queued item to a new future time, replacing its previous time. Only pending items can be moved. Returns the updated item, or an error when the ID is unknown, the item is not pending or the time is in the past.",
    inputSchema: Scheduler.rescheduleContentSchema,
    outputSchema: { simulated, success: z.boolean(), scheduled: scheduledShape.describe("The updated item") },
    annotations: LOCAL_OVERWRITE
  },
  async (params) => guarded(async () => social(await Scheduler.rescheduleContent({
    contentId: params.contentId,
    newScheduledFor: parseDate(params.newScheduledFor, "newScheduledFor")
  })))
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
