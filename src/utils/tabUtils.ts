import deepEqual from 'deep-equal';
import { Note, NoteModifier } from 'types/Note';
import { TabData } from 'types/TabData';
import { TrackData } from 'types/TrackData';
import { isArrayNotEmpty } from './arrayUtils';

const DOUBLE_SIZE_NOTE_BRACKET = '⌐¬';
const REPEAT_QUAVER = '’';
const REPEAT_QUAVERS = '”';
const QUAVER_BEAT_TYPE = 8;

function getBarLineText(lineIndex: number, lineOffset: number): string {
  return lineIndex < lineOffset ? ' ' : '|';
}

function getSpacerText(lineIndex: number, lineOffset: number): string {
  return lineIndex < lineOffset ? ' ' : '-';
}

function getNoteSize({ fret, modifier }: Note): number {
  // Fret 10 will be rendered as ю, so size of 1. Frets 11 and above have size 2.
  return fret >= 11 && modifier !== NoteModifier.Tie ? 2 : 1;
}

function getNoteText({ fret, modifier }: Note, noteSize: number): string {
  if (modifier === NoteModifier.Tie) {
    return '~'.repeat(noteSize);
  }
  const fretText = fret === 10 && noteSize === 1 ? 'ю' : fret.toString();
  return fretText.padStart(noteSize, '-');
}

function getNoteModifierText({ modifier }: Note, noteSize: number = 1): string | null {
  if (modifier !== undefined) {
    switch (modifier) {
      case NoteModifier.HammerOn:
        return 'h'.padEnd(noteSize, DOUBLE_SIZE_NOTE_BRACKET[1]);
      case NoteModifier.PullOff:
        return 'p'.padEnd(noteSize, DOUBLE_SIZE_NOTE_BRACKET[1]);
      case NoteModifier.SlideDown:
        return '\\'.padStart(noteSize, DOUBLE_SIZE_NOTE_BRACKET[0]);
      case NoteModifier.SlideUp:
        return '/'.padEnd(noteSize, DOUBLE_SIZE_NOTE_BRACKET[1]);
      case NoteModifier.Staccato:
        return '.'.padStart(noteSize, DOUBLE_SIZE_NOTE_BRACKET[0]);
      case NoteModifier.Tie:
        return null;
      default: {
        const exhaustiveCheck: never = modifier;
        throw new Error(`Unknown NoteModifier: ${modifier}.`);
      }
    }
  }
  return null;
}

function renderTuningTab(stringNames: Array<string>) {
  const maxLengthStringName = Math.max(...stringNames.map((s) => s.length));
  return stringNames.map((s) => `${s.padStart(maxLengthStringName, ' ')}|`).join('\n');
}

function renderTimeSignatureTab(timeSignature: [number, number], numberOfStrings: number) {
  if (numberOfStrings === 1) {
    return `${timeSignature[0]}/${timeSignature[1]}:`;
  }

  const size = Math.max(...timeSignature.map((value) => value.toString().length));
  const lines = new Array<string>(numberOfStrings).fill('');

  const startLineIndex = Math.floor((numberOfStrings - 2) / 2);
  lines[startLineIndex] = timeSignature[0].toString();
  lines[startLineIndex + 1] = timeSignature[1].toString();

  return lines.map((value) => `${value.padStart(size, ' ')}:`).join('\n');
}

export function convertTrackDataToTabData({ stringNames, bars }: TrackData): TabData {
  const tabData: TabData = {
    tuningTab: renderTuningTab(stringNames),
    timeSignatureTabsLookup: new Map<number, string>(),
    barTabs: new Array<string>(),
  };

  // This is the number of repeat quavers before we use ” instead of ’
  let repeatQuaverCountThreshold: number | undefined;

  bars.forEach((bar, barIndex) => {
    if (bar.timeSignature) {
      tabData.timeSignatureTabsLookup.set(
        barIndex,
        renderTimeSignatureTab(bar.timeSignature, stringNames.length),
      );

      repeatQuaverCountThreshold =
        (bar.timeSignature[0] / bar.timeSignature[1]) * (QUAVER_BEAT_TYPE / 2) - 1;
    }

    const topStringHasAnnotations = bar.beats
      .flatMap((beat) => beat.notes.filter((note) => note.string === 0))
      .some((note) => getNoteModifierText(note) !== null || getNoteSize(note) === 2);
    const lineOffset = topStringHasAnnotations ? 1 : 0;
    const lines = new Array<string>(stringNames.length + lineOffset).fill('');

    const shortestBeatType = Math.max(...bar.beats.map((beat) => beat.duration[1]));
    let repeatQuaverCount = 0;

    bar.beats.forEach((beat, beatIndex) => {
      const noteSize = isArrayNotEmpty(beat.notes) ? Math.max(...beat.notes.map(getNoteSize)) : 1;
      const beatSize = (beat.duration[0] * shortestBeatType) / beat.duration[1] + noteSize - 1;

      const isRepeatQuaver =
        shortestBeatType === QUAVER_BEAT_TYPE &&
        beat.duration[0] === 1 &&
        beat.duration[1] === QUAVER_BEAT_TYPE &&
        beatIndex > 0 &&
        deepEqual(bar.beats[beatIndex - 1], beat);
      if (isRepeatQuaver) {
        repeatQuaverCount += 1;
      } else {
        repeatQuaverCount = 0;
      }

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const stringIndex = lineIndex - lineOffset;
        const noteOnLine = beat.notes.find((note) => note.string === stringIndex);

        if (noteOnLine) {
          if (isRepeatQuaver) {
            if (repeatQuaverCountThreshold && repeatQuaverCount < repeatQuaverCountThreshold) {
              lines[lineIndex] += REPEAT_QUAVER;
            }
            if (repeatQuaverCount === repeatQuaverCountThreshold) {
              const lastQuaverIndex = lines[lineIndex].length - repeatQuaverCount + 1;
              lines[lineIndex] = lines[lineIndex].substring(0, lastQuaverIndex);
              lines[lineIndex] += REPEAT_QUAVERS;
            }
          } else {
            lines[lineIndex] += getNoteText(noteOnLine, noteSize) + '~'.repeat(beatSize - noteSize);
          }
        } else if (isRepeatQuaver) {
          if (repeatQuaverCountThreshold && repeatQuaverCount < repeatQuaverCountThreshold) {
            lines[lineIndex] += getSpacerText(lineIndex, lineOffset);
          }
          if (repeatQuaverCount === repeatQuaverCountThreshold) {
            const lastQuaverIndex = lines[lineIndex].length - repeatQuaverCount + 1;
            lines[lineIndex] = lines[lineIndex].substring(0, lastQuaverIndex);
            lines[lineIndex] += getSpacerText(lineIndex, lineOffset);
          }
        } else {
          const noteOnLineBelow = beat.notes.find((note) => note.string === stringIndex + 1);
          if (noteOnLineBelow) {
            const modifier = getNoteModifierText(noteOnLineBelow, noteSize);
            if (modifier) {
              lines[lineIndex] +=
                modifier + getSpacerText(lineIndex, lineOffset).repeat(beatSize - noteSize);
            } else if (getNoteSize(noteOnLineBelow) === 2) {
              lines[lineIndex] +=
                DOUBLE_SIZE_NOTE_BRACKET +
                getSpacerText(lineIndex, lineOffset).repeat(beatSize - noteSize);
            } else {
              lines[lineIndex] += getSpacerText(lineIndex, lineOffset).repeat(beatSize);
            }
          } else {
            lines[lineIndex] += getSpacerText(lineIndex, lineOffset).repeat(beatSize);
          }
        }
      }
    });

    tabData.barTabs.push(
      lines.map((line, lineIndex) => `${line}${getBarLineText(lineIndex, lineOffset)}`).join('\n'),
    );
  });

  return tabData;
}

export function joinTabs(...tabs: ReadonlyArray<string>) {
  const splitTabs = tabs.map((tab) => tab.split('\n'));
  const maxLineCount = Math.max(...splitTabs.map((lines) => lines.length));

  const lines = new Array<string>();

  for (let lineIndex = 0; lineIndex < maxLineCount; lineIndex += 1) {
    lines.push(
      splitTabs
        .map((splitTab) => {
          const maxLineLength = Math.max(...splitTab.map((line) => line.length));

          // Check if this tab needs extra lines at the top, to match adjacent tabs with annotations
          const lineOffset = maxLineCount - splitTab.length;
          const isExtraTopLine = lineIndex < lineOffset;

          return isExtraTopLine
            ? ' '.repeat(maxLineLength)
            : splitTab[lineIndex - lineOffset].padEnd(maxLineLength, ' ');
        })
        .join(''),
    );
  }

  return lines.join('\n');
}
