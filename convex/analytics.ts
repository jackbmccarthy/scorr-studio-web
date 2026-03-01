import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Calculate and update standings for a competition
export const calculateStandings = mutation({
  args: {
    competitionId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get all matches for this competition
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // 2. Get all results
    const results = await ctx.db
      .query("matchResults")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // 3. Initialize stats map
    const teamStats = new Map<string, {
      teamId: string;
      teamName: string;
      wins: number;
      losses: number;
      draws: number;
      pointsFor: number;
      pointsAgainst: number;
      winStreak: number;
      currentStreak: number;
      // helpers
      streakType: "win" | "loss" | "draw" | null;
    }>();

    // Helper to get or init team stats
    const getStats = (teamId: string, teamName: string) => {
      if (!teamStats.has(teamId)) {
        teamStats.set(teamId, {
          teamId,
          teamName,
          wins: 0,
          losses: 0,
          draws: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          winStreak: 0,
          currentStreak: 0,
          streakType: null,
        });
      }
      return teamStats.get(teamId)!;
    };

    // 4. Process results
    // Sort results by date to calculate streaks correctly
    results.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    for (const result of results) {
      const winner = getStats(result.winner.teamId, result.winner.teamName);
      
      // Calculate points
      let winnerPoints = 0;
      let loserPoints = 0;
      
      for (const set of result.scores) {
        // Assuming team1 is winner if team1Score > team2Score and result.winner.teamId == matches.team1.id
        // But result.scores has team1Score and team2Score.
        // We need to know which score belongs to winner.
        // The result object has winner.teamId. 
        // We need to look up the match to know which team was team1/team2?
        // matchResults schema: scores: { setNumber, team1Score, team2Score }
        // matchResults schema: matchId
        
        // Wait, matchResults doesn't store which team was team1/team2. It relies on the match record?
        // Actually, usually team1/team2 in matchResults corresponds to team1/team2 in match.
        // But we don't have that info easily here without querying every match.
        // However, we fetched all matches in step 1.
        
        const match = matches.find(m => m.matchId === result.matchId);
        if (!match || !match.team1 || !match.team2) continue;

        const isWinnerTeam1 = match.team1.id === result.winner.teamId;
        
        if (isWinnerTeam1) {
            winnerPoints += set.team1Score;
            loserPoints += set.team2Score;
        } else {
            winnerPoints += set.team2Score;
            loserPoints += set.team1Score;
        }
      }

      // Update winner stats
      winner.wins += 1;
      winner.pointsFor += winnerPoints;
      winner.pointsAgainst += loserPoints;
      
      if (winner.streakType === "win") {
        winner.currentStreak += 1;
      } else {
        winner.streakType = "win";
        winner.currentStreak = 1;
      }
      winner.winStreak = Math.max(winner.winStreak, winner.currentStreak);

      // Update loser stats if exists
      if (result.loser) {
        const loser = getStats(result.loser.teamId, result.loser.teamName);
        loser.losses += 1;
        loser.pointsFor += loserPoints;
        loser.pointsAgainst += winnerPoints;
        
        if (loser.streakType === "loss") {
          loser.currentStreak += 1;
        } else {
          loser.streakType = "loss";
          loser.currentStreak = 1;
        }
      }
    }

    // 5. Store in competitionStats
    const statsArray = Array.from(teamStats.values()).map(s => ({
      teamId: s.teamId,
      teamName: s.teamName,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      winStreak: s.winStreak,
      currentStreak: s.currentStreak * (s.streakType === "loss" ? -1 : 1), // Negative for losing streak
    }));

    // Check if stats exist
    const existingStats = await ctx.db
      .query("competitionStats")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        teamStats: statsArray,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert("competitionStats", {
        competitionId: args.competitionId,
        tenantId: args.tenantId,
        teamStats: statsArray,
        lastUpdated: new Date().toISOString(),
      });
    }
  },
});

// Get competition stats
export const getCompetitionStats = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("competitionStats")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();
  },
});

// Get team analytics
export const getTeamAnalytics = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    // This would aggregate across all competitions
    // For now, let's just get the latest stats from any competition
    // Ideally we should have a 'teamStats' table for global stats.
    // We can query competitionStats and filter.
    
    // Scan competitionStats (not ideal for scale, but okay for MVP)
    const allStats = await ctx.db.query("competitionStats").collect();
    
    // Find stats for this team
    const teamStats = [];
    for (const compStat of allStats) {
      const s = compStat.teamStats.find((ts: { teamId: string }) => ts.teamId === args.teamId);
      if (s) {
        teamStats.push({
          competitionId: compStat.competitionId,
          ...s
        });
      }
    }
    
    return teamStats;
  },
});

// Get head-to-head
export const getHeadToHead = query({
  args: { team1Id: v.string(), team2Id: v.string() },
  handler: async (ctx, args) => {
    // We need to find matches where both teams participated.
    // Since we don't have a direct "participants" index that allows AND queries easily,
    // we can search matches by one team and filter for the other.
    
    // Find all matches for team1
    // Matches schema: team1.id, team2.id.
    // Query matches table directly? It doesn't have an index on team1.id OR team2.id specifically for this.
    // But we can verify.
    // Matches table has 'team1' and 'team2' objects.
    
    // Actually, `matchParticipants` table links matchId to profileId. But for teams?
    // Matches table stores team1.id and team2.id.
    
    // We don't have a good index for "matches by team".
    // Wait, matchResults might be better? No index there either.
    
    // Let's use `matchResults` table query. We already implemented `getResultsByTeam` using filter.
    // Let's optimize: query matchResults, filter where (winner=t1 AND loser=t2) OR (winner=t2 AND loser=t1).
    
    const results = await ctx.db.query("matchResults").collect();
    
    const h2h = results.filter(r => 
      (r.winner.teamId === args.team1Id && r.loser?.teamId === args.team2Id) ||
      (r.winner.teamId === args.team2Id && r.loser?.teamId === args.team1Id)
    );
    
    return h2h;
  },
});

// Get trending teams (best active streaks)
export const getTrendingTeams = query({
  args: { competitionId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("competitionStats")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();
      
    if (!stats) return [];
    
    // Sort by current streak (descending)
    const sorted = [...stats.teamStats].sort((a, b) => b.currentStreak - a.currentStreak);
    
    return sorted.slice(0, args.limit || 5);
  },
});

// Get upsides/upsets (lower seed beat higher seed)
export const getUpsets = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("matchResults")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();
      
    // We need seeds. We can get seeds from `teams` table or `competitions` data?
    // Teams table has `seed`.
    
    // Get all teams in this competition to map seeds
    const teams = await ctx.db
        .query("teams")
        .withIndex("by_competition", q => q.eq("competitionId", args.competitionId))
        .collect();
        
    const teamSeeds = new Map(teams.map(t => [t.teamId, t.seed || 9999]));
    
    const upsets = [];
    
    for (const r of results) {
        if (!r.loser) continue;
        
        const winnerSeed = teamSeeds.get(r.winner.teamId) || 9999;
        const loserSeed = teamSeeds.get(r.loser.teamId) || 9999;
        
        // If winner seed is significantly worse (higher number) than loser seed
        if (winnerSeed > loserSeed) {
            upsets.push({
                ...r,
                winnerSeed,
                loserSeed,
                diff: winnerSeed - loserSeed
            });
        }
    }
    
    return upsets.sort((a, b) => b.diff - a.diff);
  },
});
