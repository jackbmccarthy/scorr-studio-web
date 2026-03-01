# API Reference

Scorr Studio V2 uses Convex for its backend API. This document covers all available functions and API routes.

## Table of Contents

- [Convex Functions](#convex-functions)
  - [Matches](#matches)
  - [Competitions](#competitions)
  - [Leagues](#leagues)
  - [Teams](#teams)
  - [Displays](#displays)
  - [Members](#members)
  - [Tenants](#tenants)
- [API Routes](#api-routes)
- [Webhooks](#webhooks)
- [Error Handling](#error-handling)

---

## Convex Functions

Convex provides real-time, type-safe functions for all data operations.

### Using Convex Functions

#### In React Components

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/lib/convex';

// Query
const matches = useQuery(api.matches.getByTenant, { tenantId });

// Mutation
const createMatch = useMutation(api.matches.create);
await createMatch({ ...matchData });
```

#### In Server Code

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/lib/convex';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Query
const matches = await client.query(api.matches.getByTenant, { tenantId });

// Mutation
const result = await client.mutation(api.matches.create, matchData);
```

---

## Matches

### Queries

#### `matches.getByMatchId`

Get a single match by its external ID.

```typescript
// Arguments
{ matchId: string }

// Returns
{
  _id: Id<"matches">;
  matchId: string;
  tenantId: string;
  sportId: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  team1: { id?: string; name: string; logoUrl?: string; score: number };
  team2: { id?: string; name: string; logoUrl?: string; score: number };
  state: SportSpecificState;
  competitionId?: string;
  winner?: string;
  // ... other fields
}
```

#### `matches.getByTenant`

Get all matches for a tenant.

```typescript
// Arguments
{
  tenantId: string;
  status?: 'scheduled' | 'live' | 'finished' | 'cancelled';
  sportId?: string;
}

// Returns
Match[]
```

#### `matches.getByCompetition`

Get all matches in a competition.

```typescript
// Arguments
{ competitionId: string }

// Returns
Match[]
```

#### `matches.getLiveMatches`

Get all currently live matches for a tenant.

```typescript
// Arguments
{ tenantId: string }

// Returns
Match[]  // Only matches with status: 'live'
```

### Mutations

#### `matches.create`

Create a new match.

```typescript
// Arguments
{
  matchId: string;          // UUID
  tenantId: string;
  sportId: string;
  team1: {
    id?: string;
    name: string;
    logoUrl?: string;
  };
  team2: {
    id?: string;
    name: string;
    logoUrl?: string;
  };
  state: SportSpecificState;  // From sport config
  competitionId?: string;
  eventId?: string;
  eventName?: string;
  matchRound?: string;
  roundIndex?: number;
  matchIndex?: number;
  nextMatchId?: string;
  nextMatchSlot?: 'team1Id' | 'team2Id';
}

// Returns
{ _id: Id<"matches"> }
```

#### `matches.updateState`

Update match state and scores.

```typescript
// Arguments
{
  matchId: string;
  state: SportSpecificState;
  status?: 'scheduled' | 'live' | 'finished' | 'cancelled';
  team1Score?: number;
  team2Score?: number;
}

// Returns
{ success: boolean }
```

#### `matches.startMatch`

Start a match (set status to live).

```typescript
// Arguments
{ matchId: string }

// Returns
{ success: boolean }
```

#### `matches.endMatch`

End a match.

```typescript
// Arguments
{
  matchId: string;
  winner?: 'team1' | 'team2';
}

// Returns
{ success: boolean }
```

#### `matches.remove`

Delete a match.

```typescript
// Arguments
{ matchId: string }

// Returns
{ success: boolean }
```

#### `matches.recordDefault`

Record a match default (forfeit, walkover, etc.).

```typescript
// Arguments
{
  matchId: string;
  type: 'forfeit' | 'walkover' | 'double_default' | 'retirement';
  defaultedSide: 'team1' | 'team2' | 'both';
  reason?: string;
  recordedBy: string;
}

// Returns
{ success: boolean }
```

---

## Competitions

### Queries

#### `competitions.list`

List all competitions for a tenant.

```typescript
// Arguments
{
  tenantId: string;
  status?: 'draft' | 'active' | 'completed';
}

// Returns
Competition[]
```

#### `competitions.getById`

Get a competition by ID.

```typescript
// Arguments
{ competitionId: string }

// Returns
Competition
```

### Mutations

#### `competitions.create`

Create a new competition.

```typescript
// Arguments
{
  tenantId: string;
  sportId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venueName?: string;
  venueAddress?: string;
}

// Returns
{ competitionId: string; _id: Id<"competitions"> }
```

#### `competitions.update`

Update a competition.

```typescript
// Arguments
{
  competitionId: string;
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  venueName?: string;
  venueAddress?: string;
}

// Returns
{ success: boolean }
```

#### `competitions.remove`

Delete a competition.

```typescript
// Arguments
{ competitionId: string }

// Returns
{ success: boolean }
```

#### `competitions.generateBracket`

Generate tournament bracket matches.

```typescript
// Arguments
{
  competitionId: string;
  teamCount: number;
  seedingType?: 'random' | 'seeded';
}

// Returns
{
  success: boolean;
  rounds: number;
  matchesPerRound: number[];
}
```

---

## Leagues

### Queries

#### `leagues.list`

List all leagues for a tenant.

```typescript
// Arguments
{
  tenantId: string;
  status?: string;
}

// Returns
League[]
```

#### `leagues.getById`

Get a league by ID.

```typescript
// Arguments
{ leagueId: string }

// Returns
League
```

#### `leagues.getStandings`

Get league standings.

```typescript
// Arguments
{ leagueId: string }

// Returns
Standing[]
```

### Mutations

#### `leagues.create`

Create a new league.

```typescript
// Arguments
{
  tenantId: string;
  sportId: string;
  name: string;
  type: 'individual' | 'team_simple' | 'team_multi_match';
  description?: string;
}

// Returns
{ leagueId: string; _id: Id<"leagues"> }
```

#### `leagues.update`

Update a league.

```typescript
// Arguments
{
  leagueId: string;
  name?: string;
  description?: string;
  status?: string;
}

// Returns
{ success: boolean }
```

#### `leagues.remove`

Delete a league.

```typescript
// Arguments
{ leagueId: string }

// Returns
{ success: boolean }
```

#### `leagues.generateFixtures`

Generate league fixtures.

```typescript
// Arguments
{
  leagueId: string;
  seasonId?: string;
  teams: { id: string; name: string }[];
  schedule?: {
    startDate: string;
    endDate: string;
    matchDays: string[];
  };
}

// Returns
{ success: boolean; fixtureCount: number }
```

---

## Teams

### Queries

#### `teams.list`

List all teams for a tenant.

```typescript
// Arguments
{
  tenantId: string;
  sportId?: string;
}

// Returns
Team[]
```

#### `teams.getById`

Get a team by ID.

```typescript
// Arguments
{ teamId: string }

// Returns
Team
```

### Mutations

#### `teams.create`

Create a new team.

```typescript
// Arguments
{
  tenantId: string;
  sportId: string;
  name: string;
  logoUrl?: string;
  color?: string;
  players?: Player[];
}

// Returns
{ teamId: string; _id: Id<"teams"> }
```

#### `teams.update`

Update a team.

```typescript
// Arguments
{
  teamId: string;
  name?: string;
  logoUrl?: string;
  color?: string;
  players?: Player[];
}

// Returns
{ success: boolean }
```

#### `teams.remove`

Delete a team.

```typescript
// Arguments
{ teamId: string }

// Returns
{ success: boolean }
```

---

## Displays

### Queries

#### `displays.list`

List all score displays for a tenant.

```typescript
// Arguments
{
  tenantId: string;
  sportId?: string;
}

// Returns
ScoreDisplay[]
```

#### `displays.getById`

Get a display by ID.

```typescript
// Arguments
{ displayId: string }

// Returns
ScoreDisplay
```

### Mutations

#### `displays.create`

Create a new display.

```typescript
// Arguments
{
  tenantId: string;
  sportId: string;
  name: string;
  type?: 'standard' | 'konva' | 'composite' | 'bracket';
  width: number;
  height: number;
  theme?: object;
}

// Returns
{ displayId: string; _id: Id<"scoreDisplays"> }
```

#### `displays.update`

Update a display.

```typescript
// Arguments
{
  displayId: string;
  name?: string;
  width?: number;
  height?: number;
  theme?: object;
  sceneData?: KonvaSceneData;
}

// Returns
{ success: boolean }
```

#### `displays.remove`

Delete a display.

```typescript
// Arguments
{ displayId: string }

// Returns
{ success: boolean }
```

---

## Members

### Queries

#### `members.getByTenant`

Get all members of a tenant.

```typescript
// Arguments
{ tenantId: string }

// Returns
Member[]
```

#### `members.getByUser`

Get all tenants a user belongs to.

```typescript
// Arguments
{ userId: string }

// Returns
Member[]
```

### Mutations

#### `members.invite`

Invite a new member.

```typescript
// Arguments
{
  tenantId: string;
  email: string;
  role: 'owner' | 'admin' | 'designer' | 'scorer' | 'viewer';
}

// Returns
{ invitationId: string }
```

#### `members.acceptInvite`

Accept an invitation.

```typescript
// Arguments
{ token: string }

// Returns
{ success: boolean; tenantId: string }
```

#### `members.remove`

Remove a member.

```typescript
// Arguments
{
  tenantId: string;
  userId: string;
}

// Returns
{ success: boolean }
```

---

## Tenants

### Queries

#### `tenants.getById`

Get a tenant by ID.

```typescript
// Arguments
{ tenantId: string }

// Returns
Tenant
```

#### `tenants.getBySlug`

Get a tenant by slug.

```typescript
// Arguments
{ slug: string }

// Returns
Tenant
```

### Mutations

#### `tenants.create`

Create a new tenant (organization).

```typescript
// Arguments
{
  name: string;
  slug?: string;
}

// Returns
{ tenantId: string; _id: Id<"tenants"> }
```

#### `tenants.update`

Update a tenant.

```typescript
// Arguments
{
  tenantId: string;
  name?: string;
  slug?: string;
  settings?: TenantSettings;
}

// Returns
{ success: boolean }
```

---

## API Routes

Scorr Studio also provides REST API routes for external integrations.

### Authentication

API routes require authentication via:
- Session cookie (logged-in users)
- API key (for integrations)

### Available Routes

#### `GET /api/health`

Health check endpoint.

```typescript
// Response
{ status: 'ok'; timestamp: string }
```

#### `POST /api/webhooks/stripe`

Stripe webhook handler.

```typescript
// Headers
{ 'stripe-signature': string }

// Body
Stripe Event object

// Response
{ received: true }
```

#### `POST /api/webhooks/convex`

Convex webhook handler for external triggers.

---

## Webhooks

### Outgoing Webhooks

Configure webhooks to receive events from Scorr Studio.

#### Available Events

| Event | Triggered When |
|-------|----------------|
| `match.created` | New match created |
| `match.started` | Match goes live |
| `match.updated` | Match state changed |
| `match.finished` | Match completed |
| `competition.created` | New competition |
| `competition.started` | Competition activated |
| `competition.completed` | Competition finished |

#### Webhook Payload

```typescript
{
  id: string;           // Unique event ID
  event: string;        // Event type
  timestamp: string;    // ISO 8601 timestamp
  data: {
    tenantId: string;
    // Event-specific data
  }
}
```

#### Webhook Security

Webhooks include a signature header for verification:

```typescript
// Headers
{
  'x-webhook-signature': string;  // HMAC-SHA256
  'x-webhook-timestamp': string;
}
```

Verify the signature:

```typescript
import crypto from 'crypto';

function verifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

---

## Error Handling

### Error Format

All errors follow this format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: unknown;
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `VALIDATION_ERROR` | Invalid input |
| `INTERNAL_ERROR` | Server error |

### Handling Errors

```typescript
try {
  await createMatch({ ...data });
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else if (error.message.includes('unauthorized')) {
    // Handle auth error
  }
}
```

---

## Rate Limits

### Convex Limits

| Operation | Limit |
|-----------|-------|
| Queries per second | 1000 |
| Mutations per second | 500 |
| WebSocket messages | 100/second |

### API Route Limits

| Route | Limit |
|-------|-------|
| All routes | 100 requests/minute |
| Webhooks | No limit (verified) |

---

## TypeScript Types

All API types are exported from `src/lib/types.ts`:

```typescript
import type {
  Match,
  Competition,
  League,
  Team,
  ScoreDisplay,
  Member,
  Tenant,
  // ... and more
} from '@/lib/types';
```

For sport-specific types:

```typescript
import type { TableTennisState } from '@/lib/sports/table-tennis';
import type { BasketballState } from '@/lib/sports/basketball';
```
