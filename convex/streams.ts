import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Start a stream for a match
export const startStream = mutation({
  args: {
    matchId: v.string(),
    tenantId: v.string(),
    platform: v.string(), // "youtube" | "twitch" | "facebook" | "custom"
    streamUrl: v.optional(v.string()),
    streamKey: v.optional(v.string()),
    settings: v.optional(v.object({
      quality: v.string(),
      showScoreboard: v.boolean(),
      showSponsors: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if stream already exists for this match
    const existingStream = await ctx.db
      .query("streams")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existingStream && existingStream.isLive) {
      throw new Error("Stream is already live for this match");
    }

    const streamId = nanoid();
    const now = new Date().toISOString();

    if (existingStream) {
      // Restart existing stream
      await ctx.db.patch(existingStream._id, {
        isLive: true,
        startedAt: now,
        endedAt: undefined,
        viewerCount: 0,
        settings: args.settings,
      });
      return { streamId: existingStream.streamId, isLive: true };
    }

    // Create new stream
    await ctx.db.insert("streams", {
      streamId,
      matchId: args.matchId,
      tenantId: args.tenantId,
      platform: args.platform,
      streamUrl: args.streamUrl,
      streamKey: args.streamKey,
      isLive: true,
      viewerCount: 0,
      startedAt: now,
      settings: args.settings ?? {
        quality: "1080p",
        showScoreboard: true,
        showSponsors: true,
      },
    });

    return { streamId, isLive: true };
  },
});

// End a stream
export const endStream = mutation({
  args: {
    streamId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db
      .query("streams")
      .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
      .first();

    if (!stream || stream.tenantId !== args.tenantId) {
      throw new Error("Stream not found or unauthorized");
    }

    await ctx.db.patch(stream._id, {
      isLive: false,
      endedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Get stream status
export const getStreamStatus = query({
  args: {
    streamId: v.optional(v.string()),
    matchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stream;

    if (args.streamId) {
      const id = args.streamId;
      stream = await ctx.db
        .query("streams")
        .withIndex("by_streamId", (q) => q.eq("streamId", id))
        .first();
    } else if (args.matchId) {
      const id = args.matchId;
      stream = await ctx.db
        .query("streams")
        .withIndex("by_match", (q) => q.eq("matchId", id))
        .first();
    }

    if (!stream) {
      return null;
    }

    return {
      streamId: stream.streamId,
      matchId: stream.matchId,
      platform: stream.platform,
      isLive: stream.isLive,
      viewerCount: stream.viewerCount,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      streamUrl: stream.streamUrl,
      settings: stream.settings,
    };
  },
});

// Update viewer count (called by streaming infrastructure)
export const updateViewerCount = mutation({
  args: {
    streamId: v.string(),
    viewerCount: v.number(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db
      .query("streams")
      .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
      .first();

    if (!stream) {
      throw new Error("Stream not found");
    }

    await ctx.db.patch(stream._id, {
      viewerCount: args.viewerCount,
    });

    return { success: true };
  },
});

// List streams for a tenant
export const listStreams = query({
  args: {
    tenantId: v.string(),
    liveOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.liveOnly) {
      return streams.filter(s => s.isLive);
    }

    return streams;
  },
});

// Get all live streams
export const getLiveStreams = query({
  args: {
    tenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_live", (q) => q.eq("isLive", true))
      .collect();

    if (args.tenantId) {
      return streams.filter(s => s.tenantId === args.tenantId);
    }

    return streams;
  },
});

// Update stream settings
export const updateStreamSettings = mutation({
  args: {
    streamId: v.string(),
    tenantId: v.string(),
    settings: v.object({
      quality: v.optional(v.string()),
      showScoreboard: v.optional(v.boolean()),
      showSponsors: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db
      .query("streams")
      .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
      .first();

    if (!stream || stream.tenantId !== args.tenantId) {
      throw new Error("Stream not found or unauthorized");
    }

    await ctx.db.patch(stream._id, {
      settings: {
        quality: args.settings.quality ?? stream.settings?.quality ?? "1080p",
        showScoreboard: args.settings.showScoreboard ?? stream.settings?.showScoreboard ?? true,
        showSponsors: args.settings.showSponsors ?? stream.settings?.showSponsors ?? true,
      },
    });

    return { success: true };
  },
});
