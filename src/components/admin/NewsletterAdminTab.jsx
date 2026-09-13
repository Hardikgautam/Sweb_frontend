// src/components/admin/NewsletterAdminTab.jsx
// Admin management for Newsletter Subscribers
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSubscribers, deleteSubscriber } from '../../api/newsletter';
import './NewsletterAdminTab.css';

function fmtDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function NewsletterAdminTab({ token, toast, onCountUpdate }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const debounceRef = useRef(null);

  const fetchSubscribersList = useCallback(async (searchQuery = '', sortOrder = order) => {
    setLoading(true);
    setError('');
    try {
      const params = { order: sortOrder };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getSubscribers(token, params);
      const list = Array.isArray(data) ? data : [];
      setSubscribers(list);
      if (onCountUpdate) onCountUpdate(list.length);
    } catch (err) {
      setError('Failed to load newsletter subscribers. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [token, order, onCountUpdate]);

  useEffect(() => {
    fetchSubscribersList(search, order);
  }, [fetchSubscribersList, order]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSubscribersList(val, order);
    }, 350);
  };

  const handleToggleOrder = () => {
    const nextOrder = order === 'desc' ? 'asc' : 'desc';
    setOrder(nextOrder);
    fetchSubscribersList(search, nextOrder);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSubscriber(deleteTarget.id, token);
      setSubscribers(prev => {
        const next = prev.filter(s => s.id !== deleteTarget.id);
        if (onCountUpdate) onCountUpdate(next.length);
        return next;
      });
      toast(`Subscriber ${deleteTarget.email} removed.`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      toast('Failed to delete subscriber. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyEmail = (sub) => {
    navigator.clipboard.writeText(sub.email);
    setCopiedId(sub.id);
    toast(`Copied ${sub.email} to clipboard.`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!subscribers.length) {
      toast('No subscribers to export.', 'info');
      return;
    }
    const headers = ['ID', 'Email', 'Subscribed At'];
    const rows = subscribers.map(s => [
      s.id,
      `"${s.email}"`,
      `"${s.subscribed_at ? new Date(s.subscribed_at).toISOString() : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `newsletter_subscribers_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`Exported ${subscribers.length} subscribers to CSV.`, 'success');
  };

  return (
    <div className="adm-newsletter-tab">
      <div className="adm-card">
        {/* ── Card Header ────────────────────────────────────────── */}
        <div className="adm-card__header">
          <div className="adm-newsletter-title-wrap">
            <h2 className="adm-card__title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Newsletter Subscribers
            </h2>
            <span className="adm-subscribers-badge" title="Deduplicated distinct subscriber emails">
              {subscribers.length} Distinct Subscriber{subscribers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="adm-table-toolbar">
            {/* Search Input */}
            <div className="adm-search-wrap">
              <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="search"
                className="adm-search-input"
                placeholder="Search by email…"
                value={search}
                onChange={handleSearchChange}
                aria-label="Search subscribers by email"
              />
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-sort-toggle-btn"
              onClick={handleToggleOrder}
              title={`Sorting: ${order === 'desc' ? 'Newest First' : 'Oldest First'}. Click to toggle.`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              {order === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              className="adm-btn adm-btn--ghost"
              onClick={() => fetchSubscribersList(search, order)}
              title="Refresh subscriber list"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>

            {/* Export as CSV */}
            <button
              type="button"
              className="adm-btn adm-btn--primary adm-export-csv-btn"
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              title="Download CSV for sending newsletter"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export as CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="adm-error-banner" style={{ margin: '1rem 1.5rem 0' }} role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────── */}
        <div className="adm-table-wrap">
          <table className="adm-table" aria-label="Newsletter subscribers table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>#</th>
                <th>Subscriber Email</th>
                <th style={{ width: 220 }}>Subscribed Date &amp; Time</th>
                <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="adm-skeleton-row">
                  <td><div className="adm-skeleton-block" style={{ width: 25, margin: '0 auto' }} /></td>
                  <td><div className="adm-skeleton-block" style={{ width: '60%' }} /></td>
                  <td><div className="adm-skeleton-block" style={{ width: 140 }} /></td>
                  <td><div className="adm-skeleton-block" style={{ width: 70, marginLeft: 'auto' }} /></td>
                </tr>
              ))}

              {!loading && subscribers.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="adm-table-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <br />
                      {search ? `No subscribers matched "${search}"` : 'No newsletter subscribers recorded yet.'}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && subscribers.map((sub, idx) => (
                <tr key={sub.id}>
                  <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div className="adm-sub-email-cell">
                      <svg className="adm-sub-email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span className="adm-sub-email-text">{sub.email}</span>
                      <button
                        type="button"
                        className="adm-copy-email-btn"
                        onClick={() => handleCopyEmail(sub)}
                        title="Copy email to clipboard"
                      >
                        {copiedId === sub.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.88rem' }}>
                    {fmtDateTime(sub.subscribed_at)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn--danger adm-btn--sm"
                      onClick={() => setDeleteTarget(sub)}
                      title="Unsubscribe / Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteTarget && (
        <div className="adm-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="adm-modal__header">
              <h3 className="adm-modal__title" style={{ color: '#b91c1c' }}>
                Remove Subscriber
              </h3>
              <button
                type="button"
                className="adm-modal__close"
                onClick={() => setDeleteTarget(null)}
              >
                &times;
              </button>
            </div>

            <div className="adm-modal__body">
              <p style={{ margin: '0 0 0.85rem', lineHeight: 1.55, color: '#334155' }}>
                Are you sure you want to remove <strong>{deleteTarget.email}</strong> from the newsletter subscriber list?
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                This removes all submission entries for this email address to permanently honor the unsubscribe request.
              </p>
            </div>

            <div className="adm-modal__footer">
              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Removing…' : 'Delete Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
