'use client';

import {useCallback, useEffect, useState} from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import NotificationDrawer from '@/components/NotificationDrawer';
import {fetchUnreadCount} from '@/services/notification';

// How often the bell re-checks the unread count.
const POLL_INTERVAL_MS = 30000;

// Header bell + unread badge. Self-fetching: it polls the unread-count route
// itself rather than receiving a prop, because Header is rendered directly by
// every role page (not only via SessionHeader), so a prop would have to be
// threaded through every call site.
export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Stable refresh for the drawer's onChanged callback (called from a child event
  // handler). The setState lands after an await, so it never runs synchronously.
  const refresh = useCallback(async () => {
    try {
      setCount(await fetchUnreadCount());
    } catch {
      // Ignore transient failures (and the not-signed-in case, which returns 0).
    }
  }, []);

  // Poll the unread count. The fetch+setCount live in an inner async function so
  // the state update only happens after the await (never synchronously in the
  // effect), and an `active` guard drops a late response after unmount.
  useEffect(() => {
    let active = true;
    async function tick() {
      try {
        const next = await fetchUnreadCount();
        if (active) setCount(next);
      } catch {
        // Ignore transient failures (and the not-signed-in case, which returns 0).
      }
    }
    void tick();
    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        aria-label="お知らせ"
        sx={{color: '#666666'}}
      >
        <Badge badgeContent={count} color="error" max={99}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        onChanged={refresh}
      />
    </>
  );
}
