// Rugby Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface RugbyState extends BaseMatchState {
  // Halves
  currentHalf: number;
  halfLength: number;
  
  // Score breakdown
  team1Tries: number;
  team2Tries: number;
  team1Conversions: number;
  team2Conversions: number;
  team1Penalties: number;
  team2Penalties: number;
  team1DropGoals: number;
  team2DropGoals: number;
  
  // Sin Bin
  team1SinBin: number;
  team2SinBin: number;
  
  // Cards
  team1YellowCards: number;
  team2YellowCards: number;
  team1RedCards: number;
  team2RedCards: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): RugbyState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentHalf: 1,
    halfLength: 2400, // 40 minutes
    team1Tries: 0,
    team2Tries: 0,
    team1Conversions: 0,
    team2Conversions: 0,
    team1Penalties: 0,
    team2Penalties: 0,
    team1DropGoals: 0,
    team2DropGoals: 0,
    team1SinBin: 0,
    team2SinBin: 0,
    team1YellowCards: 0,
    team2YellowCards: 0,
    team1RedCards: 0,
    team2RedCards: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 2400, isRunning: false, direction: 'down' },
    period: 1,
  } as RugbyState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: RugbyState, action: SportAction): RugbyState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'TRY_TEAM1':
      newState.team1Tries++;
      newState.team1Score += 5;
      return newState;
    case 'TRY_TEAM2':
      newState.team2Tries++;
      newState.team2Score += 5;
      return newState;
    case 'CONVERSION_TEAM1':
      newState.team1Conversions++;
      newState.team1Score += 2;
      return newState;
    case 'CONVERSION_TEAM2':
      newState.team2Conversions++;
      newState.team2Score += 2;
      return newState;
    case 'PENALTY_TEAM1':
      newState.team1Penalties++;
      newState.team1Score += 3;
      return newState;
    case 'PENALTY_TEAM2':
      newState.team2Penalties++;
      newState.team2Score += 3;
      return newState;
    case 'DROP_GOAL_TEAM1':
      newState.team1DropGoals++;
      newState.team1Score += 3;
      return newState;
    case 'DROP_GOAL_TEAM2':
      newState.team2DropGoals++;
      newState.team2Score += 3;
      return newState;
    case 'YELLOW_CARD_TEAM1':
      newState.team1YellowCards++;
      newState.team1SinBin++;
      return newState;
    case 'YELLOW_CARD_TEAM2':
      newState.team2YellowCards++;
      newState.team2SinBin++;
      return newState;
    case 'RED_CARD_TEAM1':
      newState.team1RedCards++;
      return newState;
    case 'RED_CARD_TEAM2':
      newState.team2RedCards++;
      return newState;
    case 'SIN_BIN_END_TEAM1':
      newState.team1SinBin = Math.max(0, state.team1SinBin - 1);
      return newState;
    case 'SIN_BIN_END_TEAM2':
      newState.team2SinBin = Math.max(0, state.team2SinBin - 1);
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

function handleNextHalf(state: RugbyState): RugbyState {
  if (state.currentHalf === 1) {
    return {
      ...state,
      currentHalf: 2,
      period: 2,
      clock: { ...state.clock, seconds: state.halfLength },
    };
  }
  return { ...state, status: 'finished' };
}

function getMatchSummary(state: RugbyState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'All Blacks' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Springboks' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 28 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 24 },
  { id: 'team1Tries', type: 'text', label: 'Tries 1', category: 'Tries', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team1Tries', behaviorType: 'text' }, sample: 3 },
  { id: 'team2Tries', type: 'text', label: 'Tries 2', category: 'Tries', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team2Tries', behaviorType: 'text' }, sample: 2 },
  { id: 'half', type: 'text', label: 'Half', category: 'Period', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentHalf', behaviorType: 'text', formatter: '{value}st Half' }, sample: 2 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 1845 },
];

const rugbyConfig: SportConfig<RugbyState> = {
  id: 'rugby',
  name: 'Rugby',
  description: 'Rugby scoring with tries, conversions, penalties, and sin bin',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(rugbyConfig);

export type { RugbyState }; export { rugbyConfig };
