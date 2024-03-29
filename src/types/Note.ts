import { NoteTime } from './NoteTime';

export enum NoteModifier {
  Dead,
  HammerOn,
  PullOff,
  SlideDown,
  SlideUp,
  Staccato,
  Tie,
}

export type Note = {
  startNoteTime: NoteTime;
  duration: NoteTime;
  string: number;
  fret: number;
  modifier?: NoteModifier;
};
