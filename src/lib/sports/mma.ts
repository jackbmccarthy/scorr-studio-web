// MMA Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface MMAState extends BaseMatchState {
  // Rounds
  currentRound: number;
  totalRounds: number;
  roundLength: number;
  
  // Round scores (10-point must system)
  team1RoundScores: number[];
  team2RoundScores: number[];
  team1TotalPoints: number;
  team2TotalPoints: number;
  
  // Strikes
  team1Strikes: number;
  team2Strikes: number;
  team1SignificantStrikes: number;
  team2SignificantStrikes: number;
  
  // Grappling
  team1Takedowns: number;
  team2Takedowns: number;
  team1ControlTime: number;
  team2ControlTime: number;
  
  // Submission attempts
  team1SubmissionAttempts: number;
  team2SubmissionAttempts: number;
  
  // Finish
  finishType: 'ko' | 'tko' | 'submission' | 'decision' | 'dq' | null;
  finishRound: number | null;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): MMAState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentRound: 1,
    totalRounds: 3,
    roundLength: 300, // 5 minutes
    team1RoundScores: [],
    team2RoundScores: [],
    team1TotalPoints: 0,
    team2TotalPoints: 0,
    team1Strikes: 0,
    team2Strikes: 0,
    team1SignificantStrikes: 0,
    team2SignificantStrikes: 0,
    team1Takedowns: 0,
    team2Takedowns: 0,
    team1ControlTime: 0,
    team2ControlTime: 0,
    team1SubmissionAttempts: 0,
    team2SubmissionAttempts: 0,
    finishType: null,
    finishRound: null,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 300, isRunning: false, direction: 'down' },
    period: 1,
  } as MMAState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: MMAState, action: SportAction): MMAState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'STRIKE_TEAM1':
      newState.team1Strikes++;
      return newState;
    case 'STRIKE_TEAM2':
      newState.team2Strikes++;
      return newState;
    case 'SIGNIFICANT_STRIKE_TEAM1':
      newState.team1Strikes++;
      newState.team1SignificantStrikes++;
      return newState;
    case 'SIGNIFICANT_STRIKE_TEAM2':
      newState.team2Strikes++;
      newState.team2SignificantStrikes++;
      return newState;
    case 'TAKEDOWN_TEAM1':
      newState.team1Takedowns++;
      return newState;
    case 'TAKEDOWN_TEAM2':
      newState.team2Takedowns++;
      return newState;
    case 'SUBMISSION_ATTEMPT_TEAM1':
      newState.team1SubmissionAttempts++;
      return newState;
    case 'SUBMISSION_ATTEMPT_TEAM2':
      newState.team2SubmissionAttempts++;
      return newState;
    case 'SCORE_ROUND':
      return handleScoreRound(newState, action.payload as { team1: number; team2: number });
    case 'KO':
      return handleFinish(newState, action.payload as 1 | 2, 'ko');
    case 'TKO':
      return handleFinish(newState, action.payload as 1 | 2, 'tko');
    case 'SUBMISSION':
      return handleFinish(newState, action.payload as 1 | 2, 'submission');
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

function handleScoreRound(state: MMAState, scores: { team1: number; team2: number }): MMAState {
  const newState = { ...state };
  
  newState.team1RoundScores[state.currentRound - 1] = scores.team1;
  newState.team2RoundScores[state.currentRound - 1] = scores.team2;
  
  newState.team1TotalPoints = newState.team1RoundScores.reduce((a, b) => a + b, 0);
  newState.team2TotalPoints = newState.team2RoundScores.reduce((a, b) => a + b, 0);
  
  newState.team1Score = newState.team1TotalPoints;
  newState.team2Score = newState.team2TotalPoints;
  
  return newState;
}

function handleFinish(state: MMAState, winner: 1 | 2, type: 'ko' | 'tko' | 'submission'): MMAState {
  return {
    ...state,
    matchWinner: winner,
    status: 'finished',
    finishType: type as 'ko' | 'tko' | 'submission' | 'decision' | 'dq' | null,
    finishRound: state.currentRound,
  };
}

function handleNextRound(state: MMAState): MMAState {
  if (state.currentRound >= state.totalRounds) {
    return handleDecision(state);
  }
  
  return {
    ...state,
    currentRound: state.currentRound + 1,
    period: state.currentRound + 1,
    clock: { ...state.clock, seconds: state.roundLength },
  };
}

function handleDecision(state: MMAState): MMAState {
  const newState = { ...state, status: 'finished' as const, finishType: 'decision' as const };
  
  if (state.team1TotalPoints > state.team2TotalPoints) {
    newState.matchWinner = 1;
  } else if (state.team2TotalPoints > state.team1TotalPoints) {
    newState.matchWinner = 2;
  }
  
  return newState;
}

function getMatchSummary(state: MMAState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Fighter 1', category: 'Fighters', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'McGregor' },
  { id: 'team2Name', type: 'text', label: 'Fighter 2', category: 'Fighters', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Khabib' },
  { id: 'currentRound', type: 'text', label: 'Round', category: 'Match', defaultProps: { fontSize: 48 }, dataBinding: { field: 'currentRound', behaviorType: 'text', formatter: 'Round {value}' }, sample: 2 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 234 },
  { id: 'team1Strikes', type: 'text', label: 'Strikes 1', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team1SignificantStrikes', behaviorType: 'text' }, sample: 45 },
  { id: 'team2Strikes', type: 'text', label: 'Strikes 2', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team2SignificantStrikes', behaviorType: 'text' }, sample: 32 },
  { id: 'team1Takedowns', type: 'text', label: 'TD 1', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team1Takedowns', behaviorType: 'text' }, sample: 1 },
  { id: 'team2Takedowns', type: 'text', label: 'TD 2', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team2Takedowns', behaviorType: 'text' }, sample: 3 },
];

const mmaConfig: SportConfig<MMAState> = {
  id: 'mma',
  name: 'MMA',
  description: 'MMA scoring with strikes, takedowns, and finish types',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(mmaConfig);

export type { MMAState }; export { mmaConfig };
