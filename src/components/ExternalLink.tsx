import { Link, LinkProps } from '@mui/material';

export default function ExternalLink(props: LinkProps) {
  return <Link {...props} target="_blank" rel="noopener" />;
}
