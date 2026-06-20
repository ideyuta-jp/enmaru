'use client';

import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import {sendChatMessage} from '@/server/chat-actions';
import {fetchChatThread} from '@/services/chat';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  type ChatMessage,
  type ChatThread,
} from '@/types/Chat';
import {formatDateTime} from '@/utils/date';

// How often the panel polls for the counterpart's new messages.
const POLL_INTERVAL_MS = 5000;

interface Props {
  initial: ChatThread;
}

export default function ChatPanel({initial}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [open, setOpen] = useState(initial.open);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Guards every async setState (poll and post-send refresh) against firing
  // after the panel unmounts.
  const mountedRef = useRef(true);

  // Poll the thread so the counterpart's messages appear without a reload.
  // Self-scheduling (setTimeout re-armed after each poll settles) rather than
  // setInterval: a fixed interval can launch a new request before the previous
  // one returns, and an earlier-but-slower response can then clobber a fresher
  // one. Chaining keeps at most one request in flight, so the order is stable.
  useEffect(() => {
    mountedRef.current = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const thread = await fetchChatThread(initial.engagementId);
        if (!mountedRef.current) return;
        setMessages(thread.messages);
        setOpen(thread.open);
      } catch {
        // Transient poll failure: keep the last good view and retry next round.
      } finally {
        if (mountedRef.current) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [initial.engagementId]);

  // Keep the latest message in view as the thread grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  async function handleSend() {
    // Guard against an empty / whitespace-only send (mirrors the disabled send
    // button); the body itself is sent raw — sendChatMessage trims and is the
    // authoritative validator, so a second client-side trim would be redundant.
    if (sending || body.trim().length === 0) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendChatMessage(initial.engagementId, body);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBody('');
      const thread = await fetchChatThread(initial.engagementId);
      if (!mountedRef.current) return;
      setMessages(thread.messages);
      setOpen(thread.open);
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSending(false);
    }
  }

  return (
    <Box>
      <SectionHeading subtitle={initial.jobTitle}>
        {initial.counterpartName}さんとのチャット
      </SectionHeading>

      <Paper
        variant="outlined"
        sx={{
          p: {xs: 1.5, md: 2},
          mb: 2,
          height: {xs: '60vh', md: 440},
          overflowY: 'auto',
          bgcolor: '#FAFAFA',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 6}}>
            <Typography variant="body2" color="text.secondary">
              まだメッセージがありません
            </Typography>
          </Box>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                mine={m.senderParty === initial.viewerParty}
              />
            ))}
            <div ref={bottomRef} />
          </Box>
        )}
      </Paper>

      <ErrorAlert message={error} />

      {open ? (
        <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-end'}}>
          <TextField
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="メッセージを入力"
            size="small"
            multiline
            maxRows={4}
            fullWidth
            slotProps={{htmlInput: {maxLength: MAX_CHAT_MESSAGE_LENGTH}}}
          />
          <Button
            variant="contained"
            disabled={sending || body.trim().length === 0}
            onClick={handleSend}
            sx={{whiteSpace: 'nowrap'}}
          >
            {sending ? '送信中...' : '送信'}
          </Button>
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{textAlign: 'center', py: 1}}
        >
          チャットの利用可能期間が終了しました（業務完了から24時間）。
        </Typography>
      )}
    </Box>
  );
}

const MessageBubble = ({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}) => (
  <Box sx={{display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start'}}>
    <Box
      sx={{
        maxWidth: '75%',
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: mine ? '#F4A7B9' : '#FFFFFF',
        color: mine ? '#FFFFFF' : '#333333',
        border: mine ? 'none' : '1px solid #E0E0E0',
      }}
    >
      <Typography
        variant="body2"
        sx={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}
      >
        {message.body}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 0.25,
          textAlign: 'right',
          color: mine ? 'rgba(255,255,255,0.8)' : '#AAAAAA',
        }}
      >
        {formatDateTime(message.createdAt)}
      </Typography>
    </Box>
  </Box>
);
