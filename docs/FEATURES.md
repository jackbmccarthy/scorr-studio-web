# Scorr Studio V2 Features

Complete documentation for all features in Scorr Studio V2.

## Table of Contents

- [Match Scoring](#match-scoring)
- [Competitions (Tournaments)](#competitions-tournaments)
- [Leagues](#leagues)
- [Displays & Broadcasting](#displays--broadcasting)
- [Print & Share](#print--share)
- [Settings & Administration](#settings--administration)

---

## Match Scoring

The core feature of Scorr Studio - real-time match scoring for 20+ sports.

### Creating a Match

1. Navigate to **Matches** in the sidebar
2. Click **New Match** button
3. Select a sport from the dropdown
4. Fill in match details:
   - **Team/Player 1** - Name and optional logo
   - **Team/Player 2** - Name and optional logo
   - **Event Name** - Tournament or event (optional)
   - **Match Round** - Round number or description (optional)
5. Configure sport-specific settings:
   - Best of 3/5/7 games
   - Points to win
   - Time limits
6. Click **Create Match**

### Scoring Actions

Each sport has specific scoring actions:

#### Racquet Sports (Table Tennis, Tennis, Badminton, etc.)

| Action | Description |
|--------|-------------|
| **Score Point** | Add point to player/team |
| **Undo** | Undo last action |
| **Timeout** | Call a timeout |
| **Switch Server** | Change serving player |
| **Yellow/Red Card** | Issue penalty card |

#### Team Sports (Basketball, Soccer, etc.)

| Action | Description |
|--------|-------------|
| **Score** | Add 1, 2, or 3 points (basketball) |
| **Foul** | Record a foul |
| **Timeout** | Call a timeout |
| **Start/Stop Clock** | Control game clock |
| **Next Period** | Advance to next quarter/period |

### Match States

- **Scheduled** - Match is created but not started
- **Live** - Match is in progress
- **Finished** - Match is complete
- **Cancelled** - Match was cancelled

### Match Defaults

When a match cannot be completed normally:

| Type | Description |
|------|-------------|
| **Forfeit** | One team withdraws |
| **Walkover** | One team doesn't show up |
| **Retirement** | Player injured during match |
| **Double Default** | Both teams forfeit |

To record a default:
1. Click the menu (⋮) on the match
2. Select "Record Default"
3. Choose the type and affected team
4. Add a reason (optional)
5. Confirm

---

## Competitions (Tournaments)

Create and manage tournaments with various bracket formats.

### Competition Formats

| Format | Description | Best For |
|--------|-------------|----------|
| **Single Elimination** | Lose once and you're out | Quick tournaments |
| **Double Elimination** | Losers bracket, must lose twice | Competitive events |
| **Round Robin** | Everyone plays everyone | Leagues, small groups |
| **Round Robin → Playoffs** | Groups then knockout | Large tournaments |
| **Swiss** | Dynamic pairing by record | Chess, large fields |

### Creating a Competition

1. Go to **Competitions** → **New Competition**
2. Enter basic info:
   - Name (e.g., "Summer Championship 2024")
   - Sport
   - Description
   - Start/End dates
   - Venue information
3. Create events within the competition:
   - Click **Add Event**
   - Name the event (e.g., "Men's Singles", "Women's Doubles")
   - Select format
   - Configure event-specific settings
4. Add participants:
   - Manual entry
   - Import from CSV
   - Use registration lists
5. Generate brackets:
   - Seed participants
   - Click **Generate Matches**
   - Review and adjust

### Seeding

Seeding determines bracket placement:

1. **Manual Seeding** - Drag and drop to arrange
2. **Random Seeding** - Randomly assign positions
3. **Rating-Based** - Use player ratings (if configured)

### Bracket Management

- **View bracket** - Visual bracket display
- **Edit matches** - Change times, courts, etc.
- **Progress winners** - Winners auto-advance
- **Regenerate** - Re-generate if needed (deletes existing matches)

### Double Elimination Specifics

- **Winners Bracket** - Unbeaten teams
- **Losers Bracket** - Teams with one loss
- **Grand Final** - Winner of losers bracket vs winners bracket winner
- **Reset Final** - If winners bracket loses, a deciding match is played

---

## Leagues

Manage ongoing leagues with seasons, divisions, and standings.

### League Types

| Type | Description |
|------|-------------|
| **Individual** | Solo players compete |
| **Team Simple** | Teams play one match per fixture |
| **Team Multi-Match** | Teams play multiple individual matches |

### League Structure

```
League
├── Season 1
│   ├── Division A
│   │   ├── Group 1
│   │   │   ├── Participants
│   │   │   ├── Fixtures
│   │   │   └── Standings
│   │   └── Group 2
│   └── Division B
├── Season 2
│   └── ...
```

### Creating a League

1. Go to **Leagues** → **New League**
2. Enter details:
   - Name
   - Sport
   - Type (individual/team)
3. Create a season:
   - Name (e.g., "2024 Season")
   - Start/end dates
   - Registration period
4. Add divisions:
   - Division name
   - Points configuration
   - Tiebreaker rules
5. Add groups and participants
6. Generate fixtures

### Points System

Configure points for match outcomes:

| Outcome | Default Points |
|---------|---------------|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |

Customize per league requirements.

### Tiebreakers

Available tiebreaker options:

1. **Goal/Point Difference** - Goals for minus goals against
2. **Goals/Points For** - Total goals scored
3. **Head to Head** - Direct match results
4. **Matches Won** - Number of wins
5. **Games Won** - For racquet sports

### Standings

Standings are automatically calculated from completed matches:

| Column | Description |
|--------|-------------|
| P | Played (matches) |
| W | Won |
| D | Drawn |
| L | Lost |
| GF | Goals/Points For |
| GA | Goals/Points Against |
| GD | Goal Difference |
| Pts | Points |

### Team Match Format

For team multi-match leagues:

```typescript
const format = {
  matchCount: 5,
  matchTypes: ['singles', 'singles', 'doubles', 'doubles', 'singles'],
  winCondition: 'majority', // First to 3 wins
  allowConcurrentMatches: true
};
```

---

## Displays & Broadcasting

Create professional scoreboard displays for broadcast and spectator viewing.

### Display Types

| Type | Description |
|------|-------------|
| **Standard** | Pre-built templates |
| **Konva** | Custom canvas-based designs |
| **Composite** | Multiple elements combined |
| **Bracket** | Tournament bracket display |

### Creating a Display

1. Go to **Displays** → **New Display**
2. Choose a type and template
3. Set dimensions (e.g., 1920x1080 for 1080p)
4. Customize using the Konva editor
5. Save and preview

### Konva Editor

The Konva editor allows visual customization:

#### Available Elements

| Element | Description |
|---------|-------------|
| **Text** | Static or data-bound text |
| **Score** | Animated score display |
| **Image** | Logos, photos |
| **Timer** | Game clock |
| **Container** | Grouped elements |
| **Rectangle** | Decorative shapes |
| **Visibility** | Show/hide based on state |

#### Data Bindings

Connect elements to live match data:

- `teamName1` / `teamName2` - Team names
- `team1Score` / `team2Score` - Current scores
- `teamLogo1` / `teamLogo2` - Team logos
- `currentGame` - Game number
- `currentServer` - Who's serving
- `clock.seconds` - Time remaining

#### Animations

Add visual effects:

| Animation | Use Case |
|-----------|----------|
| **Pulse** | Score changes |
| **Flash** | Important events |
| **Slide Up/Down** | Scene transitions |
| **Scale Up** | Highlights |
| **Glow** | Active elements |

### Scene Management

Stages manage scene transitions:

| Scene | When Used |
|-------|-----------|
| **Idle** | No active match |
| **Versus** | Pre-match intro |
| **Scoreboard** | During match |
| **Winner** | Match complete |
| **Break** | Between matches |

### Public Display URLs

Each display has a shareable URL:

```
https://your-scorr.com/display/[display-id]
```

Share this URL for:
- OBS Browser Source
- Projector displays
- Spectator screens

---

## Print & Share

Generate printable schedules, brackets, and QR codes.

### Print Center

Access via **Print** in the sidebar.

### Printable Items

| Item | Description |
|------|-------------|
| **Match Schedule** | All matches grouped by date |
| **Court Assignments** | Matches organized by location |
| **Tournament Bracket** | Visual bracket with results |

### Printing

1. Select items to print
2. Click **Print Selected**
3. Choose your printer or "Save as PDF"

### QR Codes

QR codes are automatically generated for:
- Public schedule pages
- Live bracket views
- Individual displays

Scanning a QR code:
1. Opens the public view
2. No login required
3. Auto-refreshes with live data

### Share URLs

Generate public links:

```
https://your-scorr.com/share/[token]
https://your-scorr.com/share/[token]/schedule
```

Share via:
- QR code
- Copy link
- Social media

---

## Settings & Administration

Configure your organization and preferences.

### Organization Settings

Access at **Settings** → **Organization**

| Setting | Description |
|---------|-------------|
| **Name** | Organization display name |
| **Logo** | Upload your logo |
| **Primary Color** | Brand color for displays |
| **Enabled Sports** | Which sports to show |
| **Custom Fields** | Player profile fields |

### Team Management

Access at **Settings** → **Team**

#### Member Roles

| Role | Can Do |
|------|--------|
| **Owner** | Everything + billing |
| **Admin** | Full access except billing |
| **Designer** | Create/edit displays |
| **Scorer** | Score matches |
| **Viewer** | Read-only access |

#### Inviting Members

1. Click **Invite Member**
2. Enter email address
3. Select role
4. Send invitation

Members receive an email with a link to join.

### Integrations

Access at **Settings** → **Integrations**

#### Available Integrations

| Integration | Purpose |
|-------------|---------|
| **Twitter/X** | Auto-post results |
| **Instagram** | Share match graphics |
| **YouTube** | Stream overlays |
| **Webhooks** | Custom integrations |
| **API Keys** | Programmatic access |

### Social Media Automation

Configure auto-posting:

1. Connect your social accounts
2. Enable **Auto-Post on Finish**
3. Add custom hashtags
4. Configure post templates

When a match ends:
- Automatically posts result
- Includes score and graphic
- Uses your hashtags

### Developer Settings

For API access:

#### API Keys

```bash
# Create an API key
POST /api/v1/api-keys
{
  "name": "My Integration",
  "permissions": ["matches:read", "matches:write"]
}
```

#### Webhooks

```bash
# Register a webhook
POST /api/v1/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["match.started", "match.finished"]
}
```

#### Available Events

- `match.created`
- `match.started`
- `match.scored`
- `match.finished`
- `competition.created`
- `competition.completed`
