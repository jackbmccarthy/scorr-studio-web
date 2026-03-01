import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==========================================
  // TENANCY & AUTH
  // ==========================================

  // Tenants (Organizations)
  tenants: defineTable({
    tenantId: v.string(), // WorkOS organization ID
    name: v.string(),
    slug: v.optional(v.string()),
    createdAt: v.string(),
    subscription: v.optional(v.object({
      tier: v.string(), // 'free', 'pro', 'enterprise'
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      status: v.optional(v.string()),
      currentPeriodEnd: v.optional(v.string()),
    })),
    usage: v.optional(v.object({
      matches: v.optional(v.number()),
      competitions: v.optional(v.number()),
      leagues: v.optional(v.number()),
      displays: v.optional(v.number()),
    })),
    settings: v.optional(v.object({
      enabledSports: v.optional(v.any()),
      currentSportId: v.optional(v.string()),
      socialAutomation: v.optional(v.object({
        autoPostOnFinish: v.optional(v.boolean()),
        platforms: v.optional(v.array(v.string())),
        customHashtags: v.optional(v.string()),
      })),
      customFields: v.optional(v.any()), // Up to 10 custom fields
    })),
    // Tenant Branding
    branding: v.optional(v.object({
      logoUrl: v.optional(v.string()),
      logoDarkUrl: v.optional(v.string()), // Dark mode logo
      primaryColor: v.optional(v.string()), // Hex color
      secondaryColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      fontFamily: v.optional(v.string()), // "inter" | "roboto" | "space_grotesk" | etc.
      customCss: v.optional(v.string()), // Advanced custom CSS
      // Display settings
      showLogoOnScoreboard: v.optional(v.boolean()),
      showSponsorLogo: v.optional(v.boolean()),
      sponsorLogoUrl: v.optional(v.string()),
      // Social links
      website: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      // Preset theme (if using preset)
      presetTheme: v.optional(v.string()),
    })),
    // Stripe Connect
    stripeAccountId: v.optional(v.string()),
    stripeOnboardingComplete: v.optional(v.boolean()),
    stripeChargesEnabled: v.optional(v.boolean()),
    platformFeePercent: v.optional(v.number()), // default 5
    lastRenamedAt: v.optional(v.string()),
    lastActiveAt: v.optional(v.string()),
  })
    .index("by_tenantId", ["tenantId"])
    .index("by_slug", ["slug"])
    .index("by_lastActive", ["lastActiveAt"]),

  // Members (Tenant membership)
  members: defineTable({
    tenantId: v.string(),
    userId: v.string(), // WorkOS user ID
    email: v.string(),
    name: v.optional(v.string()),
    role: v.string(), // 'owner' | 'admin' | 'designer' | 'scorer' | 'viewer'
    joinedAt: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["userId"])
    .index("by_tenant_user", ["tenantId", "userId"]),

  // Invitations
  invitations: defineTable({
    tenantId: v.string(),
    token: v.string(),
    email: v.string(),
    role: v.string(),
    invitedBy: v.string(),
    createdAt: v.string(),
    expiresAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_token", ["token"])
    .index("by_tenant_email", ["tenantId", "email"]),

  // ==========================================
  // USER PROFILES
  // ==========================================

  profiles: defineTable({
    userId: v.string(), // WorkOS user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    hometown: v.optional(v.string()),
    // Social handles
    twitterHandle: v.optional(v.string()),
    instagramHandle: v.optional(v.string()),
    linkedinHandle: v.optional(v.string()),
    taggingEnabled: v.optional(v.boolean()),
    // Athlete attributes (per sport)
    athleteAttributes: v.optional(v.any()),
    // Ratings (per sport)
    playerRatings: v.optional(v.any()),
    // Custom field values (per tenant)
    customFieldValues: v.optional(v.any()),
    verified: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // ==========================================
  // SPORTS & MATCHES
  // ==========================================

  // Matches
  matches: defineTable({
    matchId: v.string(), // External UUID
    tenantId: v.string(),
    sportId: v.string(),
    status: v.string(), // 'scheduled' | 'live' | 'finished' | 'cancelled'
    createdAt: v.string(),
    name: v.optional(v.string()),
    // Team data
    team1: v.optional(v.object({
      id: v.optional(v.string()),
      name: v.string(),
      logoUrl: v.optional(v.string()),
      score: v.optional(v.number()),
    })),
    team2: v.optional(v.object({
      id: v.optional(v.string()),
      name: v.string(),
      logoUrl: v.optional(v.string()),
      score: v.optional(v.number()),
    })),
    // Match state (sport-specific)
    state: v.any(),
    // Competition linkage
    type: v.optional(v.string()), // 'standalone' | 'competition' | 'league'
    competitionId: v.optional(v.string()),
    eventId: v.optional(v.string()),
    leagueId: v.optional(v.string()),
    seasonId: v.optional(v.string()),
    divisionId: v.optional(v.string()),
    fixtureId: v.optional(v.string()),
    eventName: v.optional(v.string()),
    // Bracket progression
    matchRound: v.optional(v.string()),
    roundIndex: v.optional(v.number()),
    matchIndex: v.optional(v.number()),
    nextMatchId: v.optional(v.string()),
    nextMatchSlot: v.optional(v.union(v.literal("team1Id"), v.literal("team2Id"))),
    loserNextMatchId: v.optional(v.string()),
    loserNextMatchSlot: v.optional(v.union(v.literal("team1Id"), v.literal("team2Id"))),
    isLosersBracket: v.optional(v.boolean()),
    isPlayoff: v.optional(v.boolean()),
    // Match result
    winner: v.optional(v.string()),
    defaultInfo: v.optional(v.object({
      type: v.string(), // 'forfeit' | 'walkover' | 'double_default' | 'retirement'
      defaultedSide: v.string(), // 'team1' | 'team2' | 'both'
      reason: v.optional(v.string()),
      recordedBy: v.string(),
      recordedAt: v.string(),
    })),
    // AI-generated summary
    aiSummary: v.optional(v.string()),
    // Umpire assignment
    umpireId: v.optional(v.string()),
    umpireToken: v.optional(v.string()),
    note: v.optional(v.string()),
    // Schedule fields
    scheduledStartTime: v.optional(v.string()), // ISO datetime
    scheduledEndTime: v.optional(v.string()), // ISO datetime
    courtId: v.optional(v.string()), // Assigned court/table
    courtName: v.optional(v.string()), // Denormalized for display
    scheduleStatus: v.optional(v.string()), // "scheduled" | "in_progress" | "completed" | "delayed"
    // Actual times
    actualStartTime: v.optional(v.string()), // When match actually went live
    actualEndTime: v.optional(v.string()), // When match actually ended
  })
    .index("by_matchId", ["matchId"])
    .index("by_tenant_sport", ["tenantId", "sportId"])
    .index("by_competition", ["competitionId"])
    .index("by_league", ["leagueId"])
    .index("by_status", ["status"])
    .index("by_schedule_time", ["scheduledStartTime"]),

  // Match participants (linking profiles to matches)
  matchParticipants: defineTable({
    matchId: v.string(),
    profileId: v.id("profiles"),
    role: v.string(), // 'player1', 'player2', 'team1_player', 'team2_player', etc.
    team: v.optional(v.string()), // 'team1' | 'team2'
    position: v.optional(v.number()), // Position within team
    joinedAt: v.string(),
  })
    .index("by_matchId", ["matchId"])
    .index("by_profileId", ["profileId"]),

  // Match Results
  matchResults: defineTable({
    resultId: v.string(),
    tenantId: v.string(),
    matchId: v.string(),
    competitionId: v.string(),
    // Team info snapshot
    team1: v.object({
      teamId: v.string(),
      teamName: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    team2: v.object({
      teamId: v.string(),
      teamName: v.string(),
      logoUrl: v.optional(v.string()),
    }),
    // Scores
    scores: v.array(v.object({
      setNumber: v.number(),
      team1Score: v.number(),
      team2Score: v.number(),
      winner: v.optional(v.string()), // "team1" | "team2" | "tie"
    })),
    winner: v.object({
      teamId: v.string(),
      teamName: v.string(),
    }),
    loser: v.optional(v.object({
      teamId: v.string(),
      teamName: v.string(),
    })),
    // Match info
    duration: v.optional(v.number()), // minutes
    completedAt: v.string(),
    notes: v.optional(v.string()),
    // Verification
    verified: v.optional(v.boolean()),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),
    // Stats
    mvpId: v.optional(v.string()), // Most valuable player
    highlights: v.optional(v.array(v.string())),
  })
    .index("by_match", ["matchId"])
    .index("by_competition", ["competitionId"]),

  // Analytics Aggregation
  competitionStats: defineTable({
    competitionId: v.string(),
    tenantId: v.string(),
    // Team stats
    teamStats: v.array(v.object({
      teamId: v.string(),
      teamName: v.string(),
      wins: v.number(),
      losses: v.number(),
      draws: v.number(),
      pointsFor: v.number(),
      pointsAgainst: v.number(),
      winStreak: v.number(),
      currentStreak: v.number(),
    })),
    // Player stats (for individual sports)
    playerStats: v.optional(v.array(v.object({
      playerId: v.string(),
      playerName: v.string(),
      wins: v.number(),
      losses: v.number(),
      rating: v.optional(v.number()),
    }))),
    lastUpdated: v.string(),
  })
    .index("by_competition", ["competitionId"]),

  // ==========================================
  // COMPETITIONS & TOURNAMENTS
  // ==========================================

  // Competitions
  competitions: defineTable({
    competitionId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // 'draft' | 'active' | 'completed'
    createdAt: v.string(),
    // Events/brackets within competition
    events: v.optional(v.any()),
    // Registered teams
    teams: v.optional(v.any()),
    // Branding
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    slug: v.optional(v.string()),
    // Dates
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    // Venue
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    // Stripe Connect for payments
    stripeAccountId: v.optional(v.string()), // organizer's Stripe account
    // Registration settings
    registrationOpen: v.optional(v.boolean()),
    registrationStartDate: v.optional(v.string()),
    registrationEndDate: v.optional(v.string()),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"])
    .index("by_slug", ["slug"]),

  // Competition Branding (public pages)
  competitionBranding: defineTable({
    competitionId: v.string(),
    slug: v.string(), // unique URL slug
    logo: v.optional(v.string()),
    banner: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    sponsorLogos: v.optional(v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
      url: v.optional(v.string()),
    }))),
    customCss: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_competition", ["competitionId"])
    .index("by_slug", ["slug"]),

  // Competition Events (individual events within a competition)
  competitionEvents: defineTable({
    competitionId: v.string(),
    tenantId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(), // 'singles' | 'doubles' | 'team'
    category: v.optional(v.string()), // e.g., 'Men', 'Women', 'Mixed', 'Junior'
    division: v.optional(v.string()), // e.g., 'Open', 'A', 'B', 'C'
    capacity: v.optional(v.number()),
    registeredCount: v.optional(v.number()),
    waitlistCount: v.optional(v.number()),
    entryFee: v.optional(v.number()), // in cents
    currency: v.optional(v.string()), // default "usd"
    registrationOpen: v.optional(v.boolean()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.string()), // 'upcoming' | 'live' | 'completed' | 'cancelled'
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_competition", ["competitionId"])
    .index("by_tenant", ["tenantId"]),

  // Competition Registrations
  competitionRegistrations: defineTable({
    registrationId: v.string(),
    competitionId: v.string(),
    eventId: v.string(),
    tenantId: v.string(),
    participantId: v.optional(v.string()), // profile ID or null for anonymous
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    club: v.optional(v.string()),
    rating: v.optional(v.number()),
    division: v.optional(v.string()),
    // For doubles events
    partner: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      club: v.optional(v.string()),
      rating: v.optional(v.number()),
    })),
    status: v.string(), // 'pending' | 'confirmed' | 'waitlisted' | 'checked_in' | 'cancelled'
    paymentStatus: v.optional(v.string()), // 'unpaid' | 'paid' | 'refunded' | 'partial'
    paymentId: v.optional(v.string()), // Stripe PaymentIntent ID
    checkoutSessionId: v.optional(v.string()), // Stripe Checkout Session ID
    amountPaid: v.optional(v.number()), // in cents
    registeredAt: v.string(),
    confirmedAt: v.optional(v.string()),
    cancelledAt: v.optional(v.string()),
    qrCode: v.optional(v.string()), // QR code for check-in
    waiverAccepted: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index("by_registrationId", ["registrationId"])
    .index("by_competition", ["competitionId"])
    .index("by_event", ["eventId"])
    .index("by_participant", ["participantId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_competition_event", ["competitionId", "eventId"])
    .index("by_tenant", ["tenantId"]),

  // Payment Transactions
  paymentTransactions: defineTable({
    transactionId: v.string(),
    tenantId: v.string(),
    competitionId: v.string(),
    eventId: v.optional(v.string()),
    registrationId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    amount: v.number(), // in cents
    currency: v.string(), // default "usd"
    platformFee: v.number(), // platform fee in cents
    organizerAmount: v.number(), // amount to organizer in cents
    status: v.string(), // 'pending' | 'succeeded' | 'failed' | 'refunded'
    payerEmail: v.optional(v.string()),
    payerName: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    refundedAt: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
    payoutStatus: v.optional(v.string()), // 'pending' | 'paid'
    payoutId: v.optional(v.string()), // Stripe Payout ID
  })
    .index("by_transactionId", ["transactionId"])
    .index("by_tenant", ["tenantId"])
    .index("by_competition", ["competitionId"])
    .index("by_registration", ["registrationId"])
    .index("by_status", ["status"])
    .index("by_stripe_payment", ["stripePaymentIntentId"])
    .index("by_created", ["createdAt"]),

  // Registration Lists
  registrations: defineTable({
    listId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    competitionId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    publicUrl: v.optional(v.string()),
    entries: v.optional(v.any()),
    capacity: v.optional(v.number()),
    registrationOpen: v.optional(v.boolean()),
    registrationStartDate: v.optional(v.string()),
    registrationEndDate: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"])
    .index("by_publicUrl", ["publicUrl"])
    .index("by_competition", ["competitionId"]),

  // ==========================================
  // LEAGUES
  // ==========================================

  // Leagues
  leagues: defineTable({
    leagueId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // 'individual' | 'team_simple' | 'team_multi_match'
    status: v.optional(v.string()), // 'draft' | 'active' | 'completed' | 'archived'
    defaultMatchSettings: v.optional(v.any()),
    seasons: v.optional(v.any()),
    currentSeasonId: v.optional(v.string()),
    registrationEnabled: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    publicPageContent: v.optional(v.string()),
    // Branding
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    slug: v.optional(v.string()),
    // Rules
    rulesContent: v.optional(v.string()),
    rulesDocumentUrl: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"])
    .index("by_slug", ["slug"]),

  // ==========================================
  // TEAMS & ROSTERS
  // ==========================================

  // Teams (Enhanced for Roster Management)
  teams: defineTable({
    teamId: v.optional(v.string()),
    tenantId: v.string(),
    competitionId: v.optional(v.string()),
    sportId: v.optional(v.string()),
    name: v.string(),
    shortName: v.optional(v.string()), // "LAL" for Lakers
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()), // Primary team color
    players: v.optional(v.array(v.object({
      playerId: v.string(),
      name: v.string(),
      number: v.optional(v.string()),
      position: v.optional(v.string()),
      isCaptain: v.optional(v.boolean()),
    }))),
    stats: v.optional(v.object({
      wins: v.number(),
      losses: v.number(),
      draws: v.number(),
      pointsFor: v.number(),
      pointsAgainst: v.number(),
    })),
    seed: v.optional(v.number()), // Tournament seed
    checkedIn: v.optional(v.boolean()),
    captainId: v.optional(v.string()),
    deletedAt: v.optional(v.string()), // Soft delete
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"])
    .index("by_tenant", ["tenantId"])
    .index("by_competition", ["competitionId"]),

  // Players (Individual athletes)
  players: defineTable({
    playerId: v.optional(v.string()),
    tenantId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    // Stats across competitions
    totalMatches: v.optional(v.number()),
    wins: v.optional(v.number()),
    losses: v.optional(v.number()),
    // Ratings
    rating: v.optional(v.number()), // DUPR, ELO, etc.
    ratingSystem: v.optional(v.string()), // "dupr" | "elo" | "utr"
    // Metadata
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    deletedAt: v.optional(v.string()), // Soft delete
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_email", ["email"])
    .index("by_tenant_name", ["tenantId", "name"]),

  // Player-Team Junction (for individual sports where players move between teams)
  playerTeams: defineTable({
    playerId: v.string(),
    teamId: v.string(),
    competitionId: v.optional(v.string()),
    joinedAt: v.string(),
    role: v.optional(v.string()), // "player" | "captain" | "substitute"
    isActive: v.optional(v.boolean()),
  })
    .index("by_player", ["playerId"])
    .index("by_team", ["teamId"])
    .index("by_competition", ["competitionId"])
    .index("by_player_team", ["playerId", "teamId"]),

  // Team Tokens
  teamTokens: defineTable({
    token: v.string(),
    tenantId: v.string(),
    sportId: v.string(),
    teamId: v.string(),
    type: v.string(), // 'manager' | 'public'
    createdAt: v.string(),
    expiresAt: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_team", ["teamId"]),

  // ==========================================
  // BROADCAST & DISPLAYS
  // ==========================================

  // Stages (Broadcast configuration)
  stages: defineTable({
    stageId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    currentMatchId: v.optional(v.string()),
    queue: v.optional(v.array(v.string())),
    activeCompetitionId: v.optional(v.string()),
    scoringUrlId: v.optional(v.string()),
    displays: v.optional(v.any()),
    // Scene management
    currentScene: v.optional(v.string()), // 'idle' | 'versus' | 'scoreboard' | 'winner' | 'break'
    createdAt: v.string(),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"]),

  // Score Displays
  scoreDisplays: defineTable({
    displayId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    type: v.optional(v.string()), // 'standard' | 'konva' | 'composite' | 'bracket'
    width: v.number(),
    height: v.number(),
    theme: v.optional(v.any()),
    overlays: v.optional(v.any()),
    compositeLayout: v.optional(v.any()),
    assignedStageId: v.optional(v.string()),
    // Konva scene data
    sceneData: v.optional(v.any()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"]),

  // Public Links
  publicLinks: defineTable({
    urlId: v.string(),
    type: v.string(), // 'scoring' | 'display' | 'umpire'
    tenantId: v.string(),
    sportId: v.string(),
    stageId: v.optional(v.string()),
    displayId: v.optional(v.string()),
    matchId: v.optional(v.string()),
    umpireId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_urlId", ["urlId"])
    .index("by_match", ["matchId"]),

  // Broadcast Configs
  broadcasts: defineTable({
    configId: v.optional(v.string()),
    tenantId: v.string(),
    sportId: v.string(),
    name: v.string(),
    rtmpUrl: v.string(),
    rtmpKey: v.optional(v.string()),
    scoreDisplayId: v.optional(v.string()),
    matchId: v.optional(v.string()),
    overlayPosition: v.string(),
    overlayScale: v.number(),
    overlayOffsetX: v.number(),
    overlayOffsetY: v.number(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant_sport", ["tenantId", "sportId"]),

  // ==========================================
  // SCHEDULING & VENUES
  // ==========================================

  // Competition Venues (courts/tables configuration)
  competitionVenues: defineTable({
    competitionId: v.string(),
    tenantId: v.string(),
    courts: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(), // "Court 1", "Table A"
      location: v.optional(v.string()),
      type: v.optional(v.string()), // "standard" | "featured" | "streaming"
      active: v.optional(v.boolean()),
      order: v.optional(v.number()),
    }))),
    timeSlots: v.optional(v.object({
      startTime: v.string(), // "09:00"
      endTime: v.string(), // "18:00"
      slotDuration: v.number(), // minutes
      breakDuration: v.optional(v.number()), // minutes between matches
    })),
    schedule: v.optional(v.any()), // Record<matchId, assignment>
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_competition", ["competitionId"])
    .index("by_tenant", ["tenantId"]),

  // Match Schedule Assignments
  matchScheduleAssignments: defineTable({
    matchId: v.string(),
    competitionId: v.string(),
    tenantId: v.string(),
    courtId: v.string(),
    scheduledStartTime: v.string(), // ISO datetime
    scheduledEndTime: v.string(), // ISO datetime
    status: v.string(), // "scheduled" | "in_progress" | "completed" | "delayed" | "cancelled"
    assignedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_match", ["matchId"])
    .index("by_competition", ["competitionId"])
    .index("by_court", ["courtId"])
    .index("by_status", ["status"])
    .index("by_tenant", ["tenantId"])
    .index("by_time", ["scheduledStartTime"]),

  // ==========================================
  // TEMPLATES
  // ==========================================

  templates: defineTable({
    templateId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // 'scoreboard' | 'bracket' | 'overlay'
    sportId: v.optional(v.string()),
    author: v.string(),
    authorId: v.optional(v.string()),
    content: v.any(),
    thumbnail: v.optional(v.string()),
    downloads: v.optional(v.number()),
    rating: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    status: v.optional(v.string()), // 'draft' | 'submitted' | 'published' | 'archived'
    tags: v.optional(v.array(v.string())),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_templateId", ["templateId"])
    .index("by_type", ["type"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  // ==========================================
  // UMPIRES & OFFICIALS
  // ==========================================

  umpires: defineTable({
    tenantId: v.string(),
    userId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    certifications: v.optional(v.array(v.string())),
    isAvailable: v.boolean(),
    rating: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_email", ["email"])
    .index("by_user", ["userId"]),

  // ==========================================
  // SOCIAL MEDIA
  // ==========================================

  socialConnections: defineTable({
    tenantId: v.string(),
    platform: v.string(), // 'twitter', 'instagram', 'threads', 'linkedin', 'tiktok'
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    profileId: v.optional(v.string()),
    profileName: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant_platform", ["tenantId", "platform"]),

  socialPostHistory: defineTable({
    tenantId: v.string(),
    matchId: v.optional(v.string()),
    platform: v.string(),
    postId: v.string(),
    postUrl: v.optional(v.string()),
    caption: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.string(),
    analytics: v.optional(v.object({
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      impressions: v.number(),
      lastUpdatedAt: v.string(),
    })),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_match", ["matchId"])
    .index("by_postId", ["postId"]),

  scheduledSocialPosts: defineTable({
    tenantId: v.string(),
    sportId: v.string(),
    matchId: v.optional(v.string()),
    platform: v.string(),
    caption: v.string(),
    imageUrl: v.optional(v.string()),
    scheduledFor: v.string(),
    status: v.string(), // 'pending' | 'posted' | 'failed'
    createdAt: v.string(),
    error: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status", "scheduledFor"]),

  // ==========================================
  // DEVELOPER FEATURES
  // ==========================================

  apiKeys: defineTable({
    keyId: v.string(),
    tenantId: v.string(),
    hashedSecret: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    createdAt: v.string(),
    lastUsedAt: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    revokedAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_keyId", ["keyId"]),

  webhooks: defineTable({
    webhookId: v.string(),
    tenantId: v.string(),
    url: v.string(),
    events: v.array(v.string()),
    secret: v.string(),
    isActive: v.boolean(),
    createdAt: v.string(),
    failureCount: v.optional(v.number()),
    lastTriggeredAt: v.optional(v.string()),
    lastFailureAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_active", ["tenantId", "isActive"]),

  webhookDeliveries: defineTable({
    webhookId: v.string(),
    tenantId: v.string(),
    event: v.string(),
    payload: v.any(),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    deliveredAt: v.string(),
    success: v.boolean(),
  })
    .index("by_webhook", ["webhookId"])
    .index("by_tenant", ["tenantId"]),

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  expoPushTokens: defineTable({
    userId: v.string(),
    token: v.string(),
    platform: v.string(), // 'ios' | 'android'
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["token"]),

  // ==========================================
  // NOTIFICATIONS & EMAIL
  // ==========================================

  notifications: defineTable({
    notificationId: v.string(),
    tenantId: v.string(),
    userId: v.string(),
    type: v.string(), // "match_reminder" | "registration_confirm" | "schedule_change" | "match_result" | "announcement"
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()), // Additional context
    read: v.boolean(),
    readAt: v.optional(v.string()),
    createdAt: v.string(),
    // Delivery tracking
    emailSent: v.optional(v.boolean()),
    emailSentAt: v.optional(v.string()),
    pushSent: v.optional(v.boolean()),
    pushSentAt: v.optional(v.string()),
    smsSent: v.optional(v.boolean()),
    smsSentAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_user_unread", ["userId", "read"]),

  emailTemplates: defineTable({
    templateId: v.string(),
    tenantId: v.string(),
    name: v.string(), // "welcome" | "registration_confirm" | "match_reminder" | etc.
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.optional(v.array(v.string())), // ["playerName", "matchTime", etc.]
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_name", ["tenantId", "name"]),

  notificationPreferences: defineTable({
    userId: v.string(),
    tenantId: v.string(),
    // Global toggles
    emailEnabled: v.optional(v.boolean()),
    pushEnabled: v.optional(v.boolean()),
    smsEnabled: v.optional(v.boolean()),
    // Per-type preferences
    matchReminders: v.optional(v.boolean()),
    registrationConfirmations: v.optional(v.boolean()),
    scheduleChanges: v.optional(v.boolean()),
    matchResults: v.optional(v.boolean()),
    announcements: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_user_tenant", ["userId", "tenantId"]),

  // ==========================================
  // YOUTUBE INTEGRATION
  // ==========================================

  youtubeConnections: defineTable({
    tenantId: v.string(),
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.string(),
    youtubeChannelId: v.optional(v.string()),
    youtubeChannelName: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant_user", ["tenantId", "userId"]),

  // ==========================================
  // SUPPORT
  // ==========================================

  supportTickets: defineTable({
    tenantId: v.string(),
    userId: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: v.string(), // 'low' | 'medium' | 'high' | 'urgent'
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  // ==========================================
  // FEATURE FLAGS
  // ==========================================

  planFeatures: defineTable({
    planId: v.string(), // 'free', 'pro', 'enterprise'
    featureKey: v.string(),
    enabled: v.boolean(),
    limit: v.optional(v.number()),
  })
    .index("by_plan", ["planId"])
    .index("by_feature", ["featureKey"]),

  // ==========================================
  // BRACKETS (Phase 8)
  // ==========================================

  brackets: defineTable({
    bracketId: v.string(),
    competitionId: v.string(),
    eventId: v.optional(v.string()),
    tenantId: v.string(),
    type: v.string(), // "single_elimination" | "double_elimination" | "round_robin" | "swiss"
    rounds: v.array(v.object({
      roundNumber: v.number(),
      name: v.string(), // "Quarter Finals", "Semi Finals", etc.
      matches: v.array(v.string()), // matchIds
    })),
    champions: v.optional(v.array(v.string())), // Previous winners
    settings: v.object({
      thirdPlaceMatch: v.boolean(),
      seedOrder: v.string(), // "standard" | "random" | "snake"
      byeHandling: v.string(), // "random" | "highest_seed"
    }),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_bracketId", ["bracketId"])
    .index("by_competition", ["competitionId"])
    .index("by_tenant", ["tenantId"]),

  // ==========================================
  // STREAMS (Phase 8)
  // ==========================================

  streams: defineTable({
    streamId: v.string(),
    matchId: v.string(),
    tenantId: v.string(),
    platform: v.string(), // "youtube" | "twitch" | "facebook" | "custom"
    streamKey: v.optional(v.string()),
    streamUrl: v.optional(v.string()),
    isLive: v.boolean(),
    viewerCount: v.optional(v.number()),
    startedAt: v.optional(v.string()),
    endedAt: v.optional(v.string()),
    settings: v.optional(v.object({
      quality: v.string(), // "720p" | "1080p" | "4k"
      showScoreboard: v.boolean(),
      showSponsors: v.boolean(),
    })),
  })
    .index("by_streamId", ["streamId"])
    .index("by_match", ["matchId"])
    .index("by_tenant", ["tenantId"])
    .index("by_live", ["isLive"]),

  // ==========================================
  // SOCIAL POSTS (Phase 8)
  // ==========================================

  socialPosts: defineTable({
    postId: v.string(),
    tenantId: v.string(),
    matchId: v.optional(v.string()),
    competitionId: v.optional(v.string()),
    platform: v.string(), // "twitter" | "facebook" | "instagram"
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
    status: v.string(), // "draft" | "scheduled" | "published" | "failed"
    scheduledFor: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    postIdExternal: v.optional(v.string()),
    templateId: v.optional(v.string()), // Reference to a post template
    error: v.optional(v.string()), // Error message if status is "failed"
    analytics: v.optional(v.object({
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      impressions: v.number(),
      lastUpdatedAt: v.string(),
    })),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_postId", ["postId"])
    .index("by_tenant", ["tenantId"])
    .index("by_match", ["matchId"])
    .index("by_competition", ["competitionId"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledFor"]),

  // ==========================================
  // SPONSORS (Phase 8)
  // ==========================================

  sponsors: defineTable({
    sponsorId: v.string(),
    tenantId: v.string(),
    competitionId: v.optional(v.string()), // null = global tenant sponsor
    name: v.string(),
    logoUrl: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    tier: v.string(), // "platinum" | "gold" | "silver" | "bronze"
    displayOnScoreboard: v.boolean(),
    displayOnPrint: v.boolean(),
    displayOnStream: v.boolean(),
    displayOrder: v.optional(v.number()), // For rotation order
    active: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_sponsorId", ["sponsorId"])
    .index("by_tenant", ["tenantId"])
    .index("by_competition", ["competitionId"])
    .index("by_tier", ["tier"]),

  // ==========================================
  // MATCH TIMELINE (Phase 8)
  // ==========================================

  matchTimeline: defineTable({
    timelineId: v.string(),
    matchId: v.string(),
    tenantId: v.string(),
    events: v.array(v.object({
      eventId: v.string(),
      type: v.string(), // "point" | "game" | "set" | "timeout" | "substitution" | "card" | "video_ref" | "custom"
      timestamp: v.string(),
      team: v.optional(v.string()), // "team1" | "team2"
      player: v.optional(v.string()),
      data: v.optional(v.any()), // Event-specific data
      description: v.optional(v.string()),
      videoUrl: v.optional(v.string()), // Link to highlight video
    })),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  })
    .index("by_timelineId", ["timelineId"])
    .index("by_match", ["matchId"]),

  // ==========================================
  // AI HIGHLIGHTS (Phase 8)
  // ==========================================

  aiHighlights: defineTable({
    highlightId: v.string(),
    matchId: v.string(),
    tenantId: v.string(),
    type: v.string(), // "commentary" | "prediction" | "summary" | "key_moment"
    content: v.string(),
    confidence: v.optional(v.number()), // 0-1 confidence score
    metadata: v.optional(v.any()),
    createdAt: v.string(),
  })
    .index("by_highlightId", ["highlightId"])
    .index("by_match", ["matchId"])
    .index("by_type", ["type"]),

  // ==========================================
  // EXPORT JOBS (Phase 8)
  // ==========================================

  exportJobs: defineTable({
    jobId: v.string(),
    tenantId: v.string(),
    type: v.string(), // "pdf_bracket" | "csv_data" | "json_export" | "excel" | "report"
    status: v.string(), // "pending" | "processing" | "completed" | "failed"
    params: v.any(), // Export parameters
    downloadUrl: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.string(),
    completedAt: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status"]),

  // ==========================================
  // ARTICLES / BLOG
  // ==========================================

  articles: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    author: v.string(),
    authorAvatar: v.optional(v.string()),
    publishedAt: v.string(),
    isPublished: v.boolean(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["isPublished", "publishedAt"]),
});
