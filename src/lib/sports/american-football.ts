// American Football Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface AmericanFootballState extends BaseMatchState {
  // Quarters
  currentQuarter: number;
  quarterLength: number;
  
  // Scores by type
  team1Touchdowns: number;
  team1ExtraPoints: number;
  team1FieldGoals: number;
  team1Safeties: number;
  team2Touchdowns: number;
  team2ExtraPoints: number;
  team2FieldGoals: number;
  team2Safeties: number;
  
  // Possession
  possession: 1 | 2;
  
  // Down and distance
  down: 1 | 2 | 3 | 4;
  yardsToGo: number;
  ballOn: number; // Yard line
  
  // Timeout
  team1Timeouts: number;
  team2Timeouts: number;
  
  // Overtime
  inOvertime: boolean;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): AmericanFootballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentQuarter: 1,
    quarterLength: 900, // 15 minutes
    team1Touchdowns: 0,
    team1ExtraPoints: 0,
    team1FieldGoals: 0,
    team1Safeties: 0,
    team2Touchdowns: 0,
    team2ExtraPoints: 0,
    team2FieldGoals: 0,
    team2Safeties: 0,
    possession: 1,
    down: 1,
    yardsToGo: 10,
    ballOn: 25,
    team1Timeouts: 3,
    team2Timeouts: 3,
    inOvertime: false,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 900, isRunning: false, direction: 'down' },
  } as AmericanFootballState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: AmericanFootballState, action: SportAction): AmericanFootballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'TOUCHDOWN':
      return handleTouchdown(newState, action.payload as 1 | 2);
    case 'EXTRA_POINT':
      return handleExtraPoint(newState, action.payload as { team: 1 | 2; made: boolean });
    case 'FIELD_GOAL':
      return handleFieldGoal(newState, action.payload as 1 | 2);
    case 'SAFETY':
      return handleSafety(newState, action.payload as 1 | 2);
    case 'FIRST_DOWN':
      return { ...newState, down: 1, yardsToGo: 10 };
    case 'NEXT_DOWN':
      return handleNextDown(newState, action.payload as number);
    case 'TURNOVER':
      return handleTurnover(newState);
    case 'TIMEOUT_TEAM1':
      return { ...newState, team1Timeouts: Math.max(0, state.team1Timeouts - 1) };
    case 'TIMEOUT_TEAM2':
      return { ...newState, team2Timeouts: Math.max(0, state.team2Timeouts - 1) };
    case 'NEXT_QUARTER':
      return handleNextQuarter(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleTouchdown(state: AmericanFootballState, team: 1 | 2): AmericanFootballState {
  const newState = { ...state };
  
  if (team === 1) {
    newState.team1Touchdowns++;
    newState.team1Score += 6;
  } else {
    newState.team2Touchdowns++;
    newState.team2Score += 6;
  }
  
  newState.down = 1;
  newState.yardsToGo = 10;
  
  return newState;
}

function handleExtraPoint(state: AmericanFootballState, payload: { team: 1 | 2; made: boolean }): AmericanFootballState {
  const newState = { ...state };
  
  if (payload.made) {
    if (payload.team === 1) {
      newState.team1ExtraPoints++;
      newState.team1Score++;
    } else {
      newState.team2ExtraPoints++;
      newState.team2Score++;
    }
  }
  
  return newState;
}

function handleFieldGoal(state: AmericanFootballState, team: 1 | 2): AmericanFootballState {
  const newState = { ...state };
  
  if (team === 1) {
    newState.team1FieldGoals++;
    newState.team1Score += 3;
  } else {
    newState.team2FieldGoals++;
    newState.team2Score += 3;
  }
  
  newState.down = 1;
  newState.yardsToGo = 10;
  
  return newState;
}

function handleSafety(state: AmericanFootballState, team: 1 | 2): AmericanFootballState {
  const newState = { ...state };
  
  // Safety scores for the defensive team
  if (team === 1) {
    newState.team2Safeties++;
    newState.team2Score += 2;
  } else {
    newState.team1Safeties++;
    newState.team1Score += 2;
  }
  
  return newState;
}

function handleNextDown(state: AmericanFootballState, yardsGained: number): AmericanFootballState {
  const newState = { ...state };
  newState.yardsToGo -= yardsGained;
  newState.ballOn += yardsGained;
  
  if (newState.yardsToGo <= 0) {
    newState.down = 1;
    newState.yardsToGo = 10;
  } else if (state.down < 4) {
    newState.down = (state.down + 1) as 1 | 2 | 3 | 4;
  } else {
    // Turnover on downs
    return handleTurnover(newState);
  }
  
  return newState;
}

function handleTurnover(state: AmericanFootballState): AmericanFootballState {
  const newState = { ...state };
  newState.possession = state.possession === 1 ? 2 : 1;
  newState.down = 1;
  newState.yardsToGo = 10;
  newState.ballOn = 100 - state.ballOn;
  
  return newState;
}

function handleNextQuarter(state: AmericanFootballState): AmericanFootballState {
  const newState = { ...state };
  
  if (state.currentQuarter < 4) {
    newState.currentQuarter++;
    newState.period = newState.currentQuarter;
    newState.clock = { ...state.clock, seconds: state.quarterLength };
  } else if (state.team1Score === state.team2Score) {
    newState.inOvertime = true;
  } else {
    newState.status = 'finished';
    newState.matchWinner = state.team1Score > state.team2Score ? 1 : 2;
  }
  
  return newState;
}

function getMatchSummary(state: AmericanFootballState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Chiefs' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: '49ers' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 28 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 24 },
  { id: 'quarter', type: 'text', label: 'Quarter', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentQuarter', behaviorType: 'text', formatter: 'Q{value}' }, sample: 4 },
  { id: 'down', type: 'text', label: 'Down', category: 'Down', defaultProps: { fontSize: 24 }, dataBinding: { field: 'down', behaviorType: 'text', formatter: '{value}&' }, sample: 3 },
  { id: 'yardsToGo', type: 'text', label: 'To Go', category: 'Down', defaultProps: { fontSize: 24 }, dataBinding: { field: 'yardsToGo', behaviorType: 'text' }, sample: 7 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 543 },
];

const americanFootballConfig: SportConfig<AmericanFootballState> = {
  id: 'american-football',
  name: 'American Football',
  description: 'American football scoring with downs, yards, and quarters',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(americanFootballConfig);

export type { AmericanFootballState }; export { americanFootballConfig };
