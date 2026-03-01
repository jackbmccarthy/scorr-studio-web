// Pickleball Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface PickleballState extends BaseMatchState {
  // Match format
  bestOf: number;
  pointsToWin: number;
  
  // Game scores
  team1Games: number[];
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  
  currentGame: number;
  
  // Side-out scoring (only serving team can score)
  currentServer: 1 | 2;
  servingTeam: 1 | 2;
  
  // Doubles server tracking
  serverNumber: 1 | 2;
  
  // Win by 2
  winByTwo: boolean;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): PickleballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 3,
    pointsToWin: 11,
    team1Games: [0],
    team2Games: [0],
    team1GamesWon: 0,
    team2GamesWon: 0,
    currentGame: 1,
    currentServer: 1,
    servingTeam: 1,
    serverNumber: 1,
    winByTwo: true,
    matchWinner: null,
  } as PickleballState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: PickleballState, action: SportAction): PickleballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleScore(newState, 1);
    case 'SCORE_TEAM2':
      return handleScore(newState, 2);
    case 'SIDE_OUT':
      return handleSideOut(newState);
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleScore(state: PickleballState, team: 1 | 2): PickleballState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  
  // Only serving team can score
  if (state.servingTeam !== team) {
    return handleSideOut(newState);
  }
  
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
  
  // Check game win
  if (checkGameWin(newState, gameIndex)) {
    if (team === 1) newState.team1GamesWon++;
    else newState.team2GamesWon++;
    
    const gamesToWin = Math.ceil(newState.bestOf / 2);
    if (newState.team1GamesWon >= gamesToWin) {
      newState.matchWinner = 1;
      newState.status = 'finished';
    } else if (newState.team2GamesWon >= gamesToWin) {
      newState.matchWinner = 2;
      newState.status = 'finished';
    } else {
      newState.currentGame++;
      newState.team1Games[newState.currentGame - 1] = 0;
      newState.team2Games[newState.currentGame - 1] = 0;
      newState.team1Score = 0;
      newState.team2Score = 0;
      newState.servingTeam = team === 1 ? 2 : 1;
      newState.serverNumber = 1;
    }
  }
  
  return newState;
}

function handleSideOut(state: PickleballState): PickleballState {
  const newState = { ...state };
  
  // Switch serving team
  newState.servingTeam = newState.servingTeam === 1 ? 2 : 1;
  newState.currentServer = newState.servingTeam;
  newState.serverNumber = 1;
  
  return newState;
}

function checkGameWin(state: PickleballState, gameIndex: number): boolean {
  const t1 = state.team1Games[gameIndex] || 0;
  const t2 = state.team2Games[gameIndex] || 0;
  
  if (state.winByTwo) {
    return (t1 >= state.pointsToWin || t2 >= state.pointsToWin) && Math.abs(t1 - t2) >= 2;
  }
  
  return t1 >= state.pointsToWin || t2 >= state.pointsToWin;
}

function getMatchSummary(state: PickleballState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1GamesWon, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2GamesWon, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Team A' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Team B' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 9 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 11 },
  { id: 'team1GamesWon', type: 'score', label: 'Games 1', category: 'Games', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1GamesWon', behaviorType: 'text' }, sample: 1 },
  { id: 'team2GamesWon', type: 'score', label: 'Games 2', category: 'Games', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2GamesWon', behaviorType: 'text' }, sample: 1 },
  { id: 'servingTeam', type: 'text', label: 'Serving', category: 'Server', defaultProps: { fontSize: 18 }, dataBinding: { field: 'servingTeam', behaviorType: 'text' }, sample: 1 },
];

const pickleballConfig: SportConfig<PickleballState> = {
  id: 'pickleball',
  name: 'Pickleball',
  description: 'Pickleball scoring with side-out scoring, games to 11, win by 2',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(pickleballConfig);

export type { PickleballState }; export { pickleballConfig };
