import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ==========================================
// ORGANIZATION SETTINGS
// ==========================================

export const getOrganization = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const org = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();

    return org;
  },
});

export const updateOrganization = mutation({
  args: {
    tenantId: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const org = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();

    if (!org) {
      throw new Error("Organization not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.slug !== undefined) updates.slug = args.slug;
    
    // Custom fields storage handling if needed
    if (args.description || args.email || args.website) {
      const currentSettings = org.settings || {};
      const newSettings = {
        ...currentSettings,
        description: args.description,
        email: args.email,
        website: args.website,
      };
      updates.settings = newSettings;
    }

    await ctx.db.patch(org._id, updates);

    return { success: true };
  },
});

// ==========================================
// TEAM MEMBERS
// ==========================================

export const listMembers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Auth check
    return await ctx.db
      .query("members")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const inviteMember = mutation({
  args: {
    tenantId: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const token = crypto.randomUUID();
    
    // Check if invite already exists
    const existing = await ctx.db
      .query("invitations")
      .filter((q) => 
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.eq(q.field("email"), args.email)
        )
      )
      .first();

    if (existing) {
      return { token: existing.token, _id: existing._id, exists: true };
    }

    const invitation = await ctx.db.insert("invitations", {
      token,
      tenantId: args.tenantId,
      email: args.email,
      role: args.role,
      invitedBy: "user_current", // Get from auth
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    return { token, _id: invitation };
  },
});

export const removeMember = mutation({
  args: { 
    tenantId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Auth check
    const member = await ctx.db
      .query("members")
      .filter((q) => 
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (!member) {
      throw new Error("Member not found");
    }

    await ctx.db.delete(member._id);
    return { success: true };
  },
});
