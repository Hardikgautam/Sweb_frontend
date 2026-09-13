// pages/AdminDashboard.jsx
// Admin panel — News/Events & Holidays/Vacations management.
// Protected by ProtectedRoute. Uses AuthContext for token.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getNews,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  toggleNewsPin,
} from '../api/news';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../api/events';
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from '../api/holidays';
import {
  getEnquiries,
  deleteEnquiry,
  cleanupEnquiries,
} from '../api/enquiries';
import FeesAdminTab from '../components/admin/FeesAdminTab';
import NewsletterAdminTab from '../components/admin/NewsletterAdminTab';
import './AdminDashboard.css';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtDateRange(start, end) {
  if (!start) return '—';
  if (!end || start === end) {
    return fmtDate(start);
  }
  const s = new Date(start);
  const e = new Date(end);
  const sStr = s.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: s.getFullYear() === e.getFullYear() ? undefined : 'numeric',
  });
  const eStr = e.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${sStr} – ${eStr}`;
}

function getDurationDays(start, end) {
  if (!start) return 1;
  if (!end || start === end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

function HolidayTypeBadge({ type }) {
  const t = (type || 'school').toLowerCase();
  let label = 'School';
  let className = 'adm-htype--school';
  if (t === 'national') { label = 'National'; className = 'adm-htype--national'; }
  else if (t === 'vacation') { label = 'Vacation'; className = 'adm-htype--vacation'; }
  else if (t === 'exam') { label = 'Exam'; className = 'adm-htype--exam'; }

  return <span className={`adm-htype-badge ${className}`}>{label}</span>;
}

function SortIcon({ dir }) {
  return (
    <span className={`adm-sort-icon${dir ? ' active' : ''}`} aria-hidden="true">
      <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
        <path d="M4 0L0 4h8L4 0z" opacity={dir === 'asc' ? 1 : 0.3} />
        <path d="M4 12L8 8H0l4 4z" opacity={dir === 'desc' ? 1 : 0.3} />
      </svg>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────────────────────────

let _toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = 'success') => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="adm-toast-stack" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
          {t.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {t.type === 'error'   && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          {t.type === 'info'    && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWS: Upload form & modals
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_NEWS_FORM = { title: '', description: '', is_pinned: false };

function UploadForm({ token, onCreated }) {
  const [form, setForm]       = useState(EMPTY_NEWS_FORM);
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const fileRef = useRef();

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!file)                    e.file = 'An image is required';
    return e;
  };

  const handleFileChange = (f) => {
    if (!f) return;
    setFile(f);
    setErrors(p => ({ ...p, file: undefined }));
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const created = await createNewsArticle(
        { title: form.title.trim(), description: form.description.trim(), is_pinned: form.is_pinned, image: file },
        token
      );
      setForm(EMPTY_NEWS_FORM);
      removeFile();
      setErrors({});
      onCreated(created);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Upload failed';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="adm-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {errors.submit}
        </div>
      )}

      <div className="adm-upload-form">
        <div className="adm-field">
          <label htmlFor="up-title" className="adm-label">Title <span>*</span></label>
          <input id="up-title" className={`adm-input${errors.title ? ' error' : ''}`}
            placeholder="Annual Sports Day 2026…"
            value={form.title} onChange={e => { setForm(p => ({...p, title: e.target.value})); setErrors(p => ({...p, title: undefined})); }} />
          {errors.title && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.title}</span>}
        </div>

        <div className="adm-field" style={{justifyContent:'flex-end'}}>
          <div className="adm-checkbox-row">
            <input type="checkbox" id="up-pin" checked={form.is_pinned}
              onChange={e => setForm(p => ({...p, is_pinned: e.target.checked}))} />
            <label htmlFor="up-pin">⭐ Pin this article (shows first)</label>
          </div>
        </div>

        <div className="adm-field adm-upload-form__full">
          <label htmlFor="up-desc" className="adm-label">Description <span>*</span></label>
          <textarea id="up-desc" className={`adm-textarea${errors.description ? ' error' : ''}`}
            placeholder="A short summary of the news or event…"
            value={form.description}
            onChange={e => { setForm(p => ({...p, description: e.target.value})); setErrors(p => ({...p, description: undefined})); }} />
          {errors.description && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.description}</span>}
        </div>

        <div className="adm-field adm-upload-form__full">
          <label className="adm-label">Image <span>*</span></label>
          <div className={`adm-file-zone${drag ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFileChange(e.dataTransfer.files[0]); }}>
            <input ref={fileRef} type="file" accept="image/*"
              onChange={e => handleFileChange(e.target.files[0])}
              aria-label="Upload image" />
            {!file ? (
              <>
                <div className="adm-file-zone__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <p className="adm-file-zone__label">
                  <strong>Click to upload</strong> or drag and drop<br />
                  <span style={{fontSize:'0.75rem'}}>JPG, PNG, WebP — max 10 MB</span>
                </p>
              </>
            ) : (
              <div className="adm-file-zone__preview">
                {preview && <img src={preview} className="adm-file-zone__thumb" alt="preview" />}
                <span className="adm-file-zone__filename">{file.name}</span>
                <button type="button" className="adm-file-zone__remove" onClick={e => { e.stopPropagation(); removeFile(); }}>Remove</button>
              </div>
            )}
          </div>
          {errors.file && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.file}</span>}
        </div>

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { setForm(EMPTY_NEWS_FORM); removeFile(); setErrors({}); }}>
            Reset
          </button>
          <button type="submit" id="upload-submit-btn" className="adm-btn adm-btn--primary" disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Uploading…</>) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Publish Article</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function EditNewsModal({ article, token, onSaved, onClose }) {
  const [form, setForm]       = useState({ title: article.title, description: article.description, is_pinned: article.is_pinned });
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await updateNewsArticle(
        article.id,
        { title: form.title.trim(), description: form.description.trim(), is_pinned: form.is_pinned, image: file || undefined },
        token
      );
      if (preview) URL.revokeObjectURL(preview);
      onSaved(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <div className="adm-modal__header">
          <span id="edit-modal-title" className="adm-modal__title">Edit Article</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close edit modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="adm-modal__body">
            {error && (
              <div className="adm-error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="adm-field">
              <label htmlFor="edit-title" className="adm-label">Title</label>
              <input id="edit-title" className="adm-input" value={form.title}
                onChange={e => setForm(p => ({...p, title: e.target.value}))} />
            </div>

            <div className="adm-field">
              <label htmlFor="edit-desc" className="adm-label">Description</label>
              <textarea id="edit-desc" className="adm-textarea" value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            </div>

            <div className="adm-checkbox-row">
              <input type="checkbox" id="edit-pin" checked={form.is_pinned}
                onChange={e => setForm(p => ({...p, is_pinned: e.target.checked}))} />
              <label htmlFor="edit-pin">⭐ Pin this article</label>
            </div>

            <div className="adm-field">
              <label className="adm-label">Replace Image <span style={{fontWeight:400,textTransform:'none',color:'#9ca3af'}}>(optional)</span></label>
              <div className="adm-file-zone" style={{padding:'1rem'}}>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={e => handleFile(e.target.files[0])} aria-label="Replace image" />
                {file ? (
                  <div className="adm-file-zone__preview">
                    {preview && <img src={preview} className="adm-file-zone__thumb" alt="new preview" />}
                    <span className="adm-file-zone__filename">{file.name}</span>
                    <button type="button" className="adm-file-zone__remove"
                      onClick={e => { e.stopPropagation(); setFile(null); if(preview) URL.revokeObjectURL(preview); setPreview(null); if(fileRef.current) fileRef.current.value=''; }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="adm-file-zone__label" style={{fontSize:'0.8rem'}}>
                    <strong>Click to replace</strong> — leave empty to keep current image
                  </p>
                )}
              </div>
            </div>

            {article.image_url && !preview && (
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <img src={article.image_url} alt="current" style={{width:80,height:54,objectFit:'cover',borderRadius:4,border:'1px solid #e5e7eb'}} />
                <span style={{fontSize:'0.75rem',color:'#9ca3af'}}>Current image</span>
              </div>
            )}
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Saving…</>) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteNewsModal({ article, token, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteNewsArticle(article.id, token);
      onDeleted(article.id);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="del-modal-title">
        <div className="adm-modal__header">
          <span id="del-modal-title" className="adm-modal__title">Delete Article</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-confirm-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p className="adm-confirm-title">Delete this article?</p>
          <p className="adm-confirm-sub">
            <strong>"{article.title}"</strong> will be permanently removed along with its image on Cloudinary.
            This action cannot be undone.
          </p>
          {error && <p style={{color:'#b91c1c',fontSize:'0.85rem'}}>{error}</p>}
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" id={`delete-confirm-btn-${article.id}`} className="adm-btn adm-btn--primary" style={{background:'#b91c1c',borderColor:'#b91c1c'}}
            onClick={handleDelete} disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Deleting…</>) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsRow({ article, token, onEdit, onDelete, onPinToggle }) {
  const [pinLoading, setPinLoading] = useState(false);

  const handlePin = async () => {
    setPinLoading(true);
    try { await onPinToggle(article); }
    finally { setPinLoading(false); }
  };

  return (
    <tr>
      <td>
        <div className="adm-thumb-wrap">
          {article.image_url
            ? <img src={article.image_url} className="adm-thumb" alt={article.title} loading="lazy" />
            : <div className="adm-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          }
        </div>
      </td>
      <td className="adm-title-cell" title={article.title}><span>{article.title}</span></td>
      <td className="adm-desc-cell" title={article.description}>{article.description}</td>
      <td>
        <span className={`adm-pin-badge adm-pin-badge--${article.is_pinned ? 'yes' : 'no'}`}>
          {article.is_pinned ? '⭐ Pinned' : '— No'}
        </span>
      </td>
      <td className="adm-date-cell">{fmtDate(article.created_at)}</td>
      <td>
        <div className="adm-actions-cell">
          <button
            className={`adm-btn adm-btn--pin${article.is_pinned ? ' active' : ''}`}
            onClick={handlePin}
            disabled={pinLoading}
            title={article.is_pinned ? 'Unpin' : 'Pin'}
            aria-label={article.is_pinned ? `Unpin: ${article.title}` : `Pin: ${article.title}`}
          >
            {pinLoading ? <span className="adm-btn__spinner" aria-hidden="true" /> : (article.is_pinned ? '📌 Unpin' : '📌 Pin')}
          </button>
          <button
            className="adm-btn adm-btn--icon adm-btn--edit"
            onClick={() => onEdit(article)}
            title="Edit article"
            aria-label={`Edit: ${article.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            className="adm-btn adm-btn--icon adm-btn--del"
            onClick={() => onDelete(article)}
            title="Delete article"
            aria-label={`Delete: ${article.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAYS: Form, Table, Modals
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_HOLIDAY_FORM = {
  name: '',
  type: 'school',
  start_date: '',
  end_date: '',
  description: '',
};

function HolidayForm({ token, onCreated }) {
  const [form, setForm]       = useState(EMPTY_HOLIDAY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Holiday or event name is required';
    if (!form.start_date)  e.start_date = 'Start date is required';
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      e.end_date = 'End date cannot be earlier than start date';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        description: form.description.trim() || undefined,
      };
      const created = await createHoliday(payload, token);
      setForm(EMPTY_HOLIDAY_FORM);
      setErrors({});
      onCreated(created);
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || err?.message || 'Failed to create holiday' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="adm-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {errors.submit}
        </div>
      )}

      <div className="adm-upload-form">
        <div className="adm-field">
          <label htmlFor="h-name" className="adm-label">Name / Title <span>*</span></label>
          <input
            id="h-name"
            className={`adm-input${errors.name ? ' error' : ''}`}
            placeholder="e.g. Summer Vacation, Diwali Break, Mid-Term Exams…"
            value={form.name}
            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
          />
          {errors.name && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.name}</span>}
        </div>

        <div className="adm-field">
          <label htmlFor="h-type" className="adm-label">Category / Type <span>*</span></label>
          <select
            id="h-type"
            className="adm-input adm-select"
            value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          >
            <option value="school">School Holiday</option>
            <option value="national">National Holiday</option>
            <option value="vacation">Vacation / Break</option>
            <option value="exam">Exam Period</option>
          </select>
        </div>

        <div className="adm-field">
          <label htmlFor="h-start" className="adm-label">Start Date <span>*</span></label>
          <input
            type="date"
            id="h-start"
            className={`adm-input${errors.start_date ? ' error' : ''}`}
            value={form.start_date}
            onChange={e => { setForm(p => ({ ...p, start_date: e.target.value })); setErrors(p => ({ ...p, start_date: undefined })); }}
          />
          {errors.start_date && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.start_date}</span>}
        </div>

        <div className="adm-field">
          <label htmlFor="h-end" className="adm-label">
            End Date <span style={{fontWeight:400,textTransform:'none',color:'#9ca3af'}}>(optional range)</span>
          </label>
          <input
            type="date"
            id="h-end"
            className={`adm-input${errors.end_date ? ' error' : ''}`}
            value={form.end_date}
            min={form.start_date || undefined}
            onChange={e => { setForm(p => ({ ...p, end_date: e.target.value })); setErrors(p => ({ ...p, end_date: undefined })); }}
          />
          {errors.end_date && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.end_date}</span>}
          <span style={{fontSize:'0.72rem',color:'#6b7280',marginTop:'3px'}}>Leave blank or equal to start date for single-day holidays</span>
        </div>

        <div className="adm-field adm-upload-form__full">
          <label htmlFor="h-desc" className="adm-label">Description <span style={{fontWeight:400,textTransform:'none',color:'#9ca3af'}}>(optional)</span></label>
          <textarea
            id="h-desc"
            className="adm-textarea"
            rows="2"
            placeholder="Additional notes for students and parents (e.g. classes affected, reporting dates)…"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { setForm(EMPTY_HOLIDAY_FORM); setErrors({}); }}>
            Reset
          </button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Saving…</>) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Holiday / Date Range</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function EditHolidayModal({ holiday, token, onSaved, onClose }) {
  const [form, setForm]       = useState({
    name: holiday.name,
    type: holiday.type || 'school',
    start_date: holiday.start_date,
    end_date: holiday.end_date || holiday.start_date,
    description: holiday.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.start_date) {
      setError('Name and start date are required.');
      return;
    }
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updated = await updateHoliday(
        holiday.id,
        {
          name: form.name.trim(),
          type: form.type,
          start_date: form.start_date,
          end_date: form.end_date || form.start_date,
          description: form.description.trim() || undefined,
        },
        token
      );
      onSaved(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="edit-h-title">
        <div className="adm-modal__header">
          <span id="edit-h-title" className="adm-modal__title">Edit Holiday / Date Range</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="adm-modal__body">
            {error && (
              <div className="adm-error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="adm-field">
              <label htmlFor="edit-h-name" className="adm-label">Name / Title</label>
              <input id="edit-h-name" className="adm-input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            <div className="adm-field">
              <label htmlFor="edit-h-type" className="adm-label">Category / Type</label>
              <select
                id="edit-h-type"
                className="adm-input adm-select"
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              >
                <option value="school">School Holiday</option>
                <option value="national">National Holiday</option>
                <option value="vacation">Vacation / Break</option>
                <option value="exam">Exam Period</option>
              </select>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="adm-field">
                <label htmlFor="edit-h-start" className="adm-label">Start Date</label>
                <input type="date" id="edit-h-start" className="adm-input" value={form.start_date}
                  onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>

              <div className="adm-field">
                <label htmlFor="edit-h-end" className="adm-label">End Date</label>
                <input type="date" id="edit-h-end" className="adm-input" value={form.end_date}
                  min={form.start_date || undefined}
                  onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>

            <div className="adm-field">
              <label htmlFor="edit-h-desc" className="adm-label">Description</label>
              <textarea id="edit-h-desc" className="adm-textarea" rows="2" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Saving…</>) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteHolidayModal({ holiday, token, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteHoliday(holiday.id, token);
      onDeleted(holiday.id);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="del-h-title">
        <div className="adm-modal__header">
          <span id="del-h-title" className="adm-modal__title">Delete Holiday / Vacation</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-confirm-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p className="adm-confirm-title">Delete this entry?</p>
          <p className="adm-confirm-sub">
            <strong>"{holiday.name}"</strong> ({fmtDateRange(holiday.start_date, holiday.end_date)}) will be removed from the official school calendar.
          </p>
          {error && <p style={{color:'#b91c1c',fontSize:'0.85rem'}}>{error}</p>}
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="adm-btn adm-btn--primary" style={{background:'#b91c1c',borderColor:'#b91c1c'}}
            onClick={handleDelete} disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Deleting…</>) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HolidayRow({ holiday, onEdit, onDelete }) {
  const duration = getDurationDays(holiday.start_date, holiday.end_date);
  const isRange  = holiday.start_date !== holiday.end_date;

  return (
    <tr>
      <td>
        <HolidayTypeBadge type={holiday.type} />
      </td>
      <td className="adm-title-cell" title={holiday.name}>
        <strong>{holiday.name}</strong>
      </td>
      <td className="adm-date-cell">
        <div style={{fontWeight:600}}>{fmtDateRange(holiday.start_date, holiday.end_date)}</div>
      </td>
      <td>
        <span className={`adm-duration-pill ${isRange ? 'range' : 'single'}`}>
          {isRange ? `${duration} Days` : '1 Day'}
        </span>
      </td>
      <td className="adm-desc-cell" title={holiday.description || 'No description'}>
        {holiday.description || <span style={{color:'#9ca3af',fontStyle:'italic'}}>No notes</span>}
      </td>
      <td>
        <div className="adm-actions-cell">
          <button
            className="adm-btn adm-btn--icon adm-btn--edit"
            onClick={() => onEdit(holiday)}
            title="Edit holiday"
            aria-label={`Edit: ${holiday.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            className="adm-btn adm-btn--icon adm-btn--del"
            onClick={() => onDelete(holiday)}
            title="Delete holiday"
            aria-label={`Delete: ${holiday.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS: Form, Modals & Row
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_EVENT_FORM = {
  title: '',
  category: 'Academic',
  event_date: '',
  event_time: '',
  location: '',
  display_order: 0,
};

function EventCategoryBadge({ category }) {
  const cat = (category || 'General').toLowerCase();
  let className = 'adm-etype--academic';
  if (cat.includes('sport')) className = 'adm-etype--sports';
  else if (cat.includes('cultur') || cat.includes('art') || cat.includes('music')) className = 'adm-etype--cultural';
  else if (cat.includes('exam') || cat.includes('test')) className = 'adm-etype--exam';
  else if (cat.includes('celebrat') || cat.includes('annual')) className = 'adm-etype--celebration';

  return <span className={`adm-htype-badge ${className}`}>{category || 'General'}</span>;
}

function EventForm({ token, onCreated }) {
  const [form, setForm]       = useState(EMPTY_EVENT_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title = 'Event title is required';
    if (!form.event_date)      e.event_date = 'Event date is required';
    if (!form.location.trim()) e.location = 'Location is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || 'General',
        event_date: form.event_date,
        event_time: form.event_time.trim() || undefined,
        location: form.location.trim(),
        display_order: Number(form.display_order || 0),
      };
      const created = await createEvent(payload, token);
      setForm(EMPTY_EVENT_FORM);
      setErrors({});
      onCreated(created);
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || err?.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="adm-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {errors.submit}
        </div>
      )}

      <div className="adm-upload-form">
        <div className="adm-field">
          <label htmlFor="ev-title" className="adm-label">Event Title <span>*</span></label>
          <input
            id="ev-title"
            className={`adm-input${errors.title ? ' error' : ''}`}
            placeholder="e.g. Annual Sports Meet 2026, Science Exhibition…"
            value={form.title}
            onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: undefined })); }}
          />
          {errors.title && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.title}</span>}
        </div>

        <div className="adm-field">
          <label htmlFor="ev-cat" className="adm-label">Category <span>*</span></label>
          <select
            id="ev-cat"
            className="adm-input adm-select"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          >
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Celebration">Celebration</option>
            <option value="Competition">Competition</option>
            <option value="Parent-Teacher">Parent-Teacher</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="adm-field">
          <label htmlFor="ev-date" className="adm-label">Event Date <span>*</span></label>
          <input
            type="date"
            id="ev-date"
            className={`adm-input${errors.event_date ? ' error' : ''}`}
            value={form.event_date}
            onChange={e => { setForm(p => ({ ...p, event_date: e.target.value })); setErrors(p => ({ ...p, event_date: undefined })); }}
          />
          {errors.event_date && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.event_date}</span>}
        </div>

        <div className="adm-field">
          <label htmlFor="ev-time" className="adm-label">Event Time</label>
          <input
            id="ev-time"
            className="adm-input"
            placeholder="e.g. 09:30 AM – 01:00 PM"
            value={form.event_time}
            onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))}
          />
        </div>

        <div className="adm-field">
          <label htmlFor="ev-loc" className="adm-label">Location / Venue <span>*</span></label>
          <input
            id="ev-loc"
            className={`adm-input${errors.location ? ' error' : ''}`}
            placeholder="e.g. Main Auditorium / Sports Ground"
            value={form.location}
            onChange={e => { setForm(p => ({ ...p, location: e.target.value })); setErrors(p => ({ ...p, location: undefined })); }}
          />
          {errors.location && <span style={{fontSize:'0.75rem',color:'var(--color-maroon)'}}>{errors.location}</span>}
        </div>

        <div className="adm-field">
          <label htmlFor="ev-order" className="adm-label">Display Order</label>
          <input
            type="number"
            id="ev-order"
            className="adm-input"
            value={form.display_order}
            onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
        </div>

        <div className="adm-form-actions adm-upload-form__full">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { setForm(EMPTY_EVENT_FORM); setErrors({}); }}>
            Reset
          </button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Saving…</>) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Upcoming Event</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function EditEventModal({ event, token, onSaved, onClose }) {
  const [form, setForm]       = useState({
    title: event.title,
    category: event.category || 'Academic',
    event_date: event.event_date,
    event_time: event.event_time || '',
    location: event.location || '',
    display_order: event.display_order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date || !form.location.trim()) {
      setError('Title, date, and location are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updated = await updateEvent(
        event.id,
        {
          title: form.title.trim(),
          category: form.category.trim() || 'General',
          event_date: form.event_date,
          event_time: form.event_time.trim() || undefined,
          location: form.location.trim(),
          display_order: Number(form.display_order || 0),
        },
        token
      );
      onSaved(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="edit-ev-title">
        <div className="adm-modal__header">
          <span id="edit-ev-title" className="adm-modal__title">Edit Event</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="adm-modal__body">
            {error && (
              <div className="adm-error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="adm-field">
              <label htmlFor="edit-ev-title" className="adm-label">Event Title</label>
              <input id="edit-ev-title" className="adm-input" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="adm-field">
              <label htmlFor="edit-ev-cat" className="adm-label">Category</label>
              <select
                id="edit-ev-cat"
                className="adm-input adm-select"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Celebration">Celebration</option>
                <option value="Competition">Competition</option>
                <option value="Parent-Teacher">Parent-Teacher</option>
                <option value="General">General</option>
              </select>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="adm-field">
                <label htmlFor="edit-ev-date" className="adm-label">Event Date</label>
                <input type="date" id="edit-ev-date" className="adm-input" value={form.event_date}
                  onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} />
              </div>

              <div className="adm-field">
                <label htmlFor="edit-ev-time" className="adm-label">Event Time</label>
                <input id="edit-ev-time" className="adm-input" value={form.event_time}
                  onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))} />
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
              <div className="adm-field">
                <label htmlFor="edit-ev-loc" className="adm-label">Location / Venue</label>
                <input id="edit-ev-loc" className="adm-input" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div className="adm-field">
                <label htmlFor="edit-ev-order" className="adm-label">Display Order</label>
                <input type="number" id="edit-ev-order" className="adm-input" value={form.display_order}
                  onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))} />
              </div>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Saving…</>) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteEventModal({ event, token, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteEvent(event.id, token);
      onDeleted(event.id);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="del-ev-title">
        <div className="adm-modal__header">
          <span id="del-ev-title" className="adm-modal__title">Delete Event</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-confirm-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p className="adm-confirm-title">Delete this event?</p>
          <p className="adm-confirm-sub">
            <strong>"{event.title}"</strong> ({fmtDate(event.event_date)}) will be removed from the school events schedule.
          </p>
          {error && <p style={{color:'#b91c1c',fontSize:'0.85rem'}}>{error}</p>}
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="adm-btn adm-btn--primary" style={{background:'#b91c1c',borderColor:'#b91c1c'}}
            onClick={handleDelete} disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Deleting…</>) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <EventCategoryBadge category={event.category} />
      </td>
      <td className="adm-title-cell" title={event.title}>
        <strong>{event.title}</strong>
      </td>
      <td className="adm-date-cell">
        <div style={{fontWeight:600}}>{fmtDate(event.event_date)}</div>
      </td>
      <td>
        <span style={{fontSize:'0.82rem',color:'#374151'}}>{event.event_time || '—'}</span>
      </td>
      <td className="adm-desc-cell" title={event.location}>
        {event.location}
      </td>
      <td style={{textAlign:'center'}}>
        <span style={{fontSize:'0.82rem',fontWeight:600,color:'#6b7280'}}>{event.display_order ?? 0}</span>
      </td>
      <td>
        <div className="adm-actions-cell">
          <button
            className="adm-btn adm-btn--icon adm-btn--edit"
            onClick={() => onEdit(event)}
            title="Edit event"
            aria-label={`Edit: ${event.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            className="adm-btn adm-btn--icon adm-btn--del"
            onClick={() => onDelete(event)}
            title="Delete event"
            aria-label={`Delete: ${event.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMISSIONS ENQUIRIES: Components & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ENQUIRY_STORAGE_KEY = 'school_admin_enquiry_cols';
const ALL_ENQUIRY_COLUMNS = [
  { id: 'child_name', label: "Child's Name" },
  { id: 'class_applying_for', label: 'Class Applying' },
  { id: 'parent_name', label: "Parent's Name" },
  { id: 'phone', label: 'Phone Number' },
  { id: 'email', label: 'Email' },
  { id: 'notes', label: 'Notes / Message' },
  { id: 'created_at', label: 'Submitted Date' },
  { id: 'status', label: 'Status' },
];
const DEFAULT_ENQUIRY_COLUMNS = ['child_name', 'class_applying_for', 'parent_name', 'phone', 'email', 'created_at', 'status'];

function getInitialEnquiryColumns() {
  try {
    const saved = localStorage.getItem(ENQUIRY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_ENQUIRY_COLUMNS;
}

function EnquiryStatusBadges({ enquiry }) {
  const badges = [];
  if (!enquiry.is_valid_phone) {
    badges.push(
      <span key="phone" className="adm-badge adm-badge--invalid" title="Invalid Indian phone number">
        ⚠️ Invalid Phone
      </span>
    );
  }
  if (!enquiry.is_valid_email) {
    badges.push(
      <span key="email" className="adm-badge adm-badge--invalid" title="Invalid email address format">
        ⚠️ Invalid Email
      </span>
    );
  }
  if (enquiry.is_duplicate) {
    badges.push(
      <span key="dup" className="adm-badge adm-badge--duplicate" title="Older duplicate submission for same contact">
        Duplicate
      </span>
    );
  }
  if (enquiry.is_valid_phone && enquiry.is_valid_email && !enquiry.is_duplicate) {
    badges.push(
      <span key="valid" className="adm-badge adm-badge--valid">
        ✓ Valid
      </span>
    );
  }
  return <div className="adm-status-badges">{badges}</div>;
}

function DeleteEnquiryModal({ enquiry, token, onDeleted, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteEnquiry(enquiry.id, token);
      onDeleted(enquiry.id);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Delete failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="del-enq-title">
        <div className="adm-modal__header">
          <span id="del-enq-title" className="adm-modal__title">Delete Enquiry</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-confirm-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p className="adm-confirm-title">Delete this enquiry?</p>
          <p className="adm-confirm-sub">
            Are you sure you want to delete the enquiry for <strong>{enquiry.child_name || 'this student'}</strong> submitted by <strong>{enquiry.parent_name || 'parent'}</strong>? This action cannot be undone.
          </p>
          {error && <p style={{color:'#b91c1c',fontSize:'0.85rem'}}>{error}</p>}
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="adm-btn adm-btn--primary" style={{background:'#b91c1c',borderColor:'#b91c1c'}}
            onClick={handleDelete} disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Deleting…</>) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CleanupEnquiriesModal({ token, invalidCount, duplicateCount, onCleaned, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleCleanup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cleanupEnquiries(token);
      onCleaned(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Cleanup failed');
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cleanup-enq-title">
        <div className="adm-modal__header">
          <span id="cleanup-enq-title" className="adm-modal__title">Purge Invalid &amp; Duplicate Records</span>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-confirm-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p className="adm-confirm-title">Permanently remove invalid data?</p>
          <p className="adm-confirm-sub">
            This will permanently delete all enquiry submissions that fail Indian mobile number validation, fail email format validation, or are older duplicates.
          </p>
          {(invalidCount > 0 || duplicateCount > 0) && (
            <div style={{background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.65rem 0.9rem', fontSize: '0.84rem', color: '#92400e', textAlign: 'left', width: '100%'}}>
              <strong>Currently detected records:</strong>
              <ul style={{marginTop: '0.35rem', marginBottom: 0, paddingLeft: '1.25rem'}}>
                <li>Invalid phone / email: ~{invalidCount}</li>
                <li>Duplicate submissions: ~{duplicateCount}</li>
              </ul>
            </div>
          )}
          {error && <p style={{color:'#b91c1c',fontSize:'0.85rem'}}>{error}</p>}
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="adm-btn adm-btn--primary" style={{background:'#b91c1c',borderColor:'#b91c1c'}}
            onClick={handleCleanup} disabled={loading}>
            {loading ? (<><span className="adm-btn__spinner" aria-hidden="true" /> Purging…</>) : 'Yes, Permanently Purge'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EnquiryRow({ enquiry, visibleCols, onDelete }) {
  return (
    <tr>
      {visibleCols.includes('child_name') && (
        <td className="adm-title-cell" title={enquiry.child_name}>
          <strong>{enquiry.child_name || '—'}</strong>
        </td>
      )}
      {visibleCols.includes('class_applying_for') && (
        <td>
          <span className="adm-badge adm-badge--class">
            {enquiry.class_applying_for || '—'}
          </span>
        </td>
      )}
      {visibleCols.includes('parent_name') && (
        <td>{enquiry.parent_name || '—'}</td>
      )}
      {visibleCols.includes('phone') && (
        <td>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
            <a href={`tel:${enquiry.phone}`} style={{color: 'inherit', textDecoration: 'none', fontWeight: 500}}>
              {enquiry.phone || '—'}
            </a>
            {!enquiry.is_valid_phone && (
              <span title="Invalid Indian mobile number" style={{color: '#b91c1c', cursor: 'help', fontSize: '0.85rem'}}>⚠️</span>
            )}
          </div>
        </td>
      )}
      {visibleCols.includes('email') && (
        <td>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
            <a href={`mailto:${enquiry.email}`} style={{color: 'var(--color-navy)', textDecoration: 'none'}}>
              {enquiry.email || '—'}
            </a>
            {!enquiry.is_valid_email && (
              <span title="Invalid email address format" style={{color: '#b91c1c', cursor: 'help', fontSize: '0.85rem'}}>⚠️</span>
            )}
          </div>
        </td>
      )}
      {visibleCols.includes('notes') && (
        <td className="adm-desc-cell" title={enquiry.message || ''}>
          {enquiry.message || '—'}
        </td>
      )}
      {visibleCols.includes('created_at') && (
        <td className="adm-date-cell">
          <div style={{fontWeight: 500}}>{fmtDate(enquiry.created_at)}</div>
        </td>
      )}
      {visibleCols.includes('status') && (
        <td>
          <EnquiryStatusBadges enquiry={enquiry} />
        </td>
      )}
      <td>
        <div className="adm-actions-cell">
          <button
            className="adm-btn adm-btn--icon adm-btn--del"
            onClick={() => onDelete(enquiry)}
            title="Delete enquiry"
            aria-label={`Delete enquiry for ${enquiry.child_name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { token, adminEmail, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, push: toast } = useToasts();

  // Navigation tab: 'news' | 'holidays'
  const [activeTab, setActiveTab] = useState('news');

  // News table state
  const [articles, setArticles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchErr] = useState('');
  const [search, setSearch]       = useState('');
  const [sortCol, setSortCol]     = useState('created_at');
  const [sortDir, setSortDir]     = useState('desc');

  // News Modals
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Holidays state
  const [holidays, setHolidays]         = useState([]);
  const [hLoading, setHLoading]         = useState(false);
  const [hError, setHError]             = useState('');
  const [hSearch, setHSearch]           = useState('');
  const [hSortCol, setHSortCol]         = useState('start_date');
  const [hSortDir, setHSortDir]         = useState('asc');
  const [hEditTarget, setHEditTarget]   = useState(null);
  const [hDelTarget, setHDelTarget]     = useState(null);

  // Events state
  const [events, setEvents]             = useState([]);
  const [eLoading, setELoading]         = useState(false);
  const [eError, setEError]             = useState('');
  const [eSearch, setESearch]           = useState('');
  const [eSortCol, setESortCol]         = useState('event_date');
  const [eSortDir, setESortDir]         = useState('asc');
  const [eEditTarget, setEEditTarget]   = useState(null);
  const [eDelTarget, setEDelTarget]     = useState(null);

  // Enquiries state
  const [enquiries, setEnquiries]         = useState([]);
  const [enqLoading, setEnqLoading]       = useState(false);
  const [enqError, setEnqError]           = useState('');
  const [enqSearch, setEnqSearch]         = useState('');
  const [enqValidOnly, setEnqValidOnly]   = useState(true);
  const [enqSortCol, setEnqSortCol]       = useState('created_at');
  const [enqSortDir, setEnqSortDir]       = useState('desc');
  const [enqColumns, setEnqColumns]       = useState(getInitialEnquiryColumns);
  const [showColPicker, setShowColPicker] = useState(false);
  const [enqDelTarget, setEnqDelTarget]   = useState(null);
  const [enqCleanupOpen, setEnqCleanupOpen] = useState(false);

  // Fees & Scholarships state
  const [feesTotalCount, setFeesTotalCount] = useState(0);

  // Newsletter Subscribers state
  const [newsletterCount, setNewsletterCount] = useState(0);

  const debounceRef = useRef(null);
  const hDebounceRef = useRef(null);
  const enqDebounceRef = useRef(null);
  const colPickerRef   = useRef(null);

  // ── Fetch News ───────────────────────────────────────────────────
  const fetchArticles = useCallback(async (q = '') => {
    setLoading(true);
    setFetchErr('');
    try {
      const data = await getNews(q ? { search: q, limit: 500 } : { limit: 500 });
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        navigate('/admin/login');
        return;
      }
      setFetchErr('Failed to load articles. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  // ── Fetch Holidays ───────────────────────────────────────────────
  const fetchHolidayList = useCallback(async (q = '') => {
    setHLoading(true);
    setHError('');
    try {
      const data = await getHolidays(q ? { search: q } : {});
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        navigate('/admin/login');
        return;
      }
      setHError('Failed to load calendar holidays.');
    } finally {
      setHLoading(false);
    }
  }, [logout, navigate]);

  // ── Fetch Events ─────────────────────────────────────────────────
  const fetchEventsList = useCallback(async () => {
    setELoading(true);
    setEError('');
    try {
      const data = await getEvents({ limit: 500 });
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        navigate('/admin/login');
        return;
      }
      setEError('Failed to load upcoming events.');
    } finally {
      setELoading(false);
    }
  }, [logout, navigate]);

  // ── Fetch Enquiries ─────────────────────────────────────────────
  const fetchEnquiriesList = useCallback(async (searchVal = '', validOnlyVal = true, sortVal = 'created_at', dirVal = 'desc') => {
    setEnqLoading(true);
    setEnqError('');
    try {
      const params = {
        valid_only: validOnlyVal,
        sort_by: sortVal,
        order: dirVal,
      };
      if (searchVal) params.search = searchVal;
      const data = await getEnquiries(params, token);
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
        navigate('/admin/login');
        return;
      }
      setEnqError('Failed to load admissions enquiries.');
    } finally {
      setEnqLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchArticles('');
    fetchEventsList();
    fetchHolidayList('');
    fetchEnquiriesList('', true, 'created_at', 'desc');
  }, [fetchArticles, fetchEventsList, fetchHolidayList, fetchEnquiriesList]);

  // Close column picker on outside click
  useEffect(() => {
    if (!showColPicker) return;
    const handleClickOutside = (e) => {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target)) {
        setShowColPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColPicker]);

  // ── Search Handlers ──────────────────────────────────────────────
  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchArticles(v.trim()), 400);
  };

  const handleHSearch = (e) => {
    const v = e.target.value;
    setHSearch(v);
    clearTimeout(hDebounceRef.current);
    hDebounceRef.current = setTimeout(() => fetchHolidayList(v.trim()), 400);
  };

  const handleESearch = (e) => {
    setESearch(e.target.value);
  };

  // ── Sorting ──────────────────────────────────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const toggleESort = (col) => {
    if (eSortCol === col) setESortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setESortCol(col); setESortDir('asc'); }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (sortCol === 'created_at') { va = new Date(va); vb = new Date(vb); }
    else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 :  1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const toggleHSort = (col) => {
    if (hSortCol === col) setHSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setHSortCol(col); setHSortDir('asc'); }
  };

  // ── Enquiry Handlers ─────────────────────────────────────────────
  const handleEnqSearch = (e) => {
    const v = e.target.value;
    setEnqSearch(v);
    clearTimeout(enqDebounceRef.current);
    enqDebounceRef.current = setTimeout(() => {
      fetchEnquiriesList(v.trim(), enqValidOnly, enqSortCol, enqSortDir);
    }, 350);
  };

  const handleValidOnlyChange = (val) => {
    if (val === enqValidOnly) return;
    setEnqValidOnly(val);
    fetchEnquiriesList(enqSearch.trim(), val, enqSortCol, enqSortDir);
  };

  const toggleEnqSort = (col) => {
    const nextDir = enqSortCol === col && enqSortDir === 'asc' ? 'desc' : 'asc';
    setEnqSortCol(col);
    setEnqSortDir(nextDir);
    fetchEnquiriesList(enqSearch.trim(), enqValidOnly, col, nextDir);
  };

  const toggleColumn = (colId) => {
    setEnqColumns(prev => {
      let next;
      if (prev.includes(colId)) {
        if (prev.length <= 1) return prev;
        next = prev.filter(c => c !== colId);
      } else {
        next = [...prev, colId];
      }
      try {
        localStorage.setItem(ENQUIRY_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleEnquiryDeleted = (id) => {
    setEnquiries(p => p.filter(e => e.id !== id));
    setEnqDelTarget(null);
    toast('Enquiry deleted successfully.', 'success');
  };

  const handleEnquiriesCleaned = (result) => {
    const count = result?.total_deleted ?? 0;
    toast(`Cleanup complete: ${count} invalid/duplicate record${count === 1 ? '' : 's'} purged.`, 'success');
    setEnqCleanupOpen(false);
    fetchEnquiriesList(enqSearch.trim(), enqValidOnly, enqSortCol, enqSortDir);
  };

  const invalidEnqCount = enquiries.filter(e => !e.is_valid_phone || !e.is_valid_email).length;
  const duplicateEnqCount = enquiries.filter(e => e.is_duplicate).length;

  const sortedHolidays = [...holidays].sort((a, b) => {
    let va = a[hSortCol], vb = b[hSortCol];
    if (hSortCol === 'start_date') { va = new Date(va); vb = new Date(vb); }
    else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return hSortDir === 'asc' ? -1 :  1;
    if (va > vb) return hSortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const filteredEvents = events.filter(ev => {
    if (!eSearch.trim()) return true;
    const q = eSearch.toLowerCase();
    return (
      (ev.title || '').toLowerCase().includes(q) ||
      (ev.category || '').toLowerCase().includes(q) ||
      (ev.location || '').toLowerCase().includes(q)
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let va = a[eSortCol], vb = b[eSortCol];
    if (eSortCol === 'event_date') { va = new Date(va); vb = new Date(vb); }
    else if (eSortCol === 'display_order') { va = Number(va || 0); vb = Number(vb || 0); }
    else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return eSortDir === 'asc' ? -1 : 1;
    if (va > vb) return eSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // ── News CRUD callbacks ──────────────────────────────────────────
  const handleNewsCreated = (article) => {
    setArticles(p => [article, ...p]);
    toast('Article published successfully!', 'success');
  };

  const handleNewsSaved = (updated) => {
    setArticles(p => p.map(a => a.id === updated.id ? updated : a));
    setEditTarget(null);
    toast('Article updated.', 'success');
  };

  const handleNewsDeleted = (id) => {
    setArticles(p => p.filter(a => a.id !== id));
    setDeleteTarget(null);
    toast('Article deleted.', 'success');
  };

  const handlePinToggle = async (article) => {
    try {
      const updated = await toggleNewsPin(article.id, token);
      setArticles(p => p.map(a => a.id === updated.id ? updated : a));
      toast(updated.is_pinned ? 'Article pinned.' : 'Article unpinned.', 'info');
    } catch (err) {
      if (err?.response?.status === 401) { logout(); navigate('/admin/login'); return; }
      toast('Pin toggle failed. Try again.', 'error');
    }
  };

  // ── Holiday CRUD callbacks ───────────────────────────────────────
  const handleHolidayCreated = (item) => {
    setHolidays(p => [...p, item].sort((a,b) => new Date(a.start_date) - new Date(b.start_date)));
    toast('Holiday / Date range added!', 'success');
  };

  const handleHolidaySaved = (updated) => {
    setHolidays(p => p.map(h => h.id === updated.id ? updated : h).sort((a,b) => new Date(a.start_date) - new Date(b.start_date)));
    setHEditTarget(null);
    toast('Holiday updated.', 'success');
  };

  const handleHolidayDeleted = (id) => {
    setHolidays(p => p.filter(h => h.id !== id));
    setHDelTarget(null);
    toast('Holiday removed from calendar.', 'success');
  };

  // ── Event CRUD callbacks ─────────────────────────────────────────
  const handleEventCreated = (item) => {
    setEvents(p => [...p, item].sort((a,b) => new Date(a.event_date) - new Date(b.event_date)));
    toast('Upcoming event added!', 'success');
  };

  const handleEventSaved = (updated) => {
    setEvents(p => p.map(ev => ev.id === updated.id ? updated : ev).sort((a,b) => new Date(a.event_date) - new Date(b.event_date)));
    setEEditTarget(null);
    toast('Event updated.', 'success');
  };

  const handleEventDeleted = (id) => {
    setEvents(p => p.filter(ev => ev.id !== id));
    setEDelTarget(null);
    toast('Event deleted.', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="adm">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="adm-topbar">
        <div className="adm-topbar__brand">
          <div className="adm-topbar__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <div className="adm-topbar__title">Admin Control Panel</div>
            <div className="adm-topbar__sub">XYZ Public School</div>
          </div>
        </div>

        <div className="adm-topbar__actions">
          {adminEmail && (
            <span className="adm-topbar__email" aria-label={`Signed in as ${adminEmail}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {adminEmail}
            </span>
          )}
          <Link to="/news" className="adm-topbar__view-site" target="_blank" rel="noopener noreferrer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            News Page
          </Link>
          <Link to="/calendar" className="adm-topbar__view-site" target="_blank" rel="noopener noreferrer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Calendar
          </Link>
          <Link to="/fees-scholarships" className="adm-topbar__view-site" target="_blank" rel="noopener noreferrer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Fees &amp; Scholarships
          </Link>
          <button className="adm-topbar__logout" onClick={handleLogout} aria-label="Log out of admin panel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Sub Navigation Tabs ──────────────────────────────────── */}
      <div className="adm-tabs-bar">
        <div className="adm-tabs-container">
          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            News Articles
            <span className="adm-tab-badge">{articles.length}</span>
          </button>

          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Upcoming Events
            <span className="adm-tab-badge">{events.length}</span>
          </button>

          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'holidays' ? 'active' : ''}`}
            onClick={() => setActiveTab('holidays')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Holidays &amp; Vacations
            <span className="adm-tab-badge">{holidays.length}</span>
          </button>

          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Admissions Enquiries
            <span className="adm-tab-badge">{enquiries.length}</span>
          </button>

          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Fees &amp; Scholarships
            <span className="adm-tab-badge">{feesTotalCount}</span>
          </button>

          <button
            type="button"
            className={`adm-tab-btn ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletter')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Newsletter Subscribers
            <span className="adm-tab-badge">{newsletterCount}</span>
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="adm-content">

        {/* ========================================================= */}
        {/* TAB 1: NEWS ARTICLES                                      */}
        {/* ========================================================= */}
        {activeTab === 'news' && (
          <>
            {/* Upload card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Publish New Article
                </h2>
              </div>
              <div className="adm-card__body">
                <UploadForm token={token} onCreated={handleNewsCreated} />
              </div>
            </div>

            {/* Table card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  All Articles
                </h2>

                <div className="adm-table-toolbar">
                  <div className="adm-search-wrap">
                    <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      id="dashboard-search"
                      type="search"
                      className="adm-search-input"
                      placeholder="Search articles…"
                      value={search}
                      onChange={handleSearch}
                      aria-label="Search news articles"
                    />
                  </div>
                  <span className="adm-table-count" aria-live="polite">
                    {loading ? '…' : `${sortedArticles.length} article${sortedArticles.length !== 1 ? 's' : ''}`}
                  </span>
                  <button className="adm-btn adm-btn--ghost" onClick={() => fetchArticles(search.trim())} aria-label="Refresh table">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  </button>
                </div>
              </div>

              {fetchError && (
                <div className="adm-error-banner" style={{margin:'1rem 1.5rem',marginBottom:0}} role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {fetchError}
                </div>
              )}

              <div className="adm-table-wrap">
                <table className="adm-table" aria-label="News articles table">
                  <thead>
                    <tr>
                      <th style={{width:86}}>Image</th>
                      <th className={`sortable${sortCol === 'title' ? ' sorted' : ''}`} onClick={() => toggleSort('title')}>
                        Title <SortIcon dir={sortCol === 'title' ? sortDir : null} />
                      </th>
                      <th style={{minWidth:200}}>Description</th>
                      <th style={{width:90}}>Pinned</th>
                      <th className={`sortable${sortCol === 'created_at' ? ' sorted' : ''}`} onClick={() => toggleSort('created_at')}>
                        Created <SortIcon dir={sortCol === 'created_at' ? sortDir : null} />
                      </th>
                      <th style={{width:180, textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && Array.from({length:5}).map((_, i) => (
                      <tr key={i} className="adm-skeleton-row">
                        <td><div className="adm-thumb-wrap"><div className="adm-skeleton-block" style={{height:'100%',borderRadius:5}} /></div></td>
                        <td><div className="adm-skeleton-block" style={{width:'75%'}} /></td>
                        <td><div className="adm-skeleton-block" /></td>
                        <td><div className="adm-skeleton-block" style={{width:50}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:70}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:120,marginLeft:'auto'}} /></td>
                      </tr>
                    ))}
                    {!loading && sortedArticles.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <div className="adm-table-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <br />
                            {search ? `No articles matched "${search}"` : 'No articles yet — publish one above.'}
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && sortedArticles.map(article => (
                      <NewsRow
                        key={article.id}
                        article={article}
                        token={token}
                        onEdit={setEditTarget}
                        onDelete={setDeleteTarget}
                        onPinToggle={handlePinToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: UPCOMING EVENTS                                    */}
        {/* ========================================================= */}
        {activeTab === 'events' && (
          <>
            {/* Event creation card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Schedule New Event
                </h2>
              </div>
              <div className="adm-card__body">
                <EventForm token={token} onCreated={handleEventCreated} />
              </div>
            </div>

            {/* Event table card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  All Scheduled Events
                </h2>

                <div className="adm-table-toolbar">
                  <div className="adm-search-wrap">
                    <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="search"
                      className="adm-search-input"
                      placeholder="Search events, venues, categories…"
                      value={eSearch}
                      onChange={handleESearch}
                      aria-label="Search events"
                    />
                  </div>
                  <span className="adm-table-count" aria-live="polite">
                    {eLoading ? '…' : `${sortedEvents.length} event${sortedEvents.length !== 1 ? 's' : ''}`}
                  </span>
                  <button className="adm-btn adm-btn--ghost" onClick={fetchEventsList} aria-label="Refresh events">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  </button>
                </div>
              </div>

              {eError && (
                <div className="adm-error-banner" style={{margin:'1rem 1.5rem',marginBottom:0}} role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {eError}
                </div>
              )}

              <div className="adm-table-wrap">
                <table className="adm-table" aria-label="Events table">
                  <thead>
                    <tr>
                      <th style={{width:110}}>Category</th>
                      <th className={`sortable${eSortCol === 'title' ? ' sorted' : ''}`} onClick={() => toggleESort('title')} style={{minWidth:180}}>
                        Title <SortIcon dir={eSortCol === 'title' ? eSortDir : null} />
                      </th>
                      <th className={`sortable${eSortCol === 'event_date' ? ' sorted' : ''}`} onClick={() => toggleESort('event_date')} style={{minWidth:140}}>
                        Date <SortIcon dir={eSortCol === 'event_date' ? eSortDir : null} />
                      </th>
                      <th style={{minWidth:130}}>Time</th>
                      <th style={{minWidth:160}}>Location / Venue</th>
                      <th className={`sortable${eSortCol === 'display_order' ? ' sorted' : ''}`} onClick={() => toggleESort('display_order')} style={{width:80,textAlign:'center'}}>
                        Order <SortIcon dir={eSortCol === 'display_order' ? eSortDir : null} />
                      </th>
                      <th style={{width:120, textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eLoading && Array.from({length:5}).map((_, i) => (
                      <tr key={i} className="adm-skeleton-row">
                        <td><div className="adm-skeleton-block" style={{width:70}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:'80%'}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:100}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:80}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:110}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:40,margin:'0 auto'}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:70,marginLeft:'auto'}} /></td>
                      </tr>
                    ))}
                    {!eLoading && sortedEvents.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <div className="adm-table-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <br />
                            {eSearch ? `No events matched "${eSearch}"` : 'No events scheduled yet — add one above.'}
                          </div>
                        </td>
                      </tr>
                    )}
                    {!eLoading && sortedEvents.map(item => (
                      <EventRow
                        key={item.id}
                        event={item}
                        onEdit={setEEditTarget}
                        onDelete={setEDelTarget}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HOLIDAYS & VACATIONS                               */}
        {/* ========================================================= */}
        {activeTab === 'holidays' && (
          <>
            {/* Holiday creation card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Add Holiday or Date Range
                </h2>
              </div>
              <div className="adm-card__body">
                <HolidayForm token={token} onCreated={handleHolidayCreated} />
              </div>
            </div>

            {/* Holiday table card */}
            <div className="adm-card">
              <div className="adm-card__header">
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Official School Calendar Entries
                </h2>

                <div className="adm-table-toolbar">
                  <div className="adm-search-wrap">
                    <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="search"
                      className="adm-search-input"
                      placeholder="Search holidays, vacations, exams…"
                      value={hSearch}
                      onChange={handleHSearch}
                      aria-label="Search holidays"
                    />
                  </div>
                  <span className="adm-table-count" aria-live="polite">
                    {hLoading ? '…' : `${sortedHolidays.length} entr${sortedHolidays.length !== 1 ? 'ies' : 'y'}`}
                  </span>
                  <button className="adm-btn adm-btn--ghost" onClick={() => fetchHolidayList(hSearch.trim())} aria-label="Refresh holidays">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  </button>
                </div>
              </div>

              {hError && (
                <div className="adm-error-banner" style={{margin:'1rem 1.5rem',marginBottom:0}} role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {hError}
                </div>
              )}

              <div className="adm-table-wrap">
                <table className="adm-table" aria-label="Holidays table">
                  <thead>
                    <tr>
                      <th style={{width:110}}>Category</th>
                      <th className={`sortable${hSortCol === 'name' ? ' sorted' : ''}`} onClick={() => toggleHSort('name')} style={{minWidth:180}}>
                        Name / Title <SortIcon dir={hSortCol === 'name' ? hSortDir : null} />
                      </th>
                      <th className={`sortable${hSortCol === 'start_date' ? ' sorted' : ''}`} onClick={() => toggleHSort('start_date')} style={{minWidth:170}}>
                        Date Span <SortIcon dir={hSortCol === 'start_date' ? hSortDir : null} />
                      </th>
                      <th style={{width:105}}>Duration</th>
                      <th style={{minWidth:200}}>Description</th>
                      <th style={{width:120, textAlign:'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hLoading && Array.from({length:5}).map((_, i) => (
                      <tr key={i} className="adm-skeleton-row">
                        <td><div className="adm-skeleton-block" style={{width:70}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:'80%'}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:120}} /></td>
                        <td><div className="adm-skeleton-block" style={{width:60}} /></td>
                        <td><div className="adm-skeleton-block" /></td>
                        <td><div className="adm-skeleton-block" style={{width:70,marginLeft:'auto'}} /></td>
                      </tr>
                    ))}
                    {!hLoading && sortedHolidays.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <div className="adm-table-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <br />
                            {hSearch ? `No holidays matched "${hSearch}"` : 'No holidays yet — add one above.'}
                          </div>
                        </td>
                      </tr>
                    )}
                    {!hLoading && sortedHolidays.map(item => (
                      <HolidayRow
                        key={item.id}
                        holiday={item}
                        onEdit={setHEditTarget}
                        onDelete={setHDelTarget}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADMISSIONS ENQUIRIES                               */}
        {/* ========================================================= */}
        {activeTab === 'enquiries' && (
          <div className="adm-card">
            <div className="adm-card__header" style={{flexWrap:'wrap', gap:'1rem'}}>
              <div>
                <h2 className="adm-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Admissions Enquiries
                </h2>
                <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'0.25rem'}}>
                  Direct submissions from the public website enquiry form
                </div>
              </div>

              <div className="adm-enquiry-toolbar">
                <div className="adm-toggle-group" role="group" aria-label="Filter enquiries validity">
                  <button
                    type="button"
                    className={`adm-toggle-btn ${enqValidOnly ? 'active' : ''}`}
                    onClick={() => handleValidOnlyChange(true)}
                  >
                    Valid Only
                  </button>
                  <button
                    type="button"
                    className={`adm-toggle-btn ${!enqValidOnly ? 'active' : ''}`}
                    onClick={() => handleValidOnlyChange(false)}
                  >
                    Show All
                  </button>
                </div>

                <div className="adm-col-picker-container" ref={colPickerRef}>
                  <button
                    type="button"
                    className="adm-btn adm-btn--ghost"
                    onClick={() => setShowColPicker(p => !p)}
                    aria-label="Toggle visible columns menu"
                    aria-expanded={showColPicker}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Columns ({enqColumns.length})
                  </button>
                  {showColPicker && (
                    <div className="adm-col-picker-dropdown" role="menu">
                      <div className="adm-col-picker-title">Display Columns</div>
                      {ALL_ENQUIRY_COLUMNS.map(col => (
                        <label key={col.id} className="adm-col-picker-label">
                          <input
                            type="checkbox"
                            checked={enqColumns.includes(col.id)}
                            onChange={() => toggleColumn(col.id)}
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="adm-btn adm-btn--danger-cleanup"
                  onClick={() => setEnqCleanupOpen(true)}
                  title="Purge all invalid phone/email records and duplicate entries"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Clean Up Invalid &amp; Duplicates
                </button>
              </div>

              <div className="adm-table-toolbar" style={{width:'100%', marginTop:'0.5rem'}}>
                <div className="adm-search-wrap">
                  <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="search"
                    className="adm-search-input"
                    placeholder="Search by student, parent, email, phone, or class…"
                    value={enqSearch}
                    onChange={handleEnqSearch}
                    aria-label="Search admissions enquiries"
                  />
                </div>
                <span className="adm-table-count" aria-live="polite">
                  {enqLoading ? '…' : `${enquiries.length} enquir${enquiries.length !== 1 ? 'ies' : 'y'}`}
                </span>
                <button
                  className="adm-btn adm-btn--ghost"
                  onClick={() => fetchEnquiriesList(enqSearch.trim(), enqValidOnly, enqSortCol, enqSortDir)}
                  aria-label="Refresh enquiries"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                </button>
              </div>
            </div>

            {enqError && (
              <div className="adm-error-banner" style={{margin:'1rem 1.5rem',marginBottom:0}} role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {enqError}
              </div>
            )}

            <div className="adm-table-wrap">
              <table className="adm-table" aria-label="Admissions enquiries table">
                <thead>
                  <tr>
                    {enqColumns.includes('child_name') && (
                      <th className={`sortable${enqSortCol === 'child_name' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('child_name')} style={{minWidth:150}}>
                        Child's Name <SortIcon dir={enqSortCol === 'child_name' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('class_applying_for') && (
                      <th className={`sortable${enqSortCol === 'class_applying_for' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('class_applying_for')} style={{minWidth:110}}>
                        Class <SortIcon dir={enqSortCol === 'class_applying_for' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('parent_name') && (
                      <th className={`sortable${enqSortCol === 'parent_name' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('parent_name')} style={{minWidth:150}}>
                        Parent's Name <SortIcon dir={enqSortCol === 'parent_name' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('phone') && (
                      <th className={`sortable${enqSortCol === 'phone' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('phone')} style={{minWidth:140}}>
                        Phone <SortIcon dir={enqSortCol === 'phone' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('email') && (
                      <th className={`sortable${enqSortCol === 'email' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('email')} style={{minWidth:180}}>
                        Email <SortIcon dir={enqSortCol === 'email' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('notes') && (
                      <th style={{minWidth:200}}>Notes / Message</th>
                    )}
                    {enqColumns.includes('created_at') && (
                      <th className={`sortable${enqSortCol === 'created_at' ? ' sorted' : ''}`} onClick={() => toggleEnqSort('created_at')} style={{minWidth:140}}>
                        Submitted <SortIcon dir={enqSortCol === 'created_at' ? enqSortDir : null} />
                      </th>
                    )}
                    {enqColumns.includes('status') && (
                      <th style={{minWidth:140}}>Status</th>
                    )}
                    <th style={{width:80, textAlign:'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enqLoading && Array.from({length:5}).map((_, i) => (
                    <tr key={i} className="adm-skeleton-row">
                      {Array.from({length: enqColumns.length + 1}).map((__, j) => (
                        <td key={j}><div className="adm-skeleton-block" style={{width: j === 0 ? '70%' : '50%'}} /></td>
                      ))}
                    </tr>
                  ))}
                  {!enqLoading && enquiries.length === 0 && (
                    <tr>
                      <td colSpan={enqColumns.length + 1}>
                        <div className="adm-table-empty">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          <br />
                          {enqSearch ? `No enquiries matched "${enqSearch}"` : 'No enquiries found.'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {!enqLoading && enquiries.map(item => (
                    <EnquiryRow
                      key={item.id}
                      enquiry={item}
                      visibleCols={enqColumns}
                      onDelete={setEnqDelTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FEES & SCHOLARSHIPS                                */}
        {/* ========================================================= */}
        {activeTab === 'fees' && (
          <FeesAdminTab
            token={token}
            toast={toast}
            onCountsUpdate={(fCount, sCount) => setFeesTotalCount(fCount + sCount)}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 6: NEWSLETTER SUBSCRIBERS                             */}
        {/* ========================================================= */}
        {activeTab === 'newsletter' && (
          <NewsletterAdminTab
            token={token}
            toast={toast}
            onCountUpdate={(count) => setNewsletterCount(count)}
          />
        )}

      </div>

      {/* ── News Modals ────────────────────────────────────────────── */}
      {editTarget && (
        <EditNewsModal
          article={editTarget}
          token={token}
          onSaved={handleNewsSaved}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteNewsModal
          article={deleteTarget}
          token={token}
          onDeleted={handleNewsDeleted}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Holiday Modals ─────────────────────────────────────────── */}
      {hEditTarget && (
        <EditHolidayModal
          holiday={hEditTarget}
          token={token}
          onSaved={handleHolidaySaved}
          onClose={() => setHEditTarget(null)}
        />
      )}

      {hDelTarget && (
        <DeleteHolidayModal
          holiday={hDelTarget}
          token={token}
          onDeleted={handleHolidayDeleted}
          onClose={() => setHDelTarget(null)}
        />
      )}

      {/* ── Event Modals ───────────────────────────────────────────── */}
      {eEditTarget && (
        <EditEventModal
          event={eEditTarget}
          token={token}
          onSaved={handleEventSaved}
          onClose={() => setEEditTarget(null)}
        />
      )}

      {eDelTarget && (
        <DeleteEventModal
          event={eDelTarget}
          token={token}
          onDeleted={handleEventDeleted}
          onClose={() => setEDelTarget(null)}
        />
      )}

      {/* ── Enquiry Modals ─────────────────────────────────────────── */}
      {enqDelTarget && (
        <DeleteEnquiryModal
          enquiry={enqDelTarget}
          token={token}
          onDeleted={handleEnquiryDeleted}
          onClose={() => setEnqDelTarget(null)}
        />
      )}

      {enqCleanupOpen && (
        <CleanupEnquiriesModal
          token={token}
          invalidCount={invalidEnqCount}
          duplicateCount={duplicateEnqCount}
          onCleaned={handleEnquiriesCleaned}
          onClose={() => setEnqCleanupOpen(false)}
        />
      )}

      {/* ── Toast stack ───────────────────────────────────────────── */}
      <ToastStack toasts={toasts} />
    </div>
  );
}
