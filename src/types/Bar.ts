import { Note } from './Note';
import { NoteTime } from './NoteTime';

export type Bar = {
  /**
   * `timeSignature` should be set once at the start and then only when it changes.
   */
  timeSignature?: NoteTime;
  notes: Array<Note>;
};
