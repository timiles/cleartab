import { Order, Sequence, findSequences } from './sequenceUtils';

describe('sequenceUtils', () => {
  describe('findSequences', () => {
    it('handles repeating items', () => {
      const input = [1, 1, 1, 1, 2, 3, 2, 3, 4, 5, 6, 7, 1, 1, 4, 5, 6, 7, 2, 3];

      const { sequences, order } = findSequences(input);

      const expectedSequences: Array<Sequence<number>> = [
        { items: [1] },
        { items: [2, 3] },
        { items: [4, 5, 6, 7] },
      ];

      const expectedOrder: Array<Order> = [
        { sequenceIndex: 0, times: 4 },
        { sequenceIndex: 1, times: 2 },
        { sequenceIndex: 2, times: 1 },
        { sequenceIndex: 0, times: 2 },
        { sequenceIndex: 2, times: 1 },
        { sequenceIndex: 1, times: 1 },
      ];

      expect(sequences).toStrictEqual(expectedSequences);
      expect(order).toStrictEqual(expectedOrder);
    });

    it('handles different endings', () => {
      const input = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 5, 1, 2, 3, 6, 1, 2, 3, 4];

      const { sequences, order } = findSequences(input);

      const expectedSequences: Array<Sequence<number>> = [
        { items: [1, 2, 3], endings: [[4], [5], [6]] },
      ];

      const expectedOrder: Array<Order> = [
        { sequenceIndex: 0, endingIndex: 0, times: 2 },
        { sequenceIndex: 0, endingIndex: 1, times: 1 },
        { sequenceIndex: 0, endingIndex: 2, times: 1 },
        { sequenceIndex: 0, endingIndex: 0, times: 1 },
      ];

      expect(sequences).toStrictEqual(expectedSequences);
      expect(order).toStrictEqual(expectedOrder);
    });

    it('handles truncated sequences', () => {
      const input = [1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4];

      const { sequences, order } = findSequences(input);

      const expectedSequences: Array<Sequence<number>> = [
        { items: [1, 2, 3, 4] },
        { items: [5, 6] },
      ];

      const expectedOrder: Array<Order> = [
        { sequenceIndex: 0, times: 2 },
        { sequenceIndex: 1, times: 1 },
        { sequenceIndex: 0, times: 1 },
      ];

      expect(sequences).toStrictEqual(expectedSequences);
      expect(order).toStrictEqual(expectedOrder);
    });

    it('handles long sequences', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7];

      const { sequences, order } = findSequences(input);

      const expectedSequences: Array<Sequence<number>> = [{ items: [1, 2, 3, 4, 5, 6, 7] }];

      const expectedOrder: Array<Order> = [{ sequenceIndex: 0, times: 2 }];

      expect(sequences).toStrictEqual(expectedSequences);
      expect(order).toStrictEqual(expectedOrder);
    });
  });
});
