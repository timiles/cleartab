const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

export function getNoteNameFromMidiNote(midiNote: number): string {
  return NOTE_NAMES[midiNote % 12];
}
