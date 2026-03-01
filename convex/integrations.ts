import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// API KEYS
// ==========================================

export const listApiKeys = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Auth check
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const createApiKey = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const keyId = crypto.randomUUID();
    const secret = `sk_live_${crypto.randomUUID().replace(/-/g, "")}`;
    const hashedSecret = secret; // In prod, hash this!

    const apiKey = await ctx.db.insert("apiKeys", {
      keyId,
      tenantId: args.tenantId,
      hashedSecret,
      name: args.name,
      permissions: args.permissions,
      createdAt: new Date().toISOString(),
    });

    return { keyId, secret, _id: apiKey };
  },
});

export const deleteApiKey = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    // TODO: Auth check
    await ctx.db.delete(args.apiKeyId);
    return { success: true };
  },
});

// ==========================================
// WEBHOOKS
// ==========================================

export const listWebhooks = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Auth check
    return await ctx.db
      .query("webhooks")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const createWebhook = mutation({
  args: {
    tenantId: v.string(),
    url: v.string(),
    events: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const webhookId = crypto.randomUUID();
    const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;

    const webhook = await ctx.db.insert("webhooks", {
      webhookId,
      tenantId: args.tenantId,
      url: args.url,
      events: args.events,
      secret,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return { webhookId, secret, _id: webhook };
  },
});

export const deleteWebhook = mutation({
  args: { webhookId: v.id("webhooks") },
  handler: async (ctx, args) => {
    // TODO: Auth check
    await ctx.db.delete(args.webhookId);
    return { success: true };
  },
});
