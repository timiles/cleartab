import { areArraysEqual, isArrayNotEmpty, isNotNullish, range } from './arrayUtils';

describe('arrayUtils', () => {
  describe('isArrayNotEmpty', () => {
    it('returns false if array is null', () => {
      expect(isArrayNotEmpty(null)).toBe(false);
    });

    it('returns false if array is undefined', () => {
      expect(isArrayNotEmpty(undefined)).toBe(false);
    });

    it('returns false if array is empty', () => {
      expect(isArrayNotEmpty([])).toBe(false);
    });

    it('returns true if array has items', () => {
      expect(isArrayNotEmpty([0])).toBe(true);
    });
  });

  describe('areArraysEqual', () => {
    it('returns false if arrays are different lengths', () => {
      expect(areArraysEqual([1], [1], [1, 2])).toBe(false);
    });

    it('returns false if arrays have different items', () => {
      expect(areArraysEqual([1, 2], [1, 2], [1, 3])).toBe(false);
    });

    it('returns false if array items are not strictly equal', () => {
      expect(areArraysEqual([1, 2], [1, 2], [1, '2'])).toBe(false);
    });

    it('returns true if arrays have same items', () => {
      expect(areArraysEqual([1, 2], [1, 2], [1, 2])).toBe(true);
    });
  });

  describe('isNotNullish', () => {
    it('returns only non-nullish number values', () => {
      const array = [3, null, -1, undefined, 0];
      const expected = [3, -1, 0];
      expect(array.filter(isNotNullish)).toStrictEqual(expected);
    });

    it('returns only non-nullish string values', () => {
      const array = ['foo', null, 'bar', undefined, ''];
      const expected = ['foo', 'bar', ''];
      expect(array.filter(isNotNullish)).toStrictEqual(expected);
    });
  });

  describe('range', () => {
    it('returns range as expected', () => {
      expect(range(5)).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });
});
