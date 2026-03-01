import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // TODO: Add proper auth check when auth is implemented
    // For now, return mock data
    const mockEarnings = {
      totalEarnings: 1250.00,
      pendingPayouts: 325.00,
      totalTransactions: 47,
      recentTransactions: [
        {
          id: "txn_1",
          amount: 25.00,
          status: "completed",
          createdAt: new Date().toISOString(),
          description: "Spring Championship - Men's Singles",
        },
        {
          id: "txn_2",
          amount: 30.00,
          status: "completed",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: "Spring Championship - Mixed Doubles",
        },
      ],
    };

    return NextResponse.json(mockEarnings);
  } catch (error: any) {
    console.error("Earnings fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
