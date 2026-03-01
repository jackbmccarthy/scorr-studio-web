import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v4 as uuidv4 } from "uuid";

// Submit match result
export const submitResult = mutation({
  args: {
    tenantId: v.string(),
    matchId: v.string(),
    competitionId: v.string(),
    team1: v.object({
      teamId: v.string(),
      teamName: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    team2: v.object({
      teamId: v.string(),
      teamName: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    scores: v.array(v.object({
      setNumber: v.number(),
      team1Score: v.number(),
      team2Score: v.number(),
      winner: v.optional(v.string()), // "team1" | "team2" | "tie"
    })),
    winner: v.object({
      teamId: v.string(),
      teamName: v.string(),
    }),
    loser: v.optional(v.object({
      teamId: v.string(),
      teamName: v.string(),
    })),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    mvpId: v.optional(v.string()),
    highlights: v.optional(v.array(v.string())),
    completedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate IDs
    const resultId = uuidv4();
    const completedAt = args.completedAt || new Date().toISOString();

    // Check if result already exists for this match
    const existing = await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existing) {
      throw new Error("Result already exists for this match");
    }

    // Insert result
    const id = await ctx.db.insert("matchResults", {
      resultId,
      tenantId: args.tenantId,
      matchId: args.matchId,
      competitionId: args.competitionId,
      team1: args.team1,
      team2: args.team2,
      scores: args.scores,
      winner: args.winner,
      loser: args.loser,
      duration: args.duration,
      completedAt,
      notes: args.notes,
      mvpId: args.mvpId,
      highlights: args.highlights,
      verified: false, // Default to unverified
    });

    // Update match status to finished
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (match) {
      await ctx.db.patch(match._id, {
        status: "finished",
        winner: args.winner.teamId,
      });
    }

    // TODO: Trigger analytics update (can be done via scheduling or direct call)
    // For now we just return the ID
    return id;
  },
});

// Update match result
export const updateResult = mutation({
  args: {
    id: v.id("matchResults"),
    scores: v.optional(v.array(v.object({
      setNumber: v.number(),
      team1Score: v.number(),
      team2Score: v.number(),
      winner: v.optional(v.string()),
    }))),
    winner: v.optional(v.object({
      teamId: v.string(),
      teamName: v.string(),
    })),
    loser: v.optional(v.object({
      teamId: v.string(),
      teamName: v.string(),
    })),
    notes: v.optional(v.string()),
    mvpId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete result
export const deleteResult = mutation({
  args: {
    id: v.id("matchResults"),
  },
  handler: async (ctx, args) => {
    // Get result to reset match status
    const result = await ctx.db.get(args.id);
    if (!result) return;

    // Delete result
    await ctx.db.delete(args.id);

    // Reset match status to scheduled or live? 
    // Maybe best to just leave it or set to "scheduled" if we want to replay
    // For now, let's look up the match and set it back to 'scheduled' if it was 'finished'
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", result.matchId))
      .first();

    if (match && match.status === "finished") {
      await ctx.db.patch(match._id, {
        status: "scheduled",
        winner: undefined,
      });
    }
  },
});

// Get result by match ID
export const getResult = query({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();
  },
});

// Get results by competition
export const getResultsByCompetition = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matchResults")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();
  },
});

// Get results by team (this is harder without a specific index, but we can filter)
// Or we could add an index. Given the schema, we don't have a team index on matchResults.
// But we can filter in memory for now or just scan.
// Actually, `matchResults` has `winner.teamId` and `loser.teamId`.
// It might be better to query matches by team then get results, but let's just do a filter for now if the dataset is small.
// Or we can query by competition and filter.
// Let's implement a simple filter scan since we don't have a direct index on teamId in matchResults.
export const getResultsByTeam = query({
  args: { teamId: v.string(), competitionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results;
    
    if (args.competitionId) {
      results = await ctx.db
        .query("matchResults")
        .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId!))
        .collect();
    } else {
      results = await ctx.db.query("matchResults").collect();
    }
    
    return results.filter(r => 
      r.winner.teamId === args.teamId || 
      r.loser?.teamId === args.teamId
    );
  },
});

// Verify result
export const verifyResult = mutation({
  args: {
    id: v.id("matchResults"),
    verifierId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verified: true,
      verifiedBy: args.verifierId,
      verifiedAt: new Date().toISOString(),
    });
  },
});

// Get unverified results
export const getUnverifiedResults = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // In a real app we'd index by tenant + verified status.
    // For now, filter.
    const results = await ctx.db
      .query("matchResults")
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .collect();
      
    return results.filter(r => !r.verified);
  },
});

// Get recent results across all competitions
export const getRecentResults = query({
  args: { tenantId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("matchResults")
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .collect();
      
    // Sort by completedAt descending
    return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, args.limit || 20);
  },
});
