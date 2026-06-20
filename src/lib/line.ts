// LINE Messaging API client. Knows how to talk to LINE; no domain knowledge.
// One file per external service (same shape as lib/logto.ts / lib/storage.ts).

const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

// Channel access token for the official account. Empty until configured; see
// .env.example. Read with the same `?? ''` fallback pattern as lib/logto.ts.
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';

// Push a text message to one LINE user. Best-effort and intentionally gated: a
// no-op (not an error) when the channel token is unset OR the recipient has no
// lineUserId. Until the registration friend-add flow populates User.lineUserId
// (a follow-up), lineUserId is null for everyone, so this stays dark in prod by
// construction. A non-2xx LINE response throws so the caller (server/notification)
// can log it; the caller never lets it surface to the user.
export async function pushLineMessage(
  lineUserId: string | null,
  text: string,
): Promise<void> {
  if (!channelAccessToken || !lineUserId) return;

  const response = await fetch(LINE_PUSH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{type: 'text', text}],
    }),
  });
  if (!response.ok) {
    throw new Error(
      `LINE push failed: ${response.status} ${await response.text()}`,
    );
  }
}
