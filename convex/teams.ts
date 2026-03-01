import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Type for team player
type TeamPlayer = {
  playerId: string;
  name: string;
  number?: string;
  position?: string;
  isCaptain?: boolean;
};

// ==========================================
// QUERIES
// ==========================================

export const list = query({
  args: {
    tenantId: v.string(),
    sportId: v.optional(v.string()),
    competitionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    let teams;
    
    if (args.competitionId) {
      teams = await ctx.db
        .query("teams")
        .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
        .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
    } else if (args.sportId) {
      teams = await ctx.db
        .query("teams")
        .withIndex("by_tenant_sport", (q) => 
          q.eq("tenantId", args.tenantId).eq("sportId", args.sportId)
        )
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
    } else {
      teams = await ctx.db
        .query("teams")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .collect();
    }

    return teams;
  },
});

export const getById = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    return team;
  },
});

export const getTeam = getById; // Alias for clarity

export const listTeams = list; // Alias for clarity

export const getTeamStats = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    // Return team stats with calculated win percentage
    const stats = team.stats || { wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 };
    const totalGames = stats.wins + stats.losses + stats.draws;
    const winPercentage = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;

    return {
      ...stats,
      totalGames,
      winPercentage: Math.round(winPercentage * 10) / 10,
      pointDifferential: stats.pointsFor - stats.pointsAgainst,
    };
  },
});

export const searchTeams = query({
  args: {
    tenantId: v.string(),
    query: v.string(),
    competitionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const searchLower = args.query.toLowerCase();
    return teams.filter((team) => {
      const matchesSearch = 
        team.name.toLowerCase().includes(searchLower) ||
        (team.shortName?.toLowerCase().includes(searchLower) ?? false);
      const matchesCompetition = !args.competitionId || team.competitionId === args.competitionId;
      return matchesSearch && matchesCompetition;
    });
  },
});

// ==========================================
// MUTATIONS
// ==========================================

export const create = mutation({
  args: {
    tenantId: v.string(),
    sportId: v.optional(v.string()),
    competitionId: v.optional(v.string()),
    name: v.string(),
    shortName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()),
    players: v.optional(v.array(v.object({
      playerId: v.string(),
      name: v.string(),
      number: v.optional(v.string()),
      position: v.optional(v.string()),
      isCaptain: v.optional(v.boolean()),
    }))),
    seed: v.optional(v.number()),
    captainId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const teamId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const team = await ctx.db.insert("teams", {
      teamId,
      tenantId: args.tenantId,
      sportId: args.sportId,
      competitionId: args.competitionId,
      name: args.name,
      shortName: args.shortName,
      logoUrl: args.logoUrl,
      color: args.color,
      players: args.players || [],
      stats: { wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 },
      seed: args.seed,
      checkedIn: false,
      captainId: args.captainId,
      createdAt: now,
      updatedAt: now,
    });

    return { teamId, _id: team };
  },
});

export const createTeam = create; // Alias for clarity

export const update = mutation({
  args: {
    teamId: v.string(),
    name: v.optional(v.string()),
    shortName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()),
    seed: v.optional(v.number()),
    checkedIn: v.optional(v.boolean()),
    captainId: v.optional(v.string()),
    competitionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.shortName !== undefined) updates.shortName = args.shortName;
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;
    if (args.color !== undefined) updates.color = args.color;
    if (args.seed !== undefined) updates.seed = args.seed;
    if (args.checkedIn !== undefined) updates.checkedIn = args.checkedIn;
    if (args.captainId !== undefined) updates.captainId = args.captainId;
    if (args.competitionId !== undefined) updates.competitionId = args.competitionId;

    await ctx.db.patch(team._id, updates);

    return { success: true };
  },
});

export const updateTeam = update; // Alias for clarity

export const remove = mutation({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    // Soft delete
    await ctx.db.patch(team._id, { 
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

export const deleteTeam = remove; // Alias for clarity

// ==========================================
// TEAM ROSTER MANAGEMENT
// ==========================================

export const addPlayerToTeam = mutation({
  args: {
    teamId: v.string(),
    playerId: v.string(),
    name: v.string(),
    number: v.optional(v.string()),
    position: v.optional(v.string()),
    isCaptain: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const players: TeamPlayer[] = (team.players as TeamPlayer[]) || [];
    
    // Check if player already exists on team
    if (players.some((p) => p.playerId === args.playerId)) {
      throw new Error("Player already on team");
    }

    players.push({
      playerId: args.playerId,
      name: args.name,
      number: args.number,
      position: args.position,
      isCaptain: args.isCaptain || false,
    });

    await ctx.db.patch(team._id, { 
      players,
      updatedAt: new Date().toISOString(),
    });

    // Also create playerTeams junction record
    await ctx.db.insert("playerTeams", {
      playerId: args.playerId,
      teamId: args.teamId,
      competitionId: team.competitionId,
      joinedAt: new Date().toISOString(),
      role: args.isCaptain ? "captain" : "player",
      isActive: true,
    });

    return { success: true };
  },
});

export const removePlayerFromTeam = mutation({
  args: {
    teamId: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const players = ((team.players || []) as TeamPlayer[]).filter((p) => p.playerId !== args.playerId);

    await ctx.db.patch(team._id, { 
      players: players.map(p => ({
        playerId: p.playerId,
        name: p.name,
        number: p.number,
        position: p.position,
        isCaptain: p.isCaptain,
      })),
      updatedAt: new Date().toISOString(),
    });

    // Also update playerTeams junction record
    const playerTeam = await ctx.db
      .query("playerTeams")
      .withIndex("by_player_team", (q) => 
        q.eq("playerId", args.playerId).eq("teamId", args.teamId)
      )
      .first();

    if (playerTeam) {
      await ctx.db.patch(playerTeam._id, { isActive: false });
    }

    return { success: true };
  },
});

export const updatePlayerRole = mutation({
  args: {
    teamId: v.string(),
    playerId: v.string(),
    role: v.optional(v.string()), // "player" | "captain" | "substitute"
    isCaptain: v.optional(v.boolean()),
    position: v.optional(v.string()),
    number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const players = (team.players || []) as Array<{ playerId: string; name: string; number?: string; position?: string; isCaptain?: boolean }>;
    const playerIndex = players.findIndex((p) => p.playerId === args.playerId);
    
    if (playerIndex === -1) {
      throw new Error("Player not found on team");
    }

    // Update player data
    if (args.isCaptain !== undefined) {
      players[playerIndex].isCaptain = args.isCaptain;
    }
    if (args.position !== undefined) {
      players[playerIndex].position = args.position;
    }
    if (args.number !== undefined) {
      players[playerIndex].number = args.number;
    }

    await ctx.db.patch(team._id, { 
      players,
      updatedAt: new Date().toISOString(),
    });

    // Also update playerTeams junction record
    const playerTeam = await ctx.db
      .query("playerTeams")
      .withIndex("by_player_team", (q) => 
        q.eq("playerId", args.playerId).eq("teamId", args.teamId)
      )
      .first();

    if (playerTeam && args.role !== undefined) {
      await ctx.db.patch(playerTeam._id, { role: args.role });
    }

    return { success: true };
  },
});

export const setCaptain = mutation({
  args: {
    teamId: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const players = (team.players || []) as Array<{ playerId: string; name: string; number?: string; position?: string; isCaptain?: boolean }>;
    
    // Remove captain from all players
    players.forEach((p) => {
      p.isCaptain = p.playerId === args.playerId;
    });

    await ctx.db.patch(team._id, { 
      players,
      captainId: args.playerId,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

export const reorderPlayers = mutation({
  args: {
    teamId: v.string(),
    playerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const currentPlayers = (team.players || []) as Array<{ playerId: string; name: string; number?: string; position?: string; isCaptain?: boolean }>;
    const playerMap = new Map(currentPlayers.map((p: { playerId: string; name: string }) => [p.playerId, p]));
    
    // Reorder players based on new order
    const reorderedPlayers = args.playerIds
      .map((id) => playerMap.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    await ctx.db.patch(team._id, { 
      players: reorderedPlayers,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// ==========================================
// TEAM STATS
// ==========================================

export const updateTeamStats = mutation({
  args: {
    teamId: v.string(),
    stats: v.object({
      wins: v.optional(v.number()),
      losses: v.optional(v.number()),
      draws: v.optional(v.number()),
      pointsFor: v.optional(v.number()),
      pointsAgainst: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const currentStats = team.stats || { wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 };
    
    const newStats = {
      wins: args.stats.wins ?? currentStats.wins,
      losses: args.stats.losses ?? currentStats.losses,
      draws: args.stats.draws ?? currentStats.draws,
      pointsFor: args.stats.pointsFor ?? currentStats.pointsFor,
      pointsAgainst: args.stats.pointsAgainst ?? currentStats.pointsAgainst,
    };

    await ctx.db.patch(team._id, { 
      stats: newStats,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

export const recordMatchResult = mutation({
  args: {
    teamId: v.string(),
    won: v.boolean(),
    pointsFor: v.number(),
    pointsAgainst: v.number(),
    isDraw: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const team = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!team) {
      throw new Error("Team not found");
    }

    const currentStats = team.stats || { wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 };
    
    const newStats = {
      wins: currentStats.wins + (args.won && !args.isDraw ? 1 : 0),
      losses: currentStats.losses + (!args.won && !args.isDraw ? 1 : 0),
      draws: currentStats.draws + (args.isDraw ? 1 : 0),
      pointsFor: currentStats.pointsFor + args.pointsFor,
      pointsAgainst: currentStats.pointsAgainst + args.pointsAgainst,
    };

    await ctx.db.patch(team._id, { 
      stats: newStats,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, stats: newStats };
  },
});

// Legacy function aliases for backward compatibility
export const addPlayer = addPlayerToTeam;
export const removePlayer = removePlayerFromTeam;
