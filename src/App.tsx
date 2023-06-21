import { Box, Stack } from '@mui/material';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import AppBar from 'AppBar';
import ControlContainer from 'components/ControlContainer';
import TrackFileInput from 'components/TrackFileInput';
import TrackView from 'components/TrackView';
import { SnackbarProvider } from 'notistack';
import { useState } from 'react';
import { Track } from 'types/Track';

export default function App() {
  const [track, setTrack] = useState<Track>();

  return (
    <Container maxWidth="xl">
      <AppBar />
      <Box component="main" pt={2}>
        <Toolbar />
        <ControlContainer>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TrackFileInput onTrackChanged={setTrack} />
          </Stack>
        </ControlContainer>
        {track && <TrackView track={track} />}
      </Box>
      <SnackbarProvider />
    </Container>
  );
}
