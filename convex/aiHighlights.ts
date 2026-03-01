import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Store AI-generated content
export const storeAIContent = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
    type: v.string(), // "commentary" | "prediction" | "summary" | "key_moment"
    content: v.string(),
    confidence: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const highlightId = nanoid();

    await ctx.db.insert("aiHighlights", {
      highlightId,
      matchId: args.matchId,
      tenantId: args.tenantId,
      type: args.type,
      content: args.content,
      confidence: args.confidence,
      metadata: args.metadata,
      createdAt: new Date().toISOString(),
    });

    return { highlightId };
  },
});

// Get AI content for a match
export const getAIContent = query({
  args: {
    matchId: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let highlights = await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    if (args.type) {
      highlights = highlights.filter(h => h.type === args.type);
    }

    return highlights.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get latest prediction for a match
export const getLatestPrediction = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const predictions = await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("type"), "prediction"))
      .order("desc")
      .first();

    return predictions ?? null;
  },
});

// Get key moments for a match
export const getKeyMoments = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("type"), "key_moment"))
      .collect();
  },
});

// Get match summary
export const getMatchSummary = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const summary = await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("type"), "summary"))
      .order("desc")
      .first();

    return summary ?? null;
  },
});

// Get recent commentary
export const getRecentCommentary = query({
  args: {
    matchId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const commentary = await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("type"), "commentary"))
      .order("desc")
      .take(args.limit ?? 10);

    return commentary.reverse(); // Oldest first for display
  },
});

// Delete old AI content (cleanup)
export const cleanupAIContent = mutation({
  args: {
    matchId: v.string(),
    olderThanHours: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = new Date(Date.now() - args.olderThanHours * 60 * 60 * 1000).toISOString();
    
    const oldContent = await ctx.db
      .query("aiHighlights")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();

    for (const content of oldContent) {
      await ctx.db.delete(content._id);
    }

    return { deletedCount: oldContent.length };
  },
});
