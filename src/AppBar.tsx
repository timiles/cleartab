import { Slide } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useScrollTrigger from '@mui/material/useScrollTrigger';

export default function AppBar() {
  const scrollTrigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!scrollTrigger}>
      <MuiAppBar component="nav">
        <Toolbar>
          <Typography variant="h6" component="div" flexGrow={1}>
            ClearTab
          </Typography>
        </Toolbar>
      </MuiAppBar>
    </Slide>
  );
}
