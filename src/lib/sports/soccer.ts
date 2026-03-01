// Soccer Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface SoccerState extends BaseMatchState {
  // Halves
  currentHalf: number;
  totalHalves: number;
  halfLength: number; // seconds
  
  // Injury time
  injuryTime: number;
  injuryTimeAdded: boolean;
  
  // Cards
  team1YellowCards: number;
  team1RedCards: number;
  team2YellowCards: number;
  team2RedCards: number;
  
  // Substitutions
  team1Subs: number;
  team2Subs: number;
  maxSubs: number;
  
  // Penalty shootout (if applicable)
  inPenaltyShootout: boolean;
  team1PenaltyGoals: number;
  team2PenaltyGoals: number;
  team1PenaltyAttempts: number;
  team2PenaltyAttempts: number;
  currentPenaltyTaker: 1 | 2;
  
  // Extra time
  inExtraTime: boolean;
  extraTimeHalf: number;
  extraTimeLength: number;
}

function getInitialState(data?: InitialStateData): SoccerState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentHalf: 1,
    totalHalves: 2,
    halfLength: 2700, // 45 minutes
    injuryTime: 0,
    injuryTimeAdded: false,
    team1YellowCards: 0,
    team1RedCards: 0,
    team2YellowCards: 0,
    team2RedCards: 0,
    team1Subs: 0,
    team2Subs: 0,
    maxSubs: 5,
    inPenaltyShootout: false,
    team1PenaltyGoals: 0,
    team2PenaltyGoals: 0,
    team1PenaltyAttempts: 0,
    team2PenaltyAttempts: 0,
    currentPenaltyTaker: 1,
    inExtraTime: false,
    extraTimeHalf: 0,
    extraTimeLength: 900, // 15 minutes
    clock: {
      seconds: 0,
      isRunning: false,
      direction: 'up',
    },
    period: 1,
  } as SoccerState;
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

function handleAction(state: SoccerState, action: SportAction): SoccerState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return { ...newState, team1Score: newState.team1Score + 1 };
    case 'SCORE_TEAM2':
      return { ...newState, team2Score: newState.team2Score + 1 };
    case 'YELLOW_CARD_TEAM1':
      return { ...newState, team1YellowCards: newState.team1YellowCards + 1 };
    case 'YELLOW_CARD_TEAM2':
      return { ...newState, team2YellowCards: newState.team2YellowCards + 1 };
    case 'RED_CARD_TEAM1':
      return { ...newState, team1RedCards: newState.team1RedCards + 1 };
    case 'RED_CARD_TEAM2':
      return { ...newState, team2RedCards: newState.team2RedCards + 1 };
    case 'SUBSTITUTION_TEAM1':
      return { ...newState, team1Subs: Math.min(newState.maxSubs, newState.team1Subs + 1) };
    case 'SUBSTITUTION_TEAM2':
      return { ...newState, team2Subs: Math.min(newState.maxSubs, newState.team2Subs + 1) };
    case 'NEXT_HALF':
      return handleNextHalf(newState);
    case 'ADD_INJURY_TIME':
      return { ...newState, injuryTime: action.payload as number, injuryTimeAdded: true };
    case 'START_EXTRA_TIME':
      return { ...newState, inExtraTime: true, extraTimeHalf: 1, period: 3 };
    case 'START_PENALTIES':
      return { ...newState, inPenaltyShootout: true };
    case 'PENALTY_SCORE':
      return handlePenaltyScore(newState, action.payload as 1 | 2);
    case 'PENALTY_MISS':
      return handlePenaltyMiss(newState, action.payload as 1 | 2);
    case 'START_CLOCK':
      return { ...newState, clock: { ...newState.clock, isRunning: true } };
    case 'STOP_CLOCK':
      return { ...newState, clock: { ...newState.clock, isRunning: false } };
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleNextHalf(state: SoccerState): SoccerState {
  if (state.currentHalf < state.totalHalves) {
    return {
      ...state,
      currentHalf: state.currentHalf + 1,
      period: state.currentHalf + 1,
      injuryTime: 0,
      injuryTimeAdded: false,
    };
  }
  return state;
}

function handlePenaltyScore(state: SoccerState, team: 1 | 2): SoccerState {
  if (team === 1) {
    return {
      ...state,
      team1PenaltyGoals: state.team1PenaltyGoals + 1,
      team1PenaltyAttempts: state.team1PenaltyAttempts + 1,
      currentPenaltyTaker: 2,
    };
  } else {
    return {
      ...state,
      team2PenaltyGoals: state.team2PenaltyGoals + 1,
      team2PenaltyAttempts: state.team2PenaltyAttempts + 1,
      currentPenaltyTaker: 1,
    };
  }
}

function handlePenaltyMiss(state: SoccerState, team: 1 | 2): SoccerState {
  if (team === 1) {
    return {
      ...state,
      team1PenaltyAttempts: state.team1PenaltyAttempts + 1,
      currentPenaltyTaker: 2,
    };
  } else {
    return {
      ...state,
      team2PenaltyAttempts: state.team2PenaltyAttempts + 1,
      currentPenaltyTaker: 1,
    };
  }
}

function getMatchSummary(state: SoccerState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Arsenal' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Chelsea' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 2 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 1 },
  { id: 'half', type: 'text', label: 'Half', category: 'Period', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentHalf', behaviorType: 'text', formatter: '{value}st Half' }, sample: 2 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Period', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countup' }, sample: 2745 },
  { id: 'team1YellowCards', type: 'text', label: 'Yellow 1', category: 'Cards', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team1YellowCards', behaviorType: 'text' }, sample: 2 },
  { id: 'team2YellowCards', type: 'text', label: 'Yellow 2', category: 'Cards', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team2YellowCards', behaviorType: 'text' }, sample: 1 },
  { id: 'team1RedCards', type: 'text', label: 'Red 1', category: 'Cards', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team1RedCards', behaviorType: 'text' }, sample: 0 },
  { id: 'team2RedCards', type: 'text', label: 'Red 2', category: 'Cards', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team2RedCards', behaviorType: 'text' }, sample: 0 },
];

const soccerConfig: SportConfig<SoccerState> = {
  id: 'soccer',
  name: 'Soccer',
  description: 'Soccer/football scoring with halves, cards, substitutions, and penalty shootouts',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(soccerConfig);

export type { SoccerState }; export { soccerConfig };
