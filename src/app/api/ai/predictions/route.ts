import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Generate win probability prediction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, tenantId } = body;

    if (!matchId || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = await (convex as any).query(api.matches.getByMatchId, { matchId });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = await (convex as any).query(api.matchTimeline.getTimeline, { matchId });

    // Generate prediction
    const prediction = generatePrediction(match, timeline);

    // Store the prediction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (convex as any).mutation(api.aiHighlights.storeAIContent, {
      matchId,
      tenantId,
      type: "prediction",
      content: prediction.content,
      confidence: prediction.confidence,
      metadata: prediction.metadata,
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error generating prediction:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}

// Get latest prediction for a match
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prediction = await (convex as any).query(api.aiHighlights.getLatestPrediction, {
      matchId,
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error getting prediction:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 }
    );
  }
}

// Simple prediction generator (would use ML model in production)
function generatePrediction(
  match: Record<string, unknown>,
  timeline?: { events: Array<{ team?: string }> } | null
): {
  content: string;
  confidence: number;
  metadata: Record<string, unknown>;
} {
  const team1 = (match.team1 as { name: string; score?: number }) ?? { name: "Team 1", score: 0 };
  const team2 = (match.team2 as { name: string; score?: number }) ?? { name: "Team 2", score: 0 };
  
  const score1 = team1.score ?? 0;
  const score2 = team2.score ?? 0;
  const totalScore = score1 + score2 || 1;

  // Calculate base probability from current score
  let team1Prob = score1 / totalScore;
  
  // Factor in momentum from recent events
  if (timeline?.events) {
    const recentEvents = timeline.events.slice(-10);
    const team1Events = recentEvents.filter(e => e.team === "team1").length;
    const team2Events = recentEvents.filter(e => e.team === "team2").length;
    const momentumFactor = (team1Events - team2Events) * 0.05;
    team1Prob = Math.min(0.95, Math.max(0.05, team1Prob + momentumFactor));
  }

  const team2Prob = 1 - team1Prob;
  const confidence = Math.max(team1Prob, team2Prob);

  return {
    content: `Win probability: ${team1.name} ${(team1Prob * 100).toFixed(1)}% vs ${team2.name} ${(team2Prob * 100).toFixed(1)}%`,
    confidence,
    metadata: {
      team1Probability: team1Prob,
      team2Probability: team2Prob,
      basedOn: "current_score",
    },
  };
}
