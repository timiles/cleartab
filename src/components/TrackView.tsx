import { Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { TabData } from 'types/TabData';
import { Track } from 'types/Track';
import { TrackData } from 'types/TrackData';
import { packItemData, unpackItemData } from 'utils/sequenceUtils';
import { formatRiffs, getBarTabsWithTimeSignatures } from 'utils/tabUtils';
import { getWorkerPool } from 'workers/getWorkerPool';
import ControlContainer from './ControlContainer';
import CopyToClipboardButton from './CopyToClipboardButton';
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
        .convertSongsterrDataToTrackData(songsterrData)
        .then(setTrackData)
        .catch((error) => {
          enqueueSnackbar(`An error occurred: "${error}".`, { variant: 'error' });
          pool.terminate();
        });
    } else if (!tabData) {
      setStatus('Converting to tab...');
      pool
        .convertTrackDataToTabData(trackData)
        .then(setTabData)
        .catch((error) => {
          enqueueSnackbar(`An error occurred: "${error}".`, { variant: 'error' });
        });
    } else if (!riffs) {
      pool
        .findSequences(getBarTabsWithTimeSignatures(tabData).map(packItemData))
        .then((result) => {
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        mb={2}
        spacing={1}
      >
        <Stack direction="column">
          <Typography component="h2" variant="h4" mb={1}>
            {filename}
          </Typography>
          <Typography component="h3" variant="h5" mb={1}>
            {songsterrData.instrument}
          </Typography>
        </Stack>
        {tabData && riffs && order && (
          <CopyToClipboardButton tuningTab={tabData.tuningTab} riffs={riffs} order={order} />
        )}
      </Stack>
      {status && <pre>{status}</pre>}
      {tabData && riffs && order && (
        <RiffsView tuning={tabData.tuningTab} riffs={riffs} order={order} />
      )}
      {tabData && <TabView tabData={tabData} />}
    </ControlContainer>
  );
}
