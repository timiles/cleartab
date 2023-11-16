import { Bar } from './Bar';

export type TrackData = {
  name: string;
  /**
   * `stringNames` are from top to bottom.
   */
  stringNames: Array<string>;
  bars: Array<Bar>;
};
