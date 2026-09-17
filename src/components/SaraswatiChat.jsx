// src/components/SaraswatiChat.jsx
// Saraswati AI — the site-wide chat launcher and panel.
//
// Behaviour:
//  - Answers questions from published school information only. Personal and
//    student records are refused server-side; nothing sensitive is requested
//    from here.
//  - Works signed out. Signing in with Google is what makes a conversation
//    durable: it is saved against the user's email so a staff reply posted
//    hours later is waiting the next time they open the chat.
//  - On open it replays the last few messages of the visitor's thread, so a
//    returning user resumes mid-conversation instead of starting over.
//  - "Talk to a person" escalates the thread to the admin dashboard inbox.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getChatConfig,
  getChatHistory,
  sendChatMessage,
  requestHumanHelp,
  markChatRead,
  signInWithGoogle,
  getStoredChatUser,
  getChatToken,
  clearChatSession,
} from '../api/chat';
import './SaraswatiChat.css';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

const SUGGESTIONS = [
  'How do I apply for admission?',
  'What are the fees?',
  'Which subjects do you offer?',
  'When are the next holidays?',
];

/** Load Google Identity Services once, shared across mounts. */
let gisPromise = null;
function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Google Sign-In could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Renders assistant text: paragraphs, and "- " lines as a list. */
function MessageBody({ text }) {
  const blocks = String(text || '').split('\n').filter((l) => l.trim());
  const out = [];
  let bullets = [];

  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="sar-msg__list">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>,
      );
      bullets = [];
    }
  };

  blocks.forEach((line) => {
    const trimmed = line.trim();
    if (/^[-•*]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-•*]\s+/, ''));
    } else {
      flush();
      out.push(<p key={`p-${out.length}`}>{trimmed}</p>);
    }
  });
  flush();

  return <>{out}</>;
}

export default function SaraswatiChat() {
  const { pathname } = useLocation();
  // The widget is for site visitors. On the admin dashboard it only floats over
  // the charts and tables, so it stays out of /admin entirely.
  const hiddenHere = pathname.startsWith('/admin');

  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [suggestHuman, setSuggestHuman] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);
  const [unread, setUnread] = useState(0);
  const [user, setUser] = useState(() => (getChatToken() ? getStoredChatUser() : null));
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const googleBtnRef = useRef(null);
  const panelRef = useRef(null);

  // ── Bootstrap: config, then any unread staff reply ─────────────────────
  useEffect(() => {
    let cancelled = false;
    getChatConfig()
      .then((cfg) => { if (!cancelled) setConfig(cfg); })
      .catch(() => {
        // Backend offline: keep the launcher hidden rather than opening a
        // panel that cannot answer anything.
        if (!cancelled) setConfig(null);
      });
    return () => { cancelled = true; };
  }, []);

  // Surface a waiting staff reply on the launcher badge without opening.
  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    getChatHistory()
      .then((data) => {
        if (cancelled) return;
        setUnread(data.unread_for_user || 0);
        setNeedsHuman(Boolean(data.needs_human));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [config]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  // ── Load the thread when the panel opens ───────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError('');
    try {
      const data = await getChatHistory();
      setMessages(data.messages || []);
      setNeedsHuman(Boolean(data.needs_human));
      if (data.user) setUser(data.user);
      if (data.unread_for_user) {
        // Opening the panel counts as reading the staff reply.
        markChatRead().catch(() => {});
      }
      setUnread(0);
      scrollToBottom(false);
    } catch {
      setError('Could not load your conversation. Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  useEffect(() => {
    if (hiddenHere && open) setOpen(false);
  }, [hiddenHere, open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // ── Google Sign-In ─────────────────────────────────────────────────────
  const handleCredential = useCallback(async (response) => {
    setSigningIn(true);
    setError('');
    try {
      const data = await signInWithGoogle(response.credential);
      setUser(data.user);
      await loadHistory();
    } catch (err) {
      setError(
        err?.response?.data?.detail
        || 'Sign-in failed. You can keep chatting without signing in.',
      );
    } finally {
      setSigningIn(false);
    }
  }, [loadHistory]);

  // Render Google's own button — it handles consent and account chooser.
  useEffect(() => {
    if (!open || user || !config?.google_client_id || !googleBtnRef.current) return;

    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !googleBtnRef.current) return;
        google.accounts.id.initialize({
          client_id: config.google_client_id,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        googleBtnRef.current.innerHTML = '';
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'medium',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
        });
      })
      .catch(() => { /* sign-in unavailable; chatting still works */ });

    return () => { cancelled = true; };
  }, [open, user, config, handleCredential]);

  const handleSignOut = () => {
    clearChatSession();
    setUser(null);
    setMessages([]);
    setNeedsHuman(false);
    try {
      window.google?.accounts?.id?.disableAutoSelect();
    } catch { /* ignore */ }
  };

  // ── Sending ────────────────────────────────────────────────────────────
  const submit = async (text) => {
    const question = (text ?? draft).trim();
    if (!question || sending) return;

    setDraft('');
    setError('');
    setSending(true);
    setSuggestHuman(false);

    // Optimistic echo so the panel feels immediate.
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content: question, created_at: new Date().toISOString() },
    ]);

    try {
      const data = await sendChatMessage(question);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.user_message,
        data.reply,
      ]);
      setSuggestHuman(Boolean(data.suggest_human));
      if (data.status === 'awaiting_human') setNeedsHuman(true);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(question); // don't lose what they typed
      setError(
        err?.response?.status === 429
          ? 'You have sent a lot of messages just now. Please wait a moment.'
          : 'Message could not be sent. Please check your connection and try again.',
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleRequestHuman = async () => {
    setSending(true);
    setError('');
    try {
      const data = await requestHumanHelp({
        note: 'Requested from the chat widget',
        contact_email: user?.email,
        contact_name: user?.name,
      });
      setMessages(data.messages || []);
      setNeedsHuman(true);
      setSuggestHuman(false);
    } catch {
      setError('Could not reach the school team just now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    // Enter sends; Shift+Enter makes a new line.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // The backend is the source of truth for whether the bot can serve answers.
  if (!config || hiddenHere) return null;

  const botName = config.bot_name || 'Saraswati AI';
  const showSuggestions = !loadingHistory && messages.length === 0;

  return (
    <>
      {/* ── Launcher ──────────────────────────────────────────────────── */}
      <button
        type="button"
        className={`sar-launcher${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? `Close ${botName}` : `Open ${botName} chat`}
        aria-expanded={open}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="sar-launcher__badge" aria-label={`${unread} new replies`}>{unread}</span>
        )}
        {!open && <span className="sar-launcher__label">Ask {botName}</span>}
      </button>

      {/* ── Panel ─────────────────────────────────────────────────────── */}
      {open && (
        <section
          className="sar-panel"
          ref={panelRef}
          role="dialog"
          aria-label={`${botName} chat`}
        >
          <header className="sar-panel__head">
            <div className="sar-brand">
              <span className="sar-brand__mark" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-4z" />
                  <path d="M9.2 11.2 12 14l3.4-4" />
                </svg>
              </span>
              <span className="sar-brand__text">
                <strong className="sar-brand__name">{botName}</strong>
                <span className="sar-brand__sub">
                  {needsHuman ? 'Waiting for a staff reply' : 'School information assistant'}
                </span>
              </span>
            </div>

            <div className="sar-head-actions">
              {user ? (
                <button
                  type="button"
                  className="sar-user"
                  onClick={handleSignOut}
                  title={`${user.email} — click to sign out`}
                >
                  {user.picture_url
                    ? <img src={user.picture_url} alt="" className="sar-user__pic" referrerPolicy="no-referrer" />
                    : <span className="sar-user__initial" aria-hidden="true">{(user.name || user.email || '?')[0].toUpperCase()}</span>}
                  <span className="sar-user__name">{(user.name || user.email).split(' ')[0]}</span>
                </button>
              ) : config.sign_in_available ? (
                <div ref={googleBtnRef} className="sar-gbtn" aria-label="Sign in with Google" />
              ) : null}

              <button
                type="button"
                className="sar-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {!user && config.sign_in_available && (
            <p className="sar-note">
              Sign in with Google to save this chat and pick up staff replies later.
            </p>
          )}

          <div className="sar-scroll" ref={scrollRef}>
            {loadingHistory ? (
              <div className="sar-loading">
                {[0, 1, 2].map((i) => <div key={i} className="sar-skel" />)}
              </div>
            ) : (
              <>
                <div className="sar-msg sar-msg--bot">
                  <div className="sar-msg__bubble">
                    <MessageBody text={config.greeting} />
                  </div>
                </div>

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`sar-msg sar-msg--${m.role === 'user' ? 'me' : m.role === 'admin' ? 'staff' : 'bot'}`}
                  >
                    {m.role === 'admin' && (
                      <span className="sar-msg__who">School staff</span>
                    )}
                    <div className="sar-msg__bubble">
                      <MessageBody text={m.content} />
                    </div>
                    <time className="sar-msg__time">{formatTime(m.created_at)}</time>
                  </div>
                ))}

                {sending && (
                  <div className="sar-msg sar-msg--bot">
                    <div className="sar-msg__bubble sar-typing" aria-label="Saraswati AI is typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                {showSuggestions && (
                  <div className="sar-chips">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="sar-chip"
                        onClick={() => submit(s)}
                        disabled={sending}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {needsHuman && (
                  <div className="sar-banner sar-banner--pending" role="status">
                    <strong>Passed to the school team.</strong> Someone will reply here.
                    {!user && ' Sign in with Google so you can read their reply when you return.'}
                  </div>
                )}

                {suggestHuman && !needsHuman && (
                  <div className="sar-banner">
                    <span>Would you like to speak to a person from the school?</span>
                    <button
                      type="button"
                      className="sar-banner__btn"
                      onClick={handleRequestHuman}
                      disabled={sending}
                    >
                      Talk to a person
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="sar-error" role="alert">{error}</p>}
          {signingIn && <p className="sar-note sar-note--busy">Signing you in…</p>}

          <form
            className="sar-composer"
            onSubmit={(e) => { e.preventDefault(); submit(); }}
          >
            <label className="sar-sr-only" htmlFor="sar-input">Your message</label>
            <textarea
              id="sar-input"
              ref={inputRef}
              className="sar-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about admissions, fees, subjects…"
              rows={1}
              maxLength={2000}
              disabled={sending}
            />
            <button
              type="submit"
              className="sar-send"
              disabled={!draft.trim() || sending}
              aria-label="Send message"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          <p className="sar-disclaimer">
            {botName} answers from published school information only. It cannot see student
            records, applications or payments.
            {!needsHuman && (
              <>
                {' '}
                <button type="button" className="sar-link" onClick={handleRequestHuman} disabled={sending}>
                  Need a person to contact?
                </button>
              </>
            )}
          </p>
        </section>
      )}
    </>
  );
}
