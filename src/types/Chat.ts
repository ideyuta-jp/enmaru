// Chat within a single engagement. A chat has exactly two participants — the
// engagement's seeker and the posting's nursery — so a message's origin is
// expressed as the sending Party, not a raw user id: that is all the UI needs to
// align a bubble against the viewer, and it keeps user ids off the client.

// Cap on a single message's length. Shared by the send form (client) and the
// send action (server) so both judge the limit the same way.
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

// One chat message as shown to a viewer.
export interface ChatMessage {
  id: string;
  body: string;
  senderParty: 'SEEKER' | 'NURSERY';
  createdAt: string; // ISO 8601
}

// The whole chat view for one engagement: who the viewer is (to align bubbles),
// the counterpart and job context for the header, whether sending is currently
// allowed (the time window), and the messages so far. `open` is derived in
// server/ from the engagement's lifecycle — it is not stored.
export interface ChatThread {
  engagementId: string;
  viewerParty: 'SEEKER' | 'NURSERY';
  counterpartName: string;
  jobTitle: string;
  open: boolean;
  messages: ChatMessage[];
}
