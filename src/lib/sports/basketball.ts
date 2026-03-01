// Basketball Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface BasketballState extends BaseMatchState {
  // Quarters
  currentQuarter: number;
  totalQuarters: number;
  quarterLength: number; // seconds
  
  // Scores per quarter
  team1QuarterScores: number[];
  team2QuarterScores: number[];
  
  // Fouls
  team1Fouls: number;
  team2Fouls: number;
  team1Bonus: boolean;
  team2Bonus: boolean;
  foulsForBonus: number;
  
  // Timeouts
  team1Timeouts: number;
  team2Timeouts: number;
  maxTimeouts: number;
  timeoutActive: boolean;
  
  // Shot clock
  shotClock: number;
  shotClockLength: number;
  shotClockRunning: boolean;
  
  // Overtime
  inOvertime: boolean;
  overtimeLength: number;
}

function getInitialState(data?: InitialStateData): BasketballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentQuarter: 1,
    totalQuarters: 4,
    quarterLength: 720, // 12 minutes
    team1QuarterScores: [0, 0, 0, 0],
    team2QuarterScores: [0, 0, 0, 0],
    team1Fouls: 0,
    team2Fouls: 0,
    team1Bonus: false,
    team2Bonus: false,
    foulsForBonus: 5,
    team1Timeouts: 7,
    team2Timeouts: 7,
    maxTimeouts: 7,
    timeoutActive: false,
    shotClock: 24,
    shotClockLength: 24,
    shotClockRunning: false,
    inOvertime: false,
    overtimeLength: 300, // 5 minutes
    clock: {
      seconds: 720,
      isRunning: false,
      direction: 'down',
    },
  } as BasketballState;
}

function createMatch(params: CreateMatchParams) {
  const state = getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  });
  return createBaseMatch(params, state);
}

function handleAction(state: BasketballState, action: SportAction): BasketballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return { ...newState, team1Score: newState.team1Score + ((action.payload as number) || 1) };
    case 'SCORE_TEAM2':
      return { ...newState, team2Score: newState.team2Score + ((action.payload as number) || 1) };
    case 'FOUL_TEAM1':
      return handleFoul(newState, 1);
    case 'FOUL_TEAM2':
      return handleFoul(newState, 2);
    case 'TIMEOUT_TEAM1':
      return { ...newState, team1Timeouts: Math.max(0, newState.team1Timeouts - 1), timeoutActive: true };
    case 'TIMEOUT_TEAM2':
      return { ...newState, team2Timeouts: Math.max(0, newState.team2Timeouts - 1), timeoutActive: true };
    case 'END_TIMEOUT':
      return { ...newState, timeoutActive: false };
    case 'NEXT_QUARTER':
      return handleNextQuarter(newState);
    case 'START_CLOCK':
      return { ...newState, clock: { ...newState.clock, isRunning: true }, shotClockRunning: true };
    case 'STOP_CLOCK':
      return { ...newState, clock: { ...newState.clock, isRunning: false }, shotClockRunning: false };
    case 'RESET_SHOT_CLOCK':
      return { ...newState, shotClock: newState.shotClockLength };
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleFoul(state: BasketballState, team: 1 | 2): BasketballState {
  if (team === 1) {
    const fouls = state.team1Fouls + 1;
    return { ...state, team1Fouls: fouls, team1Bonus: fouls >= state.foulsForBonus };
  } else {
    const fouls = state.team2Fouls + 1;
    return { ...state, team2Fouls: fouls, team2Bonus: fouls >= state.foulsForBonus };
  }
}

function handleNextQuarter(state: BasketballState): BasketballState {
  if (state.currentQuarter < state.totalQuarters) {
    return {
      ...state,
      currentQuarter: state.currentQuarter + 1,
      period: state.currentQuarter + 1,
      clock: { ...state.clock, seconds: state.quarterLength },
      shotClock: state.shotClockLength,
      team1Fouls: 0,
      team2Fouls: 0,
      team1Bonus: false,
      team2Bonus: false,
    };
  }
  return state;
}

function getMatchSummary(state: BasketballState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Lakers' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Celtics' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 98 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 102 },
  { id: 'quarter', type: 'text', label: 'Quarter', category: 'Period', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentQuarter', behaviorType: 'text', formatter: 'Q{value}' }, sample: 4 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Period', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 423 },
  { id: 'shotClock', type: 'timer', label: 'Shot Clock', category: 'Period', defaultProps: { format: 'SS' }, dataBinding: { field: 'shotClock', behaviorType: 'countdown' }, sample: 14 },
  { id: 'team1Fouls', type: 'text', label: 'Fouls 1', category: 'Fouls', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team1Fouls', behaviorType: 'text' }, sample: 4 },
  { id: 'team2Fouls', type: 'text', label: 'Fouls 2', category: 'Fouls', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team2Fouls', behaviorType: 'text' }, sample: 3 },
  { id: 'team1Timeouts', type: 'text', label: 'TO 1', category: 'Timeouts', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team1Timeouts', behaviorType: 'text' }, sample: 3 },
  { id: 'team2Timeouts', type: 'text', label: 'TO 2', category: 'Timeouts', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team2Timeouts', behaviorType: 'text' }, sample: 2 },
];

const basketballConfig: SportConfig<BasketballState> = {
  id: 'basketball',
  name: 'Basketball',
  description: 'Basketball scoring with quarters, fouls, shot clock, and timeouts',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(basketballConfig);

export type { BasketballState }; export { basketballConfig };
