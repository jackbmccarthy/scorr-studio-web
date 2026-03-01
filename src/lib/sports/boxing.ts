// Boxing Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface BoxingState extends BaseMatchState {
  // Rounds
  currentRound: number;
  totalRounds: number;
  roundLength: number; // seconds
  
  // Round scores (10-point must system)
  team1RoundScores: number[];
  team2RoundScores: number[];
  
  // Total points
  team1TotalPoints: number;
  team2TotalPoints: number;
  
  // Knockdowns
  team1Knockdowns: number;
  team2Knockdowns: number;
  
  // Standing knockdown count
  knockdownCount: number;
  knockdownTeam: 1 | 2 | null;
  
  // Finish
  finishType: 'ko' | 'tko' | 'decision' | null;
  finishRound: number | null;
  
  // Fouls
  team1Warnings: number;
  team2Warnings: number;
  team1PointDeductions: number;
  team2PointDeductions: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): BoxingState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentRound: 1,
    totalRounds: 12,
    roundLength: 180, // 3 minutes
    team1RoundScores: [],
    team2RoundScores: [],
    team1TotalPoints: 0,
    team2TotalPoints: 0,
    team1Knockdowns: 0,
    team2Knockdowns: 0,
    knockdownCount: 0,
    knockdownTeam: null,
    finishType: null,
    finishRound: null,
    team1Warnings: 0,
    team2Warnings: 0,
    team1PointDeductions: 0,
    team2PointDeductions: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 180, isRunning: false, direction: 'down' },
    period: 1,
  } as BoxingState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: BoxingState, action: SportAction): BoxingState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_ROUND':
      return handleScoreRound(newState, action.payload as { team1: number; team2: number });
    case 'KNOCKDOWN_TEAM1':
      return handleKnockdown(newState, 1);
    case 'KNOCKDOWN_TEAM2':
      return handleKnockdown(newState, 2);
    case 'KNOCKOUT':
      return handleKnockout(newState, action.payload as 1 | 2);
    case 'TKO':
      return handleTKO(newState, action.payload as 1 | 2);
    case 'WARNING_TEAM1':
      newState.team1Warnings++;
      return newState;
    case 'WARNING_TEAM2':
      newState.team2Warnings++;
      return newState;
    case 'POINT_DEDUCTION_TEAM1':
      newState.team1PointDeductions++;
      return newState;
    case 'POINT_DEDUCTION_TEAM2':
      newState.team2PointDeductions++;
      return newState;
    case 'NEXT_ROUND':
      return handleNextRound(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return handleDecision(newState);
    default:
      return newState;
  }
}

function handleScoreRound(state: BoxingState, scores: { team1: number; team2: number }): BoxingState {
  const newState = { ...state };
  
  newState.team1RoundScores[state.currentRound - 1] = scores.team1;
  newState.team2RoundScores[state.currentRound - 1] = scores.team2;
  
  newState.team1TotalPoints = newState.team1RoundScores.reduce((a, b) => a + b, 0) - state.team1PointDeductions;
  newState.team2TotalPoints = newState.team2RoundScores.reduce((a, b) => a + b, 0) - state.team2PointDeductions;
  
  newState.team1Score = newState.team1TotalPoints;
  newState.team2Score = newState.team2TotalPoints;
  
  return newState;
}

function handleKnockdown(state: BoxingState, team: 1 | 2): BoxingState {
  const newState = { ...state };
  
  if (team === 1) {
    newState.team1Knockdowns++;
  } else {
    newState.team2Knockdowns++;
  }
  
  newState.knockdownCount++;
  newState.knockdownTeam = team;
  
  return newState;
}

function handleKnockout(state: BoxingState, loser: 1 | 2): BoxingState {
  const winner = loser === 1 ? 2 : 1;
  return {
    ...state,
    matchWinner: winner,
    status: 'finished',
    finishType: 'ko',
    finishRound: state.currentRound,
  };
}

function handleTKO(state: BoxingState, loser: 1 | 2): BoxingState {
  const winner = loser === 1 ? 2 : 1;
  return {
    ...state,
    matchWinner: winner,
    status: 'finished',
    finishType: 'tko',
    finishRound: state.currentRound,
  };
}

function handleNextRound(state: BoxingState): BoxingState {
  if (state.currentRound >= state.totalRounds) {
    return handleDecision(state);
  }
  
  return {
    ...state,
    currentRound: state.currentRound + 1,
    period: state.currentRound + 1,
    clock: { ...state.clock, seconds: state.roundLength },
    knockdownCount: 0,
    knockdownTeam: null,
  };
}

function handleDecision(state: BoxingState): BoxingState {
  const newState = { ...state, status: 'finished' as const, finishType: 'decision' as const };
  
  if (state.team1TotalPoints > state.team2TotalPoints) {
    newState.matchWinner = 1;
  } else if (state.team2TotalPoints > state.team1TotalPoints) {
    newState.matchWinner = 2;
  }
  
  return newState;
}

function getMatchSummary(state: BoxingState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Boxer 1', category: 'Boxers', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Tyson' },
  { id: 'team2Name', type: 'text', label: 'Boxer 2', category: 'Boxers', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Holyfield' },
  { id: 'team1TotalPoints', type: 'score', label: 'Points 1', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team1TotalPoints', behaviorType: 'text' }, sample: 87 },
  { id: 'team2TotalPoints', type: 'score', label: 'Points 2', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team2TotalPoints', behaviorType: 'text' }, sample: 84 },
  { id: 'currentRound', type: 'text', label: 'Round', category: 'Match', defaultProps: { fontSize: 24 }, dataBinding: { field: 'currentRound', behaviorType: 'text', formatter: 'Round {value}' }, sample: 8 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 123 },
  { id: 'team1Knockdowns', type: 'text', label: 'KD 1', category: 'Knockdowns', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team1Knockdowns', behaviorType: 'text' }, sample: 1 },
  { id: 'team2Knockdowns', type: 'text', label: 'KD 2', category: 'Knockdowns', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team2Knockdowns', behaviorType: 'text' }, sample: 0 },
];

const boxingConfig: SportConfig<BoxingState> = {
  id: 'boxing',
  name: 'Boxing',
  description: 'Boxing scoring with 10-point must system, knockdowns, and KO/TKO',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(boxingConfig);

export type { BoxingState }; export { boxingConfig };
