import { Bar } from 'types/Bar';
import { Note, NoteModifier } from 'types/Note';
import { TrackData } from 'types/TrackData';
import { isArrayNotEmpty } from 'utils/arrayUtils';
import { getNoteNameFromMidiNote } from 'utils/noteNameUtils';
import { SongsterrData, SongsterrNote } from './SongsterrData';

export function isValidSongsterrData(json: Object): boolean {
  const songsterrData = json as SongsterrData;
  return isArrayNotEmpty(songsterrData.tuning) && isArrayNotEmpty(songsterrData.measures);
}

function getNoteModifier(note: SongsterrNote, nextNote?: SongsterrNote): NoteModifier | undefined {
  if (note.hp !== undefined && note.fret !== undefined && nextNote?.fret !== undefined) {
    return note.fret <= nextNote.fret ? NoteModifier.HammerOn : NoteModifier.PullOff;
  }
  if (note.slide !== undefined && note.fret !== undefined && nextNote?.fret !== undefined) {
    return note.fret <= nextNote.fret ? NoteModifier.SlideUp : NoteModifier.SlideDown;
  }
  if (note.staccato) {
    return NoteModifier.Staccato;
  }
  if (note.tie) {
    return NoteModifier.Tie;
  }
  return undefined;
}

export function convertSongsterrDataToTrackData(songsterrData: SongsterrData): TrackData {
  if (!songsterrData.tuning) {
    throw new Error('Tuning data is required.');
  }

  const bars = new Array<Bar>();
  let barIndexAtStartOfRepeat: number | undefined;
  let barIndexAtEndOfRepeat: number | undefined;

  songsterrData.measures.forEach((measure, measureIndex) => {
    const bar: Bar = {
      // Ignore other voices
      beats: measure.voices[0].beats.map((beat, beatIndex) => ({
        duration: beat.duration,
        notes: beat.notes
          .filter((songsterrNote) => !songsterrNote.rest)
          .map((songsterrNote) => {
            if (songsterrNote.string == null) {
              throw new Error('string not set');
            }
            if (songsterrNote.fret == null) {
              throw new Error('fret not set');
            }

            const note: Note = {
              string: songsterrNote.string,
              fret: songsterrNote.fret,
            };

            let modifier: NoteModifier | undefined;

            // Songsterr puts hammer on, pull off, and slides on the previous note
            const prevBeat =
              measure.voices[0].beats[beatIndex - 1] ??
              songsterrData.measures[measureIndex - 1]?.voices[0].beats.at(-1);
            if (prevBeat) {
              const prevNote = prevBeat.notes.find((n) => n.string === songsterrNote.string);
              if (prevNote && (prevNote.hp !== undefined || prevNote?.slide !== undefined)) {
                modifier = getNoteModifier(prevNote, songsterrNote);
              }
            }

            if (modifier === undefined) {
              modifier = getNoteModifier(songsterrNote);
            }

            if (modifier !== undefined) {
              note.modifier = modifier;
            }
            return note;
          }),
      })),
    };

    if (measure.signature) {
      bar.timeSignature = measure.signature;
    }

    if (measure.repeatStart) {
      // Mark the start of repeated section
      barIndexAtStartOfRepeat = bars.length;
    }

    if (
      ((measure.repeat && measure.repeat > 1) || isArrayNotEmpty(measure.alternateEnding)) &&
      barIndexAtStartOfRepeat !== undefined
    ) {
      if (isArrayNotEmpty(measure.alternateEnding)) {
        if (barIndexAtEndOfRepeat === undefined) {
          // Mark the end of repeated section
          barIndexAtEndOfRepeat = bars.length;
        }

        const barsToRepeat = bars.slice(barIndexAtStartOfRepeat, barIndexAtEndOfRepeat);
        measure.alternateEnding.forEach((ending) => {
          bars.push(bar);
          if (ending !== measure.repeat) {
            // If we have more endings to handle, push the repeat section again
            bars.push(...barsToRepeat);
          }
        });

        if (measure.repeat) {
          // Repeats are finished, reset the markers
          barIndexAtStartOfRepeat = undefined;
          barIndexAtEndOfRepeat = undefined;
        }
      } else if (measure.repeat) {
        bars.push(bar);

        const barsToRepeat = bars.slice(barIndexAtStartOfRepeat);
        for (let repeatNumber = 1; repeatNumber < measure.repeat; repeatNumber += 1) {
          bars.push(...barsToRepeat);
        }

        barIndexAtStartOfRepeat = undefined;
      }
    } else {
      bars.push(bar);
    }
  });

  const stringNames = songsterrData.tuning.map((midiNote) => getNoteNameFromMidiNote(midiNote));

  return { stringNames, bars };
}
