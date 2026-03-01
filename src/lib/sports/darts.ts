// Darts Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface DartsState extends BaseMatchState {
  // Match format
  startingScore: number; // 501 or 301
  legsPerSet: number;
  setsToWin: number;
  
  // Set/Leg tracking
  team1Sets: number;
  team2Sets: number;
  team1Legs: number;
  team2Legs: number;
  
  // Current leg scores (remaining)
  team1Remaining: number;
  team2Remaining: number;
  
  // Current throw
  currentThrower: 1 | 2;
  dartsThrown: number;
  scoreThisTurn: number;
  
  // Checkout suggestions
  checkout: number | null;
  
  // Averages
  team1Average: number;
  team2Average: number;
  
  // 180s and high scores
  team1_180s: number;
  team2_180s: number;
  team1HighFinish: number;
  team2HighFinish: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): DartsState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    startingScore: 501,
    legsPerSet: 3,
    setsToWin: 3,
    team1Sets: 0,
    team2Sets: 0,
    team1Legs: 0,
    team2Legs: 0,
    team1Remaining: 501,
    team2Remaining: 501,
    currentThrower: 1,
    dartsThrown: 0,
    scoreThisTurn: 0,
    checkout: null,
    team1Average: 0,
    team2Average: 0,
    team1_180s: 0,
    team2_180s: 0,
    team1HighFinish: 0,
    team2HighFinish: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as DartsState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: DartsState, action: SportAction): DartsState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_THROW':
      return handleScoreThrow(newState, action.payload as { score: number; darts: number });
    case 'BUST':
      return handleBust(newState);
    case 'FINISH_LEG':
      return handleFinishLeg(newState);
    case 'NEXT_THROWER':
      return { ...newState, currentThrower: newState.currentThrower === 1 ? 2 : 1, dartsThrown: 0, scoreThisTurn: 0 };
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleScoreThrow(state: DartsState, payload: { score: number; darts: number }): DartsState {
  const newState = { ...state };
  const remaining = state.currentThrower === 1 ? state.team1Remaining : state.team2Remaining;
  const newRemaining = remaining - payload.score;
  
  // Check for bust
  if (newRemaining < 0 || newRemaining === 1) {
    return handleBust(newState);
  }
  
  // Track 180s
  if (payload.score === 180) {
    if (state.currentThrower === 1) newState.team1_180s++;
    else newState.team2_180s++;
  }
  
  // Update remaining
  if (state.currentThrower === 1) {
    newState.team1Remaining = newRemaining;
    newState.team1Score = state.startingScore - newRemaining;
  } else {
    newState.team2Remaining = newRemaining;
    newState.team2Score = state.startingScore - newRemaining;
  }
  
  newState.dartsThrown += payload.darts;
  newState.scoreThisTurn += payload.score;
  
  // Checkout suggestion
  newState.checkout = newRemaining <= 170 ? newRemaining : null;
  
  return newState;
}

function handleBust(state: DartsState): DartsState {
  return {
    ...state,
    dartsThrown: 0,
    scoreThisTurn: 0,
    currentThrower: state.currentThrower === 1 ? 2 : 1,
  };
}

function handleFinishLeg(state: DartsState): DartsState {
  const newState = { ...state };
  const winner = state.currentThrower;
  
  // High finish tracking
  if (state.currentThrower === 1) {
    newState.team1Legs++;
    if (state.scoreThisTurn > newState.team1HighFinish) {
      newState.team1HighFinish = state.scoreThisTurn;
    }
  } else {
    newState.team2Legs++;
    if (state.scoreThisTurn > newState.team2HighFinish) {
      newState.team2HighFinish = state.scoreThisTurn;
    }
  }
  
  // Check for set win
  if (newState.team1Legs >= state.legsPerSet) {
    newState.team1Sets++;
    newState.team1Legs = 0;
    newState.team2Legs = 0;
  } else if (newState.team2Legs >= state.legsPerSet) {
    newState.team2Sets++;
    newState.team1Legs = 0;
    newState.team2Legs = 0;
  }
  
  // Check for match win
  if (newState.team1Sets >= state.setsToWin) {
    newState.matchWinner = 1;
    newState.status = 'finished';
  } else if (newState.team2Sets >= state.setsToWin) {
    newState.matchWinner = 2;
    newState.status = 'finished';
  } else {
    // Reset for next leg
    newState.team1Remaining = state.startingScore;
    newState.team2Remaining = state.startingScore;
    newState.team1Score = 0;
    newState.team2Score = 0;
    newState.dartsThrown = 0;
    newState.scoreThisTurn = 0;
    newState.checkout = null;
    newState.currentThrower = winner;
  }
  
  return newState;
}

function getMatchSummary(state: DartsState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1Sets, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2Sets, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Player 1', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Van Gerwen' },
  { id: 'team2Name', type: 'text', label: 'Player 2', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Price' },
  { id: 'team1Remaining', type: 'score', label: 'Remaining 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Remaining', behaviorType: 'text' }, sample: 167 },
  { id: 'team2Remaining', type: 'score', label: 'Remaining 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Remaining', behaviorType: 'text' }, sample: 401 },
  { id: 'team1Sets', type: 'score', label: 'Sets 1', category: 'Sets', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1Sets', behaviorType: 'text' }, sample: 2 },
  { id: 'team2Sets', type: 'score', label: 'Sets 2', category: 'Sets', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2Sets', behaviorType: 'text' }, sample: 1 },
  { id: 'team1Legs', type: 'text', label: 'Legs 1', category: 'Legs', defaultProps: { fontSize: 24 }, dataBinding: { field: 'team1Legs', behaviorType: 'text' }, sample: 2 },
  { id: 'team2Legs', type: 'text', label: 'Legs 2', category: 'Legs', defaultProps: { fontSize: 24 }, dataBinding: { field: 'team2Legs', behaviorType: 'text' }, sample: 1 },
  { id: 'checkout', type: 'text', label: 'Checkout', category: 'Checkout', defaultProps: { fontSize: 18 }, dataBinding: { field: 'checkout', behaviorType: 'text' }, sample: 167 },
];

const dartsConfig: SportConfig<DartsState> = {
  id: 'darts',
  name: 'Darts',
  description: 'Darts scoring with 501/301, sets and legs, checkout suggestions',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(dartsConfig);

export type { DartsState }; export { dartsConfig };
