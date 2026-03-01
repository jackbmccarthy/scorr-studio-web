import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// QUERIES
// ==========================================

export const list = query({
  args: {
    tenantId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    let competitions = await ctx.db
      .query("competitions")
      .withIndex("by_tenant_sport", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.status) {
      competitions = competitions.filter((c) => c.status === args.status);
    }

    return competitions;
  },
});

export const getById = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    const competition = await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("competitionId"), args.competitionId))
      .first();

    return competition;
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
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const competitionId = crypto.randomUUID();
    
    const competition = await ctx.db.insert("competitions", {
      competitionId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      name: args.name,
      description: args.description,
      status: "draft",
      createdAt: new Date().toISOString(),
      startDate: args.startDate,
      endDate: args.endDate,
      venueName: args.venueName,
      venueAddress: args.venueAddress,
    });

    return { competitionId, _id: competition };
  },
});

export const update = mutation({
  args: {
    competitionId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const competition = await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("competitionId"), args.competitionId))
      .first();

    if (!competition) {
      throw new Error("Competition not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.venueName !== undefined) updates.venueName = args.venueName;
    if (args.venueAddress !== undefined) updates.venueAddress = args.venueAddress;

    await ctx.db.patch(competition._id, updates);

    return { success: true };
  },
});

export const remove = mutation({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const competition = await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("competitionId"), args.competitionId))
      .first();

    if (!competition) {
      throw new Error("Competition not found");
    }

    await ctx.db.delete(competition._id);

    return { success: true };
  },
});

// ==========================================
// BRACKET GENERATION
// ==========================================

export const generateBracket = mutation({
  args: {
    competitionId: v.string(),
    teamCount: v.number(),
    seedingType: v.optional(v.string()), // "random" | "seeded"
  },
  handler: async (ctx, args) => {
    // TODO: Implement bracket generation logic
    // This would create all the matches for the tournament
    
    const rounds = Math.ceil(Math.log2(args.teamCount));
    const matchesPerRound = [];
    
    for (let round = 0; round < rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round - 1);
      matchesPerRound.push(matchesInRound);
    }

    // Create matches for each round
    for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
      const matchesInRound = matchesPerRound[roundIndex];
      
      for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
        const matchId = crypto.randomUUID();
        
        await ctx.db.insert("matches", {
          matchId,
          tenantId: "", // Get from competition
          sportId: "", // Get from competition
          competitionId: args.competitionId,
          status: "scheduled",
          createdAt: new Date().toISOString(),
          state: {},
          matchRound: `Round ${roundIndex + 1}`,
          roundIndex,
          matchIndex,
          team1: undefined,
          team2: undefined,
        });
      }
    }

    return { success: true, rounds, matchesPerRound };
  },
});
