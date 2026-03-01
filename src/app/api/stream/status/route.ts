import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");
    const matchId = searchParams.get("matchId");

    if (!streamId && !matchId) {
      return NextResponse.json(
        { error: "Either streamId or matchId is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (convex as any).query(api.streams.getStreamStatus, {
      streamId: streamId ?? undefined,
      matchId: matchId ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting stream status:", error);
    return NextResponse.json(
      { error: "Failed to get stream status" },
      { status: 500 }
    );
  }
}
