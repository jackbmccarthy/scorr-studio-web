import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { anyApi } from "convex/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const api = anyApi;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create registration in Convex
    const registration = await convex.mutation(api.registrations.createRegistration, {
      competitionId: body.competitionId,
      eventId: body.eventId,
      tenantId: body.tenantId,
      participantId: body.participantId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      club: body.club,
      rating: body.rating,
      division: body.division,
      partner: body.partner,
      waiverAccepted: body.waiverAccepted,
    });

    // If there's an entry fee, create Stripe Checkout session
    if (registration.entryFee && registration.entryFee > 0 && stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2026-01-28.clover",
      });

      // Get tenant's Stripe account
      const tenantStripe = await convex.query(api.payments.getTenantStripeInfo, {
        tenantId: body.tenantId,
      });

      if (!tenantStripe?.stripeAccountId || !tenantStripe.stripeChargesEnabled) {
        // Registration created but payment not available - mark as pending
        return NextResponse.json({
          registrationId: registration.registrationId,
          status: "pending",
          message: "Registration created. Payment will be collected separately.",
        });
      }

      // Get event and competition details for checkout
      const event = await convex.query(api.registrations.getEventDetails, { eventId: body.eventId });
      const competition = await convex.query(api.registrations.getCompetitionBySlug, {
        slug: (event as any)?.competition?.slug || "",
      });

      const platformFeePercent = tenantStripe.platformFeePercent || 5;
      const entryFee = registration.entryFee as number;
      const platformFee = Math.round(entryFee * platformFeePercent / 100);
      const organizerAmount = entryFee - platformFee;

      // Create payment transaction record
      const transaction = await convex.mutation(api.payments.createTransaction, {
        tenantId: body.tenantId,
        competitionId: body.competitionId,
        eventId: body.eventId,
        registrationId: registration.registrationId,
        amount: entryFee,
        currency: registration.currency as string,
        platformFee,
        organizerAmount,
        payerEmail: body.email,
        payerName: body.name,
        description: `${(event as any)?.name || "Event"} - ${(competition as any)?.name || "Competition"}`,
        metadata: {
          registrationId: registration.registrationId,
          eventId: body.eventId,
        },
      });

      // Create Stripe Checkout session
      const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: registration.currency as string,
            unit_amount: entryFee,
            product_data: {
              name: `${(event as any)?.name || "Event"} - ${(competition as any)?.name || "Competition"}`,
              description: `Registration for ${body.name}`,
            },
          },
          quantity: 1,
        }],
        customer_email: body.email,
        success_url: `${origin}/c/${(competition as any)?.slug}/register/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/c/${(competition as any)?.slug}/register/${body.eventId}`,
        metadata: {
          registrationId: registration.registrationId,
          transactionId: transaction.transactionId,
          eventId: body.eventId,
          competitionId: body.competitionId,
          tenantId: body.tenantId,
        },
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: tenantStripe.stripeAccountId,
          },
          metadata: {
            registrationId: registration.registrationId,
            transactionId: transaction.transactionId,
          },
        },
      });

      // Update transaction with checkout session ID
      await convex.mutation(api.payments.updateTransactionStatus, {
        transactionId: transaction.transactionId,
        stripeCheckoutSessionId: checkoutSession.id,
        status: "pending",
      });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        registrationId: registration.registrationId,
      });
    }

    // Free registration or waitlist
    return NextResponse.json({
      registrationId: registration.registrationId,
      status: registration.status,
      isWaitlist: registration.isWaitlist,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
