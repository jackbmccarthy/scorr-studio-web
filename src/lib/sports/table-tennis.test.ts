// Table Tennis Tests

import { describe, it, expect } from 'vitest';
import { getSportConfig } from './registry';
import type { CreateMatchParams } from '../types';

// Import all sports to trigger registration
import './index';

describe('Table Tennis Sport', () => {
  const config = getSportConfig('table-tennis');
  
  it('should have correct initial state', () => {
    const state = config?.getInitialState();
    
    expect(state).toBeDefined();
    expect(state?.bestOf).toBe(5);
    expect(state?.pointsToWin).toBe(11);
    expect(state?.deuceEnabled).toBe(true);
    expect(state?.team1Games).toBeDefined();
    expect(state?.team2Games).toBeDefined();
  });

  it('should create a match with correct defaults', () => {
    const params: CreateMatchParams = {
      id: 'test-match',
      tenantId: 'test-tenant',
      team1: { name: 'Player A' },
      team2: { name: 'Player B' },
    };

    const match = config?.createMatch(params);

    expect(match).toBeDefined();
    expect(match?.id).toBe('test-match');
    expect(match?.team1.name).toBe('Player A');
    expect(match?.team2.name).toBe('Player B');
    expect(match?.status).toBe('scheduled');
  });

  it('should handle score actions', () => {
    let state = config?.getInitialState();
    if (!state) return;

    state = config?.handleAction(state, { type: 'START_MATCH' });
    expect(state?.status).toBe('live');

    state = config?.handleAction(state!, { type: 'SCORE_TEAM1' });
    expect(state?.team1Score).toBe(1);

    state = config?.handleAction(state!, { type: 'SCORE_TEAM2' });
    expect(state?.team2Score).toBe(1);
  });

  it('should switch server', () => {
    let state = config?.getInitialState();
    if (!state) return;

    const initialServer = state.currentServer;
    
    state = config?.handleAction(state, { type: 'SWITCH_SERVER' });
    expect(state?.currentServer).not.toBe(initialServer);
  });

  it('should return correct match summary', () => {
    const state = config?.getInitialState();
    if (!state) return;

    const summary = config?.getMatchSummary(state);
    
    expect(summary).toBeDefined();
    expect(summary?.status).toBe('scheduled');
    expect(summary?.team1Score).toBe(0);
    expect(summary?.team2Score).toBe(0);
  });

  it('should have Konva blocks defined', () => {
    expect(config?.konvaConfig).toBeDefined();
    expect(config?.konvaConfig?.blocks).toBeDefined();
    expect(config?.konvaConfig?.blocks.length).toBeGreaterThan(0);
  });
});
