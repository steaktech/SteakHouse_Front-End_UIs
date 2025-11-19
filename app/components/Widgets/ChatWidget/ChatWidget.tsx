"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChatWidgetProps, Message, SortMode } from './types';
import { SharePopup } from './SharePopup';
import { usd2, nf0, formatPct, shortAddr, relTime, escapeHtml } from './utils';
import styles from './ChatWidget.module.css';
import { useWallet } from '@/app/hooks/useWallet';
import { useShare } from './useShare';
import { useHoldersData } from '@/app/hooks/useHoldersData';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import type { Candle } from '@/app/types/token';
import {
  getChatHistory,
  getChatToken,
  openChatSocket,
  type ChatHistoryItem,
  type ServerToClientEvent,
} from '@/app/lib/api/chatClient';

const EmojiPicker = dynamic<any>(() => import('emoji-picker-react'), { ssr: false });
const WalletModal = dynamic(() => import('../../Modals/WalletModal/WalletModal'), { ssr: false });

export const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenAddress,
  apiTokenData = null, // Receive API data from parent to avoid duplicate calls
}) => {
  // Wallet state
  const { isConnected: walletConnected, address } = useWallet();

  const { data: holdersData } = useHoldersData({ tokenAddress: tokenAddress, enabled: Boolean(tokenAddress) });

  // Derived token header fields with graceful fallbacks
  const tokenName = apiTokenData?.tokenInfo?.name || '';
  const tokenSymbol = apiTokenData?.tokenInfo?.symbol || '';
  const tokenPrice = typeof apiTokenData?.price === 'number' ? apiTokenData.price : undefined;
  const tokenMc = typeof apiTokenData?.marketCap === 'number' ? apiTokenData.marketCap : undefined;
  const candles = apiTokenData?.candles || [];
  const nowMs = Date.now();
  const dayAgoMs = nowMs - 24 * 60 * 60 * 1000;
  let change24hPct: number | undefined = undefined;
  if (candles.length >= 2) {
    // Try compute 24h change from candles; pick first candle >= 24h window
    const inWindow = candles.filter((c: Candle) => (typeof c.timestamp === 'number' ? c.timestamp : 0) >= dayAgoMs);
    const series = inWindow.length >= 2 ? inWindow : candles;
    const first = series[0];
    const last = series[series.length - 1];
    const open = (first as any).open as number;
    const close = (last as any).close as number;
    if (typeof open === 'number' && open > 0 && typeof close === 'number') {
      change24hPct = ((close - open) / open) * 100;
    }
  }
  // Fallback if API happens to expose price_change_24h
  if (change24hPct == null && (apiTokenData as any)?.tokenInfo?.price_change_24h != null) {
    change24hPct = Number((apiTokenData as any).tokenInfo.price_change_24h);
  }
  const holdersCount = holdersData?.holders ? holdersData.holders.length : undefined;
  const logoChar = (tokenSymbol || tokenName)?.slice(0, 1).toUpperCase() || '📈';

  // Share functionality
  const { shareContent, isShareSupported } = useShare();
  const [showSharePopup, setShowSharePopup] = useState(false);

  // Chat state
  const [wsReady, setWsReady] = useState(false);
  const [isHolder, setIsHolder] = useState(true);
  const [holdersOnly, setHoldersOnly] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('old');
  // Saved token (favorite) state via API
  const { isSaved: savedState, isLoading: isSaveLoading, toggleSave } = useSaveToken(tokenAddress || '', false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerInput, setComposerInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasEmojiPickerMounted, setHasEmojiPickerMounted] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  // Refs
  const feedRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPopoverRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastCursorRef = useRef<string | null>(null);
  const joinedChatRef = useRef<string | null>(null);
  const idCounterRef = useRef<number>(Date.now());
  const pendingByClientRef = useRef<Map<string, number>>(new Map()); // clientId -> local message id
  const sentTimestampsRef = useRef<number[]>([]); // for client-side rate guard
  const reconnectAttemptRef = useRef<number>(0);
  const loadingHistoryRef = useRef<boolean>(false);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const didInitialScrollRef = useRef<boolean>(false);

  // Role badge helper
  const roleBadge = (role: string) => {
    if (role === "holder" || role === "mod") {
      return <span className={styles.badge}>Holder</span>;
    }
    if (role === "team") {
      return <span className={`${styles.badge} ${styles.teamBadge}`}>Team</span>;
    }
    return null;
  };

  // Helpers
  const nextId = () => ++idCounterRef.current;

  // Share URL construction
  const getShareData = useCallback(() => ({
    title: `${tokenName} (${tokenSymbol})`,
    text: `Check out ${tokenName} (${tokenSymbol}) on SteakHouse Trading`,
    url: `${window.location.origin}/trading-chart/${tokenAddress}`,
  }), [tokenName, tokenSymbol, tokenAddress]);

  const MAX_LEN = 400;

  const emojiAliasMap: Record<string, string> = {
    rocket: '🚀', fire: '🔥', heart: '❤️', thumbsup: '👍', hundred: '💯', party: '🎉', smile: '😊', laughing: '😂', cry: '😭', bull: '🐂', bear: '🐻', moneybag: '💰', chart_up: '📈', chart_down: '📉', diamond: '💎'
  };

  const normalizeEmojiAliases = (text: string) => text.replace(/:([a-z_]+):/g, (full, key) => {
    const k = String(key);
    return emojiAliasMap[k] ?? full;
  });

  const insertAtCursor = (snippet: string) => {
    const el = inputRef.current;
    if (!el) {
      setComposerInput(prev => (prev + snippet).slice(0, MAX_LEN));
      return;
    }
    const start = el.selectionStart ?? composerInput.length;
    const end = el.selectionEnd ?? composerInput.length;
    const before = composerInput.slice(0, start);
    const after = composerInput.slice(end);
    const next = (before + snippet + after).slice(0, MAX_LEN);
    setComposerInput(next);
    requestAnimationFrame(() => {
      const pos = Math.min(start + snippet.length, next.length);
      try { el.setSelectionRange(pos, pos); } catch { }
      el.focus();
    });
  };

  const displayFromSender = useCallback((senderId?: string) => {
    if (!senderId) return 'anon';
    return /^0x[a-fA-F0-9]{40}$/.test(senderId) ? shortAddr(senderId) : senderId;
  }, []);

  const mapHistoryItem = useCallback((item: ChatHistoryItem): Message => ({
    id: nextId(),
    messageId: item.messageId,
    senderId: item.senderId,
    addr: displayFromSender(item.senderId),
    role: 'guest',
    avatar: '👤',
    text: item.body || '',
    ts: Date.parse(item.serverTs),
    reactions: {},
    likes: 0,
  }), [displayFromSender]);

  // Filter, sort, and search messages
  const filterSortSearch = (messageList: Message[]) => {
    const q = searchQuery.toLowerCase().trim();
    let filtered = messageList.filter((m) => (q ? m.text.toLowerCase().includes(q) : true));

    if (sortMode === "new") filtered.sort((a, b) => b.ts - a.ts);
    if (sortMode === "old") filtered.sort((a, b) => a.ts - b.ts);
    if (sortMode === "top") filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    return filtered;
  };

  // Scroll to bottom helper
  const scrollToBottom = (opts?: { smooth?: boolean }) => {
    const el = feedRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: opts?.smooth ? 'smooth' : 'auto' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  };

  // Render reactions
  const renderReactions = (m: Message) => {
    const keys = Object.keys(m.reactions);
    const all = keys.length
      ? keys.map((k) => `${k} ${m.reactions[k]}`).join(" ")
      : "";
    return (
      <>
        {all && <span>{all} </span>}
        <button
          onClick={() => handleReaction(m.id, "👍")}
          title="Like"
          className={styles.iconBtn}
        >
          👍
        </button>
        <button
          onClick={() => handleReaction(m.id, "🔥")}
          title="Fire"
          className={styles.iconBtn}
        >
          🔥
        </button>
        <button
          onClick={() => handleReaction(m.id, "🚀")}
          title="Rocket"
          className={styles.iconBtn}
        >
          🚀
        </button>
        <button
          onClick={() => handleReaction(m.id, "❤️")}
          title="Heart"
          className={styles.iconBtn}
        >
          ❤️
        </button>
      </>
    );
  };

  // Handle reactions
  const handleReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const newReactions = { ...m.reactions };
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        const newLikes = Object.values(newReactions).reduce((a, b) => a + b, 0);
        return { ...m, reactions: newReactions, likes: newLikes };
      }
      return m;
    }));
  };

  // Handle message actions
  const handleMessageAction = (action: string, messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    switch (action) {
      case 'reply':
        setComposerInput(`↪ ${message.addr}: `);
        break;
      case 'quote':
        setComposerInput(`"${message.text}" — ${message.addr}\n`);
        break;
      case 'report':
        alert("Thanks. Message was reported to moderators.");
        break;
    }
  };

  // Send message
  const handleSendMessage = () => {
    const textRaw = composerInput.trim();
    const text = normalizeEmojiAliases(textRaw);
    if (!walletConnected || !wsReady || !text || !joinedChatRef.current) return;
    if (holdersOnly && !isHolder) return;

    // Ensure the current socket is OPEN before sending (avoid InvalidStateError)
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // Optionally, you could queue the message or show a toast here
      return;
    }

    // Client-side rate guard: 10 messages / 5s
    const now = Date.now();
    sentTimestampsRef.current = sentTimestampsRef.current.filter(t => now - t < 5000);
    if (sentTimestampsRef.current.length >= 10) {
      // Soft prevent; server also enforces
      alert('You are sending messages too quickly. Please wait a few seconds.');
      return;
    }
    sentTimestampsRef.current.push(now);

    const clientId = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? (globalThis.crypto as any).randomUUID()
      : String(now);

    const localMessage: Message = {
      id: nextId(),
      clientId,
      senderId: address || 'anon',
      addr: displayFromSender(address || 'anon'),
      role: isHolder ? 'holder' : 'guest',
      avatar: '🙂',
      text,
      ts: now,
      reactions: {},
      likes: 0,
      pending: true,
    };

    setMessages(prev => [...prev, localMessage]);
    pendingByClientRef.current.set(clientId, localMessage.id);
    // Ensure we scroll to the latest message after sending
    setTimeout(() => scrollToBottom({ smooth: true }), 0);

    try {
      ws.send(JSON.stringify({
        type: 'message',
        payload: { clientId, chatId: joinedChatRef.current, body: text },
      }));
      setComposerInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle key press in composer
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Close emoji picker when clicking outside of it or the toggle button
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!showEmojiPicker) return;
      const pop = emojiPopoverRef.current;
      const btn = emojiBtnRef.current;
      const target = e.target as Node | null;
      if (pop && target && pop.contains(target)) return;
      if (btn && target && btn.contains(target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showEmojiPicker]);

  // Scroll to bottom when new messages arrive (only if user near bottom)
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Load history
  const loadHistory = useCallback(async (chatId: string, before?: number | string) => {
    if (loadingHistoryRef.current) return;
    loadingHistoryRef.current = true;
    try {
      const data = await getChatHistory(chatId, { before: before ?? Date.now(), limit: 50 });
      lastCursorRef.current = data.nextCursor || lastCursorRef.current;
      const newItems = data.items || [];

      setMessages(prev => {
        // Build a set of already-known messageIds from current state
        const known = new Set(prev.map(m => m.messageId).filter(Boolean) as string[]);
        const mapped = newItems.map(mapHistoryItem);
        const unique = mapped.filter(m => !m.messageId || !known.has(m.messageId));
        unique.forEach(m => m.messageId && known.add(m.messageId));
        // Update the seen set to reflect everything we know about now
        seenMessageIdsRef.current = known;
        return prev.length === 0 ? unique : [...prev, ...unique];
      });
      // On initial load, scroll to bottom once
      if (!didInitialScrollRef.current) {
        setTimeout(() => scrollToBottom({ smooth: false }), 0);
        didInitialScrollRef.current = true;
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      loadingHistoryRef.current = false;
    }
  }, [mapHistoryItem]);

  // WebSocket lifecycle
  const closeSocket = useCallback(() => {
    try {
      wsRef.current?.close();
    } catch { }
    wsRef.current = null;
    setWsReady(false);
    joinedChatRef.current = null;
  }, []);

  const startSocket = useCallback(async (chatId: string, userId: string) => {
    try {
      // reset ready flag for the new connection
      setWsReady(false);
      const token = await getChatToken(userId);
      const ws = openChatSocket(token);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        try {
          ws.send(JSON.stringify({ type: 'join', payload: { chatId } }));
          joinedChatRef.current = chatId;
        } catch (err) {
          console.error('Failed to send join:', err);
        }
      });

      ws.addEventListener('message', (ev) => {
        try {
          const evt = JSON.parse(ev.data) as ServerToClientEvent;
          if (evt.type === 'joined') {
            setWsReady(true);
            reconnectAttemptRef.current = 0;
          } else if (evt.type === 'ack') {
            const { clientId, messageId, senderId, body, serverTs } = evt.payload;
            const localId = pendingByClientRef.current.get(clientId);
            if (!localId) return;
            setMessages(prev => {
              // Update the pending local message
              const updatedList = prev.map(m => {
                if (m.id !== localId) return m;
                const updated: Message = {
                  ...m,
                  pending: false,
                  messageId,
                  senderId,
                  addr: displayFromSender(senderId),
                  text: body,
                  ts: Date.parse(serverTs),
                };
                if (messageId) seenMessageIdsRef.current.add(messageId);
                return updated;
              });
              // If a server broadcast (message:new) for this message arrived before ack,
              // remove that duplicate, keeping the updated local message.
              if (messageId) {
                return updatedList.filter(m => m.messageId !== messageId || m.id === localId);
              }
              return updatedList;
            });
            pendingByClientRef.current.delete(clientId);
          } else if (evt.type === 'message:new') {
            const { messageId, senderId, body, serverTs } = evt.payload;
            // Deduplicate by messageId
            if (messageId && seenMessageIdsRef.current.has(messageId)) return;
            setMessages(prev => {
              if (messageId && prev.some(m => m.messageId === messageId)) return prev;
              const m: Message = {
                id: nextId(),
                messageId,
                senderId,
                addr: displayFromSender(senderId),
                role: 'guest',
                avatar: '👤',
                text: body,
                ts: Date.parse(serverTs),
                reactions: {},
                likes: 0,
              };
              if (messageId) seenMessageIdsRef.current.add(messageId);
              return [...prev, m];
            });
          } else if (evt.type === 'error') {
            console.warn('Chat WS error:', evt.payload);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      });

      ws.addEventListener('close', (e) => {
        setWsReady(false);
        joinedChatRef.current = null;
        // Unauthorized -> refresh token & reconnect
        if (e.code === 4001) {
          console.warn('Chat WS unauthorized, refreshing token...');
        }
        // Reconnect with backoff while widget is open
        if (isOpen && chatId && userId) {
          const attempt = Math.min(6, reconnectAttemptRef.current + 1);
          reconnectAttemptRef.current = attempt;
          const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
          setTimeout(() => {
            if (isOpen && walletConnected && tokenAddress?.toLowerCase() === chatId) {
              startSocket(chatId, userId).catch(err => console.error('Reconnect failed:', err));
            }
          }, delay);
        }
      });

      ws.addEventListener('error', (e) => {
        console.error('Chat WS network error:', (e as any)?.message || e);
      });
    } catch (err) {
      console.error('Failed to start chat socket:', err);
    }
  }, [displayFromSender, isOpen, tokenAddress, walletConnected]);

  // React to open/close and token changes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup on close
      closeSocket();
      setMessages([]);
      lastCursorRef.current = null;
      seenMessageIdsRef.current.clear();
      didInitialScrollRef.current = false;
      return;
    }

    const raw = (tokenAddress || '').trim();
    if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) {
      // Invalid room id, do not proceed
      return;
    }
    const chatId = raw.toLowerCase();

    // Reset and load first page of history
    setMessages([]);
    lastCursorRef.current = null;
    seenMessageIdsRef.current.clear();
    loadHistory(chatId, Date.now());

    // If wallet connected, start socket
    if (walletConnected && address) {
      startSocket(chatId, address);
    }

    return () => {
      // If token changes or widget closes
      closeSocket();
      didInitialScrollRef.current = false;
    };
  }, [isOpen, tokenAddress, walletConnected, address, loadHistory, startSocket, closeSocket]);

  // If wallet connection turns on while widget is open, ensure socket exists
  useEffect(() => {
    if (!isOpen) return;
    if (!walletConnected || !address) return;
    if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) return;
    if (wsRef.current) return; // already connected/connecting
    startSocket(tokenAddress.toLowerCase(), address);
  }, [isOpen, walletConnected, address, tokenAddress, startSocket]);

  // Infinite scroll: load older when near top
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop <= 16 && lastCursorRef.current && tokenAddress) {
        const before = new Date(lastCursorRef.current).getTime();
        loadHistory(tokenAddress.toLowerCase(), before);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [tokenAddress, loadHistory]);

  if (!isOpen) return null;

  const filteredMessages = filterSortSearch(messages);
  const canPost = walletConnected && wsReady && (!holdersOnly || isHolder);

  return (
    <>
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={(platform: string) => {
          // Analytics tracking could be added here
          console.log(`Shared via ${platform}`);
        }}
        shareData={getShareData()}
      />

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
      />

      {/* Chat Drawer */}
      <aside
        className={`${styles.chatDrawer} ${isOpen ? styles.show : ''}`}
        role="complementary"
        aria-label="Chat"
      >

        {/* Header */}
        <header className={styles.coinHeader}>
          <div className={styles.centerline}>
            <div className={styles.leftgroup}>
              <div className={styles.logo}>
                {logoChar}
              </div>
            </div>

            <div className={styles.title}>
              <div className={styles.name}>
                {tokenName || '—'}
                <span className={styles.symbol}>${tokenSymbol || ''}</span>
              </div>
              <div className={styles.meta}>
                <span>Price {tokenPrice != null ? usd2.format(tokenPrice) : '—'}</span>
                <span>MC {tokenMc != null ? usd2.format(tokenMc) : '—'}</span>
                <span className={change24hPct != null && change24hPct >= 0 ? styles.pos : styles.neg}>
                  24h {change24hPct != null ? formatPct(change24hPct) : '—'}
                </span>
                <span>Holders {holdersCount != null ? nf0.format(holdersCount) : '—'}</span>
              </div>
            </div>

            <div className={styles.right}>
              {walletConnected && (
                <button
                  className={styles.iconBtn}
                  onClick={() => toggleSave()}
                  title={savedState ? 'Remove from saved' : 'Save token'}
                  type="button"
                  disabled={isSaveLoading}
                  style={{ color: savedState ? 'var(--primary-400)' : 'var(--text-300)', opacity: isSaveLoading ? 0.6 : 1 }}
                >
                  {savedState ? '★' : '☆'}
                </button>
              )}
              <button
                className={styles.iconBtn}
                onClick={async () => {
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  
                  if (isMobile && 'share' in navigator) {
                    // On mobile, use native share
                    try {
                      await navigator.share({
                        title: `${tokenName} (${tokenSymbol})`,
                        text: `Check out ${tokenName} (${tokenSymbol}) on SteakHouse Trading`,
                        url: window.location.href
                      });
                    } catch (error) {
                      console.error('Share failed:', error);
                      // If share fails, fallback to popup
                      setShowSharePopup(true);
                    }
                  } else {
                    // On desktop, show our custom popup
                    setShowSharePopup(true);
                  }
                }}
                title="Share"
                type="button"
              >
                ⤴
              </button>
              <button
                className={styles.iconBtn}
                onClick={onClose}
                title="Close"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          <div className={styles.sub}>
            <nav className={styles.tabs} role="tablist" aria-label="Pages">
            </nav>
            <div className={styles.toggles} title="Posting policy">
              <label>
                <input
                  type="checkbox"
                  checked={holdersOnly}
                  onChange={(e) => setHoldersOnly(e.target.checked)}
                />
                Holders-only
              </label>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className={styles.filterbar} role="region" aria-label="Chat filters">
          <div className={styles.search}>
            🔎
            <input
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.sort}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sort"
          >
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
            <option value="top">Top</option>
          </select>
        </div>

        {/* Feed */}
        <ul
          className={styles.feed}
          ref={feedRef}
          role="list"
          aria-live="polite"
          aria-busy="false"
        >
          {filteredMessages.map((message) => {
            if (message.system) {
              return (
                <li key={message.id} className={styles.system}>
                  {message.text}
                </li>
              );
            }

            return (
              <li key={message.id} className={styles.msg} role="listitem">
                <div className={styles.avatar} aria-hidden="true">
                  {message.avatar || "👤"}
                </div>
                <div className={styles.bubble}>
                  <div className={styles.row}>
                    <span className={styles.author}>{message.addr}</span>
                    {roleBadge(message.role)}
                    <time>{relTime(message.ts)}</time>
                  </div>
                  <p dangerouslySetInnerHTML={{ __html: escapeHtml(message.text) }} />
                  <div className={styles.actions}>
                    <button onClick={() => handleMessageAction('reply', message.id)} type="button">
                      Reply
                    </button>
                    <button onClick={() => handleMessageAction('quote', message.id)} type="button">
                      Quote
                    </button>
                    <button onClick={() => handleMessageAction('report', message.id)} type="button">
                      Report
                    </button>
                    <div className={styles.reactions}>
                      {renderReactions(message)}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Composer */}
        <footer className={styles.composer} role="region" aria-label="Composer">
          {!walletConnected ? (
            <div className={styles.walletCta}>
              <button
                className={styles.primary}
                onClick={() => setIsWalletModalOpen(true)}
                type="button"
              >
                Connect wallet to post
              </button>
            </div>
          ) : (
            <>
              <div className={styles.inputrow}>
                <div className={styles.emojiWrap}>
                  <button
                    ref={emojiBtnRef}
                    className={`${styles.iconBtn} ${showEmojiPicker ? styles.emojiBtnActive : ''}`}
                    onClick={() => { setHasEmojiPickerMounted(true); setShowEmojiPicker(v => !v); }}
                    aria-expanded={showEmojiPicker}
                    aria-haspopup="dialog"
                    aria-controls="emoji-picker"
                    title="Emoji"
                    type="button"
                  >
                    😊
                  </button>
                  <div
                    ref={emojiPopoverRef}
                    id="emoji-picker"
                    className={`${styles.emojiPopover} ${showEmojiPicker ? styles.open : ''}`}
                    role="dialog"
                    aria-label="Emoji picker"
                    aria-hidden={!showEmojiPicker}
                  >
                    {hasEmojiPickerMounted && (
                      <EmojiPicker
                        onEmojiClick={(emojiData: any) => {
                          const ch = (emojiData?.emoji || emojiData?.unified || '').toString();
                          if (!ch) return;
                          insertAtCursor(emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme="dark"
                        emojiStyle="native"
                        searchPlaceHolder="Search"
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis={true}
                        autoFocusSearch={false}
                        skinTonesDisabled={true}
                        suggestedEmojisMode="recent"
                        width={320}
                      />
                    )}
                  </div>
                </div>
                <button className={styles.iconBtn} title="GIF" type="button">GIF</button>
                <input
                  ref={inputRef}
                  placeholder="Add a comment..."
                  maxLength={400}
                  value={composerInput}
                  onChange={(e) => setComposerInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className={`${styles.primary} ${!canPost ? styles.disabled : ''}`}
                  onClick={handleSendMessage}
                  title="Enter"
                  type="button"
                  disabled={!canPost || composerInput.trim().length === 0}
                  aria-disabled={!canPost || composerInput.trim().length === 0}
                >
                  Enter
                </button>
              </div>
            </>
          )}
          {holdersOnly && walletConnected && !isHolder && (
            <div className={styles.holderNote}>
              Gating active: only holders can post.
            </div>
          )}
        </footer>
      </aside>
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={walletConnected}
      />
    </>
  );
};
