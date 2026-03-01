// Notification Settings API Route
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const api = anyApi;

// GET - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const tenantId = searchParams.get("tenantId");

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: "Missing required parameters: userId, tenantId" },
        { status: 400 }
      );
    }

    const preferences = await convex.query(api.notificationPreferences.getPreferences, {
      userId,
      tenantId,
    });

    return NextResponse.json(preferences);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get preferences";
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PUT - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tenantId, ...preferences } = body;

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, tenantId" },
        { status: 400 }
      );
    }

    // Validate preference keys
    const validKeys = [
      "emailEnabled",
      "pushEnabled",
      "smsEnabled",
      "matchReminders",
      "registrationConfirmations",
      "scheduleChanges",
      "matchResults",
      "announcements",
    ];

    const updateData: Record<string, boolean> = {};
    for (const key of validKeys) {
      if (preferences[key] !== undefined && typeof preferences[key] === "boolean") {
        updateData[key] = preferences[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid preferences provided" },
        { status: 400 }
      );
    }

    const result = await convex.mutation(api.notificationPreferences.updatePreferences, {
      userId,
      tenantId,
      ...updateData,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
