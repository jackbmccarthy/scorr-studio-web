import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

// Get competition by slug (public)
export const getCompetitionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const competition = await ctx.db
      .query("competitions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!competition) return null;

    // Get branding
    const branding = await ctx.db
      .query("competitionBranding")
      .withIndex("by_competition", (q) => q.eq("competitionId", competition.competitionId || competition._id))
      .first();

    // Get events
    const events = await ctx.db
      .query("competitionEvents")
      .withIndex("by_competition", (q) => q.eq("competitionId", competition.competitionId || competition._id))
      .collect();

    return {
      ...competition,
      branding,
      events: events.map(event => ({
        ...event,
        spotsRemaining: event.capacity ? event.capacity - (event.registeredCount || 0) : null,
        isFull: event.capacity ? (event.registeredCount || 0) >= event.capacity : false,
      })),
    };
  },
});

// Get event details (public)
export const getEventDetails = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("competitionEvents")
      .filter((q) => q.eq(q.field("_id"), args.eventId))
      .first();
    
    if (!event) return null;

    const competition = await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("competitionId"), event.competitionId))
      .first();

    return {
      ...event,
      competition,
      spotsRemaining: event.capacity ? event.capacity - (event.registeredCount || 0) : null,
      isFull: event.capacity ? (event.registeredCount || 0) >= event.capacity : false,
    };
  },
});

// Create a new registration
export const createRegistration = mutation({
  args: {
    competitionId: v.string(),
    eventId: v.string(),
    tenantId: v.string(),
    participantId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    club: v.optional(v.string()),
    rating: v.optional(v.number()),
    division: v.optional(v.string()),
    partner: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      club: v.optional(v.string()),
      rating: v.optional(v.number()),
    })),
    waiverAccepted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const registrationId = uuidv4();
    const now = new Date().toISOString();

    // Check if event exists and has capacity
    const event = await ctx.db
      .query("competitionEvents")
      .filter((q) => q.eq(q.field("_id"), args.eventId))
      .first();

    if (!event) {
      throw new Error("Event not found");
    }

    // Check capacity
    const currentCount = event.registeredCount || 0;
    const isWaitlist = event.capacity ? currentCount >= event.capacity : false;

    // Create QR code data
    const qrCode = JSON.stringify({
      registrationId,
      type: "competition_checkin",
      competitionId: args.competitionId,
      eventId: args.eventId,
    });

    const registration = await ctx.db.insert("competitionRegistrations", {
      registrationId,
      competitionId: args.competitionId,
      eventId: args.eventId,
      tenantId: args.tenantId,
      participantId: args.participantId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      club: args.club,
      rating: args.rating,
      division: args.division,
      partner: args.partner,
      status: isWaitlist ? "waitlisted" : (event.entryFee && event.entryFee > 0 ? "pending" : "confirmed"),
      paymentStatus: event.entryFee && event.entryFee > 0 ? "unpaid" : undefined,
      registeredAt: now,
      qrCode,
      waiverAccepted: args.waiverAccepted,
    });

    // Update event counts
    if (isWaitlist) {
      await ctx.db.patch(event._id, {
        waitlistCount: (event.waitlistCount || 0) + 1,
      });
    } else {
      await ctx.db.patch(event._id, {
        registeredCount: currentCount + 1,
      });
    }

    return {
      registrationId,
      _id: registration,
      status: isWaitlist ? "waitlisted" : (event.entryFee && event.entryFee > 0 ? "pending" : "confirmed"),
      isWaitlist,
      entryFee: event.entryFee,
      currency: event.currency || "usd",
    };
  },
});

// Update registration after payment
export const confirmPayment = mutation({
  args: {
    registrationId: v.string(),
    paymentId: v.string(),
    checkoutSessionId: v.string(),
    amountPaid: v.number(),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("competitionRegistrations")
      .withIndex("by_registrationId", (q) => q.eq("registrationId", args.registrationId))
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(registration._id, {
      status: "confirmed",
      paymentStatus: "paid",
      paymentId: args.paymentId,
      checkoutSessionId: args.checkoutSessionId,
      amountPaid: args.amountPaid,
      confirmedAt: now,
    });

    return { success: true };
  },
});

// Get registration by ID
export const getRegistration = query({
  args: { registrationId: v.string() },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("competitionRegistrations")
      .withIndex("by_registrationId", (q) => q.eq("registrationId", args.registrationId))
      .first();

    return registration;
  },
});

// Get registrations for an event
export const getEventRegistrations = query({
  args: { 
    eventId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("competitionRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));

    const registrations = await query.collect();

    if (args.status) {
      return registrations.filter(r => r.status === args.status);
    }

    return registrations;
  },
});

// Get registrations for a competition
export const getCompetitionRegistrations = query({
  args: { 
    competitionId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let registrations = await ctx.db
      .query("competitionRegistrations")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    if (args.status) {
      registrations = registrations.filter(r => r.status === args.status);
    }

    return registrations;
  },
});

// Cancel registration
export const cancelRegistration = mutation({
  args: { 
    registrationId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("competitionRegistrations")
      .withIndex("by_registrationId", (q) => q.eq("registrationId", args.registrationId))
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(registration._id, {
      status: "cancelled",
      cancelledAt: now,
      notes: args.reason,
    });

    // Update event counts
    const event = await ctx.db
      .query("competitionEvents")
      .filter((q) => q.eq(q.field("_id"), registration.eventId))
      .first();

    if (event) {
      if (registration.status === "waitlisted") {
        await ctx.db.patch(event._id, {
          waitlistCount: Math.max(0, (event.waitlistCount || 0) - 1),
        });
      } else {
        await ctx.db.patch(event._id, {
          registeredCount: Math.max(0, (event.registeredCount || 0) - 1),
        });

        // Promote from waitlist if applicable
        const waitlisted = await ctx.db
          .query("competitionRegistrations")
          .withIndex("by_event", (q) => q.eq("eventId", registration.eventId))
          .filter((q) => q.eq(q.field("status"), "waitlisted"))
          .order("asc")
          .first();

        if (waitlisted) {
          await ctx.db.patch(waitlisted._id, {
            status: "confirmed",
          });
          await ctx.db.patch(event._id, {
            registeredCount: (event.registeredCount || 0),
            waitlistCount: Math.max(0, (event.waitlistCount || 0) - 1),
          });
        }
      }
    }

    return { success: true, wasPaid: registration.paymentStatus === "paid" };
  },
});

// Check-in registration
export const checkInRegistration = mutation({
  args: { registrationId: v.string() },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("competitionRegistrations")
      .withIndex("by_registrationId", (q) => q.eq("registrationId", args.registrationId))
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status !== "confirmed") {
      throw new Error("Registration must be confirmed before check-in");
    }

    await ctx.db.patch(registration._id, {
      status: "checked_in",
    });

    return { success: true };
  },
});

// Create competition event (admin)
export const createCompetitionEvent = mutation({
  args: {
    competitionId: v.string(),
    tenantId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(),
    category: v.optional(v.string()),
    division: v.optional(v.string()),
    capacity: v.optional(v.number()),
    entryFee: v.optional(v.number()),
    currency: v.optional(v.string()),
    registrationOpen: v.optional(v.boolean()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const event = await ctx.db.insert("competitionEvents", {
      competitionId: args.competitionId,
      tenantId: args.tenantId,
      name: args.name,
      description: args.description,
      eventType: args.eventType,
      category: args.category,
      division: args.division,
      capacity: args.capacity,
      entryFee: args.entryFee,
      currency: args.currency || "usd",
      registrationOpen: args.registrationOpen ?? true,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "upcoming",
      registeredCount: 0,
      waitlistCount: 0,
      createdAt: now,
    });

    return event;
  },
});

// Update competition event
export const updateCompetitionEvent = mutation({
  args: {
    eventId: v.id("competitionEvents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    entryFee: v.optional(v.number()),
    registrationOpen: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    
    await ctx.db.patch(eventId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
