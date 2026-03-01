import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
  });

  try {
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        tenantId,
      },
    });

    // Create account link for onboarding
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/app/settings/payments?refresh=true`,
      return_url: `${origin}/api/stripe/callback?account_id=${account.id}&tenant_id=${tenantId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create Stripe Connect account";
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
