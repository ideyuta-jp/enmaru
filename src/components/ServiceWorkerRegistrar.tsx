'use client';

import {useEffect} from 'react';

// Registers the minimal service worker (public/sw.js) on the client, which is
// what lets Android Chrome treat enmaru as an installable PWA (#76). Renders
// nothing; mounted once in the root layout. Failures are ignored — registration
// is a progressive enhancement, not required for the app to work.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
