// Field Hockey Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface FieldHockeyState extends BaseMatchState {
  // Quarters
  currentQuarter: number;
  totalQuarters: number;
  quarterLength: number;
  
  // Scores by quarter
  team1QuarterScores: number[];
  team2QuarterScores: number[];
  
  // Penalty corners
  team1PenaltyCorners: number;
  team2PenaltyCorners: number;
  
  // Penalty strokes
  team1PenaltyStrokes: number;
  team2PenaltyStrokes: number;
  
  // Cards
  team1GreenCards: number;
  team2GreenCards: number;
  team1YellowCards: number;
  team2YellowCards: number;
  team1RedCards: number;
  team2RedCards: number;
  
  // Suspensions (yellow = 5 min)
  team1Suspended: boolean;
  team2Suspended: boolean;
  
  // Shootout (if applicable)
  inShootout: boolean;
  team1ShootoutGoals: number;
  team2ShootoutGoals: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): FieldHockeyState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentQuarter: 1,
    totalQuarters: 4,
    quarterLength: 900, // 15 minutes
    team1QuarterScores: [0, 0, 0, 0],
    team2QuarterScores: [0, 0, 0, 0],
    team1PenaltyCorners: 0,
    team2PenaltyCorners: 0,
    team1PenaltyStrokes: 0,
    team2PenaltyStrokes: 0,
    team1GreenCards: 0,
    team2GreenCards: 0,
    team1YellowCards: 0,
    team2YellowCards: 0,
    team1RedCards: 0,
    team2RedCards: 0,
    team1Suspended: false,
    team2Suspended: false,
    inShootout: false,
    team1ShootoutGoals: 0,
    team2ShootoutGoals: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 900, isRunning: false, direction: 'down' },
    period: 1,
  } as FieldHockeyState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: FieldHockeyState, action: SportAction): FieldHockeyState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      newState.team1Score++;
      newState.team1QuarterScores[state.currentQuarter - 1]++;
      return newState;
    case 'SCORE_TEAM2':
      newState.team2Score++;
      newState.team2QuarterScores[state.currentQuarter - 1]++;
      return newState;
    case 'PENALTY_CORNER_TEAM1':
      newState.team1PenaltyCorners++;
      return newState;
    case 'PENALTY_CORNER_TEAM2':
      newState.team2PenaltyCorners++;
      return newState;
    case 'PENALTY_STROKE_TEAM1':
      newState.team1PenaltyStrokes++;
      return newState;
    case 'PENALTY_STROKE_TEAM2':
      newState.team2PenaltyStrokes++;
      return newState;
    case 'GREEN_CARD_TEAM1':
      newState.team1GreenCards++;
      return newState;
    case 'GREEN_CARD_TEAM2':
      newState.team2GreenCards++;
      return newState;
    case 'YELLOW_CARD_TEAM1':
      newState.team1YellowCards++;
      newState.team1Suspended = true;
      return newState;
    case 'YELLOW_CARD_TEAM2':
      newState.team2YellowCards++;
      newState.team2Suspended = true;
      return newState;
    case 'RED_CARD_TEAM1':
      newState.team1RedCards++;
      return newState;
    case 'RED_CARD_TEAM2':
      newState.team2RedCards++;
      return newState;
    case 'SUSPENSION_END_TEAM1':
      newState.team1Suspended = false;
      return newState;
    case 'SUSPENSION_END_TEAM2':
      newState.team2Suspended = false;
      return newState;
    case 'NEXT_QUARTER':
      return handleNextQuarter(newState);
    case 'START_SHOOTOUT':
      return { ...newState, inShootout: true };
    case 'SHOOTOUT_GOAL_TEAM1':
      newState.team1ShootoutGoals++;
      return newState;
    case 'SHOOTOUT_GOAL_TEAM2':
      newState.team2ShootoutGoals++;
      return newState;
    case 'START_MATCH':
      return { ...newState, status: 'live', isMatchStarted: true };
    case 'END_MATCH':
      return { ...newState, status: 'finished' };
    default:
      return newState;
  }
}

function handleNextQuarter(state: FieldHockeyState): FieldHockeyState {
  if (state.currentQuarter < state.totalQuarters) {
    return {
      ...state,
      currentQuarter: state.currentQuarter + 1,
      period: state.currentQuarter + 1,
      clock: { ...state.clock, seconds: state.quarterLength },
      team1Suspended: false,
      team2Suspended: false,
    };
  }
  
  return { ...state, status: 'finished' };
}

function getMatchSummary(state: FieldHockeyState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Netherlands' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Australia' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 3 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 2 },
  { id: 'quarter', type: 'text', label: 'Quarter', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentQuarter', behaviorType: 'text', formatter: 'Q{value}' }, sample: 3 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 634 },
  { id: 'team1PenaltyCorners', type: 'text', label: 'PC 1', category: 'Stats', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team1PenaltyCorners', behaviorType: 'text' }, sample: 5 },
  { id: 'team2PenaltyCorners', type: 'text', label: 'PC 2', category: 'Stats', defaultProps: { fontSize: 16 }, dataBinding: { field: 'team2PenaltyCorners', behaviorType: 'text' }, sample: 3 },
];

const fieldHockeyConfig: SportConfig<FieldHockeyState> = {
  id: 'field-hockey',
  name: 'Field Hockey',
  description: 'Field hockey scoring with quarters, penalty corners, and card system',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(fieldHockeyConfig);

export type { FieldHockeyState }; export { fieldHockeyConfig };
