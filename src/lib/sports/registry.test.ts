// Sports Registry Tests

import { describe, it, expect, beforeEach } from 'vitest';
import { getSportConfig, getAllSports, registerSport } from './registry';
import type { SportConfig, BaseMatchState } from '../types';

// Import all sports to trigger registration
import './index';

describe('Sports Registry', () => {
  describe('getSportConfig', () => {
    it('should return table tennis config', () => {
      const config = getSportConfig('table-tennis');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Table Tennis');
    });

    it('should return basketball config', () => {
      const config = getSportConfig('basketball');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Basketball');
    });

    it('should return undefined for unknown sport', () => {
      const config = getSportConfig('unknown-sport');
      expect(config).toBeUndefined();
    });
  });

  describe('getAllSports', () => {
    it('should return all registered sports', () => {
      const sports = getAllSports();
      expect(sports.length).toBeGreaterThanOrEqual(20);
    });

    it('should include expected sports', () => {
      const sports = getAllSports();
      const sportIds = sports.map(s => s.id);
      
      expect(sportIds).toContain('table-tennis');
      expect(sportIds).toContain('basketball');
      expect(sportIds).toContain('soccer');
      expect(sportIds).toContain('tennis');
    });
  });

  describe('registerSport', () => {
    it('should register a new sport', () => {
      const customSport: SportConfig = {
        id: 'test-sport',
        name: 'Test Sport',
        description: 'A test sport',
        initialState: {} as BaseMatchState,
        getInitialState: () => ({} as BaseMatchState),
        createMatch: (params) => ({
          id: params.id,
          sportId: 'test-sport',
          tenantId: params.tenantId,
          status: 'scheduled',
          team1Id: null,
          team2Id: null,
          team1: { id: null, name: 'Team 1', score: 0 },
          team2: { id: null, name: 'Team 2', score: 0 },
          state: {} as BaseMatchState,
          createdAt: new Date().toISOString(),
        }),
        getMatchSummary: (state) => ({
          status: state.status,
          team1Score: 0,
          team2Score: 0,
          team1: { name: 'Team 1', score: 0 },
          team2: { name: 'Team 2', score: 0 },
        }),
        handleAction: (state) => state,
      };

      registerSport(customSport);
      
      const config = getSportConfig('test-sport');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Test Sport');
    });
  });
});
