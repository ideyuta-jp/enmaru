'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/server/notification-actions';
import {fetchNotifications} from '@/services/notification';
import {type Notification, NotificationType} from '@/types/Notification';
import {formatDateTime} from '@/utils/date';

interface Props {
  open: boolean;
  onClose: () => void;
  // Called after the unread set may have changed, so the bell can refresh.
  onChanged: () => void;
}

// Icon + accent colour per known notification type; unknown types fall back to a
// neutral bell (the type column tolerates kinds not listed here).
const TYPE_ICON: Record<string, {icon: React.ReactNode; color: string}> = {
  [NotificationType.MATCH_FORMED]: {
    icon: <HandshakeIcon fontSize="small" />,
    color: '#F4A7B9',
  },
  [NotificationType.DOCUMENT_APPROVED]: {
    icon: <CheckCircleOutlineIcon fontSize="small" />,
    color: '#2E7D32',
  },
  [NotificationType.DOCUMENT_REJECTED]: {
    icon: <ErrorOutlineIcon fontSize="small" />,
    color: '#C62828',
  },
  [NotificationType.WORK_REPORT_FILED]: {
    icon: <AssignmentTurnedInIcon fontSize="small" />,
    color: '#1565C0',
  },
  [NotificationType.REVIEW_REQUESTED]: {
    icon: <StarBorderIcon fontSize="small" />,
    color: '#F57F17',
  },
  [NotificationType.MESSAGE_RECEIVED]: {
    icon: <ChatBubbleOutlineIcon fontSize="small" />,
    color: '#F4A7B9',
  },
};

export default function NotificationDrawer({open, onClose, onChanged}: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load the list each time the drawer opens (cheap, always current). All
  // setState happens inside the async function after an await, never
  // synchronously in the effect; `active` drops a late response after close.
  useEffect(() => {
    if (!open) return;
    let active = true;
    async function load() {
      try {
        const items = await fetchNotifications();
        if (active) setNotifications(items);
      } catch {
        // Keep whatever was shown; the bell still works.
      } finally {
        if (active) setLoaded(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [open]);

  async function handleRowClick(item: Notification) {
    if (!item.isRead) {
      // Persist, reflect locally (so the row shows read if the drawer stays open,
      // e.g. a notification with no linkUrl), then let the bell refresh — same
      // server -> local state -> onChanged order as handleMarkAll.
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? {...n, isRead: true} : n)),
      );
      onChanged();
    }
    onClose();
    if (item.linkUrl) router.push(item.linkUrl);
  }

  async function handleMarkAll() {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({...n, isRead: true})));
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{paper: {sx: {width: {xs: 320, sm: 380}}}}}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
          お知らせ
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="閉じる">
          <CloseIcon />
        </IconButton>
      </Box>

      {hasUnread && (
        <Box sx={{px: 2, pb: 1}}>
          <Button size="small" disabled={busy} onClick={handleMarkAll}>
            すべて既読にする
          </Button>
        </Box>
      )}

      <Divider />

      {!loaded && notifications.length === 0 ? (
        <Box sx={{textAlign: 'center', py: 6}}>
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{textAlign: 'center', py: 6}}>
          <NotificationsNoneIcon sx={{fontSize: 40, color: '#CCCCCC'}} />
          <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
            お知らせはありません
          </Typography>
        </Box>
      ) : (
        <Box>
          {notifications.map((item) => {
            const visual = TYPE_ICON[item.type];
            return (
              <Box
                key={item.id}
                onClick={() => handleRowClick(item)}
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid #F0F0F0',
                  borderLeft: item.isRead
                    ? '3px solid transparent'
                    : '3px solid #F4A7B9',
                  bgcolor: item.isRead ? 'transparent' : '#FFF8F9',
                  '&:hover': {bgcolor: '#FAFAFA'},
                }}
              >
                <Box sx={{color: visual?.color ?? '#AAAAAA', mt: 0.25}}>
                  {visual?.icon ?? <NotificationsNoneIcon fontSize="small" />}
                </Box>
                <Box sx={{minWidth: 0}}>
                  <Typography
                    variant="body2"
                    sx={{fontWeight: item.isRead ? 400 : 700}}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{display: 'block', whiteSpace: 'pre-wrap'}}
                  >
                    {item.body}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{color: '#AAAAAA', display: 'block', mt: 0.25}}
                  >
                    {formatDateTime(item.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Drawer>
  );
}
