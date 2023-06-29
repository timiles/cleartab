import { Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { TabData } from 'types/TabData';
import { Track } from 'types/Track';
import { TrackData } from 'types/TrackData';
import { getWorkerPool } from 'workers/getWorkerPool';
import ControlContainer from './ControlContainer';
import TabView from './TabView';

interface IProps {
  track: Track;
}

export default function TrackView(props: IProps) {
  const {
    track: { filename, songsterrData },
  } = props;

  const [status, setStatus] = useState<string>();
  const [trackData, setTrackData] = useState<TrackData>();
  const [tabData, setTabData] = useState<TabData>();

  useEffect(() => {
    const pool = getWorkerPool();
    if (!trackData) {
      setStatus('Processing track data...');
      pool
        .exec('convertSongsterrDataToTrackData', [songsterrData])
        .then(setTrackData)
        .catch((error) => {
          enqueueSnackbar(`An error occurred: "${error}".`, { variant: 'error' });
          pool.terminate();
        });
    } else if (!tabData) {
      setStatus('Converting to tab...');
      pool
        .exec('convertTrackDataToTabData', [trackData])
        .then((result) => {
          setTabData(result);
          setStatus(undefined);
          enqueueSnackbar(`Successfully loaded "${filename}".`, { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar(`An error occurred: "${error}".`, { variant: 'error' });
        })
        .then(() => {
          pool.terminate();
        });
    }
  }, [songsterrData, trackData, tabData]);

  return (
    <ControlContainer>
      <Typography component="h2" variant="h4" mb={1}>
        {filename}
      </Typography>
      <Typography component="h3" variant="h5" mb={1}>
        {songsterrData.instrument}
      </Typography>
      {status && <pre>{status}</pre>}
      {tabData && <TabView tabData={tabData} />}
    </ControlContainer>
  );
}
