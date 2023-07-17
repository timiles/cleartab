import { Button } from '@mui/material';
import { useState } from 'react';
import CopyToClipboardDialog from './CopyToClipboardDialog';

interface IProps {
  tuningTab: string;
  riffs: ReadonlyArray<ReadonlyArray<string>>;
  order: ReadonlyArray<{ riffIndex: number; endingIndex?: number; times: number }>;
}

export default function CopyToClipboardButton(props: IProps) {
  const { tuningTab, riffs, order } = props;

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button size="small" variant="outlined" onClick={handleOpen}>
        Copy to clipboard
      </Button>
      {open && (
        <CopyToClipboardDialog
          tuningTab={tuningTab}
          riffs={riffs}
          order={order}
          onClose={handleClose}
        />
      )}
    </>
  );
}
