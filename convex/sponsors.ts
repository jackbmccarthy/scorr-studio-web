import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Create a sponsor
export const createSponsor = mutation({
  args: {
    tenantId: v.string(),
    competitionId: v.optional(v.string()),
    name: v.string(),
    logoUrl: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    tier: v.string(), // "platinum" | "gold" | "silver" | "bronze"
    displayOnScoreboard: v.boolean(),
    displayOnPrint: v.boolean(),
    displayOnStream: v.boolean(),
  },
  handler: async (ctx, args) => {
    const sponsorId = nanoid();
    
    // Get max display order for this tier
    const existingSponsors = await ctx.db
      .query("sponsors")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
    
    const tierSponsors = existingSponsors.filter(s => s.tier === args.tier);
    const maxOrder = Math.max(0, ...tierSponsors.map(s => s.displayOrder ?? 0));

    await ctx.db.insert("sponsors", {
      sponsorId,
      tenantId: args.tenantId,
      competitionId: args.competitionId,
      name: args.name,
      logoUrl: args.logoUrl,
      website: args.website,
      description: args.description,
      tier: args.tier,
      displayOnScoreboard: args.displayOnScoreboard,
      displayOnPrint: args.displayOnPrint,
      displayOnStream: args.displayOnStream,
      displayOrder: maxOrder + 1,
      active: true,
      createdAt: new Date().toISOString(),
    });

    return { sponsorId };
  },
});

// Update a sponsor
export const updateSponsor = mutation({
  args: {
    sponsorId: v.string(),
    tenantId: v.string(),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    tier: v.optional(v.string()),
    displayOnScoreboard: v.optional(v.boolean()),
    displayOnPrint: v.optional(v.boolean()),
    displayOnStream: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sponsor = await ctx.db
      .query("sponsors")
      .withIndex("by_sponsorId", (q) => q.eq("sponsorId", args.sponsorId))
      .first();

    if (!sponsor || sponsor.tenantId !== args.tenantId) {
      throw new Error("Sponsor not found or unauthorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;
    if (args.website !== undefined) updates.website = args.website;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tier !== undefined) updates.tier = args.tier;
    if (args.displayOnScoreboard !== undefined) updates.displayOnScoreboard = args.displayOnScoreboard;
    if (args.displayOnPrint !== undefined) updates.displayOnPrint = args.displayOnPrint;
    if (args.displayOnStream !== undefined) updates.displayOnStream = args.displayOnStream;
    if (args.active !== undefined) updates.active = args.active;

    await ctx.db.patch(sponsor._id, updates);

    return { success: true };
  },
});

// Delete a sponsor
export const deleteSponsor = mutation({
  args: {
    sponsorId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const sponsor = await ctx.db
      .query("sponsors")
      .withIndex("by_sponsorId", (q) => q.eq("sponsorId", args.sponsorId))
      .first();

    if (!sponsor || sponsor.tenantId !== args.tenantId) {
      throw new Error("Sponsor not found or unauthorized");
    }

    await ctx.db.delete(sponsor._id);

    return { success: true };
  },
});

// Get sponsors for display (scoreboard, print, stream)
export const getSponsorsForDisplay = query({
  args: {
    tenantId: v.string(),
    competitionId: v.optional(v.string()),
    displayType: v.optional(v.string()), // "scoreboard" | "print" | "stream"
  },
  handler: async (ctx, args) => {
    const allSponsors = await ctx.db
      .query("sponsors")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    let sponsors = allSponsors.filter(s => s.active);

    // Filter by competition if specified
    if (args.competitionId) {
      sponsors = sponsors.filter(s => 
        !s.competitionId || s.competitionId === args.competitionId
      );
    }

    // Filter by display type
    if (args.displayType === "scoreboard") {
      sponsors = sponsors.filter(s => s.displayOnScoreboard);
    } else if (args.displayType === "print") {
      sponsors = sponsors.filter(s => s.displayOnPrint);
    } else if (args.displayType === "stream") {
      sponsors = sponsors.filter(s => s.displayOnStream);
    }

    // Sort by tier priority and display order
    const tierPriority: Record<string, number> = {
      platinum: 1,
      gold: 2,
      silver: 3,
      bronze: 4,
    };

    sponsors.sort((a, b) => {
      const tierDiff = (tierPriority[a.tier] ?? 99) - (tierPriority[b.tier] ?? 99);
      if (tierDiff !== 0) return tierDiff;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });

    return sponsors;
  },
});

// List all sponsors for a tenant
export const listSponsors = query({
  args: {
    tenantId: v.string(),
    competitionId: v.optional(v.string()),
    tier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sponsors = await ctx.db
      .query("sponsors")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.competitionId) {
      sponsors = sponsors.filter(s => s.competitionId === args.competitionId);
    }

    if (args.tier) {
      sponsors = sponsors.filter(s => s.tier === args.tier);
    }

    return sponsors;
  },
});

// Reorder sponsors
export const reorderSponsors = mutation({
  args: {
    tenantId: v.string(),
    sponsorOrders: v.array(v.object({
      sponsorId: v.string(),
      displayOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const { sponsorId, displayOrder } of args.sponsorOrders) {
      const sponsor = await ctx.db
        .query("sponsors")
        .withIndex("by_sponsorId", (q) => q.eq("sponsorId", sponsorId))
        .first();

      if (sponsor && sponsor.tenantId === args.tenantId) {
        await ctx.db.patch(sponsor._id, { displayOrder });
      }
    }

    return { success: true };
  },
});

// Get sponsor by ID
export const getSponsor = query({
  args: {
    sponsorId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsors")
      .withIndex("by_sponsorId", (q) => q.eq("sponsorId", args.sponsorId))
      .first();
  },
});
