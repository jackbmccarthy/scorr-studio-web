import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Add proper auth check and Convex query when auth is implemented
    // For now, return mock data
    return NextResponse.json({
      connected: false,
      onboardingComplete: false,
      chargesEnabled: false,
    });
  } catch (error: any) {
    console.error("Stripe status fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Stripe status" },
      { status: 500 }
    );
  }
}
