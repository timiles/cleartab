import DoneIcon from '@mui/icons-material/Done';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  TextField,
  Tooltip,
  debounce,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useCallback, useEffect, useState } from 'react';
import { getRenderedRiffsMaxLineLength, renderRiffs } from 'utils/tabUtils';

interface IProps {
  tuningTab: string;
  riffs: ReadonlyArray<ReadonlyArray<string>>;
  order: ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>;
  onClose: () => void;
}

export default function CopyToClipboardDialog(props: IProps) {
  const { tuningTab, riffs, order, onClose } = props;

  const [maxLineLength, setMaxLineLength] = useState(84);
  const setMaxLineLengthDebounced = useCallback(debounce(setMaxLineLength, 500), []);

  const [hideTuning, setHideTuning] = useState(false);
  const [avoidSplittingRiffs, setAvoidSplittingRiffs] = useState(false);

  const [renderedRiffs, setRenderedRiffs] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const minimumMaxLineLength = getRenderedRiffsMaxLineLength(
    renderRiffs(tuningTab, riffs, order, { maxLineLength: 1, hideTuning, avoidSplittingRiffs }),
  );
  const actualMaxLineLength = getRenderedRiffsMaxLineLength(renderedRiffs);
  const renderedLineLength = Math.max(maxLineLength, actualMaxLineLength);

  useEffect(() => {
    if (maxLineLength >= minimumMaxLineLength) {
      setRenderedRiffs(
        renderRiffs(tuningTab, riffs, order, { maxLineLength, hideTuning, avoidSplittingRiffs }),
      );
    }
  }, [tuningTab, riffs, maxLineLength, hideTuning, avoidSplittingRiffs]);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedRiffs);
    setIsCopied(true);
  };

  return (
    <Dialog
      open
      maxWidth="xl"
      onClose={onClose}
      aria-labelledby="copy-to-clipboard-dialog-title"
      aria-describedby="copy-to-clipboard-dialog-description"
    >
      <DialogTitle id="copy-to-clipboard-dialog-title">Copy to clipboard</DialogTitle>
      <DialogContent>
        <DialogContentText id="copy-to-clipboard-dialog-description" tabIndex={-1} mb={2}>
          Use the settings to format the tab, then click the button below to copy it to your
          clipboard.
        </DialogContentText>

        <Box mb={3}>
          <Card>
            <Box component="form" noValidate autoComplete="off" p={2}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <FormControl>
                    <TextField
                      label="Max width (characters)"
                      // Uncontrolled component so we can debounce the changes
                      defaultValue={maxLineLength.toString()}
                      onChange={(e) => setMaxLineLengthDebounced(Number(e.target.value))}
                    />
                  </FormControl>
                </Grid>
                <Grid sm={4}>
                  <FormControlLabel
                    label="Hide tuning"
                    control={
                      <Checkbox
                        checked={hideTuning}
                        onChange={(e) => setHideTuning(e.target.checked)}
                      />
                    }
                  />
                </Grid>
                <Grid sm={4}>
                  <FormControlLabel
                    label="Avoid splitting riffs"
                    control={
                      <Checkbox
                        checked={avoidSplittingRiffs}
                        onChange={(e) => setAvoidSplittingRiffs(e.target.checked)}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Box>

        {!Number.isFinite(maxLineLength) && <Alert severity="warning">Max width is invalid.</Alert>}
        {maxLineLength < minimumMaxLineLength && (
          <Alert severity="warning">Minimum width for this tab is {minimumMaxLineLength}.</Alert>
        )}
        <Box sx={{ overflowX: 'auto' }}>
          <pre className="rendered-riff" style={{ width: `${renderedLineLength}ch` }}>
            {renderedRiffs}
          </pre>
        </Box>
      </DialogContent>
      <DialogActions>
        {isCopied ? (
          <Tooltip open title="Copied!" placement="top" arrow>
            <Button variant="contained" color="success" onClick={handleCopy}>
              <DoneIcon />
            </Button>
          </Tooltip>
        ) : (
          <Button variant="contained" onClick={handleCopy}>
            Copy
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
