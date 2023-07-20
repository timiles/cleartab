import { getNoteNameFromMidiNote } from './noteNameUtils';

describe('noteNameUtils', () => {
  describe('getNoteNameFromMidiNote', () => {
    it('gets note name as expected', () => {
      expect(getNoteNameFromMidiNote(55)).toBe('G');
      expect(getNoteNameFromMidiNote(54)).toBe('Gb');
      expect(getNoteNameFromMidiNote(50)).toBe('D');
      expect(getNoteNameFromMidiNote(49)).toBe('Db');
      expect(getNoteNameFromMidiNote(45)).toBe('A');
      expect(getNoteNameFromMidiNote(44)).toBe('Ab');
      expect(getNoteNameFromMidiNote(40)).toBe('E');
      expect(getNoteNameFromMidiNote(39)).toBe('Eb');
    });
  });
});
