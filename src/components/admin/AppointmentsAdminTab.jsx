// src/components/admin/AppointmentsAdminTab.jsx
// Admin Tab for Viewing, Confirming, and Managing Campus Appointments
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAppointments,
  getAppointmentStats,
  updateAppointment,
  deleteAppointment,
} from '../../api/appointments';
import './AppointmentsAdminTab.css';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AppointmentsAdminTab({ token, toast, onCountUpdate }) {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | confirmed | completed | cancelled
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('preferred_date');
  const [order, setOrder] = useState('asc');

  // Modals
  const [manageTarget, setManageTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Manage form fields
  const [editStatus, setEditStatus] = useState('pending');
  const [editConfirmedDate, setEditConfirmedDate] = useState('');
  const [editConfirmedTime, setEditConfirmedTime] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  const debounceRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAppointmentStats(token);
      if (data && typeof data === 'object') {
        setStats({
          pending: data.pending || 0,
          confirmed: data.confirmed || 0,
          completed: data.completed || 0,
          cancelled: data.cancelled || 0,
        });
        if (onCountUpdate) {
          onCountUpdate(data.pending || 0);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch appointment stats', err);
    }
  }, [token, onCountUpdate]);

  const fetchList = useCallback(async (searchQuery = search, st = statusFilter, sb = sortBy, ord = order) => {
    setLoading(true);
    try {
      const params = {
        sort_by: sb,
        order: ord,
      };
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (st && st !== 'all') {
        params.status = st;
      }
      const data = await getAppointments(params, token);
      const list = Array.isArray(data) ? data : [];
      setAppointments(list);
    } catch (err) {
      console.warn('Failed to fetch appointments list', err);
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, sortBy, order]);

  useEffect(() => {
    fetchStats();
    fetchList(search, statusFilter, sortBy, order);
  }, [fetchStats, fetchList, statusFilter, sortBy, order]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchList(val, statusFilter, sortBy, order);
    }, 350);
  };

  const handleOpenManage = (appt) => {
    setManageTarget(appt);
    setEditStatus(appt.status || 'pending');
    setEditConfirmedDate(appt.confirmed_date || appt.preferred_date || '');
    setEditConfirmedTime(appt.confirmed_time || appt.preferred_time || '');
    setEditAdminNotes(appt.admin_notes || '');
  };

  const handleSaveManage = async (e) => {
    e.preventDefault();
    if (!manageTarget) return;
    setSaving(true);
    try {
      const payload = {
        status: editStatus,
        admin_notes: editAdminNotes.trim() || null,
        confirmed_date: editConfirmedDate || null,
        confirmed_time: editConfirmedTime || null,
      };
      const updated = await updateAppointment(manageTarget.id, payload, token);
      setAppointments((prev) =>
        prev.map((item) => (item.id === manageTarget.id ? { ...item, ...updated } : item))
      );
      toast(`Appointment #${manageTarget.id} marked as ${editStatus.toUpperCase()}`, 'success');
      setManageTarget(null);
      fetchStats();
    } catch (err) {
      toast('Failed to update appointment. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAppointment(deleteTarget.id, token);
      setAppointments((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast(`Appointment #${deleteTarget.id} deleted.`, 'info');
      setDeleteTarget(null);
      fetchStats();
    } catch (err) {
      toast('Failed to delete appointment.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast(`Copied ${label} to clipboard.`, 'info');
  };

  const handleExportCSV = () => {
    if (!appointments.length) {
      toast('No appointments to export.', 'info');
      return;
    }
    const headers = [
      'ID',
      'Parent Name',
      'Student Name',
      'Phone',
      'Email',
      'Purpose',
      'Preferred Date',
      'Preferred Time',
      'Class Interested',
      'Status',
      'Confirmed Date',
      'Confirmed Time',
      'Admin Notes',
      'Created At',
    ];
    const rows = appointments.map((a) => [
      a.id,
      `"${(a.parent_name || '').replace(/"/g, '""')}"`,
      `"${(a.student_name || '').replace(/"/g, '""')}"`,
      a.phone || '',
      a.email || '',
      a.purpose || '',
      a.preferred_date || '',
      `"${a.preferred_time || ''}"`,
      `"${a.class_interested || ''}"`,
      a.status || '',
      a.confirmed_date || '',
      `"${a.confirmed_time || ''}"`,
      `"${(a.admin_notes || '').replace(/"/g, '""')}"`,
      a.created_at || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Appointments exported to CSV.', 'success');
  };

  const totalCount = stats.pending + stats.confirmed + stats.completed + stats.cancelled;

  return (
    <div className="appt-admin">
      {/* ── KPI Metric Cards ────────────────────────────────────────── */}
      <div className="appt-admin__kpis">
        <div className="appt-kpi-card">
          <div>
            <div className="appt-kpi-label">Total Bookings</div>
            <div className="appt-kpi-val">{totalCount}</div>
          </div>
          <div className="appt-kpi-icon appt-kpi-icon--total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>

        <div className="appt-kpi-card" style={{ borderColor: '#fde68a' }}>
          <div>
            <div className="appt-kpi-label" style={{ color: '#b45309' }}>Pending Confirmation</div>
            <div className="appt-kpi-val" style={{ color: '#b45309' }}>{stats.pending}</div>
          </div>
          <div className="appt-kpi-icon appt-kpi-icon--pending">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        <div className="appt-kpi-card">
          <div>
            <div className="appt-kpi-label" style={{ color: '#047857' }}>Confirmed Visits</div>
            <div className="appt-kpi-val" style={{ color: '#047857' }}>{stats.confirmed}</div>
          </div>
          <div className="appt-kpi-icon appt-kpi-icon--confirmed">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>

        <div className="appt-kpi-card">
          <div>
            <div className="appt-kpi-label">Completed Tours</div>
            <div className="appt-kpi-val">{stats.completed}</div>
          </div>
          <div className="appt-kpi-icon appt-kpi-icon--completed">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Main Data Card ─────────────────────────────────────────── */}
      <div className="appt-admin__card">
        {/* Toolbar */}
        <div className="appt-admin__toolbar">
          {/* Status Tabs */}
          <div className="appt-admin__status-tabs">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`appt-status-tab ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && stats.pending > 0 && (
                  <span style={{
                    background: '#d97706',
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.4rem',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search, Sort, and Export */}
          <div className="appt-admin__actions">
            <div className="appt-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="appt-search-input"
                placeholder="Search visitor, child, phone..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <button
              type="button"
              className="appt-tool-btn"
              onClick={() => setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sort ${order === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {order === 'asc' ? (
                  <path d="M3 4h13M3 8h9M3 12h5m8 0l3 3 3-3m-3-6v9"/>
                ) : (
                  <path d="M3 4h13M3 8h9M3 12h5m8 3l3-3 3 3m-3 6V9"/>
                )}
              </svg>
              {order === 'asc' ? 'Earliest First' : 'Latest First'}
            </button>

            <button
              type="button"
              className="appt-tool-btn"
              onClick={handleExportCSV}
              title="Download Appointments CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="appt-table-container">
          {loading ? (
            <div className="appt-empty">
              <div className="spin" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0b1a30" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
              </div>
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="appt-empty">
              <div className="appt-empty__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>No Appointments Found</h3>
              <p style={{ fontSize: '0.9rem' }}>
                {search ? `No bookings matching "${search}"` : 'No appointments in this category yet.'}
              </p>
            </div>
          ) : (
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Parent / Visitor</th>
                  <th>Student &amp; Class</th>
                  <th>Purpose</th>
                  <th>Requested Slot</th>
                  <th>Status</th>
                  <th>Remarks / Confirmation</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id} className={item.status === 'pending' ? 'appt-row--pending' : ''}>
                    {/* ID */}
                    <td>
                      <span className="appt-id-badge">#{item.id}</span>
                    </td>

                    {/* Parent & Contact */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0b1a30' }}>{item.parent_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{item.phone}</span>
                        <button
                          type="button"
                          className="appt-copy-btn"
                          title="Copy phone"
                          onClick={() => handleCopy(item.phone, 'phone')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        <span>{item.email}</span>
                      </div>
                    </td>

                    {/* Student & Class */}
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.student_name || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                        {item.class_interested ? `Grade: ${item.class_interested}` : 'General Visit'}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td>
                      <span className="appt-purpose-tag">
                        {String(item.purpose || '').replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Date / Time */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#0b1a30' }}>
                        {fmtDate(item.preferred_date)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {item.preferred_time || 'Morning Slot'}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`appt-status-badge appt-status-badge--${item.status || 'pending'}`}>
                        {item.status || 'pending'}
                      </span>
                    </td>

                    {/* Notes / Confirmation */}
                    <td>
                      {item.confirmed_date && (
                        <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                          Confirmed: {fmtDate(item.confirmed_date)} {item.confirmed_time || ''}
                        </div>
                      )}
                      {item.admin_notes && (
                        <div style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', maxWidth: '200px' }}>
                          "{item.admin_notes}"
                        </div>
                      )}
                      {item.notes && !item.admin_notes && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Visitor: {item.notes}
                        </div>
                      )}
                      {!item.confirmed_date && !item.admin_notes && !item.notes && '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="appt-action-btn appt-action-btn--manage"
                          onClick={() => handleOpenManage(item)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Manage
                        </button>
                        <button
                          type="button"
                          className="appt-action-btn appt-action-btn--delete"
                          title="Delete appointment"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal: Manage / Confirm Appointment ─────────────────────── */}
      {manageTarget && (
        <div className="appt-modal-overlay" onClick={() => setManageTarget(null)}>
          <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="appt-modal__header">
              <h3 className="appt-modal__title">
                Manage Appointment #{manageTarget.id}
              </h3>
              <button
                type="button"
                className="appt-modal__close"
                onClick={() => setManageTarget(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveManage}>
              <div className="appt-modal__body">
                {/* Visitor Quick Info */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 700, color: '#0b1a30', marginBottom: '0.2rem' }}>
                    {manageTarget.parent_name} {manageTarget.student_name ? `(Student: ${manageTarget.student_name})` : ''}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    Phone: {manageTarget.phone} | Email: {manageTarget.email}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    Requested: {fmtDate(manageTarget.preferred_date)} ({manageTarget.preferred_time || 'Slot not specified'})
                  </div>
                  {manageTarget.notes && (
                    <div style={{ color: '#334155', fontSize: '0.82rem', marginTop: '0.4rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>
                      <strong>Visitor Note:</strong> {manageTarget.notes}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="appt-form-group">
                  <label className="appt-label">Appointment Status</label>
                  <select
                    className="appt-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="pending">Pending (Awaiting Confirmation)</option>
                    <option value="confirmed">Confirmed (Pass Issued)</option>
                    <option value="completed">Completed (Visit Done)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Confirmed Date & Time */}
                <div className="appt-form-row">
                  <div className="appt-form-group">
                    <label className="appt-label">Confirmed Date</label>
                    <input
                      type="date"
                      className="appt-input"
                      value={editConfirmedDate}
                      onChange={(e) => setEditConfirmedDate(e.target.value)}
                    />
                  </div>
                  <div className="appt-form-group">
                    <label className="appt-label">Confirmed Time Slot</label>
                    <input
                      type="text"
                      className="appt-input"
                      placeholder="e.g. 10:00 AM - 11:00 AM"
                      value={editConfirmedTime}
                      onChange={(e) => setEditConfirmedTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="appt-form-group">
                  <label className="appt-label">Internal Admin Remarks / Escort Details</label>
                  <textarea
                    className="appt-textarea"
                    rows="3"
                    placeholder="e.g. Assigned to Mrs. Roy (Head of Admissions). Meeting in Conference Room B."
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="appt-modal__footer">
                <button
                  type="button"
                  className="appt-btn-cancel"
                  onClick={() => setManageTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="appt-btn-save"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Delete Confirmation ──────────────────────────────── */}
      {deleteTarget && (
        <div className="appt-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="appt-modal__header">
              <h3 className="appt-modal__title" style={{ color: '#ef4444' }}>
                Confirm Deletion
              </h3>
              <button
                type="button"
                className="appt-modal__close"
                onClick={() => setDeleteTarget(null)}
              >
                &times;
              </button>
            </div>
            <div className="appt-modal__body">
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to delete appointment <strong>#{deleteTarget.id}</strong> for{' '}
                <strong>{deleteTarget.parent_name}</strong>?
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                This record will be permanently removed from the system.
              </p>
            </div>
            <div className="appt-modal__footer">
              <button
                type="button"
                className="appt-btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="appt-btn-danger"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
