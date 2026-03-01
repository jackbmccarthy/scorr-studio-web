// Convex functions for members

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// List members for a tenant
export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('members')
      .filter((q) => q.eq(q.field('tenantId'), args.tenantId))
      .collect();
  },
});

// Get member by user and tenant
export const getByUserTenant = query({
  args: { 
    tenantId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('members')
      .filter((q) => 
        q.and(
          q.eq(q.field('tenantId'), args.tenantId),
          q.eq(q.field('userId'), args.userId)
        )
      )
      .first();
  },
});

// Create invitation
export const createInvitation = mutation({
  args: {
    tenantId: v.string(),
    email: v.string(),
    role: v.string(),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const token = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    await ctx.db.insert('invitations', {
      tenantId: args.tenantId,
      token,
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      createdAt: now,
      expiresAt,
    });
    
    return { token };
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query('invitations')
      .filter((q) => q.eq(q.field('token'), args.token))
      .first();
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      throw new Error('Invitation has expired');
    }
    
    // Add member
    await ctx.db.insert('members', {
      tenantId: invitation.tenantId,
      userId: args.userId,
      email: invitation.email,
      role: invitation.role,
      joinedAt: new Date().toISOString(),
    });
    
    // Delete invitation
    await ctx.db.delete(invitation._id);
    
    return { tenantId: invitation.tenantId };
  },
});

// Remove member
export const remove = mutation({
  args: {
    tenantId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('members')
      .filter((q) => 
        q.and(
          q.eq(q.field('tenantId'), args.tenantId),
          q.eq(q.field('userId'), args.userId)
        )
      )
      .first();
    
    if (!member) {
      throw new Error('Member not found');
    }
    
    return await ctx.db.delete(member._id);
  },
});
