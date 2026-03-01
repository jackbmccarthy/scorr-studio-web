import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// QUERIES
// ==========================================

export const list = query({
  args: {
    tenantId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const query = ctx.db
      .query("players")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined));

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const listPlayers = list; // Alias for clarity

export const getById = query({
  args: { playerId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    return player;
  },
});

export const getPlayer = getById; // Alias for clarity

export const getByEmail = query({
  args: { 
    tenantId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    return player;
  },
});

export const searchPlayers = query({
  args: {
    tenantId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const players = await ctx.db
      .query("players")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const searchLower = args.query.toLowerCase();
    const filtered = players.filter((player) => {
      return (
        player.name.toLowerCase().includes(searchLower) ||
        (player.email?.toLowerCase().includes(searchLower) ?? false) ||
        (player.phone?.includes(args.query) ?? false) ||
        (player.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ?? false)
      );
    });

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

export const getPlayerStats = query({
  args: { playerId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Get player's team memberships
    const teamMemberships = await ctx.db
      .query("playerTeams")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate win percentage
    const totalMatches = player.totalMatches || 0;
    const wins = player.wins || 0;
    const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return {
      totalMatches,
      wins: player.wins || 0,
      losses: player.losses || 0,
      winPercentage: Math.round(winPercentage * 10) / 10,
      rating: player.rating,
      ratingSystem: player.ratingSystem,
      teamCount: teamMemberships.length,
      teams: teamMemberships,
    };
  },
});

export const getPlayerMatchHistory = query({
  args: { 
    playerId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get matches where this player participated
    const participations = await ctx.db
      .query("matchParticipants")
      .withIndex("by_profileId", (q) => q.eq("profileId", args.playerId as any))
      .collect();

    // Get match details
    const matches = await Promise.all(
      participations.slice(0, args.limit || 50).map(async (p) => {
        const match = await ctx.db.get(p.matchId as any);
        return match ? { ...match, role: p.role, team: p.team } : null;
      })
    );

    return matches.filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

export const getPlayersByTeam = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("playerTeams")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const players = await Promise.all(
      memberships.map(async (m) => {
        const player = await ctx.db
          .query("players")
          .filter((q) => q.eq(q.field("playerId"), m.playerId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .first();
        return player ? { ...player, role: m.role } : null;
      })
    );

    return players.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

export const getPlayersByCompetition = query({
  args: { 
    competitionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("playerTeams")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const uniquePlayerIds = [...new Set(memberships.map((m) => m.playerId))];
    const playerIds = args.limit ? uniquePlayerIds.slice(0, args.limit) : uniquePlayerIds;

    const players = await Promise.all(
      playerIds.map(async (playerId) => {
        const player = await ctx.db
          .query("players")
          .filter((q) => q.eq(q.field("playerId"), playerId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .first();
        return player;
      })
    );

    return players.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

// ==========================================
// MUTATIONS
// ==========================================

export const create = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    rating: v.optional(v.number()),
    ratingSystem: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const playerId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const player = await ctx.db.insert("players", {
      playerId,
      tenantId: args.tenantId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      avatarUrl: args.avatarUrl,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      rating: args.rating,
      ratingSystem: args.ratingSystem,
      notes: args.notes,
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
    });

    return { playerId, _id: player };
  },
});

export const createPlayer = create; // Alias for clarity

export const update = mutation({
  args: {
    playerId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    rating: v.optional(v.number()),
    ratingSystem: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.rating !== undefined) updates.rating = args.rating;
    if (args.ratingSystem !== undefined) updates.ratingSystem = args.ratingSystem;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(player._id, updates);

    return { success: true };
  },
});

export const updatePlayer = update; // Alias for clarity

export const remove = mutation({
  args: { playerId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Soft delete
    await ctx.db.patch(player._id, { 
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Also deactivate all playerTeams junction records
    const memberships = await ctx.db
      .query("playerTeams")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    await Promise.all(
      memberships.map((m) => ctx.db.patch(m._id, { isActive: false }))
    );

    return { success: true };
  },
});

export const deletePlayer = remove; // Alias for clarity

// ==========================================
// PLAYER STATS
// ==========================================

export const updatePlayerMatchStats = mutation({
  args: {
    playerId: v.string(),
    won: v.optional(v.boolean()),
    isDraw: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const updates: Record<string, unknown> = { 
      updatedAt: new Date().toISOString(),
      totalMatches: (player.totalMatches || 0) + 1,
    };

    if (args.isDraw) {
      // Draw - don't change wins or losses
    } else if (args.won) {
      updates.wins = (player.wins || 0) + 1;
    } else {
      updates.losses = (player.losses || 0) + 1;
    }

    await ctx.db.patch(player._id, updates);

    return { success: true };
  },
});

export const updatePlayerRating = mutation({
  args: {
    playerId: v.string(),
    rating: v.number(),
    ratingSystem: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const updates: Record<string, unknown> = { 
      updatedAt: new Date().toISOString(),
      rating: args.rating,
    };

    if (args.ratingSystem !== undefined) {
      updates.ratingSystem = args.ratingSystem;
    }

    await ctx.db.patch(player._id, updates);

    return { success: true };
  },
});

// ==========================================
// BULK OPERATIONS
// ==========================================

export const importPlayers = mutation({
  args: {
    tenantId: v.string(),
    players: v.array(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      gender: v.optional(v.string()),
      rating: v.optional(v.number()),
      ratingSystem: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const now = new Date().toISOString();
    const results = {
      created: [] as string[],
      skipped: [] as { name: string; reason: string }[],
      errors: [] as { name: string; error: string }[],
    };

    for (const playerData of args.players) {
      try {
        // Check if player with email already exists
        if (playerData.email) {
          const existing = await ctx.db
            .query("players")
            .withIndex("by_email", (q) => q.eq("email", playerData.email!))
            .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .first();

          if (existing) {
            results.skipped.push({ 
              name: playerData.name, 
              reason: "Email already exists" 
            });
            continue;
          }
        }

        const playerId = crypto.randomUUID();
        await ctx.db.insert("players", {
          playerId,
          tenantId: args.tenantId,
          name: playerData.name,
          email: playerData.email,
          phone: playerData.phone,
          dateOfBirth: playerData.dateOfBirth,
          gender: playerData.gender,
          rating: playerData.rating,
          ratingSystem: playerData.ratingSystem,
          tags: playerData.tags || [],
          totalMatches: 0,
          wins: 0,
          losses: 0,
          createdAt: now,
          updatedAt: now,
        });

        results.created.push(playerId);
      } catch (error) {
        results.errors.push({ 
          name: playerData.name, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return results;
  },
});

export const bulkAssignToTeam = mutation({
  args: {
    playerIds: v.array(v.string()),
    teamId: v.string(),
    role: v.optional(v.string()),
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

    const now = new Date().toISOString();
    const results = {
      added: [] as string[],
      skipped: [] as { playerId: string; reason: string }[],
    };

    const currentPlayers = team.players || [];
    type TeamPlayer = { playerId: string; name: string; number?: string; position?: string; isCaptain?: boolean };
    const existingPlayerIds = new Set((currentPlayers as TeamPlayer[]).map((p: TeamPlayer) => p.playerId));

    for (const playerId of args.playerIds) {
      // Check if player exists
      const player = await ctx.db
        .query("players")
        .filter((q) => q.eq(q.field("playerId"), playerId))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .first();

      if (!player) {
        results.skipped.push({ playerId, reason: "Player not found" });
        continue;
      }

      // Check if already on team
      if (existingPlayerIds.has(playerId)) {
        results.skipped.push({ playerId, reason: "Already on team" });
        continue;
      }

      // Add to team
      currentPlayers.push({
        playerId,
        name: player.name,
        isCaptain: false,
      });

      // Create playerTeams junction
      await ctx.db.insert("playerTeams", {
        playerId,
        teamId: args.teamId,
        competitionId: team.competitionId,
        joinedAt: now,
        role: args.role || "player",
        isActive: true,
      });

      results.added.push(playerId);
    }

    // Update team with new players
    await ctx.db.patch(team._id, { 
      players: currentPlayers,
      updatedAt: now,
    });

    return results;
  },
});

export const bulkDelete = mutation({
  args: {
    playerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const now = new Date().toISOString();
    const results = {
      deleted: [] as string[],
      errors: [] as { playerId: string; error: string }[],
    };

    for (const playerId of args.playerIds) {
      try {
        const player = await ctx.db
          .query("players")
          .filter((q) => q.eq(q.field("playerId"), playerId))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .first();

        if (!player) {
          results.errors.push({ playerId, error: "Player not found" });
          continue;
        }

        // Soft delete
        await ctx.db.patch(player._id, { 
          deletedAt: now,
          updatedAt: now,
        });

        // Deactivate team memberships
        const memberships = await ctx.db
          .query("playerTeams")
          .withIndex("by_player", (q) => q.eq("playerId", playerId))
          .collect();

        await Promise.all(
          memberships.map((m) => ctx.db.patch(m._id, { isActive: false }))
        );

        results.deleted.push(playerId);
      } catch (error) {
        results.errors.push({ 
          playerId, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return results;
  },
});

export const addTag = mutation({
  args: {
    playerId: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const tags = player.tags || [];
    if (!tags.includes(args.tag)) {
      tags.push(args.tag);
      await ctx.db.patch(player._id, { 
        tags,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  },
});

export const removeTag = mutation({
  args: {
    playerId: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    const tags = (player.tags || []).filter((t: string) => t !== args.tag);
    await ctx.db.patch(player._id, { 
      tags,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
