import type {MetadataRoute} from 'next';

// Web App Manifest — makes enmaru installable to a phone's home screen (#76).
// Next serves this at /manifest.webmanifest and injects the <link rel="manifest">.
// Scope is deliberately minimal: home-screen install + standalone launch only,
// no offline/caching behavior (see public/sw.js).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'えんまーる',
    short_name: 'えんまーる',
    description:
      '潜在保育士と保育園を段階的につなぐマッチングプラットフォーム。',
    start_url: '/',
    display: 'standalone',
    lang: 'ja',
    // White matches the app's white AppBar / background; the sakura pink stays
    // the single accent, carried by the icons rather than chrome.
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    icons: [
      {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
