import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Generate a single elimination bracket from teams
export const generateBracket = mutation({
  args: {
    competitionId: v.string(),
    eventId: v.optional(v.string()),
    tenantId: v.string(),
    teamIds: v.array(v.string()),
    type: v.string(), // "single_elimination" | "double_elimination" | "round_robin" | "swiss"
    settings: v.object({
      thirdPlaceMatch: v.boolean(),
      seedOrder: v.string(), // "standard" | "random" | "snake"
      byeHandling: v.string(), // "random" | "highest_seed"
    }),
  },
  handler: async (ctx, args) => {
    // Get teams with their seed info
    const teams = await Promise.all(
      args.teamIds.map(async (teamId) => {
        const team = await ctx.db
          .query("teams")
          .filter((q) => q.eq(q.field("teamId"), teamId))
          .first();
        return team;
      })
    );

    const validTeams = teams.filter(Boolean);
    
    // Sort teams based on seed order
    let seededTeams = [...validTeams];
    if (args.settings.seedOrder === "standard") {
      seededTeams.sort((a, b) => (a?.seed ?? 999) - (b?.seed ?? 999));
    } else if (args.settings.seedOrder === "random") {
      seededTeams = seededTeams.sort(() => Math.random() - 0.5);
    } else if (args.settings.seedOrder === "snake") {
      seededTeams.sort((a, b) => (a?.seed ?? 999) - (b?.seed ?? 999));
      // Snake draft pattern
      const snaked: typeof seededTeams = [];
      let forward = true;
      for (let i = 0; i < seededTeams.length; i += 2) {
        const chunk = seededTeams.slice(i, i + 2);
        if (!forward) chunk.reverse();
        snaked.push(...chunk);
        forward = !forward;
      }
      seededTeams = snaked;
    }

    // Calculate bracket structure
    const numTeams = seededTeams.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const fullBracketSize = Math.pow(2, numRounds);
    const numByes = fullBracketSize - numTeams;

    // Generate round names
    const roundNames = generateRoundNames(numRounds, args.type);
    
    // Generate matches
    const matches: Array<{
      matchId: string;
      roundNumber: number;
      roundName: string;
      matchIndex: number;
      team1Id?: string;
      team2Id?: string;
      nextMatchId?: string;
      nextMatchSlot?: "team1Id" | "team2Id";
    }> = [];

    const bracketId = nanoid();
    let matchCount = 0;

    // First round matches
    let currentRoundTeams: (string | undefined)[] = [...seededTeams.map(t => t?.teamId)];
    
    // Add byes if needed
    if (numByes > 0 && args.settings.byeHandling === "highest_seed") {
      // Give byes to highest seeds
      const teamsWithByes: (string | undefined)[] = [];
      for (let i = 0; i < seededTeams.length; i++) {
        if (i < numByes) {
          // This team gets a bye - they'll be placed in round 2
        } else {
          teamsWithByes.push(seededTeams[i]?.teamId);
        }
      }
      currentRoundTeams = teamsWithByes;
    }

    // Generate all matches for each round
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      const roundName = roundNames[round - 1] || `Round ${round}`;

      for (let i = 0; i < matchesInRound; i++) {
        const matchId = nanoid();
        matches.push({
          matchId,
          roundNumber: round,
          roundName,
          matchIndex: i,
          nextMatchId: round < numRounds ? undefined : undefined, // Will be set later
        });
        matchCount++;
      }
    }

    // Set next match IDs
    for (let round = 1; round < numRounds; round++) {
      const roundStart = matches.filter(m => m.roundNumber === round);
      const nextRoundStart = matches.filter(m => m.roundNumber === round + 1);
      
      roundStart.forEach((match, idx) => {
        const nextMatchIdx = Math.floor(idx / 2);
        const nextMatch = nextRoundStart[nextMatchIdx];
        if (nextMatch) {
          match.nextMatchId = nextMatch.matchId;
          match.nextMatchSlot = idx % 2 === 0 ? "team1Id" : "team2Id";
        }
      });
    }

    // Assign teams to first round
    const firstRoundMatches = matches.filter(m => m.roundNumber === 1);
    for (let i = 0; i < firstRoundMatches.length; i++) {
      const match = firstRoundMatches[i];
      const team1Idx = i * 2;
      const team2Idx = i * 2 + 1;
      
      if (currentRoundTeams[team1Idx]) {
        match.team1Id = currentRoundTeams[team1Idx];
      }
      if (currentRoundTeams[team2Idx]) {
        match.team2Id = currentRoundTeams[team2Idx];
      }
    }

    // Create match records in database
    for (const match of matches) {
      await ctx.db.insert("matches", {
        matchId: match.matchId,
        tenantId: args.tenantId,
        sportId: "", // Will be set from competition
        competitionId: args.competitionId,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        state: {},
        team1: match.team1Id ? { name: "TBD" } : undefined,
        team2: match.team2Id ? { name: "TBD" } : undefined,
        matchRound: match.roundName,
        roundIndex: match.roundNumber,
        matchIndex: match.matchIndex,
        nextMatchId: match.nextMatchId,
        nextMatchSlot: match.nextMatchSlot,
      });
    }

    // Create bracket record
    const roundsArray = Object.values(matches.reduce<Record<number, { roundNumber: number; name: string; matches: string[] }>>((acc, match) => {
      if (!acc[match.roundNumber]) {
        acc[match.roundNumber] = {
          roundNumber: match.roundNumber,
          name: match.roundName,
          matches: [],
        };
      }
      acc[match.roundNumber].matches.push(match.matchId);
      return acc;
    }, {} as Record<number, { roundNumber: number; name: string; matches: string[] }>)).sort((a, b) => a.roundNumber - b.roundNumber);

    const bracketRecord = {
      bracketId,
      competitionId: args.competitionId,
      eventId: args.eventId,
      tenantId: args.tenantId,
      type: args.type,
      rounds: roundsArray,
      champions: [],
      settings: args.settings,
      createdAt: new Date().toISOString(),
    };

    await ctx.db.insert("brackets", bracketRecord);

    return {
      bracketId,
      matchCount: matches.length,
      rounds: bracketRecord.rounds,
    };
  },
});

// Get full bracket tree
export const getBracket = query({
  args: {
    competitionId: v.optional(v.string()),
    bracketId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bracket;
    
    if (args.bracketId) {
      const id = args.bracketId;
      bracket = await ctx.db
        .query("brackets")
        .withIndex("by_bracketId", (q) => q.eq("bracketId", id))
        .first();
    } else if (args.competitionId) {
      const id = args.competitionId;
      bracket = await ctx.db
        .query("brackets")
        .withIndex("by_competition", (q) => q.eq("competitionId", id))
        .first();
    }

    if (!bracket) {
      return null;
    }

    // Get all matches for this bracket
    type RoundType = { roundNumber: number; name: string; matches: string[] };
    const matches = await Promise.all(
      (bracket.rounds as RoundType[])
        .flatMap((r) => r.matches)
        .map(async (matchId) => {
          const match = await ctx.db
            .query("matches")
            .filter((q) => q.eq(q.field("matchId"), matchId))
            .first();
          return match;
        })
    );

    return {
      bracket,
      matches: matches.filter(Boolean),
    };
  },
});

// Update bracket structure
export const updateBracket = mutation({
  args: {
    bracketId: v.string(),
    settings: v.optional(v.object({
      thirdPlaceMatch: v.boolean(),
      seedOrder: v.string(),
      byeHandling: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const bracket = await ctx.db
      .query("brackets")
      .withIndex("by_bracketId", (q) => q.eq("bracketId", args.bracketId))
      .first();

    if (!bracket) {
      throw new Error("Bracket not found");
    }

    await ctx.db.patch(bracket._id, {
      settings: args.settings ?? bracket.settings,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Advance team to next round
export const advanceTeam = mutation({
  args: {
    matchId: v.string(),
    winnerId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("matchId"), args.matchId))
      .first();

    if (!match) {
      throw new Error("Match not found");
    }

    // Update match winner
    await ctx.db.patch(match._id, {
      winner: args.winnerId,
      status: "finished",
    });

    // If there's a next match, add winner to it
    if (match.nextMatchId) {
      const nextMatch = await ctx.db
        .query("matches")
        .filter((q) => q.eq(q.field("matchId"), match.nextMatchId))
        .first();

      if (nextMatch) {
        const update: Record<string, unknown> = {};
        
        if (match.nextMatchSlot === "team1Id") {
          update.team1 = {
            ...nextMatch.team1,
            id: args.winnerId,
            name: "", // Will be filled from team lookup
          };
        } else if (match.nextMatchSlot === "team2Id") {
          update.team2 = {
            ...nextMatch.team2,
            id: args.winnerId,
            name: "",
          };
        }

        await ctx.db.patch(nextMatch._id, update);
      }
    }

    return { success: true };
  },
});

// Regenerate bracket after changes
export const regenerateBracket = mutation({
  args: {
    bracketId: v.string(),
    teamIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existingBracket = await ctx.db
      .query("brackets")
      .withIndex("by_bracketId", (q) => q.eq("bracketId", args.bracketId))
      .first();

    if (!existingBracket) {
      throw new Error("Bracket not found");
    }

    // Delete existing matches
    type RoundType = { roundNumber: number; name: string; matches: string[] };
    const existingMatches = await Promise.all(
      (existingBracket.rounds as RoundType[])
        .flatMap((r) => r.matches)
        .map(async (matchId) => {
          const match = await ctx.db
            .query("matches")
            .filter((q) => q.eq(q.field("matchId"), matchId))
            .first();
          return match;
        })
    );

    for (const match of existingMatches.filter(Boolean)) {
      if (match) {
        await ctx.db.delete(match._id);
      }
    }

    // Delete old bracket
    await ctx.db.delete(existingBracket._id);

    // Generate new bracket
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.scheduler.runAfter(0, "brackets:generateBracket" as any, {
      competitionId: existingBracket.competitionId,
      eventId: existingBracket.eventId,
      tenantId: existingBracket.tenantId,
      teamIds: args.teamIds,
      type: existingBracket.type,
      settings: existingBracket.settings,
    });
  },
});

// Helper function to generate round names
function generateRoundNames(numRounds: number, type: string): string[] {
  if (type === "round_robin") {
    return Array.from({ length: numRounds }, (_, i) => `Round ${i + 1}`);
  }

  const names: string[] = [];
  for (let i = numRounds; i >= 1; i--) {
    if (i === 1) {
      names.push("Final");
    } else if (i === 2) {
      names.push("Semi Finals");
    } else if (i === 3) {
      names.push("Quarter Finals");
    } else if (i === 4) {
      names.push("Round of 16");
    } else if (i === 5) {
      names.push("Round of 32");
    } else {
      names.push(`Round ${numRounds - i + 1}`);
    }
  }
  return names.reverse();
}

// List brackets for a tenant
export const listBrackets = query({
  args: {
    tenantId: v.string(),
    competitionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.competitionId) {
      const competitionId = args.competitionId;
      return await ctx.db
        .query("brackets")
        .withIndex("by_competition", (q) => q.eq("competitionId", competitionId))
        .collect();
    }

    return await ctx.db
      .query("brackets")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

// Delete bracket
export const deleteBracket = mutation({
  args: {
    bracketId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const bracket = await ctx.db
      .query("brackets")
      .withIndex("by_bracketId", (q) => q.eq("bracketId", args.bracketId))
      .first();

    if (!bracket || bracket.tenantId !== args.tenantId) {
      throw new Error("Bracket not found or unauthorized");
    }

    // Delete all matches
    type RoundType = { roundNumber: number; name: string; matches: string[] };
    for (const round of (bracket.rounds as RoundType[])) {
      for (const matchId of round.matches) {
        const match = await ctx.db
          .query("matches")
          .filter((q) => q.eq(q.field("matchId"), matchId))
          .first();
        if (match) {
          await ctx.db.delete(match._id);
        }
      }
    }

    // Delete bracket
    await ctx.db.delete(bracket._id);

    return { success: true };
  },
});
