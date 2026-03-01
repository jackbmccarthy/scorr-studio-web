import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function GET(request: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.redirect(
      new URL("/app/settings/payments?error=stripe_not_configured", request.url)
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
  });

  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get("account_id");
  const tenantId = searchParams.get("tenant_id");

  if (!accountId || !tenantId) {
    return NextResponse.redirect(
      new URL("/app/settings/payments?error=missing_params", request.url)
    );
  }

  try {
    // Retrieve account to check status
    const account = await stripe.accounts.retrieve(accountId);

    // Update tenant with Stripe info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (convex as any).mutation(api.payments.updateTenantStripeInfo, {
      tenantId,
      stripeAccountId: accountId,
      onboardingComplete: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/app/settings/payments?success=true&charges_enabled=${account.charges_enabled}`,
        request.url
      )
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe callback error:", error);
    return NextResponse.redirect(
      new URL(`/app/settings/payments?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
