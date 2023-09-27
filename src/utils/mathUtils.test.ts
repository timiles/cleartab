import { findGreatestCommonDivisor, findLowestCommonMultiple } from './mathUtils';

describe('mathUtils', () => {
  describe('findGreatestCommonDivisor', () => {
    it('handles positive integers', () => {
      expect(findGreatestCommonDivisor(24, 42)).toBe(6);
    });

    it('handles negative integers', () => {
      expect(findGreatestCommonDivisor(-24, 42)).toBe(6);
    });

    it('rejects non-integers', () => {
      expect(() => findGreatestCommonDivisor(24.5, 42)).toThrowError(
        'a and b must be integers. a: 24.5, b: 42.',
      );
    });
  });

  describe('findLowestCommonMultiple', () => {
    it('handles empty array', () => {
      expect(findLowestCommonMultiple([])).toBe(1);
    });

    it('handles positive integers', () => {
      expect(findLowestCommonMultiple([105, 130])).toBe(2730);
    });

    it('handles repeated inputs', () => {
      expect(findLowestCommonMultiple([105, 105, 105, 130, 130])).toBe(2730);
    });

    it('handles many distinct inputs', () => {
      expect(findLowestCommonMultiple([1, 2, 3, 5, 6, 7])).toBe(210);
    });

    it('handles negative integers', () => {
      expect(findLowestCommonMultiple([105, -105, 105, -130, 130])).toBe(2730);
    });

    it('rejects non-integers', () => {
      expect(() => findLowestCommonMultiple([105, 130.5])).toThrowError(
        'numbers must be integers.',
      );
    });
  });
});
