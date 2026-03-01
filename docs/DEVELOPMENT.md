# Development Guide

Guide for contributing to and extending Scorr Studio V2.

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Adding New Sports](#adding-new-sports)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/scorrstudio/scorr-studio-v2.git
cd scorr-studio-v2

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development
npm run dev          # Terminal 1: Next.js
npm run convex:dev   # Terminal 2: Convex
```

---

## Code Style

### TypeScript

- **Strict mode enabled** - All code must pass strict TypeScript checks
- **No `any`** - Use proper types or `unknown` with type guards
- **Explicit return types** - For public functions and methods
- **Interfaces over types** - For object shapes (use types for unions/primitives)

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | null {
  // ...
}

// Avoid
function getUser(id: any) {
  // ...
}
```

### React

- **Functional components only** - No class components
- **Hooks at the top** - Before any early returns
- **Named exports** - Prefer named over default exports

```typescript
// Good
export function MatchCard({ match }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!match) return null;
  
  return (
    // ...
  );
}

// Avoid
export default class MatchCard extends React.Component {
  // ...
}
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MatchCard.tsx` |
| Hooks | camelCase with `use` | `useMatch.ts` |
| Utilities | camelCase | `formatScore.ts` |
| Types | camelCase | `types.ts` |
| Constants | SCREAMING_SNAKE | `MATCH_STATUS.ts` |

### Imports

Order imports as follows:

```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery, useMutation } from 'convex/react';
import { format } from 'date-fns';

// 3. Internal components
import { Button, Card } from '@/components/ui';
import { MatchCard } from '@/components/matches';

// 4. Utilities and types
import { formatScore } from '@/lib/utils';
import type { Match } from '@/lib/types';

// 5. Relative imports
import { LocalComponent } from './LocalComponent';
```

### Formatting

We use ESLint and Prettier. Format on save is recommended.

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## Project Structure

```
scorr-studio-v2/
├── convex/                    # Backend functions
│   ├── _generated/           # Auto-generated Convex types
│   ├── schema.ts             # Database schema
│   ├── matches.ts            # Match operations
│   ├── competitions.ts       # Competition operations
│   └── ...                   # Other entities
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (app)/            # Authenticated routes
│   │   │   ├── layout.tsx    # App layout with sidebar
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── matches/      # Match pages
│   │   │   ├── competitions/ # Competition pages
│   │   │   ├── leagues/      # League pages
│   │   │   ├── displays/     # Display pages
│   │   │   ├── print/        # Print center
│   │   │   └── settings/     # Settings pages
│   │   ├── auth/             # Auth callback
│   │   ├── login/            # Login page
│   │   ├── display/[id]/     # Public display
│   │   ├── share/[token]/    # Public share pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── print/            # Print components
│   │   ├── brackets/         # Bracket components
│   │   └── motion/           # Animation components
│   └── lib/
│       ├── sports/           # Sport configurations
│       │   ├── index.ts      # Exports all sports
│       │   ├── registry.ts   # Sport registry
│       │   ├── table-tennis.ts
│       │   └── ...
│       ├── types.ts          # TypeScript types
│       ├── utils.ts          # Utility functions
│       └── convex.ts         # Convex client
├── docs/                     # Documentation
├── public/                   # Static assets
└── tests/                    # Test files
```

---

## Component Architecture

### UI Components

Located in `src/components/ui/`. These are shadcn/ui components.

**Guidelines:**
- Keep components generic and reusable
- Use `forwardRef` for DOM element access
- Export from `index.ts`

```typescript
// src/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

### Feature Components

Located in `src/components/[feature]/`. These are feature-specific.

**Guidelines:**
- Group related components in folders
- Include a `index.ts` for exports
- Use composition over prop drilling

```typescript
// src/components/brackets/BracketViewer.tsx
interface BracketViewerProps {
  bracket: Bracket;
  onMatchClick?: (matchId: string) => void;
}

export function BracketViewer({ bracket, onMatchClick }: BracketViewerProps) {
  return (
    <div className="bracket-viewer">
      {bracket.rounds.map((round, i) => (
        <BracketRound key={i} round={round} onMatchClick={onMatchClick} />
      ))}
    </div>
  );
}
```

### Page Components

Located in `src/app/`. These are Next.js page components.

**Guidelines:**
- Use Server Components by default
- Use `'use client'` only when needed
- Keep pages thin, logic in components/hooks

```typescript
// src/app/(app)/matches/page.tsx
import { MatchesList } from './MatchesList';

export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Matches</h1>
      <MatchesList />
    </div>
  );
}
```

---

## Adding New Sports

### Step 1: Create Sport Configuration

Create a new file in `src/lib/sports/[sport-id].ts`:

```typescript
import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface MySportState extends BaseMatchState {
  // Sport-specific state fields
  // Examples:
  // - sets: number[]
  // - currentSet: number
  // - fouls: number
  // - timeouts: number
}

// ============================================
// INITIAL STATE
// ============================================

function getInitialState(data?: InitialStateData): MySportState {
  const base = createBaseMatchState(data);
  
  return {
    ...base,
    // Initialize sport-specific fields
  };
}

// ============================================
// MATCH CREATION
// ============================================

function createMatch(params: CreateMatchParams) {
  const state = getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  });
  
  return createBaseMatch(params, state);
}

// ============================================
// ACTION HANDLING
// ============================================

function handleAction(state: MySportState, action: SportAction): MySportState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return { ...newState, team1Score: newState.team1Score + 1 };
      
    case 'SCORE_TEAM2':
      return { ...newState, team2Score: newState.team2Score + 1 };
      
    case 'UNDO':
      // Implement undo logic
      return newState;
      
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
      
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
      
    default:
      return newState;
  }
}

// ============================================
// MATCH SUMMARY
// ============================================

function getMatchSummary(state: MySportState) {
  return createBaseMatchSummary(state);
}

// ============================================
// KONVA BLOCKS (for displays)
// ============================================

const konvaBlocks: KonvaBlockDefinition[] = [
  {
    id: 'team1Name',
    type: 'text',
    label: 'Team 1 Name',
    category: 'Match Data',
    defaultProps: { fontSize: 24, fill: '#FFFFFF' },
    dataBinding: { field: 'teamName1', behaviorType: 'text' },
    sample: 'Team Alpha',
  },
  {
    id: 'team1Score',
    type: 'score',
    label: 'Team 1 Score',
    category: 'Match Data',
    defaultProps: { fontSize: 72, fill: '#FFFFFF' },
    dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' },
    sample: 15,
  },
  // Add more blocks as needed
];

// ============================================
// REGISTER SPORT
// ============================================

const mySportConfig: SportConfig<MySportState> = {
  id: 'my-sport',
  name: 'My Sport',
  description: 'Description of the sport and its scoring rules',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: {
    blocks: konvaBlocks,
    defaultCanvasSize: { width: 1920, height: 1080 },
  },
  handleAction,
};

registerSport(mySportConfig);

export type { MySportState };
export { mySportConfig };
```

### Step 2: Register the Sport

Add to `src/lib/sports/index.ts`:

```typescript
// Import the sport configuration
import './my-sport';

// The sport self-registers on import
```

### Step 3: Add Sport Icon (Optional)

Add an icon to the sport selection UI:

```typescript
// In the sport selector component
const sportIcons: Record<string, React.ReactNode> = {
  'my-sport': <MySportIcon />,
  // ...
};
```

---

## Adding New Features

### Step 1: Plan the Feature

Before coding:
1. Define the data model
2. Plan the API (Convex functions)
3. Design the UI components
4. Consider edge cases

### Step 2: Update Schema

Add to `convex/schema.ts`:

```typescript
// Add new table
myFeature: defineTable({
  id: v.string(),
  tenantId: v.string(),
  name: v.string(),
  createdAt: v.string(),
  // ... other fields
})
  .index("by_tenant", ["tenantId"])
  .index("by_id", ["id"]),
```

Run `npm run convex:dev` to push schema changes.

### Step 3: Create Convex Functions

Create `convex/myFeature.ts`:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("myFeature")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("myFeature")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Mutations
export const create = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const id = crypto.randomUUID();
    
    await ctx.db.insert("myFeature", {
      id,
      tenantId: args.tenantId,
      name: args.name,
      createdAt: new Date().toISOString(),
    });
    
    return { id };
  },
});
```

### Step 4: Create UI Components

```typescript
// src/components/my-feature/MyFeatureList.tsx
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex';

interface MyFeatureListProps {
  tenantId: string;
}

export function MyFeatureList({ tenantId }: MyFeatureListProps) {
  const items = useQuery(api.myFeature.list, { tenantId });
  
  if (!items) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <MyFeatureCard key={item._id} item={item} />
      ))}
    </div>
  );
}
```

### Step 5: Create Page

```typescript
// src/app/(app)/my-feature/page.tsx
'use client';

import { useAuth } from '@workos-inc/authkit-nextjs';
import { MyFeatureList } from '@/components/my-feature/MyFeatureList';

export default function MyFeaturePage() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My Feature</h1>
      <MyFeatureList tenantId={user.id} />
    </div>
  );
}
```

### Step 6: Add Navigation

Add to the sidebar navigation:

```typescript
// In layout component
const navItems = [
  // ... existing items
  { href: '/my-feature', label: 'My Feature', icon: MyFeatureIcon },
];
```

---

## Testing

### Unit Tests

We use Vitest for unit testing.

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatScore } from './utils';

describe('formatScore', () => {
  it('should format a simple score', () => {
    expect(formatScore(11, 5)).toBe('11-5');
  });
  
  it('should handle zero scores', () => {
    expect(formatScore(0, 0)).toBe('0-0');
  });
});
```

Run tests:

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Sport Configuration Tests

Each sport should have tests:

```typescript
// src/lib/sports/table-tennis.test.ts
import { describe, it, expect } from 'vitest';
import { getSportConfig } from './registry';

describe('Table Tennis', () => {
  const config = getSportConfig('table-tennis');
  
  it('should have correct initial state', () => {
    const state = config.getInitialState();
    expect(state.bestOf).toBe(5);
    expect(state.pointsToWin).toBe(11);
  });
  
  it('should handle scoring', () => {
    const state = config.getInitialState();
    const newState = config.handleAction(state, { type: 'SCORE_TEAM1' });
    expect(newState.team1Score).toBe(1);
  });
});
```

### E2E Tests

We use Playwright for E2E testing.

```typescript
// tests/matches.spec.ts
import { test, expect } from '@playwright/test';

test('can create a match', async ({ page }) => {
  await page.goto('/matches');
  await page.click('text=New Match');
  
  await page.selectOption('[name="sport"]', 'table-tennis');
  await page.fill('[name="team1"]', 'Player 1');
  await page.fill('[name="team2"]', 'Player 2');
  await page.click('text=Create Match');
  
  await expect(page.locator('text=Player 1 vs Player 2')).toBeVisible();
});
```

Run E2E tests:

```bash
npm run test:e2e
```

---

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add basketball sport configuration

- Add basketball scoring with quarters
- Add shot clock tracking
- Add timeout management

Closes #123
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and tests
5. Create pull request
6. Request review
7. Address feedback
8. Merge when approved

### Before Merging

```bash
# Run all checks
npm run lint
npm run test
npm run build
```
