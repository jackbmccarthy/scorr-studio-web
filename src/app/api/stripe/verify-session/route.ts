import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
  });

  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        registrationId: session.metadata?.registrationId,
        amount: session.amount_total,
        customerEmail: session.customer_email,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: session.payment_status,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify session";
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
