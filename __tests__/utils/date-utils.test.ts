// Unit tests for date utility functions
import { formatDate, getMonthKey, formatMonthKey } from '@/lib/utils/date-utils';

describe('date-utils', () => {
  describe('formatDate', () => {
    it('should format date as "Dec 21, 2025"', () => {
      const date = new Date('2025-12-21');
      expect(formatDate(date)).toBe('Dec 21, 2025');
    });

    it('should format January correctly', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2025');
    });
  });

  describe('getMonthKey', () => {
    it('should return month key in YYYY-MM format', () => {
      const date = new Date('2025-03-15');
      expect(getMonthKey(date)).toBe('2025-03');
    });

    it('should pad month with zero', () => {
      const date = new Date('2025-01-15');
      expect(getMonthKey(date)).toBe('2025-01');
    });
  });

  describe('formatMonthKey', () => {
    it('should format month key as "January 2025"', () => {
      expect(formatMonthKey('2025-01')).toBe('January 2025');
    });

    it('should format December correctly', () => {
      expect(formatMonthKey('2025-12')).toBe('December 2025');
    });
  });
});

