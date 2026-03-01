// Baseball Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface BaseballState extends BaseMatchState {
  // Innings
  currentInning: number;
  totalInnings: number;
  isTopOfInning: boolean;
  
  // Inning scores
  team1InningScores: number[];
  team2InningScores: number[];
  
  // Count
  balls: number;
  strikes: number;
  outs: number;
  
  // Bases
  runnerOnFirst: boolean;
  runnerOnSecond: boolean;
  runnerOnThird: boolean;
  
  // Pitch count
  pitchCount: number;
  
  // Extra innings
  inExtraInnings: boolean;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): BaseballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentInning: 1,
    totalInnings: 9,
    isTopOfInning: true,
    team1InningScores: [],
    team2InningScores: [],
    balls: 0,
    strikes: 0,
    outs: 0,
    runnerOnFirst: false,
    runnerOnSecond: false,
    runnerOnThird: false,
    pitchCount: 0,
    inExtraInnings: false,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as BaseballState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: BaseballState, action: SportAction): BaseballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'BALL':
      return handleBall(newState);
    case 'STRIKE':
      return handleStrike(newState);
    case 'FOUL_BALL':
      return handleFoulBall(newState);
    case 'HIT':
      return handleHit(newState, action.payload as { bases: number; runs: number });
    case 'OUT':
      return handleOut(newState);
    case 'HOME_RUN':
      return handleHomeRun(newState);
    case 'WALK':
      return handleWalk(newState);
    case 'END_INNING':
      return handleEndInning(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleBall(state: BaseballState): BaseballState {
  const newState = { ...state, balls: state.balls + 1, pitchCount: state.pitchCount + 1 };
  
  if (newState.balls >= 4) {
    return handleWalk(newState);
  }
  
  return newState;
}

function handleStrike(state: BaseballState): BaseballState {
  const newState = { ...state, strikes: state.strikes + 1, pitchCount: state.pitchCount + 1 };
  
  if (newState.strikes >= 3) {
    return handleOut(newState);
  }
  
  return newState;
}

function handleFoulBall(state: BaseballState): BaseballState {
  const newState = { ...state, pitchCount: state.pitchCount + 1 };
  
  // Foul with 2 strikes doesn't count
  if (state.strikes < 2) {
    newState.strikes++;
  }
  
  return newState;
}

function handleHit(state: BaseballState, payload: { bases: number; runs: number }): BaseballState {
  const newState = { ...state };
  const isBatting = state.isTopOfInning ? 1 : 2;
  
  // Clear count
  newState.balls = 0;
  newState.strikes = 0;
  
  // Advance runners and score
  if (isBatting === 1) {
    newState.team1Score += payload.runs;
    newState.team1InningScores[state.currentInning - 1] = 
      (newState.team1InningScores[state.currentInning - 1] || 0) + payload.runs;
  } else {
    newState.team2Score += payload.runs;
    newState.team2InningScores[state.currentInning - 1] = 
      (newState.team2InningScores[state.currentInning - 1] || 0) + payload.runs;
  }
  
  // Update bases
  if (payload.bases >= 1) newState.runnerOnFirst = true;
  if (payload.bases >= 2) newState.runnerOnSecond = true;
  if (payload.bases >= 3) newState.runnerOnThird = true;
  
  return newState;
}

function handleHomeRun(state: BaseballState): BaseballState {
  const newState = { ...state };
  const isBatting = state.isTopOfInning ? 1 : 2;
  let runs = 1;
  
  if (state.runnerOnFirst) runs++;
  if (state.runnerOnSecond) runs++;
  if (state.runnerOnThird) runs++;
  
  // Clear bases
  newState.runnerOnFirst = false;
  newState.runnerOnSecond = false;
  newState.runnerOnThird = false;
  newState.balls = 0;
  newState.strikes = 0;
  
  if (isBatting === 1) {
    newState.team1Score += runs;
    newState.team1InningScores[state.currentInning - 1] = 
      (newState.team1InningScores[state.currentInning - 1] || 0) + runs;
  } else {
    newState.team2Score += runs;
    newState.team2InningScores[state.currentInning - 1] = 
      (newState.team2InningScores[state.currentInning - 1] || 0) + runs;
  }
  
  return newState;
}

function handleWalk(state: BaseballState): BaseballState {
  const newState = { ...state, balls: 0, strikes: 0 };
  
  // Force runners
  if (state.runnerOnFirst && state.runnerOnSecond && state.runnerOnThird) {
    // Score a run
    const isBatting = state.isTopOfInning ? 1 : 2;
    if (isBatting === 1) newState.team1Score++;
    else newState.team2Score++;
  }
  if (state.runnerOnFirst && state.runnerOnSecond) newState.runnerOnThird = true;
  if (state.runnerOnFirst) newState.runnerOnSecond = true;
  newState.runnerOnFirst = true;
  
  return newState;
}

function handleOut(state: BaseballState): BaseballState {
  const newState = { ...state, outs: state.outs + 1, strikes: 0, balls: 0 };
  
  if (newState.outs >= 3) {
    return handleEndInning(newState);
  }
  
  return newState;
}

function handleEndInning(state: BaseballState): BaseballState {
  const newState = { ...state, outs: 0, strikes: 0, balls: 0 };
  newState.runnerOnFirst = false;
  newState.runnerOnSecond = false;
  newState.runnerOnThird = false;
  
  if (state.isTopOfInning) {
    newState.isTopOfInning = false;
  } else {
    // Check for game end (bottom of 9th or later)
    if (state.currentInning >= state.totalInnings) {
      if (state.team1Score !== state.team2Score) {
        newState.matchWinner = state.team1Score > state.team2Score ? 1 : 2;
        newState.status = 'finished';
        return newState;
      }
      newState.inExtraInnings = true;
    }
    newState.currentInning++;
    newState.isTopOfInning = true;
  }
  
  return newState;
}

function getMatchSummary(state: BaseballState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Yankees' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Red Sox' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 5 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 3 },
  { id: 'inning', type: 'text', label: 'Inning', category: 'Match', defaultProps: { fontSize: 24 }, dataBinding: { field: 'currentInning', behaviorType: 'text' }, sample: 7 },
  { id: 'balls', type: 'text', label: 'Balls', category: 'Count', defaultProps: { fontSize: 18 }, dataBinding: { field: 'balls', behaviorType: 'text' }, sample: 2 },
  { id: 'strikes', type: 'text', label: 'Strikes', category: 'Count', defaultProps: { fontSize: 18 }, dataBinding: { field: 'strikes', behaviorType: 'text' }, sample: 1 },
  { id: 'outs', type: 'text', label: 'Outs', category: 'Count', defaultProps: { fontSize: 18 }, dataBinding: { field: 'outs', behaviorType: 'text' }, sample: 1 },
];

const baseballConfig: SportConfig<BaseballState> = {
  id: 'baseball',
  name: 'Baseball',
  description: 'Baseball scoring with innings, count tracking, and base runners',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(baseballConfig);

export type { BaseballState }; export { baseballConfig };
