// Utility Functions Tests

import { describe, it, expect } from 'vitest';
import {
  cn,
  generateId,
  generateUUID,
  formatTime,
  formatTimeLong,
  formatDate,
  truncate,
  capitalize,
  slugify,
  getOrdinal,
  formatNumber,
} from './utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toBe('base included');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });
  });

  describe('formatTime', () => {
    it('should format seconds as MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('formatTimeLong', () => {
    it('should format seconds as HH:MM:SS', () => {
      expect(formatTimeLong(3661)).toBe('1:01:01');
      expect(formatTimeLong(65)).toBe('01:05');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const result = truncate('This is a very long text', 10);
      expect(result).toBe('This is...');
    });

    it('should not truncate short text', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This is a Test!')).toBe('this-is-a-test');
    });
  });

  describe('getOrdinal', () => {
    it('should return correct ordinal suffixes', () => {
      expect(getOrdinal(1)).toBe('1st');
      expect(getOrdinal(2)).toBe('2nd');
      expect(getOrdinal(3)).toBe('3rd');
      expect(getOrdinal(4)).toBe('4th');
      expect(getOrdinal(11)).toBe('11th');
      expect(getOrdinal(21)).toBe('21st');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });
});
