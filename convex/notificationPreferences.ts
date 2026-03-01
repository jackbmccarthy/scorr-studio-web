// Notification Preferences Convex Functions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user notification preferences
export const getPreferences = query({
  args: {
    userId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_tenant", (q) => 
        q.eq("userId", args.userId).eq("tenantId", args.tenantId)
      )
      .first();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        matchReminders: true,
        registrationConfirmations: true,
        scheduleChanges: true,
        matchResults: true,
        announcements: true,
      };
    }

    return preferences;
  },
});

// Update user notification preferences
export const updatePreferences = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
    emailEnabled: v.optional(v.boolean()),
    pushEnabled: v.optional(v.boolean()),
    smsEnabled: v.optional(v.boolean()),
    matchReminders: v.optional(v.boolean()),
    registrationConfirmations: v.optional(v.boolean()),
    scheduleChanges: v.optional(v.boolean()),
    matchResults: v.optional(v.boolean()),
    announcements: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Find existing preferences
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_tenant", (q) => 
        q.eq("userId", args.userId).eq("tenantId", args.tenantId)
      )
      .first();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (args.emailEnabled !== undefined) updateData.emailEnabled = args.emailEnabled;
    if (args.pushEnabled !== undefined) updateData.pushEnabled = args.pushEnabled;
    if (args.smsEnabled !== undefined) updateData.smsEnabled = args.smsEnabled;
    if (args.matchReminders !== undefined) updateData.matchReminders = args.matchReminders;
    if (args.registrationConfirmations !== undefined) updateData.registrationConfirmations = args.registrationConfirmations;
    if (args.scheduleChanges !== undefined) updateData.scheduleChanges = args.scheduleChanges;
    if (args.matchResults !== undefined) updateData.matchResults = args.matchResults;
    if (args.announcements !== undefined) updateData.announcements = args.announcements;

    if (existing) {
      await ctx.db.patch(existing._id, updateData);
      return { success: true, _id: existing._id };
    } else {
      // Create new preferences
      const _id = await ctx.db.insert("notificationPreferences", {
        userId: args.userId,
        tenantId: args.tenantId,
        emailEnabled: args.emailEnabled ?? true,
        pushEnabled: args.pushEnabled ?? true,
        smsEnabled: args.smsEnabled ?? false,
        matchReminders: args.matchReminders ?? true,
        registrationConfirmations: args.registrationConfirmations ?? true,
        scheduleChanges: args.scheduleChanges ?? true,
        matchResults: args.matchResults ?? true,
        announcements: args.announcements ?? true,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, _id };
    }
  },
});

// Reset preferences to defaults
export const resetPreferences = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_tenant", (q) => 
        q.eq("userId", args.userId).eq("tenantId", args.tenantId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        matchReminders: true,
        registrationConfirmations: true,
        scheduleChanges: true,
        matchResults: true,
        announcements: true,
        updatedAt: now,
      });
      return { success: true };
    }

    return { success: false, message: "No preferences found to reset" };
  },
});
