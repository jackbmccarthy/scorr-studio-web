// Ice Hockey Sport Configuration

import { registerSport, createBaseMatchState, createBaseMatch, createBaseMatchSummary } from './registry';
import type { SportConfig, BaseMatchState, InitialStateData, CreateMatchParams, SportAction, KonvaBlockDefinition } from '../types';

interface IceHockeyState extends BaseMatchState {
  // Periods
  currentPeriod: number;
  totalPeriods: number;
  periodLength: number;
  
  // Scores by period
  team1PeriodScores: number[];
  team2PeriodScores: number[];
  
  // Shots on goal
  team1Shots: number;
  team2Shots: number;
  
  // Penalties
  team1Penalties: number;
  team2Penalties: number;
  team1PenaltyMinutes: number;
  team2PenaltyMinutes: number;
  
  // Power play / Short handed
  powerPlayTeam: 1 | 2 | null;
  team1PowerPlayGoals: number;
  team2PowerPlayGoals: number;
  
  // Empty net
  team1EmptyNet: boolean;
  team2EmptyNet: boolean;
  
  // Overtime / Shootout
  inOvertime: boolean;
  overtimeLength: number;
  inShootout: boolean;
  team1ShootoutGoals: number;
  team2ShootoutGoals: number;
  
  matchWinner: 1 | 2 | null;
}

function getInitialState(data?: InitialStateData): IceHockeyState {
  const base = createBaseMatchState(data);
  return {
    ...base,
    currentPeriod: 1,
    totalPeriods: 3,
    periodLength: 1200, // 20 minutes
    team1PeriodScores: [0, 0, 0],
    team2PeriodScores: [0, 0, 0],
    team1Shots: 0,
    team2Shots: 0,
    team1Penalties: 0,
    team2Penalties: 0,
    team1PenaltyMinutes: 0,
    team2PenaltyMinutes: 0,
    powerPlayTeam: null,
    team1PowerPlayGoals: 0,
    team2PowerPlayGoals: 0,
    team1EmptyNet: false,
    team2EmptyNet: false,
    inOvertime: false,
    overtimeLength: 300, // 5 minutes
    inShootout: false,
    team1ShootoutGoals: 0,
    team2ShootoutGoals: 0,
    matchWinner: null,
    team1Score: 0,
    team2Score: 0,
    clock: { seconds: 1200, isRunning: false, direction: 'down' },
    period: 1,
  } as IceHockeyState;
}

function createMatch(params: CreateMatchParams) {
  return createBaseMatch(params, getInitialState({
    team1: params.team1,
    team2: params.team2,
    eventName: params.eventName,
    matchRound: params.matchRound,
  }));
}

function handleAction(state: IceHockeyState, action: SportAction): IceHockeyState {
  const newState = { ...state };
  
  switch (action.type) {
    case 'SCORE_TEAM1':
      return handleGoal(newState, 1);
    case 'SCORE_TEAM2':
      return handleGoal(newState, 2);
    case 'SHOT_TEAM1':
      newState.team1Shots++;
      return newState;
    case 'SHOT_TEAM2':
      newState.team2Shots++;
      return newState;
    case 'PENALTY_TEAM1':
      newState.team1Penalties++;
      newState.team1PenaltyMinutes += (action.payload as number) || 2;
      newState.powerPlayTeam = 2;
      return newState;
    case 'PENALTY_TEAM2':
      newState.team2Penalties++;
      newState.team2PenaltyMinutes += (action.payload as number) || 2;
      newState.powerPlayTeam = 1;
      return newState;
    case 'PENALTY_END':
      return { ...newState, powerPlayTeam: null };
    case 'EMPTY_NET_TEAM1':
      return { ...newState, team1EmptyNet: true };
    case 'EMPTY_NET_TEAM2':
      return { ...newState, team2EmptyNet: true };
    case 'GOALIE_RETURN_TEAM1':
      return { ...newState, team1EmptyNet: false };
    case 'GOALIE_RETURN_TEAM2':
      return { ...newState, team2EmptyNet: false };
    case 'NEXT_PERIOD':
      return handleNextPeriod(newState);
    case 'START_OVERTIME':
      return { ...newState, inOvertime: true, clock: { ...state.clock, seconds: state.overtimeLength } };
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

function handleGoal(state: IceHockeyState, team: 1 | 2): IceHockeyState {
  const newState = { ...state };
  
  if (team === 1) {
    newState.team1Score++;
    newState.team1PeriodScores[state.currentPeriod - 1]++;
    newState.team1Shots++;
    if (state.powerPlayTeam === 1) newState.team1PowerPlayGoals++;
  } else {
    newState.team2Score++;
    newState.team2PeriodScores[state.currentPeriod - 1]++;
    newState.team2Shots++;
    if (state.powerPlayTeam === 2) newState.team2PowerPlayGoals++;
  }
  
  return newState;
}

function handleNextPeriod(state: IceHockeyState): IceHockeyState {
  if (state.currentPeriod < state.totalPeriods) {
    return {
      ...state,
      currentPeriod: state.currentPeriod + 1,
      period: state.currentPeriod + 1,
      clock: { ...state.clock, seconds: state.periodLength },
      powerPlayTeam: null,
      team1EmptyNet: false,
      team2EmptyNet: false,
    };
  }
  
  // End of regulation - check for tie
  if (state.team1Score === state.team2Score) {
    return { ...state, inOvertime: true, clock: { ...state.clock, seconds: state.overtimeLength } };
  }
  
  return { ...state, status: 'finished' };
}

function getMatchSummary(state: IceHockeyState) {
  return createBaseMatchSummary(state);
}

const konvaBlocks: KonvaBlockDefinition[] = [
  { id: 'team1Name', type: 'text', label: 'Team 1', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName1', behaviorType: 'text' }, sample: 'Bruins' },
  { id: 'team2Name', type: 'text', label: 'Team 2', category: 'Teams', defaultProps: { fontSize: 24 }, dataBinding: { field: 'teamName2', behaviorType: 'text' }, sample: 'Rangers' },
  { id: 'team1Score', type: 'score', label: 'Score 1', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team1Score', behaviorType: 'text', animation: 'pulse' }, sample: 3 },
  { id: 'team2Score', type: 'score', label: 'Score 2', category: 'Score', defaultProps: { fontSize: 72 }, dataBinding: { field: 'team2Score', behaviorType: 'text', animation: 'pulse' }, sample: 2 },
  { id: 'period', type: 'text', label: 'Period', category: 'Match', defaultProps: { fontSize: 18 }, dataBinding: { field: 'currentPeriod', behaviorType: 'text', formatter: '{value}st Period' }, sample: 2 },
  { id: 'clock', type: 'timer', label: 'Clock', category: 'Time', defaultProps: { format: 'MM:SS' }, dataBinding: { field: 'clock.seconds', behaviorType: 'countdown' }, sample: 845 },
  { id: 'team1Shots', type: 'text', label: 'Shots 1', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team1Shots', behaviorType: 'text' }, sample: 24 },
  { id: 'team2Shots', type: 'text', label: 'Shots 2', category: 'Stats', defaultProps: { fontSize: 18 }, dataBinding: { field: 'team2Shots', behaviorType: 'text' }, sample: 18 },
];

const iceHockeyConfig: SportConfig<IceHockeyState> = {
  id: 'ice-hockey',
  name: 'Ice Hockey',
  description: 'Ice hockey scoring with periods, power plays, and overtime/shootout',
  initialState: getInitialState(),
  getInitialState,
  createMatch,
  getMatchSummary,
  konvaConfig: { blocks: konvaBlocks, defaultCanvasSize: { width: 1920, height: 1080 } },
  handleAction,
};

registerSport(iceHockeyConfig);

export type { IceHockeyState }; export { iceHockeyConfig };
