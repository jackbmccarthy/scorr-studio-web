import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Create or get timeline for a match
export const getOrCreateTimeline = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("matchTimeline")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existing) {
      return existing;
    }

    const timelineId = nanoid();
    await ctx.db.insert("matchTimeline", {
      timelineId,
      matchId: args.matchId,
      tenantId: args.tenantId,
      events: [],
      createdAt: new Date().toISOString(),
    });

    return await ctx.db
      .query("matchTimeline")
      .withIndex("by_timelineId", (q) => q.eq("timelineId", timelineId))
      .first();
  },
});

// Add event to timeline
export const addTimelineEvent = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
    type: v.string(), // "point" | "game" | "set" | "timeout" | "substitution" | "card" | "video_ref" | "custom"
    team: v.optional(v.string()), // "team1" | "team2"
    player: v.optional(v.string()),
    data: v.optional(v.any()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let timeline = await ctx.db
      .query("matchTimeline")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!timeline) {
      // Create timeline if it doesn't exist
      const timelineId = nanoid();
      await ctx.db.insert("matchTimeline", {
        timelineId,
        matchId: args.matchId,
        tenantId: args.tenantId,
        events: [],
        createdAt: new Date().toISOString(),
      });

      timeline = await ctx.db
        .query("matchTimeline")
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .first();
    }

    const eventId = nanoid();
    const newEvent = {
      eventId,
      type: args.type,
      timestamp: new Date().toISOString(),
      team: args.team,
      player: args.player,
      data: args.data,
      description: args.description,
      videoUrl: args.videoUrl,
    };

    await ctx.db.patch(timeline!._id, {
      events: [...timeline!.events, newEvent],
      updatedAt: new Date().toISOString(),
    });

    return { eventId };
  },
});

// Remove event from timeline
export const removeTimelineEvent = mutation({
  args: {
    matchId: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const timeline = await ctx.db
      .query("matchTimeline")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!timeline) {
      throw new Error("Timeline not found");
    }

    type EventType = { eventId: string; type: string; timestamp: string; team?: string; player?: string; data?: unknown; description?: string; videoUrl?: string };
    await ctx.db.patch(timeline._id, {
      events: (timeline.events as EventType[]).filter((e: EventType) => e.eventId !== args.eventId),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Get timeline for a match
export const getTimeline = query({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matchTimeline")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();
  },
});

// Update event video URL
export const updateEventVideo = mutation({
  args: {
    matchId: v.string(),
    eventId: v.string(),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const timeline = await ctx.db
      .query("matchTimeline")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!timeline) {
      throw new Error("Timeline not found");
    }

    type EventType = { eventId: string; type: string; timestamp: string; team?: string; player?: string; data?: unknown; description?: string; videoUrl?: string };
    const updatedEvents = (timeline.events as EventType[]).map((e: EventType) => 
      e.eventId === args.eventId ? { ...e, videoUrl: args.videoUrl } : e
    );

    await ctx.db.patch(timeline._id, {
      events: updatedEvents,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
