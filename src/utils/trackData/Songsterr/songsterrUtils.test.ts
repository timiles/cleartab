import { NoteModifier } from 'types/Note';
import { TrackData } from 'types/TrackData';
import { SongsterrData } from './SongsterrData';
import { convertSongsterrDataToTrackData, isValidSongsterrData } from './songsterrUtils';

describe('songsterrUtils', () => {
  describe('isValidSongsterrData', () => {
    const validSongsterrData: Partial<SongsterrData> = {
      tuning: [1, 2, 3, 4],
      measures: [{ voices: [] }],
    };

    it('detects valid Songsterr data', () => {
      expect(isValidSongsterrData(validSongsterrData)).toBe(true);
    });

    it('requires tuning', () => {
      const testSongsterrData = { ...validSongsterrData };
      testSongsterrData.tuning = [];
      expect(isValidSongsterrData(testSongsterrData)).toBe(false);
    });

    it('requires measures', () => {
      const testSongsterrData = { ...validSongsterrData };
      testSongsterrData.measures = [];
      expect(isValidSongsterrData(testSongsterrData)).toBe(false);
    });
  });

  describe('convertSongsterrDataToTrackData', () => {
    it('converts measures as expected', () => {
      const songsterrData: SongsterrData = {
        tuning: [64, 59, 55, 50, 45, 40],
        instrument: 'Test',
        measures: [
          {
            signature: [4, 4],
            voices: [
              {
                beats: [
                  { notes: [{ rest: true }], duration: [1, 4] },
                  {
                    notes: [
                      { string: 4, fret: 0 },
                      { string: 3, fret: 0 },
                    ],
                    duration: [1, 4],
                  },
                  { notes: [{ string: 3, fret: 7 }], duration: [1, 2] },
                ],
              },
            ],
          },
          {
            voices: [
              {
                beats: [
                  { notes: [{ string: 3, fret: 7 }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 2 }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 5 }], duration: [1, 4] },
                  { notes: [{ string: 3, fret: 7 }], duration: [1, 4] },
                  { notes: [{ string: 2, fret: 2 }], duration: [1, 4] },
                ],
              },
            ],
          },
        ],
      };

      const expectedTrackData: TrackData = {
        name: 'Test',
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            notes: [
              { string: 4, fret: 0, startNoteTime: [1, 4], duration: [1, 4] },
              { string: 3, fret: 0, startNoteTime: [1, 4], duration: [1, 4] },
              { string: 3, fret: 7, startNoteTime: [1, 2], duration: [1, 2] },
            ],
          },
          {
            notes: [
              { string: 3, fret: 7, startNoteTime: [0, 1], duration: [1, 8] },
              { string: 3, fret: 2, startNoteTime: [1, 8], duration: [1, 8] },
              { string: 3, fret: 5, startNoteTime: [1, 4], duration: [1, 4] },
              { string: 3, fret: 7, startNoteTime: [1, 2], duration: [1, 4] },
              { string: 2, fret: 2, startNoteTime: [3, 4], duration: [1, 4] },
            ],
          },
        ],
      };

      expect(convertSongsterrDataToTrackData(songsterrData)).toStrictEqual(expectedTrackData);
    });

    it('handles modifiers', () => {
      const songsterrData: SongsterrData = {
        tuning: [64, 59, 55, 50, 45, 40],
        instrument: 'Test',
        measures: [
          {
            signature: [4, 4],
            voices: [{ beats: [{ notes: [{ string: 3, fret: 7 }], duration: [4, 4] }] }],
          },
          {
            voices: [
              {
                beats: [
                  { notes: [{ string: 3, fret: 7, tie: true }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 2, slide: 'legato' }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 5, slide: 'shift' }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 2, hp: true }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 4, hp: true }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 2 }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 5, staccato: true }], duration: [1, 8] },
                  { notes: [{ string: 3, fret: 5, dead: true }], duration: [1, 8] },
                ],
              },
            ],
          },
        ],
      };

      const expectedTrackData: TrackData = {
        name: 'Test',
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [4, 4],
            notes: [{ string: 3, fret: 7, startNoteTime: [0, 1], duration: [4, 4] }],
          },
          {
            notes: [
              {
                startNoteTime: [0, 1],
                duration: [1, 8],
                string: 3,
                fret: 7,
                modifier: NoteModifier.Tie,
              },
              {
                startNoteTime: [1, 8],
                duration: [1, 8],
                string: 3,
                fret: 2,
              },
              {
                startNoteTime: [1, 4],
                duration: [1, 8],
                string: 3,
                fret: 5,
                modifier: NoteModifier.SlideUp,
              },
              {
                startNoteTime: [3, 8],
                duration: [1, 8],
                string: 3,
                fret: 2,
                modifier: NoteModifier.SlideDown,
              },
              {
                startNoteTime: [1, 2],
                duration: [1, 8],
                string: 3,
                fret: 4,
                modifier: NoteModifier.HammerOn,
              },
              {
                startNoteTime: [5, 8],
                duration: [1, 8],
                string: 3,
                fret: 2,
                modifier: NoteModifier.PullOff,
              },
              {
                startNoteTime: [3, 4],
                duration: [1, 8],
                string: 3,
                fret: 5,
                modifier: NoteModifier.Staccato,
              },
              {
                startNoteTime: [7, 8],
                duration: [1, 8],
                string: 3,
                fret: 5,
                modifier: NoteModifier.Dead,
              },
            ],
          },
        ],
      };

      expect(convertSongsterrDataToTrackData(songsterrData)).toStrictEqual(expectedTrackData);
    });

    it('handles repeats', () => {
      const songsterrData: SongsterrData = {
        tuning: [64, 59, 55, 50, 45, 40],
        instrument: 'Test',
        measures: [
          // Bar 1 normal
          {
            signature: [1, 4],
            voices: [{ beats: [{ notes: [{ string: 0, fret: 1 }], duration: [1, 4] }] }],
          },
          // Bar 2 repeats x3
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 2 }], duration: [1, 4] }] }],
            repeatStart: true,
            repeat: 3,
          },
          // Bars 3-5 repeat x2
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 3 }], duration: [1, 4] }] }],
            repeatStart: true,
          },
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 4 }], duration: [1, 4] }] }],
          },
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 5 }], duration: [1, 4] }] }],
            repeat: 2,
          },
          // Bar 6 rest, repeat x2
          {
            voices: [{ beats: [{ notes: [{ rest: true }], duration: [1, 4] }] }],
            repeatStart: true,
            repeat: 2,
          },
          // Bar 7 normal
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 7 }], duration: [1, 4] }] }],
          },
        ],
      };

      const expectedTrackData: TrackData = {
        name: 'Test',
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          // Bar 1
          {
            timeSignature: [1, 4],
            notes: [{ string: 0, fret: 1, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 1st time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 2nd time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 3rd time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 3 1st time
          {
            notes: [{ string: 0, fret: 3, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 4 1st time
          {
            notes: [{ string: 0, fret: 4, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 5 1st time
          {
            notes: [{ string: 0, fret: 5, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 3 2nd time
          {
            notes: [{ string: 0, fret: 3, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 4 2nd time
          {
            notes: [{ string: 0, fret: 4, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 5 2nd time
          {
            notes: [{ string: 0, fret: 5, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 6 1st time
          {
            notes: [],
          },
          // Bar 6 2nd time
          {
            notes: [],
          },
          // Bar 7 after 2 bars rest
          {
            notes: [{ string: 0, fret: 7, startNoteTime: [0, 1], duration: [1, 4] }],
          },
        ],
      };

      expect(convertSongsterrDataToTrackData(songsterrData)).toStrictEqual(expectedTrackData);
    });

    it('handles repeat alternateEndings', () => {
      const songsterrData: SongsterrData = {
        tuning: [64, 59, 55, 50, 45, 40],
        instrument: 'Test',
        measures: [
          // Bar 1 normal
          {
            signature: [1, 4],
            voices: [{ beats: [{ notes: [{ string: 0, fret: 1 }], duration: [1, 4] }] }],
          },
          // Bar 2: start of repeat
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 2 }], duration: [1, 4] }] }],
            repeatStart: true,
          },
          // Bar 3: 1st and 2nd ending
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 3 }], duration: [1, 4] }] }],
            alternateEnding: [1, 2],
          },
          // Bar 4: 3rd ending
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 4 }], duration: [1, 4] }] }],
            alternateEnding: [3],
          },
          // Bar 5: 4th and 5th ending
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 5 }], duration: [1, 4] }] }],
            alternateEnding: [4, 5],
            repeat: 5,
          },
          // Bar 6: normal
          {
            voices: [{ beats: [{ notes: [{ string: 0, fret: 6 }], duration: [1, 4] }] }],
          },
        ],
      };

      const expectedTrackData: TrackData = {
        name: 'Test',
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          // Bar 1
          {
            timeSignature: [1, 4],
            notes: [{ string: 0, fret: 1, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 1st time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 3 1st time
          {
            notes: [{ string: 0, fret: 3, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 2nd time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 3 2nd time
          {
            notes: [{ string: 0, fret: 3, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 3rd time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 4
          {
            notes: [{ string: 0, fret: 4, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 4th time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 5 1st time
          {
            notes: [{ string: 0, fret: 5, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 2 5th time
          {
            notes: [{ string: 0, fret: 2, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 5 2nd time
          {
            notes: [{ string: 0, fret: 5, startNoteTime: [0, 1], duration: [1, 4] }],
          },
          // Bar 6
          {
            notes: [{ string: 0, fret: 6, startNoteTime: [0, 1], duration: [1, 4] }],
          },
        ],
      };

      expect(convertSongsterrDataToTrackData(songsterrData)).toStrictEqual(expectedTrackData);
    });

    it('handles time signature change', () => {
      const songsterrData: SongsterrData = {
        tuning: [64, 59, 55, 50, 45, 40],
        instrument: 'Test',
        measures: [
          {
            signature: [6, 8],
            voices: [{ beats: [{ notes: [{ string: 4, fret: 0 }], duration: [6, 8] }] }],
          },
          {
            voices: [{ beats: [{ notes: [{ string: 4, fret: 0 }], duration: [6, 8] }] }],
          },
          {
            signature: [4, 4],
            voices: [{ beats: [{ notes: [{ string: 4, fret: 0 }], duration: [1, 1] }] }],
          },
          {
            signature: [3, 4],
            voices: [{ beats: [{ notes: [{ string: 4, fret: 0 }], duration: [3, 4] }] }],
          },
        ],
      };

      const expectedTrackData: TrackData = {
        name: 'Test',
        stringNames: ['E', 'B', 'G', 'D', 'A', 'E'],
        bars: [
          {
            timeSignature: [6, 8],
            notes: [{ string: 4, fret: 0, startNoteTime: [0, 1], duration: [6, 8] }],
          },
          {
            notes: [{ string: 4, fret: 0, startNoteTime: [0, 1], duration: [6, 8] }],
          },
          {
            timeSignature: [4, 4],
            notes: [{ string: 4, fret: 0, startNoteTime: [0, 1], duration: [1, 1] }],
          },
          {
            timeSignature: [3, 4],
            notes: [{ string: 4, fret: 0, startNoteTime: [0, 1], duration: [3, 4] }],
          },
        ],
      };

      expect(convertSongsterrDataToTrackData(songsterrData)).toStrictEqual(expectedTrackData);
    });
  });
});
