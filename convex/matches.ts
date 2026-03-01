// Convex functions for match management

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get a match by its external matchId
 */
export const getByMatchId = query({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    return match;
  },
});

/**
 * Get all matches for a tenant
 */
export const getByTenant = query({
  args: { 
    tenantId: v.string(),
    status: v.optional(v.string()),
    sportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let matches = await ctx.db
      .query("matches")
      .withIndex("by_tenant_sport", (q) => q.eq("tenantId", args.tenantId))
      .collect();
    
    if (args.sportId) {
      matches = matches.filter(m => m.sportId === args.sportId);
    }
    
    if (args.status) {
      matches = matches.filter(m => m.status === args.status);
    }
    
    return matches.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

/**
 * Get matches for a competition
 */
export const getByCompetition = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_competition", (q) => 
        q.eq("competitionId", args.competitionId)
      )
      .collect();
  },
});

/**
 * Get matches for a league
 */
export const getByLeague = query({
  args: { leagueId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_league", (q) => 
        q.eq("leagueId", args.leagueId)
      )
      .collect();
  },
});

/**
 * Get live matches for a tenant
 */
export const getLiveMatches = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .collect();
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Create a new match
 */
export const create = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
    sportId: v.string(),
    team1: v.object({
      id: v.optional(v.string()),
      name: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    team2: v.object({
      id: v.optional(v.string()),
      name: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    state: v.any(),
    competitionId: v.optional(v.string()),
    eventId: v.optional(v.string()),
    eventName: v.optional(v.string()),
    matchRound: v.optional(v.string()),
    roundIndex: v.optional(v.number()),
    matchIndex: v.optional(v.number()),
    nextMatchId: v.optional(v.string()),
    nextMatchSlot: v.optional(v.union(v.literal("team1Id"), v.literal("team2Id"))),
    scheduledAt: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const matchId = await ctx.db.insert("matches", {
      matchId: args.matchId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      status: "scheduled",
      createdAt: now,
      team1: {
        ...args.team1,
        score: 0,
      },
      team2: {
        ...args.team2,
        score: 0,
      },
      state: args.state,
      competitionId: args.competitionId,
      eventId: args.eventId,
      eventName: args.eventName,
      matchRound: args.matchRound,
      roundIndex: args.roundIndex,
      matchIndex: args.matchIndex,
      nextMatchId: args.nextMatchId,
      nextMatchSlot: args.nextMatchSlot,
    });
    
    return matchId;
  },
});

/**
 * Update match state
 */
export const updateState = mutation({
  args: {
    matchId: v.string(),
    state: v.any(),
    status: v.optional(v.string()),
    team1Score: v.optional(v.number()),
    team2Score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    const updates: Record<string, unknown> = {
      state: args.state,
    };
    
    if (args.status) {
      updates.status = args.status;
      
      if (args.status === "live" && !match.actualStartTime) {
        updates.actualStartTime = new Date().toISOString();
      }
      if (args.status === "finished") {
        updates.actualEndTime = new Date().toISOString();
      }
    }
    
    if (args.team1Score !== undefined) {
      updates.team1 = { ...match.team1, score: args.team1Score };
    }
    if (args.team2Score !== undefined) {
      updates.team2 = { ...match.team2, score: args.team2Score };
    }
    
    await ctx.db.patch(match._id, updates);
    
    return { success: true };
  },
});

/**
 * Start a match
 */
export const startMatch = mutation({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    await ctx.db.patch(match._id, {
      status: "live",
      actualStartTime: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

/**
 * End a match
 */
export const endMatch = mutation({
  args: {
    matchId: v.string(),
    winner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    await ctx.db.patch(match._id, {
      status: "finished",
      actualEndTime: new Date().toISOString(),
      winner: args.winner,
    });
    
    return { success: true };
  },
});

/**
 * Delete a match
 */
export const remove = mutation({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    await ctx.db.delete(match._id);
    
    return { success: true };
  },
});

/**
 * Record match default (forfeit, walkover, etc.)
 */
export const recordDefault = mutation({
  args: {
    matchId: v.string(),
    type: v.string(), // 'forfeit' | 'walkover' | 'double_default' | 'retirement'
    defaultedSide: v.string(), // 'team1' | 'team2' | 'both'
    reason: v.optional(v.string()),
    recordedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    const winner = args.defaultedSide === "team1" 
      ? "team2" 
      : args.defaultedSide === "team2" 
        ? "team1" 
        : undefined;
    
    await ctx.db.patch(match._id, {
      status: "finished",
      actualEndTime: new Date().toISOString(),
      winner,
      defaultInfo: {
        type: args.type,
        defaultedSide: args.defaultedSide,
        reason: args.reason,
        recordedBy: args.recordedBy,
        recordedAt: new Date().toISOString(),
      },
    });
    
    return { success: true };
  },
});
