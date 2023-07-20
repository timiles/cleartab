import { NoteModifier } from 'types/Note';
import { TrackData } from 'types/TrackData';
import {
  convertTrackDataToTabData,
  formatRiffLabel,
  formatRiffOrderLabel,
  formatRiffs,
  joinTabs,
  renderRiffs,
} from './tabUtils';

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

  describe('formatRiffOrderLabel', () => {
    it('renders as expected', () => {
      expect(formatRiffOrderLabel({ riffIndex: 0, times: 1 })).toBe('Riff 1');
      expect(formatRiffOrderLabel({ riffIndex: 1, times: 1 })).toBe('Riff 2');
    });

    it('handles ending numbers', () => {
      expect(formatRiffOrderLabel({ riffIndex: 0, endingIndex: 0, times: 1 })).toBe('Riff 1[1]');
      expect(formatRiffOrderLabel({ riffIndex: 1, endingIndex: 3, times: 1 })).toBe('Riff 2[4]');
    });

    it('handles multiple times', () => {
      expect(formatRiffOrderLabel({ riffIndex: 0, times: 2 })).toBe('Riff 1 (x2)');
      expect(formatRiffOrderLabel({ riffIndex: 1, endingIndex: 3, times: 20 })).toBe(
        'Riff 2[4] (x20)',
      );
    });
  });

  describe('formatRiffLabel', () => {
    it('renders as expected', () => {
      expect(formatRiffLabel(0)).toBe('[Riff 1]');
      expect(formatRiffLabel(1)).toBe('[Riff 2]');
    });
  });

  describe('formatRiffs', () => {
    it('handles simple bar tabs', () => {
      const barTabs = [
        `
--------|
--------|
--------|
12345678|`.substring(1),
        `
--------|
--------|
87654321|
--------|`.substring(1),
      ];

      const timeSignatureTab = `
 :
4:
4:
 :`.substring(1);
      const riffsWithTimeSignatures = [
        { bars: barTabs.map((barTab) => ({ barTab, timeSignatureTab })) },
      ];

      const order = [{ riffIndex: 0, times: 1 }];

      const output = joinTabs(
        ...formatRiffs(riffsWithTimeSignatures, order).flatMap((riff) => riff),
      );

      const expectedOutput = `
| :--------|--------|
|4:--------|--------|
|4:--------|87654321|
| :12345678|--------|`.substring(1);

      expect(output).toStrictEqual(expectedOutput);
    });

    it('handles endings', () => {
      const riffs = [
        {
          bars: ['1---|', '2---|'],
          endings: [
            ['3---|', '4---|'],
            ['5---|', '6---|'],
          ],
        },
        {
          bars: ['7---|', '8---|'],
          endings: [['9|'], ['9-|'], ['9--|'], ['9---|'], ['9----|']],
        },
      ];

      const timeSignatureTab = '4/4:';
      const riffsWithTimeSignatures = riffs.map((riff) => ({
        bars: riff.bars.map((barTab) => ({ barTab, timeSignatureTab })),
        endings: riff.endings.map((ending) =>
          ending.map((barTab) => ({ barTab, timeSignatureTab })),
        ),
      }));

      const order = [
        { riffIndex: 0, endingIndex: 0, times: 1 },
        { riffIndex: 0, endingIndex: 1, times: 1 },
        { riffIndex: 1, endingIndex: 0, times: 1 },
        { riffIndex: 1, endingIndex: 1, times: 1 },
        { riffIndex: 1, endingIndex: 2, times: 1 },
        { riffIndex: 1, endingIndex: 3, times: 1 },
        { riffIndex: 1, endingIndex: 4, times: 1 },
      ];

      const output = joinTabs(
        ...formatRiffs(riffsWithTimeSignatures, order).flatMap((riff) => riff),
      );

      const expectedOutput = `
               [1.     ] [2.     ]            [1.][2.][3.][4.] [5. ] 
‖4/4:1---|2---|3---|4---‖5---|6---|‖7---|8---|9‖  9-‖ 9--‖9---‖9----|`.substring(1);

      expect(output).toStrictEqual(expectedOutput);
    });

    it('handles extra annotation line', () => {
      const riffs = [
        {
          bars: ['1---|'],
          endings: [
            ['2---|'],
            [
              `
.    
3---|`.substring(1),
            ],
          ],
        },
      ];

      const timeSignatureTab = '4/4:';
      const riffsWithTimeSignatures = riffs.map((riff) => ({
        bars: riff.bars.map((barTab) => ({ barTab, timeSignatureTab })),
        endings: riff.endings.map((ending) =>
          ending.map((barTab) => ({ barTab, timeSignatureTab })),
        ),
      }));

      const order = [
        { riffIndex: 0, endingIndex: 0, times: 1 },
        { riffIndex: 0, endingIndex: 1, times: 1 },
      ];

      const output = joinTabs(
        ...formatRiffs(riffsWithTimeSignatures, order).flatMap((riff) => riff),
      );

      const expectedOutput = `
               [2.] 
          [1.] .    
‖4/4:1---|2---‖3---|`.substring(1);

      expect(output).toStrictEqual(expectedOutput);
    });

    it('handles repeated bars', () => {
      const bar1 = `
.    
1---|
-1--|
--1-|
----|`.substring(1);

      const bar2 = `
---2|
-.2-|
-2--|
-2--|`.substring(1);

      // The following bars should not be replaced with repeat symbols
      const bar3 = `
-|
-|
-|
-|`.substring(1);

      const bar4 = `
--|
--|
1~|
--|`.substring(1);

      const bar5 = `
-|
-|
~|
-|`.substring(1);

      const riffs = [
        {
          bars: [bar1, bar1, bar1, bar2, bar2, bar3, bar3, bar4, bar5, bar5, bar1],
          endings: [
            [bar1, bar2],
            [bar2, bar2],
            [bar1, bar1],
          ],
        },
      ];

      const timeSignatureTab = ' :\n4:\n4:\n :';
      const riffsWithTimeSignatures = riffs.map((riff) => ({
        bars: riff.bars.map((barTab) => ({ barTab, timeSignatureTab })),
        endings: riff.endings.map((ending) =>
          ending.map((barTab) => ({ barTab, timeSignatureTab })),
        ),
      }));

      const order = [
        { riffIndex: 0, endingIndex: 0, times: 1 },
        { riffIndex: 0, endingIndex: 1, times: 1 },
        { riffIndex: 0, endingIndex: 2, times: 2 },
        { riffIndex: 0, endingIndex: 0, times: 1 },
      ];

      const output = joinTabs(
        ...formatRiffs(riffsWithTimeSignatures, order).flatMap((riff) => riff),
      );

      const expectedOutput = `
   .                          .    [1.   ] [2.  ] [3.] 
‖ :1---|%|%|---2|-|-|-|--|-|-|1---|%| ---2‖---2|-‖%| %|
‖4:-1--|-|-|-.2-|-|-|-|--|-|-|-1--|-| -.2-‖-.2-|-‖-| -|
‖4:--1-|-|-|-2--|%|-|-|1~|~|~|--1-|-| -2--‖-2--|%‖-| -|
‖ :----|-|-|-2--|%|-|-|--|-|-|----|-| -2--‖-2--|%‖-| -|`.substring(1);

      expect(output).toStrictEqual(expectedOutput);
    });

    it('handles time signatures', () => {
      const riffs = [
        {
          bars: [
            { barTab: '1---|', timeSignatureTab: '4/4:' },
            { barTab: '1--|', timeSignatureTab: '3/4:' },
          ],
          endings: [
            [{ barTab: '2--|', timeSignatureTab: '3/4:' }],
            [{ barTab: '3---|', timeSignatureTab: '4/4:' }],
          ],
        },
        {
          bars: [{ barTab: '4---|', timeSignatureTab: '4/4:' }],
          endings: [
            [{ barTab: '5---|', timeSignatureTab: '4/4:' }],
            [{ barTab: '6---|', timeSignatureTab: '4/4:' }],
          ],
        },
        {
          bars: [{ barTab: '7---|', timeSignatureTab: '4/4:' }],
          endings: [
            [{ barTab: '8---|', timeSignatureTab: '4/4:' }],
            [{ barTab: '9--|', timeSignatureTab: '3/4:' }],
          ],
        },
      ];

      const order = [
        { riffIndex: 0, endingIndex: 0, times: 1 },
        { riffIndex: 0, endingIndex: 1, times: 1 },
        { riffIndex: 1, endingIndex: 0, times: 1 },
        { riffIndex: 1, endingIndex: 1, times: 1 },
        { riffIndex: 2, endingIndex: 0, times: 1 },
        { riffIndex: 2, endingIndex: 1, times: 2 },
      ];

      const output = joinTabs(...formatRiffs(riffs, order).flatMap((riff) => riff));

      const expectedOutput = `
                  [1.][2.    ]       [1.] [2.]           [1.] [2.   ] 
‖4/4:1---|3/4:1--|2--‖4/4:3---|‖4---|5---‖6---|‖4/4:7---|8---‖3/4:9--|`.substring(1);

      expect(output).toStrictEqual(expectedOutput);
    });
  });

  describe('renderRiffs', () => {
    const defaultRiffs = [
      ['|4/4:1---|', '2---|', '3---|', '4---|'],
      ['|5---|', '6---|', '7---|', '8---|'],
    ];

    const defaultOrder = [
      { riffIndex: 0, times: 1 },
      { riffIndex: 1, times: 2 },
    ];

    it('renders riffs as expected', () => {
      const output = renderRiffs('E|', defaultRiffs, defaultOrder, {
        maxLineLength: 42,
      });

      const expectedOutput = `
  [Riff 1]                 [Riff 2]   
E||4/4:1---|2---|3---|4---||5---|6---|

7---|8---|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles minimal line length', () => {
      const output = renderRiffs('E|', defaultRiffs, defaultOrder, {
        maxLineLength: 1,
      });

      const expectedOutput = `
E|

[Riff 1]  
|4/4:1---|

2---|

3---|

4---|

[Riff 2]
|5---|  

6---|

7---|

8---|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles hideTuning', () => {
      const output = renderRiffs('E|', defaultRiffs, defaultOrder, {
        maxLineLength: 42,
        hideTuning: true,
      });

      const expectedOutput = `
[Riff 1]                 [Riff 2]        
|4/4:1---|2---|3---|4---||5---|6---|7---|

8---|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles avoidSplittingRiffs', () => {
      const output = renderRiffs('E|', defaultRiffs, defaultOrder, {
        maxLineLength: 42,
        avoidSplittingRiffs: true,
      });

      const expectedOutput = `
  [Riff 1]                 
E||4/4:1---|2---|3---|4---|

[Riff 2]             
|5---|6---|7---|8---|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles avoidSplittingRiffs when riff moves onto new line and is also split', () => {
      // Last bar is long enough that it will:
      // - cause Riff 2 to move to the 2nd line,
      // - need to be split onto the 3rd line too.
      const riffs = [['|4/4:1---|'], ['|2---|', '1234123412341234|']];

      const output = renderRiffs('E|', riffs, defaultOrder, {
        maxLineLength: 20,
        avoidSplittingRiffs: true,
      });

      const expectedOutput = `
  [Riff 1]  
E||4/4:1---|

[Riff 2]
|2---|  

1234123412341234|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles riff label longer than bar', () => {
      const riffs = [
        ['|4/4:1|', '2|', '3|', '4|'],
        ['|5|', '6|', '7|', '8|'],
      ];

      // Max line length of 24 should fit all bars
      // - this also tests that we haven't overcompensated for the length of the riff label
      const output = renderRiffs('E|', riffs, defaultOrder, {
        maxLineLength: 24,
      });

      const expectedOutput = `
  [Riff 1]     [Riff 2] 
E||4/4:1|2|3|4||5|6|7|8|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles riff label longer than riff', () => {
      const riffs = [['|1|'], ['|2|', '3|', '4|']];

      const output = renderRiffs('E|', riffs, defaultOrder, {
        maxLineLength: 42,
      });

      const expectedOutput = `
  [Riff 1][Riff 2]
E||1|     |2|3|4| 

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });

    it('handles riff label causing line to exceed max length', () => {
      // Max line length of 32 is enough for bar 5, but not enough for [Riff 2]
      const output = renderRiffs('E|', defaultRiffs, defaultOrder, {
        maxLineLength: 32,
      });

      const expectedOutput = `
  [Riff 1]                 
E||4/4:1---|2---|3---|4---|

[Riff 2]             
|5---|6---|7---|8---|

Order: Riff 1, Riff 2 (x2)`.substring(1);

      expect(output).toBe(expectedOutput);
    });
  });
});
