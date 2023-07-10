/* eslint-disable react/no-array-index-key */
import { Stack, Typography } from '@mui/material';
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
    <>
      <Typography component="h4" variant="h6">
        Full tab
      </Typography>
      <Stack direction="row" flexWrap="wrap" alignItems="end">
        <pre className="tab">{tuningTab}</pre>
        {barTabs.map((barTab, barIndex) => (
          <Fragment key={barIndex}>
            {timeSignatureTabsLookup.has(barIndex) && (
              <pre className="tab">{timeSignatureTabsLookup.get(barIndex)}</pre>
            )}
            <pre className="tab">{barTab}</pre>
          </Fragment>
        ))}
      </Stack>
    </>
  );
}
