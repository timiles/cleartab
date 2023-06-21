import { Stack } from '@mui/material';
import { Fragment } from 'react';
import { TabData } from 'types/TabData';

interface IProps {
  tabData: TabData;
}

export default function TabView(props: IProps) {
  const {
    tabData: { tuningTab, timeSignatureTabsLookup, barTabs },
  } = props;

  return (
    <Stack direction="row" flexWrap="wrap" alignItems="end">
      <pre>{tuningTab}</pre>
      {barTabs.map((bar, barIndex) => (
        // barTabs are fixed so barIndex is safe to use as key
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={barIndex}>
          {timeSignatureTabsLookup.has(barIndex) && (
            <pre>{timeSignatureTabsLookup.get(barIndex)}</pre>
          )}
          <pre>{bar}</pre>
        </Fragment>
      ))}
    </Stack>
  );
}
