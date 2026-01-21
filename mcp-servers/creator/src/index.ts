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
  version: "1.0.0"
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

server.registerTool(
  "create_article",
  {
    title: "Create Article",
    description: "Create a new article for blog or content",
    inputSchema: {
      title: z.string().min(1).describe("Article title"),
      content: z.string().describe("Article content"),
      tags: z.array(z.string()).optional().describe("Article tags")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ title, content, tags = [] }) => {
    const id = crypto.randomUUID();
    const article: Article = {
      id,
      title,
      content,
      status: "draft",
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    articles.set(id, article);
    
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
      id: z.string().describe("Article ID"),
      title: z.string().optional().describe("New title"),
      content: z.string().optional().describe("New content"),
      status: z.enum(["draft", "published", "archived"]).optional().describe("New status"),
      tags: z.array(z.string()).optional().describe("New tags"),
      seoTitle: z.string().optional().describe("SEO title"),
      seoDescription: z.string().optional().describe("SEO description")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ id, title, content, status, tags, seoTitle, seoDescription }) => {
    const article = articles.get(id);
    
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
    article.updatedAt = new Date();
    
    articles.set(id, article);
    
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
      id: z.string().describe("Article ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ id }) => {
    const article = articles.get(id);
    
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
      status: z.enum(["draft", "published", "archived"]).optional().describe("Filter by status"),
      limit: z.number().max(100).default(50).describe("Maximum number of articles")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ status, limit }) => {
    let result = Array.from(articles.values());
    
    if (status) {
      result = result.filter(a => a.status === status);
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
      name: z.string().min(1).describe("Client name"),
      email: z.string().email().describe("Client email"),
      company: z.string().optional().describe("Company name")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ name, email, company }) => {
    const id = crypto.randomUUID();
    const client: Client = {
      id,
      name,
      email,
      company,
      status: "active",
      projects: [],
      createdAt: new Date()
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
      id: z.string().describe("Client ID")
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
      name: z.string().min(1).describe("Project name"),
      clientId: z.string().describe("Client ID"),
      budget: z.number().optional().describe("Project budget"),
      deadline: z.string().optional().describe("Project deadline (ISO date)")
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
    const project: Project = {
      id,
      name,
      clientId,
      status: "planning",
      budget,
      deadline: deadline ? new Date(deadline) : undefined,
      createdAt: new Date()
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
      id: z.string().describe("Project ID")
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
      status: z.enum(["planning", "active", "completed", "on_hold"]).optional().describe("Filter by status"),
      clientId: z.string().optional().describe("Filter by client")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ status, clientId }) => {
    let result = Array.from(projects.values());
    
    if (status) {
      result = result.filter(p => p.status === status);
    }
    
    if (clientId) {
      result = result.filter(p => p.clientId === clientId);
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
      id: z.string().describe("Project ID"),
      status: z.enum(["planning", "active", "completed", "on_hold"]).describe("New status")
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
      articleId: z.string().describe("Article ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ articleId }) => {
    const article = articles.get(articleId);
    
    if (!article) {
      return {
        content: [{ type: "text", text: `Article not found: ${articleId}` }],
        isError: true
      };
    }
    
    const wordCount = article.content.split(/\s+/).length;
    const sentences = article.content.split(/[.!?]+/).filter(s => s.trim());
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
    inputSchema: Twitter.postTweetSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Twitter.postTweet({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: Twitter.createThreadSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Twitter.createThread({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: Twitter.getTweetAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Twitter.getTweetAnalytics(params.tweetId);
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
    inputSchema: LinkedIn.createPostSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await LinkedIn.createPost({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: LinkedIn.createArticleSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await LinkedIn.createArticle(params);
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
    inputSchema: LinkedIn.getPostAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await LinkedIn.getPostAnalytics(params.postId);
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
    inputSchema: Instagram.createPostSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Instagram.createPost({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: Instagram.createStorySchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Instagram.createStory(params);
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
    inputSchema: Instagram.getPostAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Instagram.getPostAnalytics(params.postId);
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
    inputSchema: Farcaster.createCastSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Farcaster.createCast({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: Farcaster.createThreadSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Farcaster.createThread({
      ...params,
      scheduledFor: params.scheduledFor ? new Date(params.scheduledFor) : undefined
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
    inputSchema: Farcaster.createFrameSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Farcaster.createFrame(params);
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
    inputSchema: Farcaster.getCastAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Farcaster.getCastAnalytics(params.castId);
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
    inputSchema: Analytics.getAggregatedAnalyticsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Analytics.getAggregatedAnalytics({
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
    inputSchema: Analytics.getBestPostingTimesSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Analytics.getBestPostingTimes(params);
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
    inputSchema: Analytics.getEngagementTrendsSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const result = await Analytics.getEngagementTrends(params);
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
    inputSchema: Scheduler.scheduleContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Scheduler.scheduleContent({
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
    inputSchema: Scheduler.bulkScheduleSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Scheduler.bulkSchedule({
      ...params,
      posts: params.posts.map(p => ({
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
    inputSchema: Scheduler.getScheduledContentSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const content = Scheduler.getScheduledContent({
      ...params,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined
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
    inputSchema: Scheduler.getUpcomingContentSchema,
    annotations: { readOnlyHint: true }
  },
  async (params) => {
    const content = Scheduler.getUpcomingContent(params.hours);
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
    inputSchema: Scheduler.cancelScheduledContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Scheduler.cancelScheduledContent(params.contentId);
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
    inputSchema: Scheduler.rescheduleContentSchema,
    annotations: { destructiveHint: false }
  },
  async (params) => {
    const result = await Scheduler.rescheduleContent({
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
