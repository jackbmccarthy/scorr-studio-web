import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// PUBLIC LINKS
// ==========================================

export const createPublicLink = mutation({
  args: {
    type: v.string(), // "scoring" | "display" | "umpire" | "share"
    tenantId: v.string(),
    sportId: v.string(),
    stageId: v.optional(v.string()),
    displayId: v.optional(v.string()),
    matchId: v.optional(v.string()),
    umpireId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique URL ID
    const urlId = crypto.randomUUID().slice(0, 8);
    
    const publicLink = await ctx.db.insert("publicLinks", {
      urlId,
      type: args.type,
      tenantId: args.tenantId,
      sportId: args.sportId,
      stageId: args.stageId,
      displayId: args.displayId,
      matchId: args.matchId,
      umpireId: args.umpireId,
      createdAt: new Date().toISOString(),
    });

    return { urlId, _id: publicLink };
  },
});

export const getPublicLink = query({
  args: { urlId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("publicLinks")
      .withIndex("by_urlId", (q) => q.eq("urlId", args.urlId))
      .first();

    return link;
  },
});

export const revokePublicLink = mutation({
  args: { urlId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("publicLinks")
      .withIndex("by_urlId", (q) => q.eq("urlId", args.urlId))
      .first();

    if (!link) {
      throw new Error("Public link not found");
    }

    await ctx.db.delete(link._id);

    return { success: true };
  },
});

// ==========================================
// STAGES (Broadcast Configuration)
// ==========================================

export const createStage = mutation({
  args: {
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const stageId = crypto.randomUUID();
    
    const stage = await ctx.db.insert("stages", {
      stageId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      name: args.name,
      createdAt: new Date().toISOString(),
    });

    return { stageId, _id: stage };
  },
});

export const getStage = query({
  args: { stageId: v.string() },
  handler: async (ctx, args) => {
    const stage = await ctx.db
      .query("stages")
      .filter((q) => q.eq(q.field("stageId"), args.stageId))
      .first();

    return stage;
  },
});

export const updateStage = mutation({
  args: {
    stageId: v.string(),
    currentMatchId: v.optional(v.string()),
    queue: v.optional(v.array(v.string())),
    currentScene: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stage = await ctx.db
      .query("stages")
      .filter((q) => q.eq(q.field("stageId"), args.stageId))
      .first();

    if (!stage) {
      throw new Error("Stage not found");
    }

    const updates: any = {};
    if (args.currentMatchId !== undefined) updates.currentMatchId = args.currentMatchId;
    if (args.queue !== undefined) updates.queue = args.queue;
    if (args.currentScene !== undefined) updates.currentScene = args.currentScene;

    await ctx.db.patch(stage._id, updates);

    return { success: true };
  },
});
