import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, tenantId } = body;

    if (!streamId || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (convex as any).mutation(api.streams.endStream, {
      streamId,
      tenantId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error ending stream:", error);
    return NextResponse.json(
      { error: "Failed to end stream" },
      { status: 500 }
    );
  }
}
