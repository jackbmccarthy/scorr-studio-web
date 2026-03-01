# Scorr Studio V2

Professional-grade, real-time scoreboard and tournament management platform for sports broadcasters, tournament organizers, and content creators.

## Overview

Scorr Studio V2 is a comprehensive sports scoring and tournament management system built with modern web technologies. It provides real-time match scoring for 20+ sports, tournament bracket management, league standings, broadcast overlays, and more.

### Key Highlights

- **20+ Sports Supported** - From table tennis to American football, each sport has custom scoring logic
- **Real-Time Updates** - Sub-100ms latency with Convex's real-time sync
- **Professional Displays** - Konva-based visual editor for broadcast overlays
- **Tournament Management** - Single/Double Elimination, Round Robin, Swiss formats
- **League Management** - Seasons, divisions, fixtures, and standings
- **Print & Share** - QR codes, printable brackets, and schedules
- **Multi-Tenant** - Organization-based access control with RBAC

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Convex** | Real-time database & backend |
| **WorkOS** | Authentication & organization management |
| **Konva** | Canvas-based scoreboard editor |
| **Framer Motion** | Animations |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/scorrstudio/scorr-studio-v2.git
cd scorr-studio-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev

# Start Convex development
npm run convex:dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

### Match Scoring
- Real-time score updates
- Sport-specific scoring rules (games, sets, periods, etc.)
- Undo/redo support
- Match defaults (forfeit, walkover, retirement)
- Timeouts and penalties tracking

### Competitions & Tournaments
- **Single Elimination** - Classic knockout format
- **Double Elimination** - Winners and losers brackets
- **Round Robin** - Everyone plays everyone
- **Swiss System** - Dynamic pairing based on records
- Seeding support and bracket generation

### Leagues
- Multiple seasons and divisions
- Automatic fixture generation
- Points-based standings
- Tiebreaker rules
- Team match formats (singles, doubles, mixed)

### Displays & Broadcasting
- Custom scoreboard designs
- Scene management (idle, versus, scoreboard, winner)
- Fullscreen broadcast mode
- Public sharing links
- QR code generation

### Print & Share
- Printable match schedules
- Tournament bracket printouts
- Court assignments
- Bulk printing support

### Settings & Administration
- Organization management
- Team member invitations
- Role-based permissions
- Social media integrations
- Custom branding

## Project Structure

```
scorr-studio-v2/
├── convex/                    # Convex backend functions
│   ├── schema.ts              # Database schema
│   ├── matches.ts             # Match CRUD operations
│   ├── competitions.ts        # Tournament management
│   ├── leagues.ts             # League management
│   ├── displays.ts            # Scoreboard displays
│   ├── teams.ts               # Team management
│   ├── members.ts             # Organization members
│   ├── tenants.ts             # Multi-tenancy
│   └── integrations.ts        # External integrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (app)/             # Authenticated app pages
│   │   │   ├── matches/       # Match management
│   │   │   ├── competitions/  # Tournament management
│   │   │   ├── leagues/       # League management
│   │   │   ├── displays/      # Scoreboard displays
│   │   │   ├── print/         # Print center
│   │   │   └── settings/      # Settings pages
│   │   ├── auth/              # Auth callback routes
│   │   ├── login/             # Login page
│   │   ├── display/[id]/      # Public display view
│   │   └── share/[token]/     # Public share pages
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── print/             # Print components
│   │   ├── brackets/          # Bracket visualization
│   │   └── motion/            # Animation components
│   └── lib/
│       ├── sports/            # Sport configurations (20+)
│       ├── types.ts           # TypeScript types
│       ├── utils.ts           # Utility functions
│       └── convex.ts          # Convex client
├── docs/                      # Documentation
└── tests/                     # Test files
```

## Documentation

- **[Getting Started](docs/GETTING_STARTED.md)** - Installation and first-time setup
- **[Features](docs/FEATURES.md)** - Complete feature documentation
- **[Sports](docs/SPORTS.md)** - Supported sports and scoring rules
- **[Printing](docs/PRINTING.md)** - Print and QR code features
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide
- **[API Reference](docs/API.md)** - Convex functions and API routes
- **[Development](docs/DEVELOPMENT.md)** - Contributing guidelines

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run convex:dev   # Start Convex development
npm run convex:deploy # Deploy Convex functions
```

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Owner** | Full access + billing management |
| **Admin** | Full access (no billing) |
| **Designer** | Create and edit displays |
| **Scorer** | Score matches |
| **Viewer** | Read-only access |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Documentation**: [docs.scorr.studio](https://docs.scorr.studio)
- **Email**: support@scorr.studio
- **Discord**: [discord.gg/scorrstudio](https://discord.gg/scorrstudio)

---

Built with ❤️ by the Scorr Studio team
