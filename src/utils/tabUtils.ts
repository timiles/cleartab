import deepEqual from 'deep-equal';
import { Note, NoteModifier } from 'types/Note';
import { TabData } from 'types/TabData';
import { TrackData } from 'types/TrackData';
import { isArrayNotEmpty } from './arrayUtils';
import { findLowestCommonMultiple } from './mathUtils';

const BAR_LINE = '|';
const REPEAT_BAR_LINE = '‖';
const DOUBLE_SIZE_NOTE_BRACKET = '⌐¬';
const REPEAT_BAR = '%';
const EMPTY_NOTE = '-';
const REPEAT_QUAVER = '’';
const REPEAT_QUAVERS = '”';
const QUAVER_BEAT_TYPE = 8;

type Riff<T = string> = {
  bars: ReadonlyArray<T>;
  endings?: ReadonlyArray<ReadonlyArray<T>>;
};

type Order = {
  riffIndex: number;
  endingIndex?: number;
  times: number;
};

function getBarLineText(lineIndex: number, lineOffset: number): string {
  return lineIndex < lineOffset ? ' ' : BAR_LINE;
}

function getSpacerText(lineIndex: number, lineOffset: number): string {
  return lineIndex < lineOffset ? ' ' : EMPTY_NOTE;
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
  return fretText.padStart(noteSize, EMPTY_NOTE);
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

/**
 * This helper assumes that all lines of the tab are the same length,
 * so returns the length of the top line.
 */
function getTabLineLength(tab: string): number {
  const indexOfFirstNewLine = tab.indexOf('\n');
  // If no new lines, tab is just one line so return the length of the whole tab
  return indexOfFirstNewLine < 0 ? tab.length : indexOfFirstNewLine;
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

    const shortestBeatType = findLowestCommonMultiple(bar.beats.map((beat) => beat.duration[1]));

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
          // Check if this tab needs extra lines at the top, to match adjacent tabs with annotations
          const lineOffset = maxLineCount - splitTab.length;
          const isExtraTopLine = lineIndex < lineOffset;

          const maxLineLength = Math.max(...splitTab.map((line) => line.length));
          return isExtraTopLine
            ? ' '.repeat(maxLineLength)
            : splitTab[lineIndex - lineOffset].padEnd(maxLineLength, ' ');
        })
        .join(''),
    );
  }

  return lines.join('\n');
}

export function getBarTabsWithTimeSignatures({
  barTabs,
  timeSignatureTabsLookup,
}: TabData): ReadonlyArray<[barTab: string, timeSignatureTab: string]> {
  let currentTimeSignatureTab = '';
  return barTabs.map((barTab, barIndex) => {
    const timeSignatureTab = timeSignatureTabsLookup.get(barIndex);
    if (timeSignatureTab !== undefined) {
      currentTimeSignatureTab = timeSignatureTab;
    }
    return [barTab, currentTimeSignatureTab];
  });
}

export function formatRiffOrderLabel(order: {
  riffIndex: number;
  endingIndex?: number;
  times: number;
}): string {
  const { riffIndex, endingIndex, times } = order;
  const riffText = `Riff ${riffIndex + 1}`;
  const endingText = endingIndex !== undefined ? `[${endingIndex + 1}]` : '';
  const timesText = times > 1 ? ` (x${times})` : '';
  return `${riffText}${endingText}${timesText}`;
}

export function formatRiffLabel(riffIndex: number): string {
  return `[Riff ${riffIndex + 1}]`;
}

function formatEndingLabel(
  endingBars: ReadonlyArray<string>,
  currentBarIndex: number,
  endingIndex: number,
): string {
  const endingNumber = endingIndex + 1;

  // Add some padding so the label spans all of the bars in this ending
  const currentBarSize = getTabLineLength(endingBars[currentBarIndex]);
  if (endingBars.length === 1) {
    const gapSize = currentBarSize - `[${endingNumber}.]`.length;
    const innerPadding = gapSize > 1 ? ' '.repeat(gapSize - 1) : '';
    const outerPadding = gapSize > 0 ? ' ' : '';
    return `[${endingNumber}.${innerPadding}]${outerPadding}`;
  }

  if (currentBarIndex === 0) {
    return `${`[${endingNumber}.`.padEnd(currentBarSize, ' ')}`;
  }
  if (currentBarIndex === endingBars.length - 1) {
    return `${' '.repeat(currentBarSize - 2)}] `;
  }
  return '';
}

function isNote(char: string): boolean {
  return char >= '0' && char <= '9';
}

function formatRepeatedBar(barTab: string) {
  const barLines = barTab.split('\n').filter((line) => line.endsWith(BAR_LINE));

  const indexOfFirstNote = Math.min(
    ...barLines
      .map((line) => line.split(BAR_LINE))
      .map(([line]) => Array.from(line).findIndex(isNote))
      .filter((index) => index >= 0),
  );

  const lineIndexesForRepeatSign = Number.isFinite(indexOfFirstNote)
    ? barLines
        .map((line, lineIndex) => (isNote(line[indexOfFirstNote]) ? lineIndex : null))
        .filter((lineIndex) => lineIndex !== null)
    : // If bar has no notes, put the repeat sign on the middle line
      [Math.floor((barLines.length - 1) / 2)];

  return barLines
    .map(
      (_, lineIndex) =>
        (lineIndexesForRepeatSign.includes(lineIndex) ? REPEAT_BAR : EMPTY_NOTE) + BAR_LINE,
    )
    .join('\n');
}

function replaceRepeatedBars(
  riff: Riff<{ barTab: string; timeSignatureTab: string }>,
): Riff<{ barTab: string; timeSignatureTab: string }> {
  const returnRiff: ReturnType<typeof replaceRepeatedBars> = {
    bars: riff.bars.slice(),
    endings: riff.endings?.map((ending) => ending.slice()),
  };

  let previousDistinctBar = returnRiff.bars[0];
  for (let barIndex = 1; barIndex < returnRiff.bars.length; barIndex += 1) {
    const bar = returnRiff.bars[barIndex];
    if (
      Array.from(bar.barTab).findIndex(isNote) >= 0 &&
      bar.barTab === previousDistinctBar?.barTab &&
      bar.timeSignatureTab === previousDistinctBar.timeSignatureTab
    ) {
      bar.barTab = formatRepeatedBar(bar.barTab);
    } else {
      previousDistinctBar = bar;
    }
  }

  if (returnRiff.endings) {
    for (let endingIndex = 0; endingIndex < returnRiff.endings.length; endingIndex += 1) {
      let previousDistinctEndingBar = previousDistinctBar;
      const ending = returnRiff.endings[endingIndex];

      for (let barIndex = 0; barIndex < ending.length; barIndex += 1) {
        const bar = ending[barIndex];
        if (
          bar.barTab === previousDistinctEndingBar?.barTab &&
          bar.timeSignatureTab === previousDistinctEndingBar.timeSignatureTab
        ) {
          bar.barTab = formatRepeatedBar(bar.barTab);
        } else {
          previousDistinctEndingBar = bar;
        }
      }
    }
  }

  return returnRiff;
}

function applyTimeSignatures(
  inputRiffs: ReadonlyArray<Riff<{ barTab: string; timeSignatureTab: string }>>,
  order: ReadonlyArray<Order>,
): ReadonlyArray<Riff> {
  // Make an editable copy for output
  const returnRiffs = inputRiffs.map(({ bars, endings }) => ({
    bars: bars.map(({ barTab }) => barTab),
    endings: endings?.map((ending) => ending.map(({ barTab }) => barTab)),
  }));

  // Track current time signature so we know when to apply changes
  let currentTimeSignatureTab = '';

  const applyTimeSignatureIfNeeded = (
    riffIndex: number,
    endingIndex: number | undefined,
    barIndex: number,
  ): void => {
    const timeSignatureTab =
      endingIndex !== undefined
        ? inputRiffs[riffIndex].endings![endingIndex][barIndex].timeSignatureTab
        : inputRiffs[riffIndex].bars[barIndex].timeSignatureTab;

    if (currentTimeSignatureTab !== timeSignatureTab) {
      currentTimeSignatureTab = timeSignatureTab;

      const bars =
        endingIndex !== undefined
          ? returnRiffs[riffIndex].endings![endingIndex]
          : returnRiffs[riffIndex].bars;

      const currentBarTab = bars[barIndex];

      // Prepend time signature if it hasn't already been rendered into tab
      if (!currentBarTab.includes(':')) {
        bars[barIndex] = joinTabs(timeSignatureTab, currentBarTab);
      }
    }
  };

  order.forEach(({ riffIndex, endingIndex, times }) => {
    // If riff is repeated (times > 1) then we want to run through twice.
    const repeatTimes = Math.min(2, times);
    for (let repeatTime = 0; repeatTime < repeatTimes; repeatTime += 1) {
      const barsLength = inputRiffs[riffIndex].bars.length;

      for (let barIndex = 0; barIndex < barsLength; barIndex += 1) {
        applyTimeSignatureIfNeeded(riffIndex, undefined, barIndex);
      }

      if (endingIndex !== undefined) {
        const endingLength = inputRiffs[riffIndex].endings![endingIndex].length;

        for (let barIndex = 0; barIndex < endingLength; barIndex += 1) {
          applyTimeSignatureIfNeeded(riffIndex, endingIndex, barIndex);
        }
      }
    }
  });

  return returnRiffs;
}

function applyOpeningBarLine(inputRiff: Riff): Riff {
  const { bars, endings } = inputRiff;

  const returnBars = bars.slice();

  const firstBarLineCharacter = isArrayNotEmpty(endings) ? REPEAT_BAR_LINE : BAR_LINE;
  returnBars[0] = returnBars[0]
    .split('\n')
    .map(
      (line) =>
        // Handle extra line for annotations: only prepend bar line if line also ends with a bar line
        `${line.endsWith(BAR_LINE) ? firstBarLineCharacter : ' '}${line}`,
    )
    .join('\n');

  return { bars: returnBars, endings };
}

function applyTabMinLineLength(tab: string, minLineLength: number): string {
  const tabLines = tab.split('\n');
  if (tabLines[0].length >= minLineLength) {
    return tab;
  }
  return tabLines.map((line) => line.padEnd(minLineLength, ' ')).join('\n');
}

function flattenEndings(inputRiff: Riff): ReadonlyArray<string> {
  const { bars, endings } = inputRiff;

  return bars.concat(
    ...(endings?.flatMap((endingBars, endingIndex) =>
      endingBars.map((bar, barIndex) => {
        const endingLabel = formatEndingLabel(endingBars, barIndex, endingIndex);
        let formattedBar = endingLabel ? `${endingLabel}\n` : '';
        formattedBar += applyTabMinLineLength(bar, endingLabel.length);
        // If last bar of ending, except if it's the last ending, then use repeat bar lines
        if (barIndex === endingBars.length - 1 && endingIndex !== endings!.length - 1) {
          formattedBar = formattedBar.replaceAll(BAR_LINE, REPEAT_BAR_LINE);
        }
        return formattedBar;
      }),
    ) ?? []),
  );
}

export function formatRiffs(
  inputRiffs: ReadonlyArray<Riff<{ barTab: string; timeSignatureTab: string }>>,
  order: ReadonlyArray<Order>,
): ReadonlyArray<ReadonlyArray<string>> {
  return applyTimeSignatures(inputRiffs.map(replaceRepeatedBars), order)
    .map(applyOpeningBarLine)
    .map(flattenEndings);
}

export function renderOrder(
  order: ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>,
): string {
  return `Order: ${order.map(formatRiffOrderLabel).join(', ')}`;
}

export function renderRiffs(
  tuningTab: string,
  riffs: ReadonlyArray<ReadonlyArray<string>>,
  order: ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>,
  options?: {
    maxLineLength?: number;
    hideTuning?: boolean;
    avoidSplittingRiffs?: boolean;
  },
): string {
  const { maxLineLength = 84, hideTuning = false, avoidSplittingRiffs = false } = options ?? {};

  const tuningTabIfShown = hideTuning ? '' : tuningTab;

  // Calculate which bars will be at the start of each system in the rendered tab
  const systemStarts = new Array({ riffIndex: 0, barIndex: 0 });

  let currentLineLength = getTabLineLength(tuningTabIfShown);

  riffs.forEach((bars, riffIndex) => {
    let currentRiffBarsLength = 0;
    const riffLabelLength = formatRiffLabel(riffIndex).length;

    bars.forEach((barTab, barIndex) => {
      const barLength = getTabLineLength(barTab);

      // The riff label can hang over from earlier bars. Check which is longer, hangover or bar
      const nextItemLength = Math.max(riffLabelLength - currentRiffBarsLength, barLength);

      currentRiffBarsLength += barLength;

      if (currentLineLength + nextItemLength > maxLineLength) {
        // Avoid splitting riffs if this riff is not already split from the previous system
        if (avoidSplittingRiffs && riffIndex !== systemStarts.at(-1)?.riffIndex) {
          // Put this riff onto the next line
          systemStarts.push({ riffIndex, barIndex: 0 });
          currentLineLength = currentRiffBarsLength;
        }
        // Check again in case the above condition changed things
        if (currentLineLength + nextItemLength > maxLineLength) {
          systemStarts.push({ riffIndex, barIndex });
          currentLineLength = barLength;
        }
      } else {
        // If it's the last bar, take the whole nextItemLength
        currentLineLength += barIndex === bars.length - 1 ? nextItemLength : barLength;
      }
    });
  });

  const systemTabs = new Array<string>();
  for (let systemIndex = 0; systemIndex < systemStarts.length; systemIndex += 1) {
    const currentSystemStart = systemStarts[systemIndex];
    const nextSystemStart = systemStarts[systemIndex + 1];

    const currentSystemTabs = new Array<string>();

    if (systemIndex === 0) {
      currentSystemTabs.push(tuningTabIfShown);
    }

    const startRiffIndex = currentSystemStart.riffIndex;
    const endRiffIndex = nextSystemStart?.riffIndex ?? riffs.length - 1;

    for (let riffIndex = startRiffIndex; riffIndex <= endRiffIndex; riffIndex += 1) {
      // These indexes are used with slice, so endBarIndex is exclusive
      const startBarIndex = riffIndex === startRiffIndex ? currentSystemStart.barIndex : 0;
      const endBarIndex = riffIndex === endRiffIndex ? nextSystemStart?.barIndex : undefined;

      if (endBarIndex === undefined || endBarIndex > startBarIndex) {
        const bars = riffs[riffIndex].slice(startBarIndex, endBarIndex);
        const renderRiffLabel = currentSystemStart.barIndex === 0 || riffIndex > startRiffIndex;
        currentSystemTabs.push(
          `${renderRiffLabel ? `${formatRiffLabel(riffIndex)}\n` : ''}${joinTabs(...bars)}`,
        );
      }
    }

    systemTabs.push(joinTabs(...currentSystemTabs));
  }

  systemTabs.push(renderOrder(order));
  return systemTabs.join('\n\n');
}

export function getRenderedRiffsMaxLineLength(renderedRiffs: string) {
  return Math.max(
    ...renderedRiffs
      .split('\n')
      // Ignore last line (order), which can wrap
      .slice(0, -1)
      .map((line) => line.length),
  );
}
