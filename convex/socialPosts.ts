import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Create a social post (draft)
export const createSocialPost = mutation({
  args: {
    tenantId: v.string(),
    matchId: v.optional(v.string()),
    competitionId: v.optional(v.string()),
    platform: v.string(), // "twitter" | "facebook" | "instagram"
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.string()),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = nanoid();

    await ctx.db.insert("socialPosts", {
      postId,
      tenantId: args.tenantId,
      matchId: args.matchId,
      competitionId: args.competitionId,
      platform: args.platform,
      content: args.content,
      mediaUrls: args.mediaUrls,
      status: args.scheduledFor ? "scheduled" : "draft",
      scheduledFor: args.scheduledFor,
      templateId: args.templateId,
      createdAt: new Date().toISOString(),
    });

    return { postId };
  },
});

// Update a social post
export const updateSocialPost = mutation({
  args: {
    postId: v.string(),
    tenantId: v.string(),
    content: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    scheduledFor: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .first();

    if (!post || post.tenantId !== args.tenantId) {
      throw new Error("Post not found or unauthorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (args.content !== undefined) updates.content = args.content;
    if (args.mediaUrls !== undefined) updates.mediaUrls = args.mediaUrls;
    if (args.scheduledFor !== undefined) {
      updates.scheduledFor = args.scheduledFor;
      updates.status = "scheduled";
    }
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(post._id, updates);

    return { success: true };
  },
});

// Delete a social post
export const deleteSocialPost = mutation({
  args: {
    postId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .first();

    if (!post || post.tenantId !== args.tenantId) {
      throw new Error("Post not found or unauthorized");
    }

    await ctx.db.delete(post._id);

    return { success: true };
  },
});

// List social posts
export const listSocialPosts = query({
  args: {
    tenantId: v.string(),
    status: v.optional(v.string()),
    platform: v.optional(v.string()),
    competitionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("socialPosts")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.status) {
      posts = posts.filter(p => p.status === args.status);
    }

    if (args.platform) {
      posts = posts.filter(p => p.platform === args.platform);
    }

    if (args.competitionId) {
      posts = posts.filter(p => p.competitionId === args.competitionId);
    }

    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get scheduled posts (for cron job)
export const getScheduledPosts = query({
  args: {
    before: v.string(), // ISO timestamp
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialPosts")
      .withIndex("by_scheduled", (q) => q.lt("scheduledFor", args.before))
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();
  },
});

// Mark post as published
export const markPostPublished = mutation({
  args: {
    postId: v.string(),
    postIdExternal: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .first();

    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(post._id, {
      status: "published",
      publishedAt: new Date().toISOString(),
      postIdExternal: args.postIdExternal,
    });

    return { success: true };
  },
});

// Mark post as failed
export const markPostFailed = mutation({
  args: {
    postId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .first();

    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(post._id, {
      status: "failed",
      error: args.error,
    });

    return { success: true };
  },
});

// Update post analytics
export const updatePostAnalytics = mutation({
  args: {
    postId: v.string(),
    analytics: v.object({
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      impressions: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .first();

    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(post._id, {
      analytics: {
        ...args.analytics,
        lastUpdatedAt: new Date().toISOString(),
      },
    });

    return { success: true };
  },
});

// Generate auto-post content from match result
export const generateMatchResultPost = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
    platform: v.string(),
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("matchId"), args.matchId))
      .first();

    if (!match) {
      throw new Error("Match not found");
    }

    // Generate post content based on match result
    const team1Name = match.team1?.name ?? "Team 1";
    const team2Name = match.team2?.name ?? "Team 2";
    const team1Score = match.team1?.score ?? 0;
    const team2Score = match.team2?.score ?? 0;

    let content: string;
    
    if (args.template) {
      // Use custom template
      content = args.template
        .replace("{team1}", team1Name)
        .replace("{team2}", team2Name)
        .replace("{score1}", String(team1Score))
        .replace("{score2}", String(team2Score));
    } else {
      // Default template
      const winner = team1Score > team2Score ? team1Name : team2Name;
      content = `🏆 Final: ${team1Name} ${team1Score} - ${team2Score} ${team2Name}\n\n${winner} wins! #Sports #Live`;
    }

    // Create post as draft
    const postId = nanoid();
    await ctx.db.insert("socialPosts", {
      postId,
      tenantId: args.tenantId,
      matchId: args.matchId,
      competitionId: match.competitionId,
      platform: args.platform,
      content,
      status: "draft",
      createdAt: new Date().toISOString(),
    });

    return { postId, content };
  },
});
