// Notifications Convex Functions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// Create a new notification
export const createNotification = mutation({
  args: {
    tenantId: v.string(),
    userId: v.string(),
    type: v.string(), // "match_reminder" | "registration_confirm" | "schedule_change" | "match_result" | "announcement"
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = crypto.randomUUID();
    const now = new Date().toISOString();

    const notificationId_result = await ctx.db.insert("notifications", {
      notificationId,
      tenantId: args.tenantId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      data: args.data,
      read: false,
      createdAt: now,
    });

    return { notificationId, _id: notificationId_result };
  },
});

// Mark a notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    await ctx.db.patch(args.notificationId, {
      read: true,
      readAt: now,
    });

    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Get all unread notifications for the user
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();

    // Mark each as read
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
        readAt: now,
      });
    }

    return { success: true, count: unreadNotifications.length };
  },
});

// Get all notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    const notifications = await query.take(args.limit ?? 50);

    // Filter by type if specified
    if (args.type) {
      return notifications.filter((n) => n.type === args.type);
    }

    return notifications;
  },
});

// Get unread notification count for a user
export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();

    return unreadNotifications.length;
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Delete all notifications for a user
export const deleteAllNotifications = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, count: notifications.length };
  },
});

// Update delivery tracking
export const updateDeliveryStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    channel: v.string(), // "email" | "push" | "sms"
    sent: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const update: Record<string, unknown> = {};
    
    if (args.channel === "email") {
      update.emailSent = args.sent;
      if (args.sent) update.emailSentAt = now;
    } else if (args.channel === "push") {
      update.pushSent = args.sent;
      if (args.sent) update.pushSentAt = now;
    } else if (args.channel === "sms") {
      update.smsSent = args.sent;
      if (args.sent) update.smsSentAt = now;
    }

    await ctx.db.patch(args.notificationId, update);

    return { success: true };
  },
});

// Get notifications by tenant (for admin)
export const getTenantNotifications = query({
  args: {
    tenantId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")
      .take(args.limit ?? 100);

    return notifications;
  },
});
