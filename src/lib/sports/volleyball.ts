// Volleyball Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface VolleyballState extends BaseMatchState {
  bestOf: number;
  pointsToWin: number;
  decidingSetPoints: number;
  
  team1Sets: number[];
  team2Sets: number[];
  team1SetsWon: number;
  team2SetsWon: number;
  
  currentSet: number;
  currentServer: 1 | 2;
  
  // Technical timeouts
  technicalTimeout: boolean;
  
  // Rotation tracking
  team1Rotation: number;
  team2Rotation: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): VolleyballState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    bestOf: 5,
    pointsToWin: 25,
    decidingSetPoints: 15,
    team1Sets: [0],
    team2Sets: [0],
    team1SetsWon: 0,
    team2SetsWon: 0,
    currentSet: 1,
    currentServer: 1,
    technicalTimeout: false,
    team1Rotation: 1,
    team2Rotation: 1,
    matchWinner: null,
  } as VolleyballState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: VolleyballState, action: SportAction): VolleyballState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleScore(newState, 1);
    case 'SCORE_TEAM2':
      return handleScore(newState, 2);
    case 'ROTATE_TEAM1':
      return { ...newState, team1Rotation: (newState.team1Rotation % 6) + 1 };
    case 'ROTATE_TEAM2':
      return { ...newState, team2Rotation: (newState.team2Rotation % 6) + 1 };
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleScore(state: VolleyballState, team: 1 | 2): VolleyballState {
  if (state.status !== 'live' || state.matchWinner) return state;
  
  const newState = { ...state };
  const setIndex = newState.currentSet - 1;
  const isDecidingSet = newState.currentSet === 5;
  const pointsToWin = isDecidingSet ? newState.decidingSetPoints : newState.pointsToWin;
  
  if (!newState.team1Sets[setIndex]) newState.team1Sets[setIndex] = 0;
  if (!newState.team2Sets[setIndex]) newState.team2Sets[setIndex] = 0;
  
  if (team === 1) {
    newState.team1Sets[setIndex]++;
    newState.team1Score = newState.team1Sets[setIndex];
  } else {
    newState.team2Sets[setIndex]++;
    newState.team2Score = newState.team2Sets[setIndex];
  }
  
  newState.currentServer = team;
  
  // Technical timeout at 8 and 16 points (not in deciding set)
  if (!isDecidingSet) {
    const t1 = newState.team1Sets[setIndex];
    const t2 = newState.team2Sets[setIndex];
    newState.technicalTimeout = t1 === 8 || t1 === 16 || t2 === 8 || t2 === 16;
  }
  
  // Check set win
  const t1 = newState.team1Sets[setIndex];
  const t2 = newState.team2Sets[setIndex];
  
  if ((t1 >= pointsToWin || t2 >= pointsToWin) && Math.abs(t1 - t2) >= 2) {
    if (team === 1) newState.team1SetsWon++;
    else newState.team2SetsWon++;
    
    const setsToWin = Math.ceil(newState.bestOf / 2);
    if (newState.team1SetsWon >= setsToWin) {
      newState.matchWinner = 1;
      newState.status = 'finished';
    } else if (newState.team2SetsWon >= setsToWin) {
      newState.matchWinner = 2;
      newState.status = 'finished';
    } else {
      newState.currentSet++;
      newState.team1Sets[newState.currentSet - 1] = 0;
      newState.team2Sets[newState.currentSet - 1] = 0;
      newState.team1Score = 0;
      newState.team2Score = 0;
      newState.technicalTimeout = false;
    }
  }
  
  return newState;
}

function getMatchSummary(state: VolleyballState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Team A' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Team B' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 23 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 25 },
  { id: 'team1SetsWon', type: 'score', label: 'Sets 1', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team1SetsWon', behaviorType: 'text' }, sample: 2 },
  { id: 'team2SetsWon', type: 'score', label: 'Sets 2', category: 'Score', defaultProps: { fontSize: 32 }, dataBinding: { field: 'team2SetsWon', behaviorType: 'text' }, sample: 1 },
  { id: 'currentSet', type: 'text', label: 'Set', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentSet', behaviorType: 'text', formatter: 'Set {value}' }, sample: 3 },
];

const volleyballConfig: SportConfig<VolleyballState> = {
  id: 'volleyball',
  name: 'Volleyball',
  description: 'Volleyball scoring with rally scoring, sets to 25, and deciding set to 15',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(volleyballConfig);

export type { VolleyballState }; export { volleyballConfig };
