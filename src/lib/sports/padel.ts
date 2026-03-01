// Padel Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface PadelState extends BaseMatchState {
  // Match format
  bestOf: number;
  gamesPerSet: number;
  
  // Set scores
  team1Sets: number[];
  team2Sets: number[];
  team1SetsWon: number;
  team2SetsWon: number;
  
  currentSet: number;
  
  // Game scores
  team1Games: number;
  team2Games: number;
  
  // Tiebreak
  inTiebreak: boolean;
  team1TiebreakScore: number;
  team2TiebreakScore: number;
  
  // Golden Point
  goldenPoint: boolean;
  
  // Serving
  currentServer: 1 | 2;
  
  // Deuce
  inDeuce: boolean;
  advantage: 1 | 2 | null;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): PadelState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 3,
    gamesPerSet: 6,
    team1Sets: [0],
    team2Sets: [0],
    team1SetsWon: 0,
    team2SetsWon: 0,
    currentSet: 1,
    team1Games: 0,
    team2Games: 0,
    inTiebreak: false,
    team1TiebreakScore: 0,
    team2TiebreakScore: 0,
    goldenPoint: false,
    currentServer: 1,
    inDeuce: false,
    advantage: null,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as PadelState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: PadelState, action: SportAction): PadelState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handlePoint(newState, 1);
    case 'SCORE_TEAM2':
      return handlePoint(newState, 2);
    case 'SWITCH_SERVER':
      return { ...newState, currentServer: newState.currentServer === 1 ? 2 : 1 };
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handlePoint(state: PadelState, team: 1 | 2): PadelState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  
  if (state.inTiebreak) {
    return handleTiebreakPoint(newState, team);
  }
  
  // Handle deuce/advantage
  if (state.inDeuce) {
    if (state.advantage === null) {
      return { ...newState, advantage: team };
    } else if (state.advantage === team) {
      return handleGameWin(newState, team);
    } else {
      return { ...newState, advantage: null };
    }
  }
  
  // Normal scoring with Golden Point
  if (state.goldenPoint && state.team1Games === 3 && state.team2Games === 3) {
    if (team === 1) {
      newState.team1Games = 4;
    } else {
      newState.team2Games = 4;
    }
    return handleGameWin(newState, team);
  }
  
  // Increment games
  if (team === 1) {
    newState.team1Games++;
    newState.team1Score = newState.team1Games;
  } else {
    newState.team2Games++;
    newState.team2Score = newState.team2Games;
  }
  
  // Check for deuce (40-40)
  if (newState.team1Games >= 3 && newState.team2Games >= 3 && 
      newState.team1Games === newState.team2Games) {
    return { ...newState, inDeuce: true };
  }
  
  // Check for game win
  if (newState.team1Games >= 4 || newState.team2Games >= 4) {
    const diff = Math.abs(newState.team1Games - newState.team2Games);
    if (diff >= 2 || state.goldenPoint) {
      return handleGameWin(newState, team);
    }
  }
  
  return newState;
}

function handleGameWin(state: PadelState, team: 1 | 2): PadelState {
  const newState = { ...state };
  
  const setIndex = newState.currentSet - 1;
  if (!newState.team1Sets[setIndex]) newState.team1Sets[setIndex] = 0;
  if (!newState.team2Sets[setIndex]) newState.team2Sets[setIndex] = 0;
  
  if (team === 1) {
    newState.team1Sets[setIndex]++;
    newState.team1SetsWon++;
  } else {
    newState.team2Sets[setIndex]++;
    newState.team2SetsWon++;
  }
  
  // Check for match win
  const setsToWin = Math.ceil(newState.bestOf / 2);
  if (newState.team1SetsWon >= setsToWin) {
    newState.matchWinner = 1;
    newState.status = 'finished';
  } else if (newState.team2SetsWon >= setsToWin) {
    newState.matchWinner = 2;
    newState.status = 'finished';
  } else {
    // Start next set
    newState.currentSet++;
    newState.team1Games = 0;
    newState.team2Games = 0;
    newState.team1Score = 0;
    newState.team2Score = 0;
    newState.inDeuce = false;
    newState.advantage = null;
  }
  
  return newState;
}

function handleTiebreakPoint(state: PadelState, team: 1 | 2): PadelState {
  const newState = { ...state };
  
  if (team === 1) newState.team1TiebreakScore++;
  else newState.team2TiebreakScore++;
  
  const diff = Math.abs(newState.team1TiebreakScore - newState.team2TiebreakScore);
  const max = Math.max(newState.team1TiebreakScore, newState.team2TiebreakScore);
  
  if (max >= 7 && diff >= 2) {
    return handleGameWin({ ...newState, inTiebreak: false }, team);
  }
  
  return newState;
}

function getMatchSummary(state: PadelState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1SetsWon, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2SetsWon, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Team A' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Team B' },
  { id: 'team1Games', type: 'score', label: 'Games 1', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team1Games', behaviorType: 'text' }, sample: 4 },
  { id: 'team2Games', type: 'score', label: 'Games 2', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team2Games', behaviorType: 'text' }, sample: 3 },
  { id: 'team1SetsWon', type: 'score', label: 'Sets 1', category: 'Sets', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1SetsWon', behaviorType: 'text' }, sample: 1 },
  { id: 'team2SetsWon', type: 'score', label: 'Sets 2', category: 'Sets', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2SetsWon', behaviorType: 'text' }, sample: 0 },
];

const padelConfig: SportConfig<PadelState> = {
  id: 'padel',
  name: 'Padel',
  description: 'Padel scoring with sets, games, tiebreak, and Golden Point',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(padelConfig);

export type { PadelState }; export { padelConfig };
