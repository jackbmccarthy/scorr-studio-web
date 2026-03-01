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
    
    let leagues = await ctx.db
      .query("leagues")
      .withIndex("by_tenant_sport", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.status) {
      leagues = leagues.filter((l) => l.status === args.status);
    }

    return leagues;
  },
});

export const getById = query({
  args: { leagueId: v.string() },
  handler: async (ctx, args) => {
    const league = await ctx.db
      .query("leagues")
      .filter((q) => q.eq(q.field("leagueId"), args.leagueId))
      .first();

    return league;
  },
});

export const getStandings = query({
  args: { leagueId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Implement standings calculation
    // Get all matches in the league and calculate standings
    
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_league", (q) => q.eq("leagueId", args.leagueId))
      .collect();

    // Calculate standings from matches
    // This is a placeholder - actual logic would be more complex
    
    return [];
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
    type: v.string(), // "individual" | "team_simple" | "team_multi_match"
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const leagueId = crypto.randomUUID();
    
    const league = await ctx.db.insert("leagues", {
      leagueId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      name: args.name,
      type: args.type,
      description: args.description,
      createdAt: new Date().toISOString(),
    });

    return { leagueId, _id: league };
  },
});

export const update = mutation({
  args: {
    leagueId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const league = await ctx.db
      .query("leagues")
      .filter((q) => q.eq(q.field("leagueId"), args.leagueId))
      .first();

    if (!league) {
      throw new Error("League not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(league._id, updates);

    return { success: true };
  },
});

export const remove = mutation({
  args: { leagueId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const league = await ctx.db
      .query("leagues")
      .filter((q) => q.eq(q.field("leagueId"), args.leagueId))
      .first();

    if (!league) {
      throw new Error("League not found");
    }

    await ctx.db.delete(league._id);

    return { success: true };
  },
});

// ==========================================
// FIXTURE GENERATION
// ==========================================

export const generateFixtures = mutation({
  args: {
    leagueId: v.string(),
    seasonId: v.optional(v.string()),
    teams: v.array(v.object({
      id: v.string(),
      name: v.string(),
    })),
    schedule: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
      matchDays: v.array(v.string()), // Days of week: "monday", "tuesday", etc.
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Implement round-robin fixture generation
    // This would create all matches for the league season
    
    const fixtures = [];
    
    // Generate round-robin schedule
    for (let i = 0; i < args.teams.length; i++) {
      for (let j = i + 1; j < args.teams.length; j++) {
        fixtures.push({
          home: args.teams[i],
          away: args.teams[j],
        });
      }
    }

    // Create matches from fixtures
    for (const fixture of fixtures) {
      const matchId = crypto.randomUUID();
      
      await ctx.db.insert("matches", {
        matchId,
        tenantId: "", // Get from league
        sportId: "", // Get from league
        leagueId: args.leagueId,
        seasonId: args.seasonId,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        state: {},
        team1: { name: fixture.home.name },
        team2: { name: fixture.away.name },
      });
    }

    return { success: true, fixtureCount: fixtures.length };
  },
});
