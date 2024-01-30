export type SongsterrNote = {
  rest?: boolean;
  string?: number;
  fret?: number;
  tie?: boolean;
  dead?: boolean;
  hp?: boolean;
  slide?: string;
  staccato?: boolean;
};

export type SongsterrData = {
  tuning?: Array<number>;
  instrument: string;
  measures: Array<{
    signature?: [number, number];
    voices: Array<{
      beats: Array<{
        notes: Array<SongsterrNote>;
        duration: [number, number];
      }>;
    }>;
    repeatStart?: boolean;
    repeat?: number;
    alternateEnding?: Array<number>;
  }>;
};
