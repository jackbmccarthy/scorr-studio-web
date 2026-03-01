# Getting Started with Scorr Studio V2

This guide will help you set up Scorr Studio V2 on your local machine and get started with scoring matches.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18.x or higher | LTS recommended |
| npm | 9.x or higher | Comes with Node.js |
| Git | Latest | For version control |

### Optional

- **Convex CLI** - Installed automatically via npm
- **VS Code** - Recommended IDE with TypeScript support

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/scorrstudio/scorr-studio-v2.git
cd scorr-studio-v2
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js and React
- Convex client and server
- WorkOS AuthKit
- shadcn/ui components
- Tailwind CSS

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# ============================================
# CONVEX CONFIGURATION
# ============================================
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ============================================
# WORKOS AUTHENTICATION
# ============================================
WORKOS_CLIENT_ID=client_xxx
WORKOS_CLIENT_SECRET=sk_xxx
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# ============================================
# OPTIONAL: STRIPE BILLING
# ============================================
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 4. Set Up Convex

Initialize Convex for development:

```bash
# Log in to Convex (first time only)
npx convex login

# Start Convex development server
npm run convex:dev
```

This will:
1. Create a new Convex deployment (if needed)
2. Push your schema to Convex
3. Generate TypeScript types
4. Watch for changes

### 5. Start the Development Server

In a new terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | `https://xxx.convex.cloud` |
| `WORKOS_CLIENT_ID` | WorkOS client ID | `client_01xxx` |
| `WORKOS_CLIENT_SECRET` | WorkOS client secret | `sk_test_xxx` |
| `WORKOS_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/callback` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## Running Locally

### Development Mode

```bash
# Terminal 1: Convex backend
npm run convex:dev

# Terminal 2: Next.js frontend
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## First-Time Setup

After logging in for the first time, you'll need to complete these steps:

### 1. Create Your Organization

When you first log in, you'll be prompted to create an organization:

1. Enter your organization name (e.g., "Spring Tennis League")
2. Choose a URL slug (e.g., "spring-tennis")
3. Select the sports you'll be using
4. Click "Create Organization"

### 2. Configure Your Organization

Navigate to **Settings** to customize your organization:

- **Logo & Branding** - Upload your logo and set primary colors
- **Enabled Sports** - Enable/disable specific sports
- **Custom Fields** - Add custom player fields (up to 10)
- **Social Automation** - Configure auto-posting to social media

### 3. Invite Team Members

To invite others to your organization:

1. Go to **Settings → Team**
2. Click "Invite Member"
3. Enter their email address
4. Select their role:
   - **Admin** - Full access
   - **Designer** - Can create/edit displays
   - **Scorer** - Can score matches
   - **Viewer** - Read-only access
5. Click "Send Invitation"

Team members will receive an email with a link to join.

### 4. Create Your First Match

1. Navigate to **Matches**
2. Click "New Match"
3. Select a sport (e.g., Table Tennis)
4. Enter team/player names
5. Configure match settings (best of 5, points to win, etc.)
6. Click "Create Match"
7. Click "Start Match" to begin scoring

### 5. Set Up a Display (Optional)

For broadcast or spectator displays:

1. Go to **Displays**
2. Click "New Display"
3. Choose a template or start from scratch
4. Use the Konva editor to customize the layout
5. Save and open the fullscreen view

## Troubleshooting

### Convex Connection Issues

If you see "Convex not configured" errors:

```bash
# Check your Convex URL
echo $NEXT_PUBLIC_CONVEX_URL

# Re-run Convex dev
npm run convex:dev
```

### Authentication Issues

If WorkOS authentication fails:

1. Verify your `WORKOS_CLIENT_ID` and `WORKOS_CLIENT_SECRET`
2. Check the redirect URI matches exactly in WorkOS dashboard
3. Ensure cookies are enabled in your browser

### Build Errors

For TypeScript or build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Database Schema Issues

If Convex schema errors occur:

```bash
# Push schema changes
npx convex dev --once

# Or reset (WARNING: deletes all data)
npx convex run init
```

## Next Steps

- **[Features Guide](FEATURES.md)** - Learn about all available features
- **[Sports Reference](SPORTS.md)** - Sport-specific scoring rules
- **[Development Guide](DEVELOPMENT.md)** - Contributing to Scorr Studio
- **[API Reference](API.md)** - Convex functions and API routes

## Getting Help

- Check the [documentation](./)
- Join our [Discord](https://discord.gg/scorrstudio)
- Email [support@scorr.studio](mailto:support@scorr.studio)
