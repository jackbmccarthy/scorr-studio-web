import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Generate highlight descriptions for a match
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

    // Generate highlights from key events
    const highlights = generateHighlights(match, timeline);

    // Store each highlight
    for (const highlight of highlights) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (convex as any).mutation(api.aiHighlights.storeAIContent, {
        matchId,
        tenantId,
        type: "key_moment",
        content: highlight.content,
        metadata: highlight.metadata,
      });
    }

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Error generating highlights:", error);
    return NextResponse.json(
      { error: "Failed to generate highlights" },
      { status: 500 }
    );
  }
}

// Get key moments for a match
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
    const highlights = await (convex as any).query(api.aiHighlights.getKeyMoments, {
      matchId,
    });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Error getting highlights:", error);
    return NextResponse.json(
      { error: "Failed to get highlights" },
      { status: 500 }
    );
  }
}

// Generate highlights from match events
function generateHighlights(
  match: Record<string, unknown>,
  timeline?: { events: Array<{
    eventId: string;
    type: string;
    timestamp: string;
    team?: string;
    player?: string;
    description?: string;
  }> } | null
): Array<{
  content: string;
  metadata: Record<string, unknown>;
}> {
  const highlights: Array<{
    content: string;
    metadata: Record<string, unknown>;
  }> = [];

  const team1 = (match.team1 as { name: string })?.name ?? "Team 1";
  const team2 = (match.team2 as { name: string })?.name ?? "Team 2";

  // Generate match summary
  const score1 = (match.team1 as { score?: number })?.score ?? 0;
  const score2 = (match.team2 as { score?: number })?.score ?? 0;
  const winner = score1 > score2 ? team1 : score2 < score1 ? team2 : "Tie";

  highlights.push({
    content: `Final Score: ${team1} ${score1} - ${team2} ${score2}. ${winner !== "Tie" ? `${winner} takes the victory!` : "Match ends in a tie!"}`,
    metadata: { type: "final_score" },
  });

  // Extract key events from timeline
  if (timeline?.events) {
    // Find significant events
    const keyEvents = timeline.events.filter(e => 
      ["set", "game", "timeout", "card"].includes(e.type)
    );

    for (const event of keyEvents.slice(0, 5)) {
      const team = event.team === "team1" ? team1 : team2;
      highlights.push({
        content: event.description || `${event.type.charAt(0).toUpperCase() + event.type.slice(1)} for ${team}${event.player ? ` (${event.player})` : ""}`,
        metadata: {
          type: event.type,
          eventId: event.eventId,
          timestamp: event.timestamp,
          team: event.team,
        },
      });
    }
  }

  return highlights;
}
