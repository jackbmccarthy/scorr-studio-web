import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convex: any = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
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
    const tenantId = process.env.DEFAULT_TENANT_ID || "demo_tenant";

    const stripeInfo = await convex.query(api.payments.getTenantStripeInfo, {
      tenantId,
    });

    if (!stripeInfo?.stripeAccountId) {
      return NextResponse.json({ error: "No Stripe account connected" }, { status: 400 });
    }

    // Create new account link for re-onboarding
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: stripeInfo.stripeAccountId,
      refresh_url: `${origin}/app/settings/payments?refresh=true`,
      return_url: `${origin}/api/stripe/callback?account_id=${stripeInfo.stripeAccountId}&tenant_id=${tenantId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to refresh Stripe onboarding";
    console.error("Stripe refresh error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
