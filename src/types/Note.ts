export enum NoteModifier {
  HammerOn,
  PullOff,
  SlideDown,
  SlideUp,
  Staccato,
  Tie,
}

export type Note = {
  string: number;
  fret: number;
  modifier?: NoteModifier;
};
