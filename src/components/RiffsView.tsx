/* eslint-disable react/no-array-index-key */
import { Box, Stack, Typography } from '@mui/material';
import { formatRiffLabel, renderOrder } from 'utils/tabUtils';

interface IProps {
  tuning: string;
  riffs: ReadonlyArray<ReadonlyArray<string>>;
  order: ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>;
}

export default function RiffsView(props: IProps) {
  const { tuning, riffs, order } = props;

  return (
    <Box mb={2}>
      <Typography component="h4" variant="h6">
        Riffs
      </Typography>
      <Stack direction="row" flexWrap="wrap" alignItems="end">
        <pre className="tab">{tuning}</pre>
        {riffs.map((riff, riffIndex) => (
          <Stack key={riffIndex} direction="column">
            <pre className="riff-label">{formatRiffLabel(riffIndex)}</pre>
            <Stack direction="row" flexWrap="wrap" alignItems="end">
              {riff.map((barTab, barIndex) => (
                <pre key={barIndex} className="tab">
                  {barTab}
                </pre>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
      <pre className="riff-order">{renderOrder(order)}</pre>
    </Box>
  );
}
