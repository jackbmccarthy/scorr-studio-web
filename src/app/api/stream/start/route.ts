import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, tenantId, platform, streamUrl, streamKey, settings } = body;

    if (!matchId || !tenantId || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (convex as any).mutation(api.streams.startStream, {
      matchId,
      tenantId,
      platform,
      streamUrl,
      streamKey,
      settings,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error starting stream:", error);
    return NextResponse.json(
      { error: "Failed to start stream" },
      { status: 500 }
    );
  }
}
