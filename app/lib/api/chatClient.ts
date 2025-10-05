// app/lib/api/chatClient.ts
export type ChatHistoryItem = {
  messageId: string;
  chatId: string;
  senderId: string;
  body: string;
  serverTs: string; // ISO string
};

export type ChatHistoryResponse = {
  items: ChatHistoryItem[];
  nextCursor?: string;
};

export type ClientToServerEvent =
  | { type: 'join'; payload: { chatId: string } }
  | { type: 'message'; payload: { clientId: string; chatId: string; body: string } };

export type ServerToClientEvent =
  | { type: 'joined'; payload: { chatId: string } }
  | { type: 'ack'; payload: ChatAckPayload }
  | { type: 'message:new'; payload: ChatBroadcastPayload }
  | { type: 'error'; payload: { code: 'bad_type' | 'bad_message' | 'rate_limited' | 'not_joined'; detail?: string } };

export type ChatAckPayload = {
  clientId: string;
  messageId: string;
  chatId: string;
  senderId: string;
  body: string; // may be sanitized by server
  serverTs: string; // ISO
};

export type ChatBroadcastPayload = {
  messageId: string;
  chatId: string;
  senderId: string;
  body: string; // may be sanitized by server
  serverTs: string; // ISO
};

export const CHAT_HTTP_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CHAT_HTTP_BASE) ||
  'https://steak-live-chat-822c5b3d1e46.herokuapp.com';

export const CHAT_WS_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CHAT_WS_BASE) ||
  'wss://steak-live-chat-822c5b3d1e46.herokuapp.com';

export async function getChatToken(userId: string): Promise<string> {
  const r = await fetch(`${CHAT_HTTP_BASE}/auth/chat-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!r.ok) throw new Error(`auth failed ${r.status}`);
  const data = (await r.json()) as { token?: string };
  if (!data?.token) throw new Error('auth failed: no token');
  return data.token;
}

export async function getChatHistory(
  chatId: string,
  opts: { before?: number | string; limit?: number } = {}
): Promise<ChatHistoryResponse> {
  const before = opts.before ?? Date.now();
  const limit = opts.limit ?? 50;
  const url = new URL(`${CHAT_HTTP_BASE}/rooms/${chatId}/messages`);
  url.searchParams.set('before', String(before));
  url.searchParams.set('limit', String(limit));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`history ${r.status}`);
  return (await r.json()) as ChatHistoryResponse;
}

export function openChatSocket(token: string): WebSocket {
  const url = `${CHAT_WS_BASE}/chat?token=${encodeURIComponent(token)}`;
  return new WebSocket(url);
}
