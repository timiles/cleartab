import { NoteModifier } from 'types/Note';
import { TrackData } from 'types/TrackData';
import { convertTrackDataToTabData, joinTabs } from './tabUtils';

describe('tabUtils', () => {
  describe('convertTrackDataToTabData', () => {
    it('converts track data as expected', () => {
      const trackData: TrackData = {
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            beats: [
              {
                notes: [
                  { string: 5, fret: 0 },
                  { string: 4, fret: 2 },
                  { string: 3, fret: 2 },
                ],
                duration: [1, 4],
              },
              {
                notes: [{ string: 2, fret: 0 }],
                duration: [3, 8],
              },
              {
                notes: [{ string: 1, fret: 2 }],
                duration: [1, 8],
              },
              {
                notes: [],
                duration: [1, 8],
              },
              {
                notes: [{ string: 0, fret: 2 }],
                duration: [1, 8],
              },
            ],
          },
        ],
      };

      const expectedTuningTab = `
E|
B|
G|
D|
A|
E|`.substring(1);

      const expectedTimeSignatureTab = `
 :
 :
4:
4:
 :
 :`.substring(1);

      const expectedBarTab = `
-------2|
-----2--|
--0~~---|
2~------|
2~------|
0~------|`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      expect(tabData.tuningTab).toBe(expectedTuningTab);
      expect(tabData.timeSignatureTabsLookup.get(0)).toBe(expectedTimeSignatureTab);
      expect(tabData.barTabs[0]).toBe(expectedBarTab);
    });

    it('handles tuning with an accidental', () => {
      const trackData: TrackData = {
        stringNames: ['E', 'B', 'G', 'D', 'A', 'C#'],
        bars: [
          {
            beats: [],
          },
        ],
      };

      const expectedTuningTab = `
 E|
 B|
 G|
 D|
 A|
C#|`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      expect(tabData.tuningTab).toBe(expectedTuningTab);
    });

    it('handles double digit time signature, five strings', () => {
      const trackData: TrackData = {
        stringNames: ['G', 'D', 'A', 'E', 'B'],
        bars: [
          {
            timeSignature: [3, 16],
            beats: [],
          },
        ],
      };

      const expectedTimeSignatureTab = `
  :
 3:
16:
  :
  :`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      expect(tabData.timeSignatureTabsLookup.get(0)).toBe(expectedTimeSignatureTab);
    });

    it('handles time signature with one string', () => {
      const trackData: TrackData = {
        stringNames: ['E'],
        bars: [
          {
            timeSignature: [3, 16],
            beats: [],
          },
        ],
      };

      const expectedTimeSignatureTab = '3/16:';

      const tabData = convertTrackDataToTabData(trackData);
      expect(tabData.timeSignatureTabsLookup.get(0)).toBe(expectedTimeSignatureTab);
    });

    it('handles note modifiers', () => {
      const trackData: TrackData = {
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            beats: [
              {
                notes: [
                  { string: 5, fret: 0, modifier: NoteModifier.Staccato },
                  { string: 4, fret: 2, modifier: NoteModifier.Staccato },
                  { string: 3, fret: 2, modifier: NoteModifier.Staccato },
                ],
                duration: [1, 4],
              },
              {
                notes: [{ string: 2, fret: 0 }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 2, fret: 2, modifier: NoteModifier.HammerOn }],
                duration: [1, 4],
              },
              {
                notes: [{ string: 0, fret: 2 }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 0, fret: 7, modifier: NoteModifier.SlideUp }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 0, fret: 2, modifier: NoteModifier.SlideDown }],
                duration: [1, 8],
              },
            ],
          },
          {
            beats: [
              {
                notes: [{ string: 0, fret: 2, modifier: NoteModifier.Tie }],
                duration: [1, 4],
              },
              {
                notes: [{ string: 0, fret: 2, modifier: NoteModifier.Tie }],
                duration: [1, 8],
              },
              {
                notes: [],
                duration: [1, 8],
              },
              {
                notes: [{ string: 2, fret: 4 }],
                duration: [1, 2],
              },
            ],
          },
        ],
      };

      const expectedTab = `
      /\\          
-----272|~~~-----|
---h----|--------|
.-02~---|----4~~~|
2~------|--------|
2~------|--------|
0~------|--------|`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      const tab = joinTabs(...tabData.barTabs);
      expect(tab).toBe(expectedTab);
    });

    it('handles double digit frets', () => {
      const trackData: TrackData = {
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            beats: [{ notes: [{ string: 0, fret: 14 }], duration: [4, 4] }],
          },
          {
            beats: [
              {
                notes: [
                  { string: 5, fret: 0, modifier: NoteModifier.Staccato },
                  { string: 4, fret: 12, modifier: NoteModifier.Staccato },
                  { string: 3, fret: 12, modifier: NoteModifier.Staccato },
                ],
                duration: [1, 4],
              },
              {
                notes: [{ string: 2, fret: 0 }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 2, fret: 12, modifier: NoteModifier.HammerOn }],
                duration: [1, 4],
              },
              {
                notes: [{ string: 0, fret: 12 }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 0, fret: 17, modifier: NoteModifier.SlideUp }],
                duration: [1, 8],
              },
              {
                notes: [{ string: 0, fret: 12, modifier: NoteModifier.SlideDown }],
                duration: [1, 8],
              },
            ],
          },
          {
            beats: [
              {
                notes: [{ string: 0, fret: 12, modifier: NoteModifier.Tie }],
                duration: [1, 4],
              },
              {
                notes: [{ string: 0, fret: 12, modifier: NoteModifier.Tie }],
                duration: [1, 8],
              },
              {
                notes: [],
                duration: [1, 8],
              },
              {
                notes: [
                  { string: 2, fret: 10 },
                  { string: 4, fret: 8 },
                ],
                duration: [1, 8],
              },
              {
                notes: [
                  { string: 2, fret: 11 },
                  { string: 4, fret: 9 },
                ],
                duration: [1, 8],
              },
              {
                notes: [
                  { string: 2, fret: 12 },
                  { string: 4, fret: 10 },
                ],
                duration: [1, 4],
              },
            ],
          },
        ],
      };

      const expectedTab = `
⌐¬           ⌐¬/¬⌐\\            
14~~~|-------121712|~~~-------|
-----|----h¬-------|-----⌐¬⌐¬-|
-----|⌐.-012~------|----ю1112~|
-----|12~----------|----------|
-----|12~----------|----8-910~|
-----|-0~----------|----------|`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      const tab = joinTabs(...tabData.barTabs);
      expect(tab).toBe(expectedTab);
    });

    it('handles repeating quavers', () => {
      const trackData: TrackData = {
        stringNames: ['G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            beats: new Array(8).fill({
              notes: [
                { string: 1, fret: 5, modifier: NoteModifier.Staccato },
                { string: 2, fret: 3, modifier: NoteModifier.Staccato },
              ],
              duration: [1, 8],
            }),
          },
          {
            beats: [
              ...new Array(4).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 8] }),
              { notes: [{ string: 2, fret: 5 }], duration: [1, 8] },
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
              { notes: [{ string: 2, fret: 5 }], duration: [1, 8] },
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
            ],
          },
          {
            beats: [
              ...new Array(4).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 8] }),
              ...new Array(4).fill({
                notes: [{ string: 2, fret: 3, modifier: NoteModifier.Staccato }],
                duration: [1, 8],
              }),
            ],
          },
          {
            beats: [
              ...new Array(3).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 8] }),
              ...new Array(5).fill({ notes: [{ string: 2, fret: 5 }], duration: [1, 8] }),
            ],
          },
          {
            beats: [
              ...new Array(2).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 8] }),
              ...new Array(4).fill({ notes: [{ string: 2, fret: 5 }], duration: [1, 8] }),
              ...new Array(2).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 8] }),
            ],
          },
          {
            beats: [
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
              ...new Array(6).fill({ notes: [{ string: 2, fret: 5 }], duration: [1, 8] }),
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
            ],
          },
          {
            // Crotchets should still be written out in full
            beats: [...new Array(4).fill({ notes: [{ string: 2, fret: 3 }], duration: [1, 4] })],
          },
          {
            // Repeated dotted crotchets should be written out
            beats: [
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
              { notes: [{ string: 2, fret: 3 }], duration: [1, 8] },
              { notes: [{ string: 2, fret: 3 }], duration: [3, 8] },
              { notes: [{ string: 2, fret: 3 }], duration: [3, 8] },
            ],
          },
          {
            beats: [
              ...new Array(4).fill({ notes: [{ string: 1, fret: 15 }], duration: [1, 8] }),
              ...new Array(2).fill({ notes: [{ string: 0, fret: 17 }], duration: [1, 8] }),
              ...new Array(2).fill({ notes: [], duration: [1, 8] }),
            ],
          },
        ],
      };

      const expectedTab = `
                                                  ⌐¬    
.-|------|----|-----|------|----|----|--------|⌐¬-17’--|
5”|------|--.-|-----|------|----|----|--------|15”-----|
3”|3”5353|3”3”|3’’5”|3’5”3’|35”3|3333|3’3~~3~~|--------|
--|------|----|-----|------|----|----|--------|--------|`.substring(1);

      const tabData = convertTrackDataToTabData(trackData);
      const tab = joinTabs(...tabData.barTabs);
      expect(tab).toBe(expectedTab);
    });
  });
});
