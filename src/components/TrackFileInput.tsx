import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Link,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import { Track } from 'types/Track';
import { SongsterrData } from 'utils/trackData/Songsterr/SongsterrData';
import {
  convertSongsterrDataToTrackData,
  isValidSongsterrData,
} from 'utils/trackData/Songsterr/songsterrUtils';
import ExternalLink from './ExternalLink';

interface IProps {
  onTrackChanged: (track: Track) => void;
}

export default function TrackFileInput(props: IProps) {
  const { onTrackChanged } = props;

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length > 0) {
      const file = files[0];
      file.text().then((text) => {
        let json: Object;
        try {
          json = JSON.parse(text);

          if (!isValidSongsterrData(json)) {
            throw new Error('Invalid Songsterr data.');
          }
        } catch (error) {
          enqueueSnackbar(`Could not read "${file.name}": ${error}.`, { variant: 'error' });
          return;
        }

        const songsterrData = json as SongsterrData;

        const track: Track = {
          filename: file.name,
          instrument: songsterrData.instrument,
          trackData: convertSongsterrDataToTrackData(songsterrData),
        };

        onTrackChanged(track);

        enqueueSnackbar(`Successfully loaded "${file.name}".`, { variant: 'success' });
      });
    }
  };

  return (
    <FormControl>
      <Button variant="contained" component="label">
        Import track file
        <input
          type="file"
          accept=".json"
          aria-describedby="track-file-input-helper-text"
          hidden
          onChange={handleChange}
        />
      </Button>
      <FormHelperText id="track-file-input-helper-text">
        See {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link component="button" onClick={handleOpen}>
          supported track files
        </Link>
      </FormHelperText>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="track-file-dialog-title"
        aria-describedby="track-file-dialog-description"
      >
        <DialogTitle id="track-file-dialog-title">Supported track files</DialogTitle>
        <DialogContent>
          <DialogContentText id="track-file-dialog-description" tabIndex={-1}>
            ClearTab can currently read tabs from{' '}
            <ExternalLink href="https://www.songsterr.com/">Songsterr.com</ExternalLink>.
            <br />
            Please{' '}
            <ExternalLink href="https://github.com/timiles/cleartab/issues">
              open an issue
            </ExternalLink>{' '}
            to request support for other file formats.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Got it</Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
}
