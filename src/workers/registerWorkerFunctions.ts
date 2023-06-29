import { convertTrackDataToTabData } from 'utils/tabUtils';
import { convertSongsterrDataToTrackData } from 'utils/trackData/Songsterr/songsterrUtils';
import WorkerPool from 'workerpool';

// Create a worker and register public functions
WorkerPool.worker({ convertSongsterrDataToTrackData, convertTrackDataToTabData });
