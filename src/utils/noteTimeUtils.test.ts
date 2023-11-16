import { Note } from 'types/Note';
import { areEquivalentNoteTimes, isNotePlaying, simplifyNoteTime } from './noteTimeUtils';

describe('noteTimeUtils', () => {
  describe('simplifyNoteTime', () => {
    it('simplifies NoteTimes as expected', () => {
      expect(simplifyNoteTime([0, 4])).toStrictEqual([0, 1]);
      expect(simplifyNoteTime([1, 4])).toStrictEqual([1, 4]);
      expect(simplifyNoteTime([2, 4])).toStrictEqual([1, 2]);
      expect(simplifyNoteTime([3, 4])).toStrictEqual([3, 4]);
      expect(simplifyNoteTime([4, 4])).toStrictEqual([1, 1]);
    });
  });

  describe('areEquivalentNoteTimes', () => {
    it('returns equivalence as expected', () => {
      expect(areEquivalentNoteTimes([1, 4], [3, 4])).toBe(false);
      expect(areEquivalentNoteTimes([0, 1], [0, 4])).toBe(true);
      expect(areEquivalentNoteTimes([1, 1], [4, 4])).toBe(true);
      expect(areEquivalentNoteTimes([1, 2], [2, 4])).toBe(true);
      expect(areEquivalentNoteTimes([4, 4], [4, 4])).toBe(true);
    });
  });

  describe('isNotePlaying', () => {
    const testNote: Note = {
      startNoteTime: [3, 8],
      duration: [1, 4],
      fret: 0,
      string: 0,
    };
    it('returns value as expected', () => {
      expect(isNotePlaying(testNote, [0, 1])).toBe(false);
      expect(isNotePlaying(testNote, [1, 8])).toBe(false);
      expect(isNotePlaying(testNote, [1, 4])).toBe(false);
      expect(isNotePlaying(testNote, [3, 8])).toBe(true);
      expect(isNotePlaying(testNote, [1, 2])).toBe(true);
      expect(isNotePlaying(testNote, [5, 8])).toBe(false);
      expect(isNotePlaying(testNote, [3, 4])).toBe(false);
      expect(isNotePlaying(testNote, [7, 8])).toBe(false);
      expect(isNotePlaying(testNote, [1, 1])).toBe(false);
    });
  });
});
