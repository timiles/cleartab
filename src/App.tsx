import { Box } from '@mui/material';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import AppBar from 'AppBar';
import { SnackbarProvider } from 'notistack';

export default function App() {
  return (
    <Container maxWidth="xl">
      <AppBar />
      <Box component="main" pt={2}>
        <Toolbar />
      </Box>
      <SnackbarProvider />
    </Container>
  );
}
