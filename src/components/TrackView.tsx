import { Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { TabData } from 'types/TabData';
import { Track } from 'types/Track';
import { TrackData } from 'types/TrackData';
import { isNotNullish } from 'utils/arrayUtils';
import { packItemData, unpackItemData } from 'utils/sequenceUtils';
import { RiffOrder, formatRiffs, getBarTabsWithTimeSignatures, isRestBar } from 'utils/tabUtils';
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
  const [order, setOrder] = useState<ReadonlyArray<RiffOrder>>();

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
          const inputRiffs = result.sequences.map(({ items, endings }) => ({
            bars: items
              .map(unpackItemData)
              .map(([barTab, timeSignatureTab]) => ({ barTab, timeSignatureTab })),
            endings: endings?.map((ending) =>
              ending
                .map(unpackItemData)
                .map(([barTab, timeSignatureTab]) => ({ barTab, timeSignatureTab })),
            ),
          }));

          const indexesOfRests = inputRiffs
            .map(({ bars, endings }, sequenceIndex) =>
              !endings && bars.length === 1 && isRestBar(bars[0].barTab) ? sequenceIndex : null,
            )
            .filter(isNotNullish);

          const sequenceOrder: ReadonlyArray<RiffOrder> = result.order.map(
            ({ sequenceIndex, endingIndex, times }) => {
              if (indexesOfRests.includes(sequenceIndex)) {
                return {
                  isRest: true,
                  bars: times,
                };
              }
              return {
                isRest: false,
                riffIndex:
                  // Adjust riff index for any skipped rest-only riffs
                  sequenceIndex - indexesOfRests.filter((index) => index < sequenceIndex).length,
                endingIndex,
                times,
              };
            },
          );

          const formattedRiffs = formatRiffs(
            inputRiffs.filter((_, sequenceIndex) => !indexesOfRests.includes(sequenceIndex)),
            sequenceOrder,
          );

          setRiffs(formattedRiffs);
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
          {trackData && (
            <Typography component="h3" variant="h5" mb={1}>
              {trackData.name}
            </Typography>
          )}
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
