import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// QUERIES
// ==========================================

export const list = query({
  args: {
    tenantId: v.string(),
    sportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    let displays = await ctx.db
      .query("scoreDisplays")
      .withIndex("by_tenant_sport", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.sportId) {
      displays = displays.filter(d => d.sportId === args.sportId);
    }

    return displays;
  },
});

export const getById = query({
  args: { displayId: v.string() },
  handler: async (ctx, args) => {
    const display = await ctx.db
      .query("scoreDisplays")
      .filter((q) => q.eq(q.field("displayId"), args.displayId))
      .first();

    return display;
  },
});

// ==========================================
// MUTATIONS
// ==========================================

export const create = mutation({
  args: {
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    type: v.optional(v.string()),
    width: v.number(),
    height: v.number(),
    theme: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const displayId = `disp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const now = Date.now();
    await ctx.db.insert("scoreDisplays", {
      displayId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      name: args.name,
      type: args.type || "standard",
      width: args.width,
      height: args.height,
      theme: args.theme,
      createdAt: now,
      updatedAt: now,
    });

    return { displayId };
  },
});

export const update = mutation({
  args: {
    displayId: v.string(),
    name: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    theme: v.optional(v.any()),
    sceneData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scoreDisplays")
      .filter((q) => q.eq(q.field("displayId"), args.displayId))
      .first();

    if (!existing) {
      throw new Error("Display not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.width !== undefined) updates.width = args.width;
    if (args.height !== undefined) updates.height = args.height;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.sceneData !== undefined) updates.sceneData = args.sceneData;

    await ctx.db.patch(existing._id, updates);

    return { success: true };
  },
});

export const remove = mutation({
  args: { displayId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scoreDisplays")
      .filter((q) => q.eq(q.field("displayId"), args.displayId))
      .first();

    if (!existing) {
      throw new Error("Display not found");
    }

    await ctx.db.delete(existing._id);

    return { success: true };
  },
});
