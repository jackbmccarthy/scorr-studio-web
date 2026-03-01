// Table Tennis Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

// ==========================================
// TABLE TENNIS STATE
// ==========================================

interface TableTennisState extends BaseMatchState {
  // Match format
  bestOf: number; // 3, 5, or 7 games
  pointsToWin: number; // 11 or 21
  deuceEnabled: boolean;
  
  // Game scores
  team1Games: number[];
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  
  // Current game
  currentGame: number;
  
  // Serving
  currentServer: 1 | 2;
  servesPerPlayer: number; // 2 or 5
  servesThisTurn: number;
  
  // Deuce tracking
  inDeuce: boolean;
  deucePoints: number;
  
  // Special modes
  expeditedMode: boolean;
  expeditedThreshold: number; // Points when expedited kicks in (e.g., 10 minutes)
  
  // Timeouts
  team1Timeouts: number;
  team2Timeouts: number;
  maxTimeouts: number;
  timeoutActive: boolean;
  timeoutTeam: 1 | 2 | null;
  
  // Penalties
  team1Cards: ('yellow' | 'red')[];
  team2Cards: ('yellow' | 'red')[];
  
  // Match winner
  matchWinner: 1 | 2 | null;
}

// ==========================================
// INITIAL STATE
// ==========================================

function getInitialState(data?: InitialStateData): TableTennisState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 5,
    pointsToWin: 11,
    deuceEnabled: true,
    team1Games: [0],
    team2Games: [0],
    team1GamesWon: 0,
    team2GamesWon: 0,
    currentGame: 1,
    currentServer: 1,
    servesPerPlayer: 2,
    servesThisTurn: 0,
    inDeuce: false,
    deucePoints: 0,
    expeditedMode: false,
    expeditedThreshold: 600, // 10 minutes
    team1Timeouts: 1,
    team2Timeouts: 1,
    maxTimeouts: 1,
    timeoutActive: false,
    timeoutTeam: null,
    team1Cards: [],
    team2Cards: [],
    matchWinner: null,
  } as TableTennisState;
}

// ==========================================
// MATCH CREATION
// ==========================================

function createMatch(params: CreateMatchParams) {
  const state = getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  });
  
  return createBaseMatch(params, state);
}

// ==========================================
// ACTION HANDLING
// ==========================================

function handleAction(state: TableTennisState, action: SportAction): TableTennisState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleScore(newState, 1);
    case 'SCORE_TEAM2':
      return handleScore(newState, 2);
    case 'UNDO':
      return handleUndo(newState, action.payload);
    case 'SWITCH_SERVER':
      return { ...newState, currentServer: newState.currentServer === 1 ? 2 : 1 };
    case 'TIMEOUT_TEAM1':
      return handleTimeout(newState, 1);
    case 'TIMEOUT_TEAM2':
      return handleTimeout(newState, 2);
    case 'END_TIMEOUT':
      return { ...newState, timeoutActive: false, timeoutTeam: null };
    case 'CARD_TEAM1':
      return handleCard(newState, 1, action.payload as 'yellow' | 'red');
    case 'CARD_TEAM2':
      return handleCard(newState, 2, action.payload as 'yellow' | 'red');
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    case 'EXPEDITED_MODE':
      return { ...newState, expeditedMode: true };
    case 'SET_BEST_OF':
      return { ...newState, bestOf: action.payload as number };
    default:
      return newState;
  }
}

function handleScore(state: TableTennisState, team: 1 | 2): TableTennisState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  const gameIndex = newState.currentGame - 1;
  
  // Initialize game arrays if needed
  if (!newState.team1Games[gameIndex]) newState.team1Games[gameIndex] = 0;
  if (!newState.team2Games[gameIndex]) newState.team2Games[gameIndex] = 0;
  
  // Increment score
  if (team === 1) {
    newState.team1Games[gameIndex]++;
  } else {
    newState.team2Games[gameIndex]++;
  }
  
  // Update main scores for display
  newState.team1Score = newState.team1Games[gameIndex];
  newState.team2Score = newState.team2Games[gameIndex];
  
  // Handle serve rotation
  newState.servesThisTurn++;
  
  // Check for deuce
  const t1Score = newState.team1Games[gameIndex];
  const t2Score = newState.team2Games[gameIndex];
  
  if (t1Score >= newState.pointsToWin - 1 && t2Score >= newState.pointsToWin - 1) {
    newState.inDeuce = true;
    // In deuce, serve changes every point
    if (newState.servesThisTurn >= 1) {
      newState.currentServer = newState.currentServer === 1 ? 2 : 1;
      newState.servesThisTurn = 0;
    }
  } else {
    // Normal serve rotation
    if (newState.servesThisTurn >= newState.servesPerPlayer) {
      newState.currentServer = newState.currentServer === 1 ? 2 : 1;
      newState.servesThisTurn = 0;
    }
  }
  
  // Check for game win
  const gamesToWin = Math.ceil(newState.bestOf / 2);
  
  if (checkGameWin(newState, gameIndex)) {
    if (team === 1) {
      newState.team1GamesWon++;
    } else {
      newState.team2GamesWon++;
    }
    
    // Check for match win
    if (newState.team1GamesWon >= gamesToWin) {
      newState.matchWinner = 1;
      newState.status = 'finished' as const;
    } else if (newState.team2GamesWon >= gamesToWin) {
      newState.matchWinner = 2;
      newState.status = 'finished' as const;
    } else {
      // Start next game
      newState.currentGame++;
      newState.team1Games[newState.currentGame - 1] = 0;
      newState.team2Games[newState.currentGame - 1] = 0;
      newState.team1Score = 0;
      newState.team2Score = 0;
      newState.inDeuce = false;
      newState.servesThisTurn = 0;
      // Alternate first server each game
      newState.currentServer = newState.currentGame % 2 === 1 ? 1 : 2;
    }
  }
  
  return newState;
}

function checkGameWin(state: TableTennisState, gameIndex: number): boolean {
  const t1 = state.team1Games[gameIndex] || 0;
  const t2 = state.team2Games[gameIndex] || 0;
  
  if (state.inDeuce) {
    // Must win by 2 in deuce
    return Math.abs(t1 - t2) >= 2;
  }
  
  // Normal win condition
  return (t1 >= state.pointsToWin || t2 >= state.pointsToWin) && Math.abs(t1 - t2) >= 2;
}

function handleTimeout(state: TableTennisState, team: 1 | 2): TableTennisState {
  const timeouts = team === 1 ? state.team1Timeouts : state.team2Timeouts;
  if (timeouts <= 0 || state.timeoutActive) return state;
  
  return {
    ...state,
    timeoutActive: true,
    timeoutTeam: team,
    team1Timeouts: team === 1 ? state.team1Timeouts - 1 : state.team1Timeouts,
    team2Timeouts: team === 2 ? state.team2Timeouts - 1 : state.team2Timeouts,
  };
}

function handleCard(state: TableTennisState, team: 1 | 2, card: 'yellow' | 'red'): TableTennisState {
  if (team === 1) {
    return { ...state, team1Cards: [...state.team1Cards, card] };
  } else {
    return { ...state, team2Cards: [...state.team2Cards, card] };
  }
}

function handleUndo(state: TableTennisState, payload?: unknown): TableTennisState {
  // Simplified undo - would need full history in production
  return state;
}

// ==========================================
// MATCH SUMMARY
// ==========================================

function getMatchSummary(state: TableTennisState) {
  return {
    ...createBaseMatchSummary(state),
    team1: {
      name: state.teamName1,
      score: state.team1GamesWon,
      image: state.teamLogo1 || null,
    },
    team2: {
      name: state.teamName2,
      score: state.team2GamesWon,
      image: state.teamLogo2 || null,
    },
  };
}

// ==========================================
// KONVA BLOCKS
// ==========================================

const konvaBlocks: KonvaBlockDefinition[] = [
  {
    id: 'team1Name',
    type: 'text',
    label: 'Team 1 Name',
    category: 'Match Data',
    defaultProps: { text: 'Team 1', fontSize: 24, fill: '#FFFFFF' },
    dataBinding: { field: 'teamName1', behaviorType: 'text' },
    sample: 'Player A',
  },
  {
    id: 'team2Name',
    type: 'text',
    label: 'Team 2 Name',
    category: 'Match Data',
    defaultProps: { text: 'Team 2', fontSize: 24, fill: '#FFFFFF' },
    dataBinding: { field: 'teamName2', behaviorType: 'text' },
    sample: 'Player B',
  },
  {
    id: 'team1Score',
    type: 'score',
    label: 'Team 1 Score',
    category: 'Match Data',
    defaultProps: { text: '0', fontSize: 72, fill: '#FFFFFF', fontStyle: 'bold' },
    dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' },
    sample: 11,
  },
  {
    id: 'team2Score',
    type: 'score',
    label: 'Team 2 Score',
    category: 'Match Data',
    defaultProps: { text: '0', fontSize: 72, fill: '#FFFFFF', fontStyle: 'bold' },
    dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' },
    sample: 7,
  },
  {
    id: 'team1GamesWon',
    type: 'score',
    label: 'Team 1 Games',
    category: 'Match Data',
    defaultProps: { text: '0', fontSize: 32, fill: '#FFFFFF' },
    dataBinding: { field: 'team1GamesWon', behaviorType: 'text' },
    sample: 3,
  },
  {
    id: 'team2GamesWon',
    type: 'score',
    label: 'Team 2 Games',
    category: 'Match Data',
    defaultProps: { text: '0', fontSize: 32, fill: '#FFFFFF' },
    dataBinding: { field: 'team2GamesWon', behaviorType: 'text' },
    sample: 1,
  },
  {
    id: 'currentGame',
    type: 'text',
    label: 'Current Game',
    category: 'Match Data',
    defaultProps: { text: 'Game 1', fontSize: 18, fill: '#9CA3AF' },
    dataBinding: { field: 'currentGame', behaviorType: 'text', formatter: 'Game {value}' },
    sample: 3,
  },
  {
    id: 'servingIndicator',
    type: 'text',
    label: 'Serving',
    category: 'Match Data',
    defaultProps: { text: '●', fontSize: 16, fill: '#10B981' },
    dataBinding: { field: 'currentServer', behaviorType: 'visibility' },
    sample: 1,
  },
  {
    id: 'team1Logo',
    type: 'image',
    label: 'Team 1 Logo',
    category: 'Match Data',
    defaultProps: { src: '', width: 48, height: 48 },
    dataBinding: { field: 'teamLogo1', behaviorType: 'image' },
    sample: '/placeholder-logo.png',
  },
  {
    id: 'team2Logo',
    type: 'image',
    label: 'Team 2 Logo',
    category: 'Match Data',
    defaultProps: { src: '', width: 48, height: 48 },
    dataBinding: { field: 'teamLogo2', behaviorType: 'image' },
    sample: '/placeholder-logo.png',
  },
];

// ==========================================
// REGISTER SPORT
// ==========================================

const tableTennisConfig: SportConfig<TableTennisState> = {
  id: 'table-tennis',
  name: 'Table Tennis',
  description: 'Table tennis / ping pong scoring with support for best of 3/5/7 games, deuce rules, timeouts, and penalties',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: {
    blocks: konvaBlocks,
    defaultCanvasSize: { width: 1920, height: 1080 },
  },
  handleAction,
};

registerSport(tableTennisConfig);

export type { TableTennisState }; export { tableTennisConfig };
