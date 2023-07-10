import { Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { TabData } from 'types/TabData';
import { Track } from 'types/Track';
import { TrackData } from 'types/TrackData';
import { SequenceData, packItemData, unpackItemData } from 'utils/sequenceUtils';
import { formatRiffs, getBarTabsWithTimeSignatures } from 'utils/tabUtils';
import { getWorkerPool } from 'workers/getWorkerPool';
import ControlContainer from './ControlContainer';
import RiffsView from './RiffsView';
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
  const [riffs, setRiffs] = useState<ReadonlyArray<ReadonlyArray<string>>>();
  const [order, setOrder] =
    useState<ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>>();

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
        .then(setTabData)
        .catch((error) => {
          enqueueSnackbar(`An error occurred: "${error}".`, { variant: 'error' });
        });
    } else if (!riffs) {
      pool
        .exec('findSequences', [getBarTabsWithTimeSignatures(tabData).map(packItemData)])
        .then((result: SequenceData<string>) => {
          const inputRiffs = result.sequences.map(({ items, endings }, sequenceIndex) => ({
            riffIndex: sequenceIndex,
            bars: items
              .map(unpackItemData)
              .map(([barTab, timeSignatureTab]) => ({ barTab, timeSignatureTab })),
            endings: endings?.map((ending) =>
              ending
                .map(unpackItemData)
                .map(([barTab, timeSignatureTab]) => ({ barTab, timeSignatureTab })),
            ),
          }));

          const sequenceOrder = result.order.map(({ sequenceIndex, endingIndex, times }) => ({
            riffIndex: sequenceIndex,
            endingIndex,
            times,
          }));

          setRiffs(formatRiffs(inputRiffs, sequenceOrder));
          setOrder(sequenceOrder);

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
  }, [songsterrData, trackData, tabData, riffs]);

  return (
    <ControlContainer>
      <Typography component="h2" variant="h4" mb={1}>
        {filename}
      </Typography>
      <Typography component="h3" variant="h5" mb={1}>
        {songsterrData.instrument}
      </Typography>
      {status && <pre>{status}</pre>}
      {tabData && riffs && order && (
        <RiffsView tuning={tabData.tuningTab} riffs={riffs} order={order} />
      )}
      {tabData && <TabView tabData={tabData} />}
    </ControlContainer>
  );
}
