const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function getNoteNameFromMidiNote(midiNote: number): string {
  return NOTE_NAMES[midiNote % 12];
}
