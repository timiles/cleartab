import WorkerPool from 'workerpool';

/**
 * A worker pool of functions specified in `registerWorkerFunctions.ts`.
 * When changing these worker functions, rebuild the bundle file using `npm run build-workers`.
 */
// eslint-disable-next-line import/prefer-default-export
export function getWorkerPool(): WorkerPool.WorkerPool {
  return WorkerPool.pool('./worker.bundle.js');
}
