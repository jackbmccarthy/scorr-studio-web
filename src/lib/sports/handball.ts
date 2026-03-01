// Handball Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface HandballState extends BaseMatchState {
  // Halves
  currentHalf: number;
  halfLength: number;
  
  // Scores by half
  team1HalfScores: number[];
  team2HalfScores: number[];
  
  // Penalties
  team1Penalties: number;
  team2Penalties: number;
  
  // Timeouts
  team1Timeouts: number;
  team2Timeouts: number;
  maxTimeouts: number;
  
  // Cards
  team1YellowCards: number;
  team2YellowCards: number;
  team1TwoMinuteSuspensions: number;
  team2TwoMinuteSuspensions: number;
  team1RedCards: number;
  team2RedCards: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): HandballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentHalf: 1,
    halfLength: 1800, // 30 minutes
    team1HalfScores: [0, 0],
    team2HalfScores: [0, 0],
    team1Penalties: 0,
    team2Penalties: 0,
    team1Timeouts: 3,
    team2Timeouts: 3,
    maxTimeouts: 3,
    team1YellowCards: 0,
    team2YellowCards: 0,
    team1TwoMinuteSuspensions: 0,
    team2TwoMinuteSuspensions: 0,
    team1RedCards: 0,
    team2RedCards: 0,
    matchWinner: null,
    clock: { seconds: 1800, isRunning: false, direction: 'down' },
    period: 1,
  } as HandballState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: HandballState, action: SportAction): HandballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      newState.team1Score++;
      return newState;
    case 'SCORE_TEAM2':
      newState.team2Score++;
      return newState;
    case 'PENALTY_TEAM1':
      newState.team1Penalties++;
      return newState;
    case 'PENALTY_TEAM2':
      newState.team2Penalties++;
      return newState;
    case 'TIMEOUT_TEAM1':
      return { ...newState, team1Timeouts: Math.max(0, state.team1Timeouts - 1) };
    case 'TIMEOUT_TEAM2':
      return { ...newState, team2Timeouts: Math.max(0, state.team2Timeouts - 1) };
    case 'YELLOW_CARD_TEAM1':
      newState.team1YellowCards++;
      return newState;
    case 'YELLOW_CARD_TEAM2':
      newState.team2YellowCards++;
      return newState;
    case 'TWO_MINUTE_TEAM1':
      newState.team1TwoMinuteSuspensions++;
      return newState;
    case 'TWO_MINUTE_TEAM2':
      newState.team2TwoMinuteSuspensions++;
      return newState;
    case 'RED_CARD_TEAM1':
      newState.team1RedCards++;
      return newState;
    case 'RED_CARD_TEAM2':
      newState.team2RedCards++;
      return newState;
    case 'NEXT_HALF':
      return handleNextHalf(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleNextHalf(state: HandballState): HandballState {
  const newState = { ...state };
  
  if (state.currentHalf === 1) {
    newState.team1HalfScores[0] = state.team1Score;
    newState.team2HalfScores[0] = state.team2Score;
    newState.currentHalf = 2;
    newState.period = 2;
    newState.clock = { ...state.clock, seconds: state.halfLength };
  } else {
    newState.status = 'finished';
    if (state.team1Score !== state.team2Score) {
      newState.matchWinner = state.team1Score > state.team2Score ? 1 : 2;
    }
  }
  
  return newState;
}

function getMatchSummary(state: HandballState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Denmark' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'France' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 28 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 25 },
  { id: 'half', type: 'text', label: 'Half', category: 'Period', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentHalf', behaviorType: 'text', formatter: '{value}st Half' }, sample: 2 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 1234 },
];

const handballConfig: SportConfig<HandballState> = {
  id: 'handball',
  name: 'Handball',
  description: 'Handball scoring with halves, penalties, and card system',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(handballConfig);

export type { HandballState }; export { handballConfig };
