# Stream Controller (Broadcast Stage)

This document outlines the design and roadmap for the **Stream Controller** (formerly "Broadcast Stage"). The Stream Controller is a tool for broadcasters to manage the *content* of their overlay without changing the *source URL* in their broadcasting software (OBS/vMix).

## 1. Core Concept

In a typical production workflow, the overlay URL needs to be static so the OBS scene doesn't need constant updating. The Stream Controller acts as a "remote control" for that static URL.

### Architecture

*   **The Stage (State):** A persistent entity in the `stages` database table representing a physical court or stream. It holds the state of "What is currently happening?".
*   **The Controller (Admin UI):** The interface where the operator selects matches, updates scores, or triggers ads.
*   **The Display (Output):** The static URL loaded in OBS (e.g., `scorr.studio/display/{stage_token}`). It listens to the Stage state and renders the appropriate overlay.

```mermaid
flowchart LR
    Admin[Stream Operator] -->|Clics specific match| Controller[Stream Controller UI]
    Controller -->|Updates| DB[(Convex 'stages')]
    DB -->|Realtime Sub| Display[Overlay URL (OBS)]
    Display -->|Renders| Video[Live Stream]
```

---

## 2. Operating Modes

The Stream Controller must support two distinct workflows:

### 2.1 Ad-Hoc Mode ("Quick Match")
For pickup games, scrimmages, or events not managed in the full Scorr Studio tournament system.

*   **Workflow:**
    1.  Operator selects "Ad-Hoc Mode".
    2.  Manually enters "Team A Name", "Team B Name", and distinct colors.
    3.  Clicks "Go Live".
    4.  Scores the match using a simple +/- interface in the controller.
    5.  Clicks "Finish Match" to clear the overlay or show a winner graphic.

### 2.2 Competition Mode ("Tournament Flow")
For structured competitions with brackets or league fixtures.

*   **Workflow:**
    1.  Operator links the Stage to a specific **Competition** or **Court**.
    2.  **Queue View:** The controller displays a list of "Upcoming Matches" assigned to this court.
    3.  **Selection:** Operator clicks the next match in the list.
    4.  **Data Pre-population:** Team names, logos, seeds, and player names are automatically loaded from the database.
    5.  **Go Live:** The overlay updates to show the "Versus" screen, then the "Scoreboard".
    6.  **Scoring:** Can be scored directly in the controller OR synced from a separate umpire's device.

---

## 3. Key Features

### Persistent Connection
*   **Static URL:** The OBS Browser Source URL never changes (`/display/uuid`).
*   **Hot Swapping:** You can switch from a "Waiting Screen" to a "Match" to a "Commercial Break" instantly from the controller.

### Overlay States
The Controller allows toggling between different "Scenes" on the overlay:
1.  **Idle/Waiting:** "Stream Starting Soon" or Sponsor Loop.
2.  **Versus:** Full-screen graphic showing Team A vs Team B.
3.  **In-Game:** Standard scoreboard lower-third or corner bug.
4.  **Post-Match:** "Winner" graphic with final score.
5.  **Break:** "Be Right Back" / Ad insertion.

---

## 4. Proposed UI Layout

The `app/app/stage/[stagename]/page.tsx` will be rebuilt with a 3-column layout:

*   **Left (Queue):** List of Ad-hoc or Competition matches. Search bar to find a match.
*   **Center (Preview & Control):**
    *   Live Preview of the overlay (thumbnail).
    *   "Scene" buttons (Versus, Scoreboard, Break).
    *   Quick Score Controls (+1, -1 for each team).
*   **Right (Edit/Override):**
    *   Edit team names/colors on the fly.
    *   Toggle visible elements (Shot clock, Period, Sponsor Logos).
    *   "Push Update" button.

---

## 5. Roadmap

### Phase 1: Controller Foundation
- [ ] Build the "Ad-Hoc" interface: Manual entry of names/scores updates the `stages` table.
- [ ] Connect `app/display` to listen to `stages.currentMatchId` modifications.
- [ ] Implement basic Scene Switching (Idle vs Match).

### Phase 2: Competition Integration
- [ ] Build the "Match Queue" sidebar: Fetch scheduled matches from `matches` table.
- [ ] "Standardize" match data: Clicking a queue item fills the Ad-Hoc state with DB data.

### Phase 3: Advanced Features
- [ ] **Drag-and-Drop Queue:** Reorder matches on the fly.
- [ ] **Multi-Select:** Move multiple matches between courts.
- [ ] **Clip Generator:** "Create Highlight" button that timestamps the current match time.
- [ ] **Automated Commercials:** "Run Ad Break" button that cycles sponsor images for 30s then returns to game.

---

## 6. Technical Requirements
*   **Real-time:** Must use Convex subscriptions. Latency between Controller click and OBS update should be <100ms.
*   **Resilience:** If the Controller tab is closed, the Display/OBS MUST remain on the last known state (no black screens).
*   **Auth:** Controller requires Admin/Scorer permissions. Display URL is public (protected by obfuscated UUID token).
