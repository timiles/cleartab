/* eslint-disable import/prefer-default-export */
import { TabData } from 'types/TabData';
import { TrackData } from 'types/TrackData';
import { SequenceData } from 'utils/sequenceUtils';
import { SongsterrData } from 'utils/trackData/Songsterr/SongsterrData';
import WorkerPool from 'workerpool';

type WorkerPoolFunction<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => WorkerPool.Promise<ReturnType<T>>;

// NOTE: Don't reference the functions directly, otherwise they'll be included in the app build
interface MyWorkerPool extends WorkerPool.WorkerPool {
  convertSongsterrDataToTrackData: WorkerPoolFunction<(songsterrData: SongsterrData) => TrackData>;
  convertTrackDataToTabData: WorkerPoolFunction<({ stringNames, bars }: TrackData) => TabData>;
  findSequences: WorkerPoolFunction<(inputItems: ReadonlyArray<string>) => SequenceData<string>>;
}

/**
 * A worker pool of functions specified in `registerWorkerFunctions.ts`.
 * When changing these worker functions, rebuild the bundle file using `npm run build-workers`.
 */
export function getWorkerPool(): MyWorkerPool {
  const pool = WorkerPool.pool('./worker.bundle.js') as MyWorkerPool;
  pool.convertSongsterrDataToTrackData = (...args) =>
    pool.exec('convertSongsterrDataToTrackData', args);
  pool.convertTrackDataToTabData = (...args) => pool.exec('convertTrackDataToTabData', args);
  pool.findSequences = (...args) => pool.exec('findSequences', args);
  return pool;
}
