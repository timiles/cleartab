import { Note } from 'types/Note';
import { NoteTime } from 'types/NoteTime';
import { findGreatestCommonDivisor } from './mathUtils';

export function simplifyNoteTime(noteTime: NoteTime): NoteTime {
  const divisor = findGreatestCommonDivisor(...noteTime);
  return [noteTime[0] / divisor, noteTime[1] / divisor];
}

export function areEquivalentNoteTimes(noteTime1: NoteTime, noteTime2: NoteTime) {
  const simplifiedNoteTime1 = simplifyNoteTime(noteTime1);
  const simplifiedNoteTime2 = simplifyNoteTime(noteTime2);
  return (
    simplifiedNoteTime1[0] === simplifiedNoteTime2[0] &&
    simplifiedNoteTime1[1] === simplifiedNoteTime2[1]
  );
}

export function isNotePlaying(note: Note, now: NoteTime): boolean {
  const multiplier = note.startNoteTime[1] * note.duration[1] * now[1];

  const startValue = (note.startNoteTime[0] * multiplier) / note.startNoteTime[1];
  const durationValue = (note.duration[0] * multiplier) / note.duration[1];
  const nowValue = (now[0] * multiplier) / now[1];

  return startValue <= nowValue && startValue + durationValue > nowValue;
}
