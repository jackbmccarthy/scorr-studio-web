// Badminton Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface BadmintonState extends BaseMatchState {
  bestOf: number;
  pointsToWin: number;
  
  team1Games: number[];
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  
  currentGame: number;
  currentServer: 1 | 2;
  
  // Interval system
  intervalReached: boolean;
  gamePoint: boolean;
  matchPoint: boolean;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): BadmintonState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 3,
    pointsToWin: 21,
    team1Games: [0],
    team2Games: [0],
    team1GamesWon: 0,
    team2GamesWon: 0,
    currentGame: 1,
    currentServer: 1,
    intervalReached: false,
    gamePoint: false,
    matchPoint: false,
    matchWinner: null,
  } as BadmintonState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: BadmintonState, action: SportAction): BadmintonState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleScore(newState, 1);
    case 'SCORE_TEAM2':
      return handleScore(newState, 2);
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

function handleScore(state: BadmintonState, team: 1 | 2): BadmintonState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  const gameIndex = newState.currentGame - 1;
  
  if (!newState.team1Games[gameIndex]) newState.team1Games[gameIndex] = 0;
  if (!newState.team2Games[gameIndex]) newState.team2Games[gameIndex] = 0;
  
  if (team === 1) {
    newState.team1Games[gameIndex]++;
    newState.team1Score = newState.team1Games[gameIndex];
  } else {
    newState.team2Games[gameIndex]++;
    newState.team2Score = newState.team2Games[gameIndex];
  }
  
  // Server changes on point win
  newState.currentServer = team;
  
  // Check interval (11 points)
  const t1 = newState.team1Games[gameIndex];
  const t2 = newState.team2Games[gameIndex];
  newState.intervalReached = t1 === 11 || t2 === 11;
  
  // Check game win
  if (checkGameWin(newState, gameIndex)) {
    if (team === 1) newState.team1GamesWon++;
    else newState.team2GamesWon++;
    
    const setsToWin = Math.ceil(newState.bestOf / 2);
    if (newState.team1GamesWon >= setsToWin) {
      newState.matchWinner = 1;
      newState.status = 'finished';
    } else if (newState.team2GamesWon >= setsToWin) {
      newState.matchWinner = 2;
      newState.status = 'finished';
    } else {
      newState.currentGame++;
      newState.team1Games[newState.currentGame - 1] = 0;
      newState.team2Games[newState.currentGame - 1] = 0;
      newState.team1Score = 0;
      newState.team2Score = 0;
      newState.intervalReached = false;
    }
  }
  
  // Update game/match point indicators
  newState.gamePoint = (t1 >= 20 || t2 >= 20) && Math.abs(t1 - t2) === 0;
  newState.matchPoint = newState.team1GamesWon === Math.ceil(newState.bestOf / 2) - 1 ||
    newState.team2GamesWon === Math.ceil(newState.bestOf / 2) - 1;
  
  return newState;
}

function checkGameWin(state: BadmintonState, gameIndex: number): boolean {
  const t1 = state.team1Games[gameIndex] || 0;
  const t2 = state.team2Games[gameIndex] || 0;
  
  // Standard win
  if ((t1 >= 21 || t2 >= 21) && Math.abs(t1 - t2) >= 2) return true;
  // Extended game (29-all, next point wins)
  if (t1 === 30 || t2 === 30) return true;
  
  return false;
}

function getMatchSummary(state: BadmintonState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1GamesWon, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2GamesWon, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Player 1', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Player A' },
  { id: 'team2Name', type: 'text', label: 'Player 2', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Player B' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 19 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 21 },
  { id: 'team1GamesWon', type: 'score', label: 'Games 1', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1GamesWon', behaviorType: 'text' }, sample: 1 },
  { id: 'team2GamesWon', type: 'score', label: 'Games 2', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2GamesWon', behaviorType: 'text' }, sample: 1 },
];

const badmintonConfig: SportConfig<BadmintonState> = {
  id: 'badminton',
  name: 'Badminton',
  description: 'Badminton scoring with rally scoring to 21, best of 3 games',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(badmintonConfig);

export type { BadmintonState }; export { badmintonConfig };
