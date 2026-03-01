# Supported Sports

Scorr Studio V2 supports 20+ sports with custom scoring logic for each.

## All Supported Sports

| Sport | ID | Type | Scoring Style |
|-------|-----|------|---------------|
| Table Tennis | `table-tennis` | Game-based | Best of 3/5/7 games to 11 |
| Tennis | `tennis` | Set-based | Best of 3/5 sets |
| Badminton | `badminton` | Game-based | Best of 3 games to 21 |
| Pickleball | `pickleball` | Game-based | Best of 3/5 games to 11 |
| Squash | `squash` | Game-based | Best of 5 games to 11 |
| Padel | `padel` | Set-based | Best of 3 sets |
| Basketball | `basketball` | Timed | 4 quarters, running score |
| Soccer | `soccer` | Timed | 2 halves, running score |
| Volleyball | `volleyball` | Set-based | Best of 5 sets to 25 |
| Handball | `handball` | Timed | 2 halves, running score |
| Field Hockey | `field-hockey` | Timed | 4 quarters, running score |
| Ice Hockey | `ice-hockey` | Timed | 3 periods, running score |
| American Football | `american-football` | Timed | 4 quarters, variable points |
| Baseball | `baseball` | Innings | 9 innings, runs |
| Cricket | `cricket` | Innings | Overs and wickets |
| Rugby | `rugby` | Timed | 2 halves, variable points |
| Snooker | `snooker` | Frame-based | Best of N frames |
| Darts | `darts` | Leg-based | Best of N legs, 501 |
| Boxing | `boxing` | Round-based | Judges scoring |
| MMA | `mma` | Round-based | Judges scoring |

---

## Game-Based Sports (Racquet Sports)

These sports use a game-based scoring system where players score points to win games, and games to win matches.

### Table Tennis

**Scoring Rules:**
- Games to 11 points (must win by 2)
- Best of 5 or 7 games (configurable)
- Serve changes every 2 points
- Deuce rules apply at 10-10

**Actions:**
| Action | Effect |
|--------|--------|
| `SCORE_TEAM1` | Add point to player 1 |
| `SCORE_TEAM2` | Add point to player 2 |
| `TIMEOUT_TEAM1` | Player 1 calls timeout |
| `TIMEOUT_TEAM2` | Player 2 calls timeout |
| `SWITCH_SERVER` | Change serving player |

**State Object:**
```typescript
interface TableTennisState {
  bestOf: number;           // 3, 5, or 7
  pointsToWin: number;      // 11 (standard) or 21
  team1Games: number[];     // Score per game
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  currentGame: number;
  currentServer: 1 | 2;
  servesPerPlayer: number;  // 2 (standard)
  inDeuce: boolean;
  team1Timeouts: number;
  team2Timeouts: number;
  timeoutActive: boolean;
}
```

### Tennis

**Scoring Rules:**
- Points: 0, 15, 30, 40, Game
- Deuce at 40-40, advantage after
- Sets to 6 games (must win by 2)
- Tiebreak at 6-6 (7 points)
- Best of 3 or 5 sets

**Special:**
- No-ad scoring option (sudden death at deuce)
- Super tiebreak for final set (10 points)

**Actions:**
| Action | Effect |
|--------|--------|
| `SCORE_TEAM1` | Add point to player 1 |
| `SCORE_TEAM2` | Add point to player 2 |
| `TIMEOUT` | 90-second break |

### Badminton

**Scoring Rules:**
- Games to 21 points (must win by 2)
- Best of 3 games
- 30-point cap (first to 30 wins at 29-29)
- Interval at 11 points (60 seconds)

**State Object:**
```typescript
interface BadmintonState {
  bestOf: number;           // 3
  pointsToWin: number;      // 21
  team1Games: number[];
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  currentGame: number;
  currentServer: 1 | 2;
  atInterval: boolean;      // 11-point break
}
```

### Pickleball

**Scoring Rules:**
- Games to 11 points (must win by 2)
- Best of 3 games (recreational) or 5 (tournament)
- Only serving team can score
- Serve from right court if score even, left if odd

**Special:**
- Kitchen line enforcement
- Double bounce rule

### Squash

**Scoring Rules:**
- Games to 11 points
- Best of 5 games
- Point-a-rally (PAR) scoring
- Set 1 or 2 at 10-10 (receiver chooses)

---

## Set-Based Sports

### Volleyball

**Scoring Rules:**
- Sets to 25 points (must win by 2)
- Best of 5 sets
- 5th set to 15 points
- Rally scoring (point on every serve)

**State Object:**
```typescript
interface VolleyballState {
  bestOf: number;           // 5
  pointsToWin: number;      // 25 (15 for 5th set)
  team1Sets: number[];
  team2Sets: number[];
  team1SetsWon: number;
  team2SetsWon: number;
  currentSet: number;
  team1Timeouts: number;    // 2 per set
  team2Timeouts: number;
}
```

---

## Timed Sports

These sports use a running clock with fixed periods.

### Basketball

**Scoring Rules:**
- 4 quarters (12 min NBA, 10 min FIBA)
- 2 or 3 points per basket
- Free throws = 1 point
- Overtime: 5 minutes

**Actions:**
| Action | Effect |
|--------|--------|
| `SCORE_TEAM1` | Add 1, 2, or 3 points |
| `FOUL_TEAM1` | Record foul |
| `TIMEOUT` | Call timeout |
| `NEXT_QUARTER` | Advance to next period |
| `START_CLOCK` | Start game clock |
| `STOP_CLOCK` | Stop game clock |
| `RESET_SHOT_CLOCK` | Reset 24-second clock |

**State Object:**
```typescript
interface BasketballState {
  currentQuarter: number;   // 1-4 (+ OT)
  totalQuarters: number;
  quarterLength: number;    // seconds (720 = 12 min)
  team1QuarterScores: number[];
  team2QuarterScores: number[];
  team1Fouls: number;
  team2Fouls: number;
  team1Bonus: boolean;      // 5+ fouls per quarter
  team2Bonus: boolean;
  team1Timeouts: number;    // 7 per game
  team2Timeouts: number;
  shotClock: number;        // 24 seconds
  shotClockRunning: boolean;
  inOvertime: boolean;
}
```

### Soccer (Football)

**Scoring Rules:**
- 2 halves of 45 minutes
- 1 point per goal
- Stoppage time added

**State Object:**
```typescript
interface SoccerState {
  currentHalf: number;      // 1 or 2
  halfLength: number;       // seconds (2700 = 45 min)
  team1Goals: number;
  team2Goals: number;
  team1Corners: number;
  team2Corners: number;
  team1YellowCards: number;
  team2YellowCards: number;
  team1RedCards: number;
  team2RedCards: number;
  addedTime: number;        // Stoppage time
}
```

### Ice Hockey

**Scoring Rules:**
- 3 periods of 20 minutes
- 1 point per goal
- Overtime/shootout for ties

**Special:**
- Power plays tracked
- Penalty box management

### American Football

**Scoring Rules:**
- 4 quarters of 15 minutes
- Touchdown = 6 points
- Extra point = 1 point
- 2-point conversion = 2 points
- Field goal = 3 points
- Safety = 2 points

### Rugby

**Scoring Rules:**
- 2 halves of 40 minutes
- Try = 5 points
- Conversion = 2 points
- Penalty kick = 3 points
- Drop goal = 3 points

---

## Innings-Based Sports

### Baseball

**Scoring Rules:**
- 9 innings
- Top and bottom of each inning
- 3 outs per half-inning

**State Object:**
```typescript
interface BaseballState {
  currentInning: number;    // 1-9
  isTopInning: boolean;
  team1Runs: number;        // Away team
  team2Runs: number;        // Home team
  team1Hits: number;
  team2Hits: number;
  team1Errors: number;
  team2Errors: number;
  outs: number;             // 0-3
  balls: number;            // 0-4
  strikes: number;          // 0-3
  runnersOnBase: number[];  // [1st, 2nd, 3rd]
}
```

### Cricket

**Scoring Rules:**
- Variable overs (T20: 20, ODI: 50, Test: unlimited)
- Runs scored by running or boundaries
- 6 balls per over
- 10 wickets per innings

**State Object:**
```typescript
interface CricketState {
  format: 't20' | 'odi' | 'test';
  totalOvers: number;
  currentInnings: number;   // 1 or 2
  team1Runs: number;
  team2Runs: number;
  team1Wickets: number;     // 0-10
  team2Wickets: number;
  currentOver: number;
  currentBall: number;      // 0-6
  target: number;           // Second innings chase
  runRate: number;
  requiredRunRate: number;
}
```

---

## Frame/Leg-Based Sports

### Snooker

**Scoring Rules:**
- Best of N frames
- Points: Red (1), Yellow (2), Green (3), Brown (4), Blue (5), Pink (6), Black (7)
- Must alternate red-color until reds cleared
- Maximum break: 147

**State Object:**
```typescript
interface SnookerState {
  bestOf: number;           // Frames
  team1FramesWon: number;
  team2FramesWon: number;
  currentFrame: number;
  team1FrameScore: number;
  team2FrameScore: number;
  redsRemaining: number;    // 15 max
  currentBreak: number;
  highestBreak: number;
}
```

### Darts

**Scoring Rules:**
- Best of N legs
- Start at 501, subtract to 0
- Must finish on a double (or bullseye)
- Bust if score goes below 0 or leaves 1

**Actions:**
| Action | Effect |
|--------|--------|
| `SCORE` | Enter score (subtract from total) |
| `BUST` | Score too high, reset turn |
| `NEXT_LEG` | Winner takes leg |

**State Object:**
```typescript
interface DartsState {
  bestOf: number;           // Legs
  team1LegsWon: number;
  team2LegsWon: number;
  team1Score: number;       // Counts down from 501
  team2Score: number;
  currentThrow: 1 | 2;
  dartsThrown: number;      // 0-3 per turn
  checkoutPossible: boolean;
}
```

---

## Combat Sports

### Boxing

**Scoring Rules:**
- Rounds (typically 12 for title fights)
- 10-point must system per round
- Winner gets 10, loser 9 or less
- Knockdowns reduce score

**State Object:**
```typescript
interface BoxingState {
  totalRounds: number;
  currentRound: number;
  roundLength: number;      // seconds (180 = 3 min)
  team1Scorecards: number[];
  team2Scorecards: number[];
  team1Knockdowns: number;
  team2Knockdowns: number;
  team1Warnings: number;
  team2Warnings: number;
  result: 'decision' | 'ko' | 'tko' | 'draw' | null;
}
```

### MMA

**Scoring Rules:**
- 3 rounds (5 for title fights)
- 5 minutes per round
- 10-point must system
- Can end by KO, TKO, submission, or decision

---

## Adding a New Sport

To add a new sport, create a file in `src/lib/sports/[sport-id].ts`:

```typescript
import { registerSport, createBaseMatchState } from './registry';
import type { SportConfig, BaseMatchState } from '../types';

interface MySportState extends BaseMatchState {
  // Sport-specific state
}

function getInitialState(data?: InitialStateData): MySportState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    // Initialize sport-specific fields
  };
}

function handleAction(state: MySportState, action: SportAction): MySportState {
  switch (action.type) {
    case 'SCORE_TEAM1':
      // Handle scoring
    default:
      return state;
  }
}

const mySportConfig: SportConfig<MySportState> = {
  id: 'my-sport',
  name: 'My Sport',
  description: 'Description of the sport',
  initialState: getInitialState(),
  getInitialState,
  createMatch: (params) => createBaseMatch(params, getInitialState()),
  getMatchSummary: (state) => createBaseMatchSummary(state),
  handleAction,
  konvaConfig: {
    blocks: [], // Define display blocks
  },
};

registerSport(mySportConfig);
```

Then import it in `src/lib/sports/index.ts`.
