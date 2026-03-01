// Tennis Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface TennisState extends BaseMatchState {
  // Match format
  bestOf: number; // 3 or 5 sets
  gamesPerSet: number;
  
  // Set scores
  team1Sets: number[];
  team2Sets: number[];
  team1SetsWon: number;
  team2SetsWon: number;
  
  // Current set
  currentSet: number;
  
  // Game scores (within current set)
  team1Games: number;
  team2Games: number;
  
  // Tiebreak
  inTiebreak: boolean;
  tiebreakPoints: number;
  team1TiebreakScore: number;
  team2TiebreakScore: number;
  
  // Serving
  currentServer: 1 | 2;
  
  // Advantage
  inDeuce: boolean;
  advantage: 1 | 2 | null;
  
  // Match winner
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): TennisState {
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
    tiebreakPoints: 7,
    team1TiebreakScore: 0,
    team2TiebreakScore: 0,
    currentServer: 1,
    inDeuce: false,
    advantage: null,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
  } as TennisState;
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

function handleAction(state: TennisState, action: SportAction): TennisState {
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
    case 'SET_BEST_OF':
      return { ...newState, bestOf: action.payload as number };
    default:
      return newState;
  }
}

function handlePoint(state: TennisState, team: 1 | 2): TennisState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  
  if (state.inTiebreak) {
    return handleTiebreakPoint(newState, team);
  }
  
  // Handle deuce/advantage
  if (state.inDeuce) {
    if (state.advantage === null) {
      // First point after deuce
      return { ...newState, advantage: team };
    } else if (state.advantage === team) {
      // Advantage team wins the game
      return handleGameWin(newState, team);
    } else {
      // Back to deuce
      return { ...newState, advantage: null };
    }
  }
  
  // Normal scoring
  const games = team === 1 ? newState.team1Games : newState.team2Games;
  const oppGames = team === 1 ? newState.team2Games : newState.team1Games;
  
  if (games >= 3 && oppGames >= 3) {
    // Deuce situation
    return { ...newState, inDeuce: true, advantage: team };
  }
  
  // Increment games
  if (team === 1) {
    newState.team1Games++;
    newState.team1Score = newState.team1Games;
  } else {
    newState.team2Games++;
    newState.team2Score = newState.team2Games;
  }
  
  // Check for game win (6 games wins, but must win by 2)
  if (checkGameWin(newState)) {
    return handleGameWin(newState, team);
  }
  
  return newState;
}

function checkGameWin(state: TennisState): boolean {
  const diff = Math.abs(state.team1Games - state.team2Games);
  const max = Math.max(state.team1Games, state.team2Games);
  return max >= 6 && diff >= 2;
}

function handleGameWin(state: TennisState, team: 1 | 2): TennisState {
  const newState = { ...state };
  
  // Update set score
  const setIndex = newState.currentSet - 1;
  if (team === 1) {
    if (!newState.team1Sets[setIndex]) newState.team1Sets[setIndex] = 0;
    newState.team1Sets[setIndex]++;
    newState.team1SetsWon++;
  } else {
    if (!newState.team2Sets[setIndex]) newState.team2Sets[setIndex] = 0;
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

function handleTiebreakPoint(state: TennisState, team: 1 | 2): TennisState {
  const newState = { ...state };
  
  if (team === 1) {
    newState.team1TiebreakScore++;
  } else {
    newState.team2TiebreakScore++;
  }
  
  // Check tiebreak win (first to 7, win by 2)
  const diff = Math.abs(newState.team1TiebreakScore - newState.team2TiebreakScore);
  const max = Math.max(newState.team1TiebreakScore, newState.team2TiebreakScore);
  
  if (max >= 7 && diff >= 2) {
    // Tiebreak won, team wins the set
    return handleGameWin({ ...newState, inTiebreak: false }, team);
  }
  
  return newState;
}

function getMatchSummary(state: TennisState) {
  return {
    ...createBaseMatchSummary(state),
    team1: { name: state.teamName1, score: state.team1SetsWon, image: state.teamLogo1 || null },
    team2: { name: state.teamName2, score: state.team2SetsWon, image: state.teamLogo2 || null },
  };
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Player 1', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Nadal' },
  { id: 'team2Name', type: 'text', label: 'Player 2', category: 'Players', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Djokovic' },
  { id: 'team1Games', type: 'score', label: 'Games 1', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team1Games', behaviorType: 'text' }, sample: 4 },
  { id: 'team2Games', type: 'score', label: 'Games 2', category: 'Score', defaultProps: { fontSize: 48 }, dataBinding: { field: 'team2Games', behaviorType: 'text' }, sample: 3 },
  { id: 'team1SetsWon', type: 'score', label: 'Sets 1', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1SetsWon', behaviorType: 'text' }, sample: 2 },
  { id: 'team2SetsWon', type: 'score', label: 'Sets 2', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2SetsWon', behaviorType: 'text' }, sample: 1 },
  { id: 'currentSet', type: 'text', label: 'Set', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentSet', behaviorType: 'text', formatter: 'Set {value}' }, sample: 3 },
];

const tennisConfig: SportConfig<TennisState> = {
  id: 'tennis',
  name: 'Tennis',
  description: 'Tennis scoring with sets, games, deuce, and tiebreaks',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(tennisConfig);

export type { TennisState }; export { tennisConfig };
