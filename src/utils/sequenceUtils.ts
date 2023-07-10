import { areArraysEqual, isArrayNotEmpty } from './arrayUtils';

const SEQUENCE_DATA_DELIMITER = '🎸';

export function packItemData(data: ReadonlyArray<string>): string {
  return data.join(SEQUENCE_DATA_DELIMITER);
}

export function unpackItemData(item: string): ReadonlyArray<string> {
  return item.split(SEQUENCE_DATA_DELIMITER);
}

export type Sequence<T> = {
  items: ReadonlyArray<T>;
  endings?: ReadonlyArray<ReadonlyArray<T>>;
};

export type Order = { sequenceIndex: number; endingIndex?: number; times: number };

export type SequenceData<T> = {
  sequences: ReadonlyArray<Sequence<T>>;
  order: ReadonlyArray<Order>;
};

export function findSequences<T>(inputItems: ReadonlyArray<T>): SequenceData<T> {
  const sequenceLength = 4;

  // We want to track sequences and the original starting index where they appeared in the input
  type SequenceInfo = {
    items: Array<T>;
    inputIndexes: Array<number>;
    endings?: Array<SequenceInfo>;
  };
  let sequences = new Array<SequenceInfo>();

  for (let inputIndex = 0; inputIndex < inputItems.length; inputIndex += 1) {
    // Take each sequence of the specified length
    const testItems = inputItems.slice(inputIndex, inputIndex + sequenceLength);

    // Check if the sequence is already known
    const knownSequence = sequences.find((s) => areArraysEqual(s.items, testItems));
    if (knownSequence) {
      knownSequence.inputIndexes.push(inputIndex);
    } else {
      sequences.push({ items: testItems, inputIndexes: [inputIndex] });
    }
  }

  // Order sequences by most common first
  sequences = sequences.sort((a, b) => b.inputIndexes.length - a.inputIndexes.length);

  // Now we want to remove the indexes that already exist within the more common sequences
  for (let sequenceIndex = 0; sequenceIndex < sequences.length - 1; sequenceIndex += 1) {
    const currentSequence = sequences[sequenceIndex];

    const indexesToRemove = new Array<number>();
    for (let offset = 1; offset < currentSequence.items.length; offset += 1) {
      indexesToRemove.push(...currentSequence.inputIndexes.map((i) => i + offset));
    }

    for (
      let testSequenceIndex = sequenceIndex + 1;
      testSequenceIndex < sequences.length;
      testSequenceIndex += 1
    ) {
      const testSequence = sequences[testSequenceIndex];
      testSequence.inputIndexes = testSequence.inputIndexes.filter(
        (i) => !indexesToRemove.includes(i),
      );
      if (testSequence.inputIndexes.length === 0) {
        // Sequence no longer needed: remove and adjust current index accordingly
        sequences.splice(testSequenceIndex, 1);
        testSequenceIndex -= 1;
      }
    }

    // Sort each time so we always have the next-most common sequences at the top
    sequences = sequences.sort((a, b) => b.inputIndexes.length - a.inputIndexes.length);
  }

  // Check if any sequences overlap with another sequence - if so, truncate
  const sequenceStartInputIndexes = sequences.flatMap((s) => s.inputIndexes).sort((a, b) => a - b);
  for (
    let inputIndexIndex = 0;
    inputIndexIndex < sequenceStartInputIndexes.length - 1;
    inputIndexIndex += 1
  ) {
    const currentInputIndex = sequenceStartInputIndexes[inputIndexIndex];
    const nextInputIndex = sequenceStartInputIndexes[inputIndexIndex + 1];
    const itemLengthToNextInputIndex = nextInputIndex - currentInputIndex;

    if (itemLengthToNextInputIndex < sequenceLength) {
      // The next sequence starts before the full length of this one, so truncate
      const sequenceIndex = sequences.findIndex((s) => s.inputIndexes.includes(currentInputIndex))!;
      const currentSequence = sequences[sequenceIndex];

      const truncatedItems = currentSequence.items.slice(0, itemLengthToNextInputIndex);

      // Check if the sequence is already known
      const knownSequence = sequences.find((s) => areArraysEqual(s.items, truncatedItems));
      if (knownSequence) {
        knownSequence.inputIndexes.push(currentInputIndex);
      } else {
        sequences.push({ items: truncatedItems, inputIndexes: [currentInputIndex] });
      }

      // Remove this input index from the list
      currentSequence.inputIndexes = currentSequence.inputIndexes.filter(
        (i) => i !== currentInputIndex,
      );
      if (currentSequence.inputIndexes.length === 0) {
        // If no more usages of this sequence, remove it
        sequences.splice(sequenceIndex, 1);
      }
    }
  }

  // Check if any sequence is made up of repeated items
  for (let sequenceIndex = 0; sequenceIndex < sequences.length; sequenceIndex += 1) {
    const currentSequence = sequences[sequenceIndex];
    for (let size = 1; size < currentSequence.items.length; size += 1) {
      if (currentSequence.items.length % size === 0) {
        const subsequences = new Array(currentSequence.items.length / size)
          .fill(0)
          .map((_, index) => currentSequence.items.slice(index * size, (index + 1) * size));

        if (areArraysEqual(...subsequences)) {
          const subsequenceItems = subsequences[0];

          const newInputIndexes = currentSequence.inputIndexes.slice();
          for (let offset = size; offset < currentSequence.items.length; offset += size) {
            newInputIndexes.push(...currentSequence.inputIndexes.map((i) => i + offset));
          }

          // Check if the sequence is already known
          const knownSequence = sequences.find((s) => areArraysEqual(s.items, subsequenceItems));
          if (knownSequence) {
            // Add these indexes to known sequence and remove the current sequence, adjust index
            knownSequence.inputIndexes = knownSequence.inputIndexes
              .concat(newInputIndexes)
              .sort((a, b) => a - b);
            sequences.splice(sequenceIndex, 1);
            sequenceIndex -= 1;
          } else {
            // Otherwise replace current sequence's values
            currentSequence.items = subsequenceItems;
            currentSequence.inputIndexes = newInputIndexes;
          }

          // Current sequence has been split, no need to check more sizes
          break;
        }
      }
    }
  }

  // Order sequences by first occurrence in the input
  sequences = sequences.sort((a, b) => a.inputIndexes[0] - b.inputIndexes[0]);

  // Check if any sequence is the same as another, but with a different ending
  for (let sequenceIndex = 0; sequenceIndex < sequences.length - 1; sequenceIndex += 1) {
    const currentSequence = sequences[sequenceIndex];

    for (
      let testSequenceIndex = sequenceIndex + 1;
      testSequenceIndex < sequences.length;
      testSequenceIndex += 1
    ) {
      const testSequence = sequences[testSequenceIndex];

      const endingSize = 1;

      // If we don't have endings yet, current sequence items haven't been truncated
      // so compare the stem of the current items to the stem of the matching sequence
      const foundFirstDifferentEnding =
        !isArrayNotEmpty(currentSequence.endings) &&
        currentSequence.items.length === sequenceLength &&
        testSequence.items.length === sequenceLength &&
        areArraysEqual(
          currentSequence.items.slice(0, -1 * endingSize),
          testSequence.items.slice(0, -1 * endingSize),
        );

      // If we already have endings, current sequence items is already the stem
      // so compare the current items to the stem of the matching sequence
      const foundAnotherDifferentEnding =
        isArrayNotEmpty(currentSequence.endings) &&
        currentSequence.items.length === sequenceLength - endingSize &&
        testSequence.items.length === sequenceLength &&
        areArraysEqual(currentSequence.items, testSequence.items.slice(0, -1 * endingSize));

      if (foundFirstDifferentEnding) {
        // Found a different ending, so truncate current items
        // and move endings of current items and testSequence items into current endings
        currentSequence.endings = new Array<SequenceInfo>(
          {
            // Splice to also truncate items
            items: currentSequence.items.splice(-1 * endingSize, endingSize),
            inputIndexes: currentSequence.inputIndexes.map((i) => i + currentSequence.items.length),
          },
          {
            items: testSequence.items.splice(-1 * endingSize, endingSize),
            inputIndexes: testSequence.inputIndexes.map((i) => i + testSequence.items.length),
          },
        );
      } else if (foundAnotherDifferentEnding) {
        currentSequence.endings!.push({
          items: testSequence.items.splice(-1 * endingSize, endingSize),
          inputIndexes: testSequence.inputIndexes.map((i) => i + testSequence.items.length),
        });
      }

      if (foundFirstDifferentEnding || foundAnotherDifferentEnding) {
        currentSequence.inputIndexes = currentSequence.inputIndexes
          .concat(testSequence.inputIndexes)
          .sort((a, b) => a - b);

        // Remove next sequence
        sequences.splice(testSequenceIndex, 1);
        testSequenceIndex -= 1;
      }
    }
  }

  // Check if one sequence is always followed by another - if so, combine
  let changeMade = false;
  do {
    changeMade = false;

    for (let sequenceIndex = 0; sequenceIndex < sequences.length - 1; sequenceIndex += 1) {
      const currentSequence = sequences[sequenceIndex];
      const nextSequenceIndex = sequenceIndex + 1;
      const nextSequence = sequences[nextSequenceIndex];

      if (
        // Ignore sequences that have different endings
        currentSequence.endings === undefined &&
        nextSequence.endings === undefined &&
        currentSequence.inputIndexes.length === nextSequence.inputIndexes.length &&
        currentSequence.inputIndexes.every((inputIndex) =>
          nextSequence.inputIndexes.includes(inputIndex + currentSequence.items.length),
        )
      ) {
        // Combine items
        currentSequence.items.push(...nextSequence.items);

        // Remove next sequence
        sequences.splice(nextSequenceIndex, 1);

        changeMade = true;
      }
    }
  } while (changeMade);

  // Finally, collect order
  const order = new Array<Order>();

  const findSequenceByInputIndex = (
    inputIndex: number,
  ): { sequenceIndex: number; endingIndex?: number } => {
    const sequenceIndex = sequences.findIndex(
      (s) =>
        s.inputIndexes.includes(inputIndex) ||
        s.endings?.some((ending) => ending.inputIndexes.includes(inputIndex)),
    );

    if (sequenceIndex < 0) {
      throw new Error(`Sequence not found for index: ${inputIndex}.`);
    }

    const sequence = sequences[sequenceIndex];
    const endingIndex = sequence.endings?.findIndex((ending) =>
      ending.inputIndexes.includes(inputIndex + sequence.items.length),
    );

    return { sequenceIndex, endingIndex };
  };

  let inputIndex = 0;
  while (inputIndex < inputItems.length) {
    const { sequenceIndex, endingIndex } = findSequenceByInputIndex(inputIndex);

    const lastOrder = order.at(-1);
    if (lastOrder?.sequenceIndex === sequenceIndex && lastOrder.endingIndex === endingIndex) {
      lastOrder.times += 1;
    } else {
      order.push({
        sequenceIndex,
        ...(endingIndex !== undefined ? { endingIndex } : {}),
        times: 1,
      });
    }

    inputIndex += sequences[sequenceIndex].items.length;
    if (endingIndex !== undefined) {
      inputIndex += sequences[sequenceIndex].endings![endingIndex].items.length;
    }
  }

  return {
    sequences: sequences.map(({ items, endings }) => ({
      items,
      ...(endings ? { endings: endings.map((ending) => ending.items) } : {}),
    })),
    order,
  };
}
