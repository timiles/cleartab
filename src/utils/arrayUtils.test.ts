import { isArrayNotEmpty } from './arrayUtils';

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
});
