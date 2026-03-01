import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Generate AI commentary for a match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, tenantId, context } = body;

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

    // Generate commentary based on match state
    // In production, this would call an AI service (OpenAI, Claude, etc.)
    const commentary = generateCommentary(match, context);

    // Store the commentary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (convex as any).mutation(api.aiHighlights.storeAIContent, {
      matchId,
      tenantId,
      type: "commentary",
      content: commentary,
      confidence: 0.85,
      metadata: { context },
    });

    return NextResponse.json({ commentary });
  } catch (error) {
    console.error("Error generating commentary:", error);
    return NextResponse.json(
      { error: "Failed to generate commentary" },
      { status: 500 }
    );
  }
}

// Get recent commentary for a match
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commentary = await (convex as any).query(api.aiHighlights.getRecentCommentary, {
      matchId,
      limit,
    });

    return NextResponse.json({ commentary });
  } catch (error) {
    console.error("Error getting commentary:", error);
    return NextResponse.json(
      { error: "Failed to get commentary" },
      { status: 500 }
    );
  }
}

// Simple commentary generator (would be replaced with AI service)
function generateCommentary(match: Record<string, unknown>, context?: string): string {
  const team1 = (match.team1 as { name: string })?.name ?? "Team 1";
  const team2 = (match.team2 as { name: string })?.name ?? "Team 2";
  const score1 = (match.team1 as { score?: number })?.score ?? 0;
  const score2 = (match.team2 as { score?: number })?.score ?? 0;

  const templates = [
    `What a match! ${team1} leads ${score1}-${score2} against ${team2}. The tension is palpable!`,
    `${team1} showing great form as they take on ${team2}. Current score: ${score1}-${score2}.`,
    `Incredible action here! ${score1 > score2 ? team1 : team2} ahead by ${Math.abs(score1 - score2)}.`,
    `The crowd is on their feet! ${team1} ${score1} - ${team2} ${score2}. Every point counts!`,
    `What intensity! Both teams giving it their all. ${team1} ${score1} - ${team2} ${score2}.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
