// src/components/admin/HumanRequestsTab.jsx
// Human-assistance inbox for Saraswati AI.
//
// When a visitor asks to talk to a person, their thread lands here. A staff
// reply is written into the same conversation, so the visitor reads it in the
// chat widget the next time they open it (or immediately, if still on the
// site). Signed-in visitors keep the thread against their Google email, which
// is what makes "they get the message when they log in again" work.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listConversations,
  getConversation,
  replyToConversation,
  resolveConversation,
} from '../../api/chat';
import './HumanRequestsTab.css';

const FILTERS = [
  { key: 'awaiting', label: 'Needs a person' },
  { key: 'all', label: 'All chats' },
  { key: 'human_replied', label: 'Replied' },
  { key: 'resolved', label: 'Resolved' },
];

const STATUS_LABELS = {
  active: 'Bot handling',
  awaiting_human: 'Waiting for you',
  human_replied: 'You replied',
  resolved: 'Resolved',
};

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatStamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function errText(err, fallback) {
  const detail = err?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}

export default function HumanRequestsTab({ token, toast, onCountUpdate }) {
  const [filter, setFilter] = useState('awaiting');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const transcriptRef = useRef(null);

  // ── List ─────────────────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = { limit: 50 };
      if (filter === 'awaiting') params.needs_human_only = true;
      else if (filter !== 'all') params.status = filter;
      if (search.trim()) params.search = search.trim();

      const data = await listConversations(token, params);
      setRows(data.items || []);
      setAwaitingCount(data.awaiting_human || 0);
      onCountUpdate?.(data.awaiting_human || 0);
    } catch (err) {
      toast?.(errText(err, 'Could not load chat requests'), 'error');
      setRows([]);
    } finally {
      setLoadingList(false);
    }
  }, [token, filter, search, toast, onCountUpdate]);

  useEffect(() => {
    const t = setTimeout(loadList, search ? 380 : 0);
    return () => clearTimeout(t);
  }, [loadList, search]);

  // Poll so a new request appears without the admin refreshing.
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) loadList();
    }, 45000);
    return () => clearInterval(id);
  }, [loadList]);

  // ── Thread ───────────────────────────────────────────────────────────────
  const openThread = useCallback(async (id) => {
    setSelectedId(id);
    setLoadingThread(true);
    setReply('');
    try {
      const data = await getConversation(token, id);
      setThread(data);
      // Opening clears the unread badge server-side; mirror that locally.
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, unread_for_admin: 0 } : r)));
    } catch (err) {
      toast?.(errText(err, 'Could not open this conversation'), 'error');
      setThread(null);
    } finally {
      setLoadingThread(false);
    }
  }, [token, toast]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread]);

  const sendReply = async (alsoResolve = false) => {
    const text = reply.trim();
    if (!text || !selectedId) return;
    setSending(true);
    try {
      const data = await replyToConversation(token, selectedId, text, alsoResolve);
      setThread(data);
      setReply('');
      toast?.(
        alsoResolve
          ? 'Reply sent and conversation resolved'
          : 'Reply sent — the parent will see it in the chat',
        'success',
      );
      loadList();
    } catch (err) {
      toast?.(errText(err, 'Could not send the reply'), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    try {
      await resolveConversation(token, selectedId);
      toast?.('Conversation resolved', 'success');
      openThread(selectedId);
      loadList();
    } catch (err) {
      toast?.(errText(err, 'Could not resolve this conversation'), 'error');
    }
  };

  const conv = thread?.conversation;

  return (
    <div className="hr-wrap">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="hr-head">
        <div>
          <h2 className="hr-h2">Chat Requests &amp; Human Assistance</h2>
          <p className="hr-sub">
            Conversations where a visitor asked to speak with a person. Replies appear in
            their Saraswati AI chat — signed-in parents see them whenever they return.
          </p>
        </div>
        {awaitingCount > 0 && (
          <span className="hr-alert">
            {awaitingCount} waiting for a reply
          </span>
        )}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="hr-toolbar">
        <div className="hr-tabs" role="group" aria-label="Filter conversations">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`hr-tab${filter === f.key ? ' is-active' : ''}`}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
            >
              {f.label}
              {f.key === 'awaiting' && awaitingCount > 0 && (
                <span className="hr-tab__badge">{awaitingCount}</span>
              )}
            </button>
          ))}
        </div>

        <input
          className="hr-input hr-input--search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or topic…"
          aria-label="Search conversations"
        />
      </div>

      {/* ── Split view ────────────────────────────────────────────────── */}
      <div className="hr-split">

        {/* List */}
        <aside className="hr-list-pane">
          {loadingList ? (
            <div className="hr-list">
              {[0, 1, 2, 3].map((i) => <div key={i} className="hr-skel" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="hr-empty">
              <p><strong>Nothing here.</strong></p>
              <p>
                {filter === 'awaiting'
                  ? 'No one is waiting on a person right now. Requests arrive here the moment a visitor asks to be contacted.'
                  : 'No conversations match this filter yet.'}
              </p>
            </div>
          ) : (
            <ul className="hr-list" role="list">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`hr-row${selectedId === row.id ? ' is-selected' : ''}${row.needs_human ? ' is-urgent' : ''}`}
                    onClick={() => openThread(row.id)}
                  >
                    <span className="hr-row__top">
                      <span className="hr-row__who">
                        {row.user_name || row.contact_name || row.user_email || row.contact_email || `Visitor #${row.id}`}
                      </span>
                      <span className="hr-row__time">{relativeTime(row.last_message_at)}</span>
                    </span>

                    <span className="hr-row__topic">{row.topic || 'New conversation'}</span>

                    <span className="hr-row__foot">
                      <span className={`hr-status hr-status--${row.status}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                      <span className="hr-row__count">{row.message_count} msg</span>
                      {row.unread_for_admin > 0 && (
                        <span className="hr-row__new">{row.unread_for_admin} new</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Thread */}
        <section className="hr-thread-pane">
          {!selectedId ? (
            <div className="hr-placeholder">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <p>Select a conversation to read it and reply.</p>
            </div>
          ) : loadingThread ? (
            <div className="hr-list" style={{ padding: '1.25rem' }}>
              {[0, 1, 2].map((i) => <div key={i} className="hr-skel" />)}
            </div>
          ) : !thread ? (
            <div className="hr-placeholder"><p>This conversation could not be loaded.</p></div>
          ) : (
            <>
              <header className="hr-thread-head">
                <div className="hr-thread-who">
                  <h3 className="hr-thread-title">
                    {conv.user_name || conv.contact_name || conv.user_email || conv.contact_email || `Visitor #${conv.id}`}
                  </h3>
                  <p className="hr-thread-meta">
                    <span className={`hr-status hr-status--${conv.status}`}>
                      {STATUS_LABELS[conv.status] || conv.status}
                    </span>
                    {' · '}Started {formatStamp(conv.created_at)}
                  </p>
                </div>

                {conv.status !== 'resolved' && (
                  <button type="button" className="hr-btn hr-btn--ghost" onClick={handleResolve}>
                    Mark resolved
                  </button>
                )}
              </header>

              {/* Contact details the visitor volunteered */}
              {(conv.user_email || conv.contact_email || conv.contact_phone) && (
                <div className="hr-contact">
                  {(conv.user_email || conv.contact_email) && (
                    <span className="hr-contact__item">
                      <strong>Email</strong>
                      <a href={`mailto:${conv.user_email || conv.contact_email}`}>
                        {conv.user_email || conv.contact_email}
                      </a>
                      {conv.user_email && <em className="hr-verified">Google verified</em>}
                    </span>
                  )}
                  {conv.contact_phone && (
                    <span className="hr-contact__item">
                      <strong>Phone</strong>
                      <a href={`tel:${conv.contact_phone}`}>{conv.contact_phone}</a>
                    </span>
                  )}
                </div>
              )}

              <div className="hr-transcript" ref={transcriptRef}>
                {thread.messages.map((m) => (
                  <div key={m.id} className={`hr-msg hr-msg--${m.role}`}>
                    <div className="hr-msg__meta">
                      <span className="hr-msg__role">
                        {m.role === 'user' ? 'Visitor' : m.role === 'admin' ? 'School staff' : 'Saraswati AI'}
                      </span>
                      <span className="hr-msg__time">{formatStamp(m.created_at)}</span>
                    </div>
                    <div className="hr-msg__body">{m.content}</div>
                  </div>
                ))}
              </div>

              <div className="hr-composer">
                <label className="hr-sr-only" htmlFor="hr-reply">Your reply</label>
                <textarea
                  id="hr-reply"
                  className="hr-input hr-textarea"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply to the parent…"
                  rows={3}
                  maxLength={4000}
                  disabled={sending}
                />
                <div className="hr-composer__actions">
                  <p className="hr-composer__hint">
                    {conv.user_email
                      ? 'Saved to their account — they will see it whenever they sign in again.'
                      : 'This visitor is not signed in; they will see it while their browser session lasts.'}
                  </p>
                  <div className="hr-composer__btns">
                    <button
                      type="button"
                      className="hr-btn hr-btn--ghost"
                      onClick={() => sendReply(true)}
                      disabled={sending || !reply.trim()}
                    >
                      Reply &amp; resolve
                    </button>
                    <button
                      type="button"
                      className="hr-btn hr-btn--primary"
                      onClick={() => sendReply(false)}
                      disabled={sending || !reply.trim()}
                    >
                      {sending ? 'Sending…' : 'Send reply'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
