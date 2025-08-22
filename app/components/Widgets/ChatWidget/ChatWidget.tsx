"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChatWidgetProps, Message, SortMode } from './types';
import { mockToken, mockMessages } from './mockData';
import { usd2, nf0, formatPct, shortAddr, relTime, escapeHtml } from './utils';
import styles from './ChatWidget.module.css';

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  // State management
  const [connected, setConnected] = useState(false);
  const [isHolder, setIsHolder] = useState(true);
  const [holdersOnly, setHoldersOnly] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('new');
  const [watched, setWatched] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerInput, setComposerInput] = useState('');

  // Refs
  const feedRef = useRef<HTMLUListElement>(null);

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

  // Filter, sort, and search messages
  const filterSortSearch = (messageList: Message[]) => {
    const q = searchQuery.toLowerCase().trim();
    let filtered = messageList.filter((m) => (q ? m.text.toLowerCase().includes(q) : true));
    
    if (sortMode === "new") filtered.sort((a, b) => b.ts - a.ts);
    if (sortMode === "old") filtered.sort((a, b) => a.ts - b.ts);
    if (sortMode === "top") filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    
    return filtered;
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
    if (!connected || !composerInput.trim()) return;
    if (holdersOnly && !isHolder) return;

    const newMessage: Message = {
      id: Date.now(),
      addr: shortAddr(
        "0x" +
        (Math.random().toString(16).slice(2) + "0000000000000000").slice(0, 16)
      ),
      role: isHolder ? "holder" : "guest",
      avatar: "🙂",
      text: composerInput.trim(),
      ts: Date.now(),
      reactions: {},
      likes: 0,
    };

    setMessages(prev => [...prev, newMessage]);
    setComposerInput('');
  };

  // Handle key press in composer
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
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

  if (!isOpen) return null;

  const filteredMessages = filterSortSearch(messages);
  const canPost = connected && (!holdersOnly || isHolder);

  return (
    <>
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
                {mockToken.logoEmoji}
              </div>
            </div>

            <div className={styles.title}>
              <div className={styles.name}>
                {mockToken.name}
                <span className={styles.symbol}>${mockToken.symbol}</span>
              </div>
              <div className={styles.meta}>
                <span>Price {usd2.format(mockToken.priceUsd)}</span>
                <span>MC {usd2.format(mockToken.mcUsd)}</span>
                <span className={mockToken.change24hPct >= 0 ? styles.pos : styles.neg}>
                  24h {formatPct(mockToken.change24hPct)}
                </span>
                <span>Holders {nf0.format(mockToken.holders)}</span>
              </div>
            </div>

            <div className={styles.right}>
              <button 
                className={styles.iconBtn} 
                onClick={() => setWatched(!watched)} 
                title="Watch"
                type="button"
                style={{ color: watched ? 'var(--primary-400)' : 'var(--text-300)' }}
              >
                {watched ? '★' : '☆'}
              </button>
              <button 
                className={styles.iconBtn} 
                onClick={async () => {
                  const text = `${mockToken.name} ($${mockToken.symbol}) • Price ${usd2.format(mockToken.priceUsd)} • MC ${usd2.format(mockToken.mcUsd)} • 24h ${formatPct(mockToken.change24hPct)} • Holders ${nf0.format(mockToken.holders)}`;
                  try {
                    await navigator.share({ title: `${mockToken.name} • ${mockToken.symbol}`, text });
                  } catch {
                    await navigator.clipboard.writeText(text);
                    alert("Copied to clipboard:\n" + text);
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
              <button className={styles.tab} role="tab" aria-selected="false" type="button">
                Trades
              </button>
              <button className={styles.tab} role="tab" aria-selected="false" type="button">
                Holders
              </button>
              <button className={`${styles.tab} ${styles.active}`} role="tab" aria-selected="true" type="button">
                Chat
              </button>
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
          {!connected ? (
            <div className={styles.walletCta}>
              <button 
                className={styles.primary} 
                onClick={() => setConnected(true)}
                type="button"
              >
                Connect wallet to post
              </button>
            </div>
          ) : (
            <div className={styles.inputrow}>
              <button className={styles.iconBtn} title="Emoji" type="button">😊</button>
              <button className={styles.iconBtn} title="GIF" type="button">GIF</button>
              <input
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
              >
                Enter
              </button>
            </div>
          )}
          {holdersOnly && connected && !isHolder && (
            <div className={styles.holderNote}>
              Gating active: only holders can post.
            </div>
          )}
        </footer>
      </aside>
    </>
  );
};
