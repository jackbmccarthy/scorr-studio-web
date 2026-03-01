// Snooker Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface SnookerState extends BaseMatchState {
  // Match format
  bestOf: number; // Best of N frames
  
  // Frame scores
  team1Frames: number;
  team2Frames: number;
  
  // Current frame
  team1Points: number;
  team2Points: number;
  
  // Break tracking
  currentBreak: number;
  highestBreak: number;
  breakPlayer: 1 | 2 | null;
  
  // Ball colors remaining
  redsRemaining: number;
  colorsRemaining: ('yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black')[];
  
  // Score breakdown
  team1Centuries: number;
  team2Centuries: number;
  team1Maximums: number;
  team2Maximums: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): SnookerState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 9,
    team1Frames: 0,
    team2Frames: 0,
    team1Points: 0,
    team2Points: 0,
    currentBreak: 0,
    highestBreak: 0,
    breakPlayer: null,
    redsRemaining: 15,
    colorsRemaining: ['yellow', 'green', 'brown', 'blue', 'pink', 'black'],
    team1Centuries: 0,
    team2Centuries: 0,
    team1Maximums: 0,
    team2Maximums: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as SnookerState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

const BALL_VALUES: Record<string, number> = {
  red: 1, yellow: 2, green: 3, brown: 4, blue: 5, pink: 6, black: 7,
};

function handleAction(state: SnookerState, action: SportAction): SnookerState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'POT_BALL':
      return handlePotBall(newState, action.payload as { team: 1 | 2; ball: string });
    case 'END_BREAK':
      return handleEndBreak(newState);
    case 'WIN_FRAME':
      return handleWinFrame(newState, action.payload as 1 | 2);
    case 'CONCEDE_FRAME':
      return handleWinFrame(newState, action.payload === 1 ? 2 : 1);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handlePotBall(state: SnookerState, payload: { team: 1 | 2; ball: string }): SnookerState {
  const newState = { ...state };
  const points = BALL_VALUES[payload.ball] || 0;
  
  if (payload.team === 1) {
    newState.team1Points += points;
    newState.team1Score = newState.team1Points;
  } else {
    newState.team2Points += points;
    newState.team2Score = newState.team2Points;
  }
  
  // Update break
  if (newState.breakPlayer === payload.team || newState.breakPlayer === null) {
    newState.breakPlayer = payload.team;
    newState.currentBreak += points;
    if (newState.currentBreak > newState.highestBreak) {
      newState.highestBreak = newState.currentBreak;
    }
  }
  
  // Track balls remaining
  if (payload.ball === 'red') {
    newState.redsRemaining = Math.max(0, newState.redsRemaining - 1);
  }
  
  // Track centuries and maximums
  if (newState.currentBreak >= 100 && newState.currentBreak < 147) {
    if (payload.team === 1) newState.team1Centuries++;
    else newState.team2Centuries++;
  }
  if (newState.currentBreak === 147) {
    if (payload.team === 1) newState.team1Maximums++;
    else newState.team2Maximums++;
  }
  
  return newState;
}

function handleEndBreak(state: SnookerState): SnookerState {
  return { ...state, currentBreak: 0, breakPlayer: null };
}

function handleWinFrame(state: SnookerState, team: 1 | 2): SnookerState {
  const newState = { ...state };
  
  if (team === 1) newState.team1Frames++;
  else newState.team2Frames++;
  
  const framesToWin = Math.ceil(newState.bestOf / 2);
  if (newState.team1Frames >= framesToWin) {
    newState.matchWinner = 1;
    newState.status = 'finished';
  } else if (newState.team2Frames >= framesToWin) {
    newState.matchWinner = 2;
    newState.status = 'finished';
  } else {
    // Reset for next frame
    newState.team1Points = 0;
    newState.team2Points = 0;
    newState.team1Score = 0;
    newState.team2Score = 0;
    newState.currentBreak = 0;
    newState.breakPlayer = null;
    newState.redsRemaining = 15;
    newState.colorsRemaining = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  }
  
  return newState;
}

function getMatchSummary(state: SnookerState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1Frames, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2Frames, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Player 1', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'O\'Sullivan' },
  { id: 'team2Name', type: 'text', label: 'Player 2', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Selby' },
  { id: 'team1Points', type: 'score', label: 'Points 1', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team1Points', behaviorType: 'text' }, sample: 87 },
  { id: 'team2Points', type: 'score', label: 'Points 2', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team2Points', behaviorType: 'text' }, sample: 45 },
  { id: 'team1Frames', type: 'score', label: 'Frames 1', category: 'Frames', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1Frames', behaviorType: 'text' }, sample: 4 },
  { id: 'team2Frames', type: 'score', label: 'Frames 2', category: 'Frames', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2Frames', behaviorType: 'text' }, sample: 3 },
  { id: 'currentBreak', type: 'text', label: 'Break', category: 'Break', defaultProps: { fontSize: 24 }, dataBinding: { field: 'currentBreak', behaviorType: 'text' }, sample: 67 },
];

const snookerConfig: SportConfig<SnookerState> = {
  id: 'snooker',
  name: 'Snooker',
  description: 'Snooker scoring with frame tracking, break scores, and century/maximum tracking',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(snookerConfig);

export type { SnookerState }; export { snookerConfig };
