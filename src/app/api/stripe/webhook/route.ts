import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convex: any = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
  });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const registrationId = metadata.registrationId;
        const transactionId = metadata.transactionId;

        // Update transaction status
        if (transactionId) {
          await convex.mutation(api.payments.updateTransactionStatus, {
            transactionId,
            stripePaymentIntentId: session.payment_intent as string,
            stripeCheckoutSessionId: session.id,
            status: "succeeded",
          });
        }

        // Confirm registration payment
        if (registrationId && session.payment_intent) {
          await convex.mutation(api.registrations.confirmPayment, {
            registrationId,
            paymentId: session.payment_intent as string,
            checkoutSessionId: session.id,
            amountPaid: session.amount_total || 0,
          });
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const transactionId = session.metadata?.transactionId;

        if (transactionId) {
          await convex.mutation(api.payments.updateTransactionStatus, {
            transactionId,
            stripeCheckoutSessionId: session.id,
            status: "failed",
          });
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata || {};

        if (metadata.transactionId) {
          await convex.mutation(api.payments.updateTransactionStatus, {
            transactionId: metadata.transactionId,
            stripePaymentIntentId: paymentIntent.id,
            stripeChargeId: paymentIntent.latest_charge as string,
            status: "succeeded",
          });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata || {};

        if (metadata.transactionId) {
          await convex.mutation(api.payments.updateTransactionStatus, {
            transactionId: metadata.transactionId,
            stripePaymentIntentId: paymentIntent.id,
            status: "failed",
          });
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          const transactions = await convex.query(api.payments.getCompetitionTransactions, {
            competitionId: "",
          });

          const transaction = (transactions as any[]).find(
            (t) => t.stripePaymentIntentId === paymentIntentId
          );

          if (transaction) {
            await convex.mutation(api.payments.refundTransaction, {
              transactionId: transaction.transactionId,
              refundAmount: charge.amount_refunded,
            });
          }
        }

        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        if (account.metadata?.tenantId) {
          await convex.mutation(api.payments.updateTenantStripeInfo, {
            tenantId: account.metadata.tenantId,
            stripeAccountId: account.id,
            onboardingComplete: account.details_submitted || false,
            chargesEnabled: account.charges_enabled || false,
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
