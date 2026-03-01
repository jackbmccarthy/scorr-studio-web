// Convex functions for user profiles

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// QUERIES
// ==========================================

/**
 * Get a user profile by userId
 */
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get a user profile by email
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Get multiple user profiles by IDs
 */
export const getByIds = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const profiles = await Promise.all(
      args.userIds.map(async (userId) => {
        return await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
      })
    );
    return profiles.filter(Boolean);
  },
});

/**
 * Search users by name or email
 */
export const search = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const allProfiles = await ctx.db.query("profiles").collect();
    
    const searchLower = args.query.toLowerCase();
    
    return allProfiles
      .filter((p) => 
        p.email.toLowerCase().includes(searchLower) ||
        p.displayName?.toLowerCase().includes(searchLower) ||
        p.firstName?.toLowerCase().includes(searchLower) ||
        p.lastName?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);
  },
});

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Create a new user profile
 */
export const create = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    const profileId = await ctx.db.insert("profiles", {
      userId: args.userId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      displayName: args.displayName || 
        (args.firstName && args.lastName 
          ? `${args.firstName} ${args.lastName}` 
          : undefined),
      avatarUrl: args.avatarUrl,
      createdAt: now,
    });
    
    return profileId;
  },
});

/**
 * Update user profile
 */
export const update = mutation({
  args: {
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    hometown: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    linkedinHandle: v.optional(v.string()),
    taggingEnabled: v.optional(v.boolean()),
    athleteAttributes: v.optional(v.any()),
    playerRatings: v.optional(v.any()),
    customFieldValues: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    
    // Only update fields that are provided
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.nationality !== undefined) updates.nationality = args.nationality;
    if (args.hometown !== undefined) updates.hometown = args.hometown;
    if (args.twitterHandle !== undefined) updates.twitterHandle = args.twitterHandle;
    if (args.instagramHandle !== undefined) updates.instagramHandle = args.instagramHandle;
    if (args.linkedinHandle !== undefined) updates.linkedinHandle = args.linkedinHandle;
    if (args.taggingEnabled !== undefined) updates.taggingEnabled = args.taggingEnabled;
    if (args.athleteAttributes !== undefined) updates.athleteAttributes = args.athleteAttributes;
    if (args.playerRatings !== undefined) updates.playerRatings = args.playerRatings;
    if (args.customFieldValues !== undefined) updates.customFieldValues = args.customFieldValues;
    
    await ctx.db.patch(profile._id, updates);
    
    return { success: true };
  },
});

/**
 * Delete user profile
 */
export const remove = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    await ctx.db.delete(profile._id);
    
    return { success: true };
  },
});

/**
 * Verify user profile
 */
export const verify = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    await ctx.db.patch(profile._id, { verified: true });
    
    return { success: true };
  },
});

/**
 * Upsert profile (create or update)
 */
export const upsert = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) {
      // Update existing profile
      const updates: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      
      if (args.firstName) updates.firstName = args.firstName;
      if (args.lastName) updates.lastName = args.lastName;
      if (args.displayName) updates.displayName = args.displayName;
      if (args.avatarUrl) updates.avatarUrl = args.avatarUrl;
      
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new profile
      const now = new Date().toISOString();
      return await ctx.db.insert("profiles", {
        userId: args.userId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        displayName: args.displayName || 
          (args.firstName && args.lastName 
            ? `${args.firstName} ${args.lastName}` 
            : undefined),
        avatarUrl: args.avatarUrl,
        createdAt: now,
      });
    }
  },
});
