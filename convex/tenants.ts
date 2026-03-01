// Convex functions for tenant management

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get a tenant by tenantId
 */
export const getByTenantId = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
  },
});

/**
 * Get a tenant by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get all members of a tenant
 */
export const getMembers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

/**
 * Get all tenants for a user
 */
export const getUserTenants = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const tenants = await Promise.all(
      memberships.map(async (membership) => {
        const tenant = await ctx.db
          .query("tenants")
          .withIndex("by_tenantId", (q) => q.eq("tenantId", membership.tenantId))
          .first();
        return tenant ? { ...tenant, role: membership.role } : null;
      })
    );
    
    return tenants.filter(Boolean);
  },
});

/**
 * Check if user is member of tenant
 */
export const isMember = query({
  args: { tenantId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .filter((q) => 
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();
    return member ? { isMember: true, role: member.role } : { isMember: false, role: null };
  },
});

/**
 * Get pending invitations for a tenant
 */
export const getInvitations = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Create a new tenant
 */
export const create = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    ownerUserId: v.string(),
    ownerEmail: v.string(),
    ownerName: v.optional(v.string()),
    initialSportId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const enabledSports: Record<string, boolean> = {};
    if (args.initialSportId) {
      enabledSports[args.initialSportId] = true;
    }
    
    await ctx.db.insert("tenants", {
      tenantId: args.tenantId,
      name: args.name,
      slug: args.slug,
      createdAt: now,
      subscription: {
        tier: "free",
      },
      settings: {
        enabledSports,
        currentSportId: args.initialSportId,
        socialAutomation: {
          autoPostOnFinish: false,
          platforms: [],
        },
      },
    });
    
    await ctx.db.insert("members", {
      tenantId: args.tenantId,
      userId: args.ownerUserId,
      email: args.ownerEmail,
      name: args.ownerName,
      role: "owner",
      joinedAt: now,
    });
    
    return { success: true, tenantId: args.tenantId };
  },
});

/**
 * Update tenant settings
 */
export const updateSettings = mutation({
  args: {
    tenantId: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    
    const updates: Record<string, unknown> = {};
    
    if (args.name) {
      updates.name = args.name;
      updates.lastRenamedAt = new Date().toISOString();
    }
    if (args.slug) {
      updates.slug = args.slug;
    }
    if (args.settings) {
      updates.settings = { ...tenant.settings, ...args.settings };
    }
    
    await ctx.db.patch(tenant._id, updates);
    
    return { success: true };
  },
});

/**
 * Invite a member to tenant
 */
export const inviteMember = mutation({
  args: {
    tenantId: v.string(),
    email: v.string(),
    role: v.string(),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already a member
    const existingMember = await ctx.db
      .query("members")
      .filter((q) => 
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.eq(q.field("userId"), "")
        )
      )
      .first();
    
    // Check for existing invitation
    const existingInvite = await ctx.db
      .query("invitations")
      .filter((q) => 
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.eq(q.field("email"), args.email)
        )
      )
      .first();
    
    if (existingInvite) {
      throw new Error("Invitation already exists");
    }
    
    // Generate token
    const token = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    await ctx.db.insert("invitations", {
      tenantId: args.tenantId,
      token,
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      createdAt: now,
      expiresAt,
    });
    
    return { success: true, token };
  },
});

/**
 * Accept an invitation
 */
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    
    if (invitation.email !== args.email) {
      throw new Error("Email does not match invitation");
    }
    
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      throw new Error("Invitation has expired");
    }
    
    const now = new Date().toISOString();
    
    // Add member
    await ctx.db.insert("members", {
      tenantId: invitation.tenantId,
      userId: args.userId,
      email: args.email,
      name: args.name,
      role: invitation.role,
      joinedAt: now,
    });
    
    // Delete invitation
    await ctx.db.delete(invitation._id);
    
    return { success: true, tenantId: invitation.tenantId };
  },
});

/**
 * Remove a member from tenant
 */
export const removeMember = mutation({
  args: {
    tenantId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
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
    
    if (member.role === "owner") {
      throw new Error("Cannot remove owner");
    }
    
    await ctx.db.delete(member._id);
    
    return { success: true };
  },
});

/**
 * Update member role
 */
export const updateMemberRole = mutation({
  args: {
    tenantId: v.string(),
    userId: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
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
    
    if (member.role === "owner") {
      throw new Error("Cannot change owner role");
    }
    
    await ctx.db.patch(member._id, { role: args.newRole });
    
    return { success: true };
  },
});

/**
 * Update tenant last active timestamp
 */
export const updateLastActive = mutation({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (tenant) {
      await ctx.db.patch(tenant._id, {
        lastActiveAt: new Date().toISOString(),
      });
    }
    
    return { success: true };
  },
});

/**
 * Update tenant enabled sports
 */
export const updateEnabledSports = mutation({
  args: {
    tenantId: v.string(),
    enabledSports: v.any(),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const enabledSportsMap = args.enabledSports as Record<string, boolean>;
    const enabledSportsList = Object.keys(enabledSportsMap).filter(key => enabledSportsMap[key]);
    
    const currentSettings = tenant.settings || {};
    const currentSportId = currentSettings.currentSportId;
    
    let newCurrentSportId = currentSportId;
    if (!currentSportId || !enabledSportsMap[currentSportId]) {
      newCurrentSportId = enabledSportsList[0] || undefined;
    }
    
    await ctx.db.patch(tenant._id, {
      settings: {
        ...currentSettings,
        enabledSports: enabledSportsMap,
        currentSportId: newCurrentSportId,
      },
    });
    
    return { success: true };
  },
});

/**
 * Set current sport for tenant
 */
export const setCurrentSport = mutation({
  args: {
    tenantId: v.string(),
    sportId: v.string(),
  },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .first();
    
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const currentSettings = tenant.settings || {};
    const enabledSports = currentSettings.enabledSports as Record<string, boolean> | undefined;
    
    if (enabledSports && !enabledSports[args.sportId]) {
      throw new Error("Sport is not enabled for this tenant");
    }
    
    await ctx.db.patch(tenant._id, {
      settings: {
        ...currentSettings,
        currentSportId: args.sportId,
      },
    });
    
    return { success: true };
  },
});
