'use client';

import {forwardRef} from 'react';
import NextLink, {type LinkProps as NextLinkProps} from 'next/link';

// Lets MUI route through next/link without each call site passing
// `component={NextLink}`. Wired into the theme as the default for MuiLink and as
// MuiButtonBase's LinkComponent, so a plain `href` on a Button / Link / CardActionArea
// produces client-side navigation. This also keeps the indirection on the client
// side: Server Components cannot pass a component (a function) across the RSC
// boundary, but they can pass a plain `href`.
const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<NextLinkProps, 'href'> & {href: NextLinkProps['href']}
>(function LinkBehavior(props, ref) {
  const {href, ...other} = props;
  return <NextLink ref={ref} href={href} {...other} />;
});

export default LinkBehavior;
