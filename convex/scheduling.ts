import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// ==========================================
// VENUE MANAGEMENT
// ==========================================

/**
 * Create a venue for a competition with courts and time slot configuration
 */
export const createVenue = mutation({
  args: {
    competitionId: v.string(),
    tenantId: v.string(),
    courts: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      location: v.optional(v.string()),
      type: v.optional(v.string()),
      active: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }))),
    timeSlots: v.optional(v.object({
      startTime: v.string(),
      endTime: v.string(),
      slotDuration: v.number(),
      breakDuration: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const existingVenue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    if (existingVenue) {
      throw new Error("Venue already exists for this competition. Use updateVenue instead.");
    }

    const venueId = await ctx.db.insert("competitionVenues", {
      competitionId: args.competitionId,
      tenantId: args.tenantId,
      courts: args.courts || [],
      timeSlots: args.timeSlots || {
        startTime: "09:00",
        endTime: "18:00",
        slotDuration: 60,
        breakDuration: 10,
      },
      schedule: {},
      createdAt: new Date().toISOString(),
    });

    return venueId;
  },
});

/**
 * Get venue configuration for a competition
 */
export const getVenue = query({
  args: { competitionId: v.string() },
  handler: async (ctx, args) => {
    const venue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    return venue;
  },
});

/**
 * Update venue configuration (courts and time slots)
 */
export const updateVenue = mutation({
  args: {
    venueId: v.id("competitionVenues"),
    courts: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      location: v.optional(v.string()),
      type: v.optional(v.string()),
      active: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }))),
    timeSlots: v.optional(v.object({
      startTime: v.string(),
      endTime: v.string(),
      slotDuration: v.number(),
      breakDuration: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (args.courts !== undefined) {
      updates.courts = args.courts;
    }
    if (args.timeSlots !== undefined) {
      updates.timeSlots = args.timeSlots;
    }

    await ctx.db.patch(args.venueId, updates);
    return { success: true };
  },
});

/**
 * Add a court to a venue
 */
export const addCourt = mutation({
  args: {
    venueId: v.id("competitionVenues"),
    court: v.object({
      name: v.string(),
      location: v.optional(v.string()),
      type: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const courts = venue.courts || [];
    const newCourt = {
      id: nanoid(),
      name: args.court.name,
      location: args.court.location,
      type: args.court.type || "standard",
      active: true,
      order: courts.length,
    };

    await ctx.db.patch(args.venueId, {
      courts: [...courts, newCourt],
      updatedAt: new Date().toISOString(),
    });

    return newCourt;
  },
});

/**
 * Update a court in a venue
 */
export const updateCourt = mutation({
  args: {
    venueId: v.id("competitionVenues"),
    courtId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      location: v.optional(v.string()),
      type: v.optional(v.string()),
      active: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const courts = venue.courts || [];
    type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
    const courtIndex = (courts as CourtType[]).findIndex((c: CourtType) => c.id === args.courtId);

    if (courtIndex === -1) {
      throw new Error("Court not found");
    }

    const updatedCourt = {
      ...courts[courtIndex],
      ...args.updates,
    };

    courts[courtIndex] = updatedCourt as (typeof courts)[0];

    await ctx.db.patch(args.venueId, {
      courts,
      updatedAt: new Date().toISOString(),
    });

    return updatedCourt;
  },
});

/**
 * Remove a court from a venue
 */
export const removeCourt = mutation({
  args: {
    venueId: v.id("competitionVenues"),
    courtId: v.string(),
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const courts = venue.courts || [];
    type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
    const filteredCourts = (courts as CourtType[]).filter((c: CourtType) => c.id !== args.courtId);

    // Check if any matches are assigned to this court
    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
      .collect();

    if (assignments.length > 0) {
      throw new Error(`Cannot remove court: ${assignments.length} matches are assigned to it`);
    }

    await ctx.db.patch(args.venueId, {
      courts: filteredCourts,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// ==========================================
// MATCH SCHEDULING
// ==========================================

/**
 * Assign a match to a court and time slot
 */
export const assignMatchToCourt = mutation({
  args: {
    matchId: v.string(),
    competitionId: v.string(),
    tenantId: v.string(),
    courtId: v.string(),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
    assignedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for existing assignment
    const existingAssignment = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (existingAssignment) {
      // Update existing assignment
      await ctx.db.patch(existingAssignment._id, {
        courtId: args.courtId,
        scheduledStartTime: args.scheduledStartTime,
        scheduledEndTime: args.scheduledEndTime,
        status: "scheduled",
        notes: args.notes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new assignment
      await ctx.db.insert("matchScheduleAssignments", {
        matchId: args.matchId,
        competitionId: args.competitionId,
        tenantId: args.tenantId,
        courtId: args.courtId,
        scheduledStartTime: args.scheduledStartTime,
        scheduledEndTime: args.scheduledEndTime,
        status: "scheduled",
        assignedBy: args.assignedBy,
        notes: args.notes,
        createdAt: new Date().toISOString(),
      });
    }

    // Also update the match record with schedule info
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (match) {
      // Get court name from venue
      const venue = await ctx.db
        .query("competitionVenues")
        .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
        .first();

      type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
      const court = (venue?.courts as CourtType[] | undefined)?.find((c: CourtType) => c.id === args.courtId);
      const courtName = court?.name || args.courtId;

      await ctx.db.patch(match._id, {
        scheduledStartTime: args.scheduledStartTime,
        scheduledEndTime: args.scheduledEndTime,
        courtId: args.courtId,
        courtName,
        scheduleStatus: "scheduled",
      });
    }

    return { success: true };
  },
});

/**
 * Unassign a match from a court
 */
export const unassignMatch = mutation({
  args: {
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (assignment) {
      await ctx.db.delete(assignment._id);
    }

    // Also clear the match record schedule info
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (match) {
      await ctx.db.patch(match._id, {
        scheduledStartTime: undefined,
        scheduledEndTime: undefined,
        courtId: undefined,
        courtName: undefined,
        scheduleStatus: undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Update match time (change scheduled time)
 */
export const updateMatchTime = mutation({
  args: {
    matchId: v.string(),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!assignment) {
      throw new Error("Match is not scheduled");
    }

    await ctx.db.patch(assignment._id, {
      scheduledStartTime: args.scheduledStartTime,
      scheduledEndTime: args.scheduledEndTime,
      updatedAt: new Date().toISOString(),
    });

    // Update the match record too
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (match) {
      await ctx.db.patch(match._id, {
        scheduledStartTime: args.scheduledStartTime,
        scheduledEndTime: args.scheduledEndTime,
      });
    }

    return { success: true };
  },
});

/**
 * Update match schedule status
 */
export const updateMatchScheduleStatus = mutation({
  args: {
    matchId: v.string(),
    status: v.string(), // "scheduled" | "in_progress" | "completed" | "delayed" | "cancelled"
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (assignment) {
      await ctx.db.patch(assignment._id, {
        status: args.status,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update the match record too
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (match) {
      await ctx.db.patch(match._id, {
        scheduleStatus: args.status,
      });
    }

    return { success: true };
  },
});

// ==========================================
// SCHEDULE QUERIES
// ==========================================

/**
 * Get full schedule for a competition
 */
export const getSchedule = query({
  args: {
    competitionId: v.string(),
    date: v.optional(v.string()), // Filter by date (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    let assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // Filter by date if provided
    if (args.date) {
      assignments = assignments.filter((a) =>
        a.scheduledStartTime.startsWith(args.date as string)
      );
    }

    // Sort by start time
    assignments.sort((a, b) =>
      a.scheduledStartTime.localeCompare(b.scheduledStartTime)
    );

    // Fetch match details for each assignment
    const scheduleWithMatches = await Promise.all(
      assignments.map(async (assignment) => {
        const match = await ctx.db
          .query("matches")
          .withIndex("by_matchId", (q) => q.eq("matchId", assignment.matchId))
          .first();

        type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
        const court = (venue?.courts as CourtType[] | undefined)?.find((c: CourtType) => c.id === assignment.courtId);

        return {
          ...assignment,
          match,
          court,
        };
      })
    );

    return {
      venue,
      assignments: scheduleWithMatches,
    };
  },
});

/**
 * Get schedule for a specific court
 */
export const getCourtSchedule = query({
  args: {
    competitionId: v.string(),
    courtId: v.string(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
      .collect();

    // Filter by competition
    assignments = assignments.filter((a) => a.competitionId === args.competitionId);

    // Filter by date if provided
    if (args.date) {
      assignments = assignments.filter((a) =>
        a.scheduledStartTime.startsWith(args.date as string)
      );
    }

    // Sort by start time
    assignments.sort((a, b) =>
      a.scheduledStartTime.localeCompare(b.scheduledStartTime)
    );

    // Fetch match details
    const scheduleWithMatches = await Promise.all(
      assignments.map(async (assignment) => {
        const match = await ctx.db
          .query("matches")
          .withIndex("by_matchId", (q) => q.eq("matchId", assignment.matchId))
          .first();

        return {
          ...assignment,
          match,
        };
      })
    );

    return scheduleWithMatches;
  },
});

/**
 * Get unscheduled matches for a competition
 */
export const getUnscheduledMatches = query({
  args: {
    competitionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all matches for the competition
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // Get all scheduled match IDs
    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    const scheduledMatchIds = new Set(assignments.map((a) => a.matchId));

    // Filter unscheduled matches
    const unscheduledMatches = matches.filter((m) => !scheduledMatchIds.has(m.matchId));

    return unscheduledMatches;
  },
});

// ==========================================
// CONFLICT DETECTION
// ==========================================

interface Conflict {
  type: "court_overlap" | "player_double_booked" | "rest_period_violation";
  matchId: string;
  conflictingMatchId: string;
  courtId?: string;
  profileId?: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Detect scheduling conflicts for a proposed match assignment
 */
export const detectConflicts = query({
  args: {
    competitionId: v.string(),
    matchId: v.string(),
    courtId: v.string(),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
    restPeriodMinutes: v.optional(v.number()), // Minimum rest between matches (default 30)
  },
  handler: async (ctx, args): Promise<Conflict[]> => {
    const conflicts: Conflict[] = [];
    const restPeriod = args.restPeriodMinutes ?? 30;

    // 1. Check for court overlap
    const courtAssignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
      .collect();

    const competitionCourtAssignments = courtAssignments.filter(
      (a) => a.competitionId === args.competitionId && a.matchId !== args.matchId
    );

    const newStart = new Date(args.scheduledStartTime).getTime();
    const newEnd = new Date(args.scheduledEndTime).getTime();

    for (const assignment of competitionCourtAssignments) {
      const existingStart = new Date(assignment.scheduledStartTime).getTime();
      const existingEnd = new Date(assignment.scheduledEndTime).getTime();

      // Check for time overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        conflicts.push({
          type: "court_overlap",
          matchId: args.matchId,
          conflictingMatchId: assignment.matchId,
          courtId: args.courtId,
          message: `Court is already occupied by another match at this time`,
          severity: "error",
        });
      }
    }

    // 2. Get participants for the match being scheduled
    const matchParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .collect();

    const participantIds = matchParticipants.map((p) => p.profileId);

    // 3. Check for player double-booking
    for (const profileId of participantIds) {
      // Get all matches this player is in
      const playerMatches = await ctx.db
        .query("matchParticipants")
        .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
        .collect();

      for (const playerMatch of playerMatches) {
        if (playerMatch.matchId === args.matchId) continue;

        // Check if this match is scheduled
        const assignment = await ctx.db
          .query("matchScheduleAssignments")
          .withIndex("by_match", (q) => q.eq("matchId", playerMatch.matchId))
          .first();

        if (assignment) {
          const existingStart = new Date(assignment.scheduledStartTime).getTime();
          const existingEnd = new Date(assignment.scheduledEndTime).getTime();

          // Check for time overlap
          if (newStart < existingEnd && newEnd > existingStart) {
            conflicts.push({
              type: "player_double_booked",
              matchId: args.matchId,
              conflictingMatchId: assignment.matchId,
              profileId: profileId,
              message: `Player is already scheduled for another match at this time`,
              severity: "error",
            });
          }

          // Check rest period
          const timeDiff = Math.abs(newStart - existingEnd);
          const restMinutes = timeDiff / (1000 * 60);

          if (restMinutes < restPeriod && restMinutes > 0) {
            conflicts.push({
              type: "rest_period_violation",
              matchId: args.matchId,
              conflictingMatchId: assignment.matchId,
              profileId: profileId,
              message: `Player has only ${Math.round(restMinutes)} minutes rest between matches (minimum: ${restPeriod})`,
              severity: "warning",
            });
          }
        }
      }
    }

    return conflicts;
  },
});

/**
 * Get all conflicts in a competition schedule
 */
export const getAllConflicts = query({
  args: {
    competitionId: v.string(),
    restPeriodMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Conflict[]> => {
    const allConflicts: Conflict[] = [];
    const restPeriod = args.restPeriodMinutes ?? 30;

    // Get all assignments for the competition
    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // Get venue for court info
    const venue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    if (!venue?.courts) {
      return [];
    }

    // Group by court
    const courtGroups = new Map<string, typeof assignments>();
    for (const assignment of assignments) {
      const courtAssignments = courtGroups.get(assignment.courtId) || [];
      courtAssignments.push(assignment);
      courtGroups.set(assignment.courtId, courtAssignments);
    }

    // Check court overlaps
    for (const [_courtId, courtAssignments] of courtGroups) {
      for (let i = 0; i < courtAssignments.length; i++) {
        for (let j = i + 1; j < courtAssignments.length; j++) {
          const a1 = courtAssignments[i];
          const a2 = courtAssignments[j];

          const start1 = new Date(a1.scheduledStartTime).getTime();
          const end1 = new Date(a1.scheduledEndTime).getTime();
          const start2 = new Date(a2.scheduledStartTime).getTime();
          const end2 = new Date(a2.scheduledEndTime).getTime();

          if (start1 < end2 && end1 > start2) {
            allConflicts.push({
              type: "court_overlap",
              matchId: a1.matchId,
              conflictingMatchId: a2.matchId,
              courtId: a1.courtId,
              message: `Court has overlapping matches`,
              severity: "error",
            });
          }
        }
      }
    }

    // Check player conflicts
    const processedPairs = new Set<string>();

    for (const assignment of assignments) {
      const participants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_matchId", (q) => q.eq("matchId", assignment.matchId))
        .collect();

      for (const participant of participants) {
        const otherMatches = await ctx.db
          .query("matchParticipants")
          .withIndex("by_profileId", (q) => q.eq("profileId", participant.profileId))
          .collect();

        for (const other of otherMatches) {
          if (other.matchId === assignment.matchId) continue;

          const pairKey = [assignment.matchId, other.matchId].sort().join("-");
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);

          const otherAssignment = await ctx.db
            .query("matchScheduleAssignments")
            .withIndex("by_match", (q) => q.eq("matchId", other.matchId))
            .first();

          if (!otherAssignment) continue;

          const start1 = new Date(assignment.scheduledStartTime).getTime();
          const end1 = new Date(assignment.scheduledEndTime).getTime();
          const start2 = new Date(otherAssignment.scheduledStartTime).getTime();
          const end2 = new Date(otherAssignment.scheduledEndTime).getTime();

          // Check overlap
          if (start1 < end2 && end1 > start2) {
            allConflicts.push({
              type: "player_double_booked",
              matchId: assignment.matchId,
              conflictingMatchId: other.matchId,
              profileId: participant.profileId,
              message: `Player is double-booked`,
              severity: "error",
            });
          }

          // Check rest period
          const timeDiff = Math.abs(start1 - end2);
          const restMinutes = timeDiff / (1000 * 60);

          if (restMinutes < restPeriod && restMinutes > 0) {
            allConflicts.push({
              type: "rest_period_violation",
              matchId: assignment.matchId,
              conflictingMatchId: other.matchId,
              profileId: participant.profileId,
              message: `Insufficient rest period (${Math.round(restMinutes)} min)`,
              severity: "warning",
            });
          }
        }
      }
    }

    return allConflicts;
  },
});

// ==========================================
// BULK OPERATIONS
// ==========================================

/**
 * Auto-assign all unscheduled matches to available slots
 */
export const autoAssignMatches = mutation({
  args: {
    competitionId: v.string(),
    tenantId: v.string(),
    matchDuration: v.optional(v.number()), // Default match duration in minutes
    assignedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const matchDuration = args.matchDuration ?? 60;

    // Get venue
    const venue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    if (!venue || !venue.courts || venue.courts.length === 0) {
      throw new Error("No courts configured for this competition");
    }

    if (!venue.timeSlots) {
      throw new Error("No time slots configured for this competition");
    }

    // Get unscheduled matches
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    const scheduledMatchIds = new Set(assignments.map((a) => a.matchId));
    const unscheduledMatches = matches.filter((m) => !scheduledMatchIds.has(m.matchId));

    if (unscheduledMatches.length === 0) {
      return { assigned: 0, message: "No unscheduled matches to assign" };
    }

    // Get existing assignments for conflict checking
    const existingAssignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    // Build availability grid
    const courtAvailability = new Map<string, Array<{ start: Date; end: Date }>>();

    for (const court of venue.courts) {
      if (!court.active) continue;
      courtAvailability.set(court.id, []);
    }

    // Fill in existing assignments
    for (const assignment of existingAssignments) {
      const slots = courtAvailability.get(assignment.courtId);
      if (slots) {
        slots.push({
          start: new Date(assignment.scheduledStartTime),
          end: new Date(assignment.scheduledEndTime),
        });
      }
    }

    // Parse time slot configuration
    const { startTime, endTime, slotDuration, breakDuration } = venue.timeSlots;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const slotTotal = slotDuration + (breakDuration ?? 0);

    // Get competition dates
    const competition = await ctx.db
      .query("competitions")
      .filter((q) => q.eq(q.field("_id"), args.competitionId))
      .first();

    const startDate = competition?.startDate ? new Date(competition.startDate) : new Date();
    const endDate = competition?.endDate ? new Date(competition.endDate) : new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // Include end date

    let assigned = 0;

    // Assign each unscheduled match
    for (const match of unscheduledMatches) {
      let assigned_ = false;

      // Iterate through each day
      const currentDate = new Date(startDate);
      while (currentDate <= endDate && !assigned_) {
        // Iterate through each time slot
        for (
          let minutes = startHour * 60 + startMin;
          minutes + slotDuration <= endHour * 60 + endMin && !assigned_;
          minutes += slotTotal
        ) {
          const hour = Math.floor(minutes / 60);
          const min = minutes % 60;

          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, min, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + matchDuration);

          // Find available court
          for (const [courtId, bookedSlots] of courtAvailability) {
            const hasConflict = bookedSlots.some(
              (slot) => slotStart < slot.end && slotEnd > slot.start
            );

            if (!hasConflict) {
              // Assign match to this court and slot
              await ctx.db.insert("matchScheduleAssignments", {
                matchId: match.matchId,
                competitionId: args.competitionId,
                tenantId: args.tenantId,
                courtId,
                scheduledStartTime: slotStart.toISOString(),
                scheduledEndTime: slotEnd.toISOString(),
                status: "scheduled",
                assignedBy: args.assignedBy,
                createdAt: new Date().toISOString(),
              });

              // Update match
              type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
              const court = (venue.courts as CourtType[] | undefined)?.find((c: CourtType) => c.id === courtId);
              await ctx.db.patch(match._id, {
                scheduledStartTime: slotStart.toISOString(),
                scheduledEndTime: slotEnd.toISOString(),
                courtId,
                courtName: court?.name,
                scheduleStatus: "scheduled",
              });

              // Add to booked slots
              bookedSlots.push({ start: slotStart, end: slotEnd });

              assigned_ = true;
              assigned++;
              break;
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return {
      assigned,
      total: unscheduledMatches.length,
      message: `Assigned ${assigned} of ${unscheduledMatches.length} matches`,
    };
  },
});

/**
 * Clear all schedule assignments for a competition
 */
export const clearSchedule = mutation({
  args: {
    competitionId: v.string(),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    // Clear schedule fields from matches
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    for (const match of matches) {
      await ctx.db.patch(match._id, {
        scheduledStartTime: undefined,
        scheduledEndTime: undefined,
        courtId: undefined,
        courtName: undefined,
        scheduleStatus: undefined,
      });
    }

    return { cleared: assignments.length };
  },
});

// ==========================================
// TIME SLOT HELPERS
// ==========================================

/**
 * Generate time slots for a date
 */
export const generateTimeSlots = query({
  args: {
    competitionId: v.string(),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db
      .query("competitionVenues")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .first();

    if (!venue?.timeSlots || !venue?.courts) {
      return [];
    }

    const { startTime, endTime, slotDuration, breakDuration } = venue.timeSlots;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const slotTotal = slotDuration + (breakDuration ?? 0);

    const slots: Array<{
      time: string;
      iso: string;
      courts: Array<{ id: string; name: string; available: boolean; matchId?: string }>;
    }> = [];

    // Get existing assignments for this date
    const assignments = await ctx.db
      .query("matchScheduleAssignments")
      .withIndex("by_competition", (q) => q.eq("competitionId", args.competitionId))
      .collect();

    const dateAssignments = assignments.filter((a) =>
      a.scheduledStartTime.startsWith(args.date)
    );

    for (
      let minutes = startHour * 60 + startMin;
      minutes + slotDuration <= endHour * 60 + endMin;
      minutes += slotTotal
    ) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const iso = `${args.date}T${timeStr}:00`;

      type CourtType = { id: string; name: string; location?: string; type?: string; active?: boolean; order?: number };
      const courtStatus = (venue.courts as CourtType[]).map((court: CourtType) => {
        const assignment = dateAssignments.find((a) => {
          if (a.courtId !== court.id) return false;
          const slotStart = new Date(iso).getTime();
          const slotEnd = slotStart + slotDuration * 60 * 1000;
          const matchStart = new Date(a.scheduledStartTime).getTime();
          const matchEnd = new Date(a.scheduledEndTime).getTime();
          return slotStart < matchEnd && slotEnd > matchStart;
        });

        return {
          id: court.id,
          name: court.name,
          available: !assignment,
          matchId: assignment?.matchId,
        };
      });

      slots.push({
        time: timeStr,
        iso,
        courts: courtStatus,
      });
    }

    return slots;
  },
});
