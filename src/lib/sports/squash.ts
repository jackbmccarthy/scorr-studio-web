// Squash Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface SquashState extends BaseMatchState {
  bestOf: number;
  pointsToWin: number;
  
  team1Games: number[];
  team2Games: number[];
  team1GamesWon: number;
  team2GamesWon: number;
  
  currentGame: number;
  currentServer: 1 | 2;
  
  // Decisions
  lets: number;
  strokes: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): SquashState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 5,
    pointsToWin: 11,
    team1Games: [0],
    team2Games: [0],
    team1GamesWon: 0,
    team2GamesWon: 0,
    currentGame: 1,
    currentServer: 1,
    lets: 0,
    strokes: 0,
    matchWinner: null,
  } as SquashState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: SquashState, action: SportAction): SquashState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleScore(newState, 1);
    case 'SCORE_TEAM2':
      return handleScore(newState, 2);
    case 'LET':
      return { ...newState, lets: newState.lets + 1 };
    case 'STROKE':
      return { ...newState, strokes: newState.strokes + 1 };
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

function handleScore(state: SquashState, team: 1 | 2): SquashState {
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
  
  newState.currentServer = team;
  
  // Check game win (first to 11, must win by 2)
  const t1 = newState.team1Games[gameIndex];
  const t2 = newState.team2Games[gameIndex];
  
  if ((t1 >= newState.pointsToWin || t2 >= newState.pointsToWin) && Math.abs(t1 - t2) >= 2) {
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
    }
  }
  
  return newState;
}

function getMatchSummary(state: SquashState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1GamesWon, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2GamesWon, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Player 1', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Player A' },
  { id: 'team2Name', type: 'text', label: 'Player 2', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Player B' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 9 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 11 },
  { id: 'team1GamesWon', type: 'score', label: 'Games 1', category: 'Games', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1GamesWon', behaviorType: 'text' }, sample: 2 },
  { id: 'team2GamesWon', type: 'score', label: 'Games 2', category: 'Games', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2GamesWon', behaviorType: 'text' }, sample: 1 },
];

const squashConfig: SportConfig<SquashState> = {
  id: 'squash',
  name: 'Squash',
  description: 'Squash scoring with rally scoring to 11, best of 5 games',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(squashConfig);

export type { SquashState }; export { squashConfig };
