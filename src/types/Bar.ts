import { Note } from './Note';

export type Bar = {
  /**
   * `timeSignature` should be set once at the start and then only when it changes.
   */
  timeSignature?: [number, number];
  beats: Array<{
    notes: Array<Note>;
    duration: [number, number];
  }>;
};
