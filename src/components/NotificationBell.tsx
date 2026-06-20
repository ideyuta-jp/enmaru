'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  // Guards every async setState against firing after unmount; used by both the
  // poll and the drawer's onChanged refresh.
  const mountedRef = useRef(true);

  // The single update path: fetch the count, set it (after the await, and only
  // while mounted). Stable so the drawer's onChanged can call it too.
  const refresh = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      if (mountedRef.current) setUnreadCount(count);
    } catch {
      // Ignore transient failures (and the not-signed-in case, which returns 0).
    }
  }, []);

  // Poll via a self-scheduling timeout (re-armed after each refresh settles)
  // rather than a fixed interval, so at most one request is in flight and a
  // slower-older response can't clobber a fresher one — same approach as
  // ChatPanel's poll.
  useEffect(() => {
    mountedRef.current = true;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      await refresh();
      if (mountedRef.current) timer = setTimeout(tick, POLL_INTERVAL_MS);
    }
    void tick();
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [refresh]);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        aria-label="お知らせ"
        sx={{color: '#666666'}}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
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
