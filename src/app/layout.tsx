import type {Metadata} from 'next';
import {Noto_Sans_JP} from 'next/font/google';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';

import theme from '@/theme';

// Exposed to MUI as the CSS variable referenced by theme.typography.fontFamily.
const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  title: {
    default: 'えんまーる | 保育士と保育園をつなぐマッチングサービス',
    template: '%s | えんまーる',
  },
  description:
    '潜在保育士と保育園を段階的につなぐマッチングプラットフォーム。応募から業務、相互評価までを一つの流れとして支えます。',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
