// Cricket Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface CricketState extends BaseMatchState {
  // Match format
  format: 't20' | 'odi' | 'test';
  oversPerInnings: number;
  
  // Innings
  currentInnings: 1 | 2;
  team1Innings1: { runs: number; wickets: number; overs: number };
  team2Innings1: { runs: number; wickets: number; overs: number };
  team1Innings2?: { runs: number; wickets: number; overs: number };
  team2Innings2?: { runs: number; wickets: number; overs: number };
  
  // Current over
  currentOver: number;
  ballsInOver: number;
  
  // Current batsmen
  striker: string;
  nonStriker: string;
  
  // Current bowler
  bowler: string;
  bowlerOvers: number;
  bowlerWickets: number;
  bowlerRuns: number;
  
  // Extras
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  
  // Target (for 2nd innings)
  target: number | null;
  requiredRunRate: number | null;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): CricketState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    format: 't20',
    oversPerInnings: 20,
    currentInnings: 1,
    team1Innings1: { runs: 0, wickets: 0, overs: 0 },
    team2Innings1: { runs: 0, wickets: 0, overs: 0 },
    currentOver: 0,
    ballsInOver: 0,
    striker: '',
    nonStriker: '',
    bowler: '',
    bowlerOvers: 0,
    bowlerWickets: 0,
    bowlerRuns: 0,
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    target: null,
    requiredRunRate: null,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as CricketState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: CricketState, action: SportAction): CricketState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'RUNS':
      return handleRuns(newState, action.payload as number);
    case 'WICKET':
      return handleWicket(newState);
    case 'WIDE':
      return handleWide(newState);
    case 'NO_BALL':
      return handleNoBall(newState);
    case 'BYE':
      return handleBye(newState, action.payload as number);
    case 'NEXT_OVER':
      return handleNextOver(newState);
    case 'END_INNINGS':
      return handleEndInnings(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleRuns(state: CricketState, runs: number): CricketState {
  const newState = { ...state };
  
  if (state.currentInnings === 1) {
    newState.team1Innings1.runs += runs;
    newState.team1Score = newState.team1Innings1.runs;
  } else {
    newState.team2Innings1.runs += runs;
    newState.team2Score = newState.team2Innings1.runs;
  }
  
  newState.ballsInOver++;
  if (newState.ballsInOver >= 6) {
    return handleNextOver(newState);
  }
  
  return checkWin(newState);
}

function handleWicket(state: CricketState): CricketState {
  const newState = { ...state };
  
  if (state.currentInnings === 1) {
    newState.team1Innings1.wickets++;
  } else {
    newState.team2Innings1.wickets++;
  }
  
  newState.bowlerWickets++;
  newState.ballsInOver++;
  
  if (newState.ballsInOver >= 6) {
    return handleNextOver(newState);
  }
  
  // All out
  if ((state.currentInnings === 1 && newState.team1Innings1.wickets >= 10) ||
      (state.currentInnings === 2 && newState.team2Innings1.wickets >= 10)) {
    return handleEndInnings(newState);
  }
  
  return newState;
}

function handleWide(state: CricketState): CricketState {
  const newState = { ...state };
  newState.wides++;
  
  if (state.currentInnings === 1) {
    newState.team1Innings1.runs++;
    newState.team1Score = newState.team1Innings1.runs;
  } else {
    newState.team2Innings1.runs++;
    newState.team2Score = newState.team2Innings1.runs;
  }
  
  return newState;
}

function handleNoBall(state: CricketState): CricketState {
  const newState = { ...state };
  newState.noBalls++;
  
  if (state.currentInnings === 1) {
    newState.team1Innings1.runs++;
    newState.team1Score = newState.team1Innings1.runs;
  } else {
    newState.team2Innings1.runs++;
    newState.team2Score = newState.team2Innings1.runs;
  }
  
  return newState;
}

function handleBye(state: CricketState, runs: number): CricketState {
  const newState = { ...state };
  newState.byes += runs;
  newState.ballsInOver++;
  return newState;
}

function handleNextOver(state: CricketState): CricketState {
  const newState = { ...state };
  
  if (state.currentInnings === 1) {
    newState.team1Innings1.overs++;
    newState.currentOver = newState.team1Innings1.overs;
  } else {
    newState.team2Innings1.overs++;
    newState.currentOver = newState.team2Innings1.overs;
  }
  
  newState.ballsInOver = 0;
  newState.bowlerOvers++;
  
  // Check if innings complete
  if (newState.currentOver >= state.oversPerInnings) {
    return handleEndInnings(newState);
  }
  
  return newState;
}

function handleEndInnings(state: CricketState): CricketState {
  const newState = { ...state };
  
  if (state.currentInnings === 1) {
    newState.currentInnings = 2;
    newState.target = newState.team1Innings1.runs + 1;
    newState.currentOver = 0;
    newState.ballsInOver = 0;
  } else {
    newState.status = 'finished';
    if (newState.team2Innings1.runs > newState.team1Innings1.runs) {
      newState.matchWinner = 2;
    } else {
      newState.matchWinner = 1;
    }
  }
  
  return newState;
}

function checkWin(state: CricketState): CricketState {
  if (state.currentInnings === 2 && state.target) {
    if (state.team2Innings1.runs >= state.target) {
      return { ...state, matchWinner: 2, status: 'finished' };
    }
  }
  return state;
}

function getMatchSummary(state: CricketState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'India' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Australia' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team1Score', behaviorType: 'text' }, sample: 185 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team2Score', behaviorType: 'text' }, sample: 142 },
  { id: 'team1Wickets', type: 'text', label: 'Wickets 1', category: 'Score', defaultProps: { fontSize: 24 }, dataBinding: { field: 'team1Innings1.wickets', behaviorType: 'text' }, sample: 4 },
  { id: 'team2Wickets', type: 'text', label: 'Wickets 2', category: 'Score', defaultProps: { fontSize: 24 }, dataBinding: { field: 'team2Innings1.wickets', behaviorType: 'text' }, sample: 6 },
  { id: 'currentOver', type: 'text', label: 'Overs', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentOver', behaviorType: 'text' }, sample: 14.3 },
];

const cricketConfig: SportConfig<CricketState> = {
  id: 'cricket',
  name: 'Cricket',
  description: 'Cricket scoring with T20, ODI, and Test formats',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(cricketConfig);

export type { CricketState }; export { cricketConfig };
