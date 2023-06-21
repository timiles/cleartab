import { Typography } from '@mui/material';
import { Track } from 'types/Track';
import { convertTrackDataToTabData } from 'utils/tabUtils';
import ControlContainer from './ControlContainer';
import TabView from './TabView';

interface IProps {
  track: Track;
}

export default function TrackView(props: IProps) {
  const {
    track: { filename, instrument, trackData },
  } = props;

  const tabData = convertTrackDataToTabData(trackData);

  return (
    <ControlContainer>
      <Typography component="h2" variant="h4" mb={1}>
        {filename}
      </Typography>
      <Typography component="h3" variant="h5" mb={1}>
        {instrument}
      </Typography>
      <TabView tabData={tabData} />
    </ControlContainer>
  );
}
