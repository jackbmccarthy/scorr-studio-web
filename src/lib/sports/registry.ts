// Sport Registry - Core sport configuration system

import type { SportConfig, BaseMatchState, InitialStateData, Match, CreateMatchParams } from '../types';

// Sport registry singleton - using any to allow different sport types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sports: Record<string, SportConfig<any>> = {};

/**
 * Register a sport configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerSport<TState = unknown>(config: SportConfig<TState & BaseMatchState>): void {
  sports[config.id] = config as SportConfig<unknown>;
}

/**
 * Get a sport configuration by ID
 */
export function getSportConfig(id: string): SportConfig<BaseMatchState> | undefined {
  return sports[id] as SportConfig<BaseMatchState> | undefined;
}

/**
 * Get all registered sports
 */
export function getAllSports(): SportConfig<BaseMatchState>[] {
  return Object.values(sports) as SportConfig<BaseMatchState>[];
}

/**
 * Get default initial state for a sport
 */
export function getDefaultInitialState(sportId: string): BaseMatchState | undefined {
  const config = sports[sportId];
  return config?.initialState;
}

/**
 * Create base match state with common fields
 */
export function createBaseMatchState(data?: InitialStateData): Partial<BaseMatchState> {
  return {
    status: 'scheduled' as const,
    team1Score: 0,
    team2Score: 0,
    clock: {
      seconds: 0,
      isRunning: false,
      direction: 'up' as const,
    },
    period: 1,
    isMatchStarted: false,
    teamName1: data?.team1?.name || 'Team 1',
    teamName2: data?.team2?.name || 'Team 2',
    teamAbbrev1: data?.team1?.name?.substring(0, 3).toUpperCase() || 'T1',
    teamAbbrev2: data?.team2?.name?.substring(0, 3).toUpperCase() || 'T2',
    teamLogo1: data?.team1?.logoUrl || '',
    teamLogo2: data?.team2?.logoUrl || '',
    teamColor1: data?.team1?.color || '#3B82F6',
    teamColor2: data?.team2?.color || '#EF4444',
    matchRound: data?.matchRound || '',
    eventName: data?.eventName || '',
  };
}

/**
 * Create a base match object
 */
export function createBaseMatch<TState = BaseMatchState>(params: CreateMatchParams, state: TState & BaseMatchState): Match<TState> {
  return {
    id: params.id,
    sportId: (params as CreateMatchParams & { sportId?: string }).sportId || '',
    tenantId: params.tenantId,
    status: 'scheduled',
    team1Id: params.team1Id || null,
    team2Id: params.team2Id || null,
    team1: {
      id: params.team1Id || null,
      name: params.team1?.name || 'Team 1',
      logoUrl: params.team1?.logoUrl,
      score: 0,
    },
    team2: {
      id: params.team2Id || null,
      name: params.team2?.name || 'Team 2',
      logoUrl: params.team2?.logoUrl,
      score: 0,
    },
    state,
    createdAt: new Date().toISOString(),
    competitionId: params.competitionId,
    eventId: params.eventId,
    eventName: params.eventName,
    round: params.matchRound,
  };
}

/**
 * Create base match summary
 */
export function createBaseMatchSummary(state: BaseMatchState) {
  return {
    status: state.status,
    team1Score: state.team1Score,
    team2Score: state.team2Score,
    team1: {
      name: state.teamName1,
      score: state.team1Score,
      image: state.teamLogo1 || null,
    },
    team2: {
      name: state.teamName2,
      score: state.team2Score,
      image: state.teamLogo2 || null,
    },
  };
}
