import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

// Create a payment transaction record
export const createTransaction = mutation({
  args: {
    tenantId: v.string(),
    competitionId: v.string(),
    eventId: v.optional(v.string()),
    registrationId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    platformFee: v.number(),
    organizerAmount: v.number(),
    payerEmail: v.optional(v.string()),
    payerName: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const transactionId = uuidv4();
    const now = new Date().toISOString();

    const transaction = await ctx.db.insert("paymentTransactions", {
      transactionId,
      tenantId: args.tenantId,
      competitionId: args.competitionId,
      eventId: args.eventId,
      registrationId: args.registrationId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      amount: args.amount,
      currency: args.currency,
      platformFee: args.platformFee,
      organizerAmount: args.organizerAmount,
      status: "pending",
      payerEmail: args.payerEmail,
      payerName: args.payerName,
      description: args.description,
      metadata: args.metadata,
      createdAt: now,
    });

    return { transactionId, _id: transaction };
  },
});

// Update transaction status
export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    status: v.string(),
    stripeChargeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let transaction;

    if (args.transactionId) {
      const id = args.transactionId;
      transaction = await ctx.db
        .query("paymentTransactions")
        .withIndex("by_transactionId", (q) => q.eq("transactionId", id))
        .first();
    } else if (args.stripeCheckoutSessionId) {
      transaction = await ctx.db
        .query("paymentTransactions")
        .filter((q) => q.eq(q.field("stripeCheckoutSessionId"), args.stripeCheckoutSessionId))
        .first();
    } else if (args.stripePaymentIntentId) {
      const id = args.stripePaymentIntentId;
      transaction = await ctx.db
        .query("paymentTransactions")
        .withIndex("by_stripe_payment", (q) => q.eq("stripePaymentIntentId", id))
        .first();
    }

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(transaction._id, {
      status: args.status,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeChargeId: args.stripeChargeId,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Get tenant earnings summary
export const getTenantEarnings = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    const summary = {
      totalRevenue: 0,
      totalPlatformFees: 0,
      totalOrganizerAmount: 0,
      pendingPayouts: 0,
      paidOut: 0,
      transactionCount: 0,
      refundedAmount: 0,
      transactions: [] as any[],
    };

    for (const tx of transactions) {
      if (tx.status === "succeeded") {
        summary.totalRevenue += tx.amount;
        summary.totalPlatformFees += tx.platformFee;
        summary.totalOrganizerAmount += tx.organizerAmount;
        summary.transactionCount++;

        if (tx.payoutStatus === "pending" || !tx.payoutStatus) {
          summary.pendingPayouts += tx.organizerAmount;
        } else if (tx.payoutStatus === "paid") {
          summary.paidOut += tx.organizerAmount;
        }
      } else if (tx.status === "refunded" && tx.refundAmount) {
        summary.refundedAmount += tx.refundAmount;
      }
    }

    summary.transactions = transactions
      .filter(tx => tx.status === "succeeded")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    return summary;
  },
});

// Get transactions for a competition
export const getCompetitionTransactions = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Mark transaction as refunded
export const refundTransaction = mutation({
  args: {
    transactionId: v.string(),
    refundAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_transactionId", (q) => q.eq("transactionId", args.transactionId))
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(transaction._id, {
      status: "refunded",
      refundAmount: args.refundAmount,
      refundedAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Update tenant Stripe Connect info
export const updateTenantStripeInfo = mutation({
  args: {
    tenantId: v.string(),
    stripeAccountId: v.string(),
    onboardingComplete: v.optional(v.boolean()),
    chargesEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    await ctx.db.patch(tenant._id, {
      stripeAccountId: args.stripeAccountId,
      stripeOnboardingComplete: args.onboardingComplete,
      stripeChargesEnabled: args.chargesEnabled,
    });

    return { success: true };
  },
});

// Get tenant Stripe info
export const getTenantStripeInfo = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();

    if (!tenant) {
      return null;
    }

    return {
      stripeAccountId: tenant.stripeAccountId,
      stripeOnboardingComplete: tenant.stripeOnboardingComplete,
      stripeChargesEnabled: tenant.stripeChargesEnabled,
      platformFeePercent: tenant.platformFeePercent || 5,
    };
  },
});
