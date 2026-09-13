// src/components/admin/FeesAdminTab.jsx
// Admin Management for Fee Structure and Scholarships
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getFees,
  createFee,
  updateFee,
  deleteFee,
  getAllScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from '../../api/fees';
import './FeesAdminTab.css';

const CLASS_OPTIONS = [
  'Nursery & KG',
  'Class 1 – 5',
  'Class 6 – 8',
  'Class 9 – 10',
  'Class 11 – 12',
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'All Classes',
];

const CATEGORY_OPTIONS = [
  'Tuition Fee',
  'Admission Fee',
  'Annual Charges',
  'Transport Fee',
  'Laboratory Fee',
  'Computer & Digital Learning',
  'Development Fee',
  'Sports & Activities',
  'Examination Fee',
  'Caution Deposit (Refundable)',
];

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

function fmtINR(val) {
  const num = Number(val);
  if (isNaN(num)) return `₹${val}`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

function SortArrow({ dir }) {
  return (
    <span className={`adm-sort-icon${dir ? ' active' : ''}`} aria-hidden="true">
      <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
        <path d="M4 0L0 4h8L4 0z" opacity={dir === 'asc' ? 1 : 0.3} />
        <path d="M4 12L8 8H0l4 4z" opacity={dir === 'desc' ? 1 : 0.3} />
      </svg>
    </span>
  );
}

export default function FeesAdminTab({ token, toast, onCountsUpdate }) {
  const [subTab, setSubTab] = useState('fees'); // 'fees' | 'scholarships'

  // ── Fee Structure State ──────────────────────────────────────────
  const [fees, setFees] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState('');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeSortCol, setFeeSortCol] = useState('display_order');
  const [feeSortDir, setFeeSortDir] = useState('asc');

  // Fee Modals
  const [feeAddOpen, setFeeAddOpen] = useState(false);
  const [feeEditTarget, setFeeEditTarget] = useState(null);
  const [feeDeleteTarget, setFeeDeleteTarget] = useState(null);

  // ── Scholarships State ───────────────────────────────────────────
  const [scholarships, setScholarships] = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [sError, setSError] = useState('');
  const [sSearch, setSSearch] = useState('');

  // Scholarship Modals
  const [sAddOpen, setSAddOpen] = useState(false);
  const [sEditTarget, setSEditTarget] = useState(null);
  const [sDeleteTarget, setSDeleteTarget] = useState(null);

  // ── Load Fees ───────────────────────────────────────────────────
  const fetchFeesList = useCallback(async () => {
    setFeesLoading(true);
    setFeesError('');
    try {
      const data = await getFees();
      setFees(Array.isArray(data) ? data : []);
      if (onCountsUpdate) onCountsUpdate(Array.isArray(data) ? data.length : 0, scholarships.length);
    } catch (err) {
      setFeesError('Failed to load fee structures. Ensure backend server is running.');
    } finally {
      setFeesLoading(false);
    }
  }, [onCountsUpdate, scholarships.length]);

  // ── Load Scholarships ────────────────────────────────────────────
  const fetchScholarshipsList = useCallback(async () => {
    setSLoading(true);
    setSError('');
    try {
      const data = await getAllScholarships(token);
      setScholarships(Array.isArray(data) ? data : []);
      if (onCountsUpdate) onCountsUpdate(fees.length, Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setSError('Failed to load scholarships list.');
    } finally {
      setSLoading(false);
    }
  }, [token, onCountsUpdate, fees.length]);

  useEffect(() => {
    fetchFeesList();
    fetchScholarshipsList();
  }, [fetchFeesList, fetchScholarshipsList]);

  // ── Fee Sorting & Filtering ─────────────────────────────────────
  const toggleFeeSort = (col) => {
    if (feeSortCol === col) {
      setFeeSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setFeeSortCol(col);
      setFeeSortDir('asc');
    }
  };

  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      if (!feeSearch.trim()) return true;
      const q = feeSearch.toLowerCase();
      return (
        (f.class_name || '').toLowerCase().includes(q) ||
        (f.category || '').toLowerCase().includes(q) ||
        (f.frequency || '').toLowerCase().includes(q) ||
        (f.notes || '').toLowerCase().includes(q) ||
        (f.academic_year || '').toLowerCase().includes(q)
      );
    });
  }, [fees, feeSearch]);

  const sortedFees = useMemo(() => {
    return [...filteredFees].sort((a, b) => {
      let va = a[feeSortCol];
      let vb = b[feeSortCol];
      if (feeSortCol === 'amount' || feeSortCol === 'display_order' || feeSortCol === 'id') {
        va = Number(va || 0);
        vb = Number(vb || 0);
      } else {
        va = (va || '').toString().toLowerCase();
        vb = (vb || '').toString().toLowerCase();
      }
      if (va < vb) return feeSortDir === 'asc' ? -1 : 1;
      if (va > vb) return feeSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredFees, feeSortCol, feeSortDir]);

  // ── Scholarship Sorting & Filtering ─────────────────────────────
  const filteredScholarships = useMemo(() => {
    return scholarships
      .filter(s => {
        if (!sSearch.trim()) return true;
        const q = sSearch.toLowerCase();
        return (
          (s.title || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.applicable_classes || '').toLowerCase().includes(q) ||
          (s.eligibility_criteria || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [scholarships, sSearch]);

  // ── Fee CRUD Handlers ───────────────────────────────────────────
  const handleFeeCreated = (newFee) => {
    setFees(prev => [...prev, newFee]);
    setFeeAddOpen(false);
    toast('Fee structure added successfully!', 'success');
  };

  const handleFeeUpdated = (updated) => {
    setFees(prev => prev.map(f => (f.id === updated.id ? updated : f)));
    setFeeEditTarget(null);
    toast('Fee structure updated.', 'success');
  };

  const handleFeeDeleted = (id) => {
    setFees(prev => prev.filter(f => f.id !== id));
    setFeeDeleteTarget(null);
    toast('Fee structure deleted.', 'success');
  };

  // ── Scholarship CRUD Handlers ───────────────────────────────────
  const handleScholarshipCreated = (newSch) => {
    setScholarships(prev => [...prev, newSch]);
    setSAddOpen(false);
    toast('Scholarship scheme created!', 'success');
  };

  const handleScholarshipUpdated = (updated) => {
    setScholarships(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setSEditTarget(null);
    toast('Scholarship updated.', 'success');
  };

  const handleScholarshipDeleted = (id) => {
    setScholarships(prev => prev.filter(s => s.id !== id));
    setSDeleteTarget(null);
    toast('Scholarship removed.', 'success');
  };

  const handleToggleActive = async (sch) => {
    try {
      const updated = await updateScholarship(sch.id, { is_active: !sch.is_active }, token);
      setScholarships(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      toast(updated.is_active ? 'Scholarship activated.' : 'Scholarship marked inactive.', 'info');
    } catch (err) {
      toast('Failed to update scholarship status.', 'error');
    }
  };

  const handleReorderScholarship = async (sch, delta) => {
    const newOrder = Math.max(0, (sch.display_order || 0) + delta);
    try {
      const updated = await updateScholarship(sch.id, { display_order: newOrder }, token);
      setScholarships(prev =>
        prev.map(s => (s.id === updated.id ? updated : s)).sort((a, b) => a.display_order - b.display_order)
      );
      toast(`Order updated to ${newOrder}`, 'info');
    } catch (err) {
      toast('Failed to reorder scholarship.', 'error');
    }
  };

  return (
    <div className="adm-fees-tab">
      {/* ── Sub-tab Switcher Header ───────────────────────────────── */}
      <div className="adm-fees-subtabs">
        <button
          type="button"
          className={`adm-fees-subtab-btn ${subTab === 'fees' ? 'active' : ''}`}
          onClick={() => setSubTab('fees')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          Fee Structures
          <span className="adm-tab-badge">{fees.length}</span>
        </button>

        <button
          type="button"
          className={`adm-fees-subtab-btn ${subTab === 'scholarships' ? 'active' : ''}`}
          onClick={() => setSubTab('scholarships')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Scholarships &amp; Concessions
          <span className="adm-tab-badge">{scholarships.length}</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* SUB-TAB 1: FEE STRUCTURE TABLE                                */}
      {/* ============================================================= */}
      {subTab === 'fees' && (
        <div className="adm-card">
          <div className="adm-card__header">
            <h2 className="adm-card__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Class-Wise Fee Schedule
            </h2>

            <div className="adm-table-toolbar">
              <div className="adm-search-wrap">
                <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="search"
                  className="adm-search-input"
                  placeholder="Search by class, category, notes…"
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                  aria-label="Search fee structures"
                />
              </div>

              <span className="adm-table-count" aria-live="polite">
                {feesLoading ? '…' : `${sortedFees.length} row${sortedFees.length !== 1 ? 's' : ''}`}
              </span>

              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                onClick={fetchFeesList}
                title="Refresh fee list"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>

              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setFeeAddOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Fee Row
              </button>
            </div>
          </div>

          {feesError && (
            <div className="adm-error-banner" style={{ margin: '1rem 1.5rem 0' }} role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {feesError}
            </div>
          )}

          <div className="adm-table-wrap">
            <table className="adm-table" aria-label="Fee structures table">
              <thead>
                <tr>
                  <th
                    className={`sortable${feeSortCol === 'display_order' ? ' sorted' : ''}`}
                    onClick={() => toggleFeeSort('display_order')}
                    style={{ width: 80, textAlign: 'center' }}
                  >
                    Order <SortArrow dir={feeSortCol === 'display_order' ? feeSortDir : null} />
                  </th>
                  <th
                    className={`sortable${feeSortCol === 'class_name' ? ' sorted' : ''}`}
                    onClick={() => toggleFeeSort('class_name')}
                    style={{ minWidth: 150 }}
                  >
                    Class / Grade <SortArrow dir={feeSortCol === 'class_name' ? feeSortDir : null} />
                  </th>
                  <th
                    className={`sortable${feeSortCol === 'category' ? ' sorted' : ''}`}
                    onClick={() => toggleFeeSort('category')}
                    style={{ minWidth: 160 }}
                  >
                    Category <SortArrow dir={feeSortCol === 'category' ? feeSortDir : null} />
                  </th>
                  <th
                    className={`sortable${feeSortCol === 'amount' ? ' sorted' : ''}`}
                    onClick={() => toggleFeeSort('amount')}
                    style={{ width: 140, textAlign: 'right' }}
                  >
                    Amount <SortArrow dir={feeSortCol === 'amount' ? feeSortDir : null} />
                  </th>
                  <th
                    className={`sortable${feeSortCol === 'frequency' ? ' sorted' : ''}`}
                    onClick={() => toggleFeeSort('frequency')}
                    style={{ width: 130 }}
                  >
                    Frequency <SortArrow dir={feeSortCol === 'frequency' ? feeSortDir : null} />
                  </th>
                  <th style={{ width: 110 }}>Academic Year</th>
                  <th style={{ minWidth: 200 }}>Notes</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feesLoading && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="adm-skeleton-row">
                    <td><div className="adm-skeleton-block" style={{ width: 30, margin: '0 auto' }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 110 }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 130 }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 80, marginLeft: 'auto' }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 70 }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 65 }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: '85%' }} /></td>
                    <td><div className="adm-skeleton-block" style={{ width: 70, marginLeft: 'auto' }} /></td>
                  </tr>
                ))}
                {!feesLoading && sortedFees.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="adm-table-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        <br />
                        {feeSearch ? `No fee records matched "${feeSearch}"` : 'No fee structures recorded yet — click "Add Fee Row" above.'}
                      </div>
                    </td>
                  </tr>
                )}
                {!feesLoading && sortedFees.map(fee => (
                  <tr key={fee.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                      {fee.display_order}
                    </td>
                    <td>
                      <strong style={{ color: '#0f1d38' }}>{fee.class_name}</strong>
                    </td>
                    <td>
                      <span className="adm-fee-category-badge">{fee.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-display, serif)', fontSize: '1.02rem', color: '#0f1d38' }}>
                      {fmtINR(fee.amount)}
                    </td>
                    <td>
                      <span className={`adm-freq-tag adm-freq-tag--${fee.frequency}`}>
                        {fee.frequency}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {fee.academic_year}
                    </td>
                    <td style={{ fontSize: '0.86rem', color: '#475569', maxWidth: 280 }}>
                      {fee.notes || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="adm-table-actions">
                        <button
                          type="button"
                          className="adm-btn adm-btn--ghost adm-btn--sm"
                          onClick={() => setFeeEditTarget(fee)}
                          title="Edit fee row"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn--danger adm-btn--sm"
                          onClick={() => setFeeDeleteTarget(fee)}
                          title="Delete fee row"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUB-TAB 2: SCHOLARSHIPS MANAGEMENT                           */}
      {/* ============================================================= */}
      {subTab === 'scholarships' && (
        <div className="adm-card">
          <div className="adm-card__header">
            <h2 className="adm-card__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Active &amp; Inactive Scholarship Schemes
            </h2>

            <div className="adm-table-toolbar">
              <div className="adm-search-wrap">
                <svg className="adm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="search"
                  className="adm-search-input"
                  placeholder="Search scholarships…"
                  value={sSearch}
                  onChange={(e) => setSSearch(e.target.value)}
                  aria-label="Search scholarships"
                />
              </div>

              <span className="adm-table-count" aria-live="polite">
                {sLoading ? '…' : `${filteredScholarships.length} scheme${filteredScholarships.length !== 1 ? 's' : ''}`}
              </span>

              <button
                type="button"
                className="adm-btn adm-btn--ghost"
                onClick={fetchScholarshipsList}
                title="Refresh scholarships"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>

              <button
                type="button"
                className="adm-btn adm-btn--primary"
                onClick={() => setSAddOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Scholarship
              </button>
            </div>
          </div>

          {sError && (
            <div className="adm-error-banner" style={{ margin: '1rem 1.5rem 0' }} role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {sError}
            </div>
          )}

          <div className="adm-card__body">
            {sLoading && (
              <div className="adm-scholarship-cards-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="adm-sch-skeleton" />
                ))}
              </div>
            )}

            {!sLoading && filteredScholarships.length === 0 && (
              <div className="adm-table-empty" style={{ padding: '3.5rem 1rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <br />
                {sSearch ? `No scholarships matched "${sSearch}"` : 'No scholarships added yet — click "Add Scholarship" to begin.'}
              </div>
            )}

            {!sLoading && (
              <div className="adm-scholarship-cards-grid">
                {filteredScholarships.map(sch => (
                  <div
                    key={sch.id}
                    className={`adm-sch-card ${!sch.is_active ? 'inactive' : ''}`}
                  >
                    <div className="adm-sch-card__header">
                      <div className="adm-sch-card__badges">
                        <span className={`adm-status-chip ${sch.is_active ? 'active' : 'inactive'}`}>
                          {sch.is_active ? '● Active' : '○ Inactive'}
                        </span>
                        <span className="adm-order-tag">Order: #{sch.display_order}</span>
                      </div>

                      <div className="adm-order-btns">
                        <button
                          type="button"
                          className="adm-order-btn"
                          title="Move Up"
                          onClick={() => handleReorderScholarship(sch, -1)}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="adm-order-btn"
                          title="Move Down"
                          onClick={() => handleReorderScholarship(sch, 1)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="adm-sch-card__body">
                      <div className="adm-sch-card__discount-banner">
                        <span className="adm-sch-card__discount-val">
                          {sch.discount_type === 'percentage'
                            ? `${sch.discount_value}% OFF`
                            : `${fmtINR(sch.discount_value)} CONCESSION`}
                        </span>
                        <span className="adm-sch-card__classes">
                          {sch.applicable_classes}
                        </span>
                      </div>

                      <h3 className="adm-sch-card__title">{sch.title}</h3>
                      <p className="adm-sch-card__desc">{sch.description}</p>

                      <div className="adm-sch-card__info-row">
                        <strong>Eligibility:</strong>
                        <span>{sch.eligibility_criteria}</span>
                      </div>

                      <div className="adm-sch-card__info-row">
                        <strong>How to Apply:</strong>
                        <span>{sch.how_to_apply}</span>
                      </div>
                    </div>

                    <div className="adm-sch-card__footer">
                      <label className="adm-toggle-label">
                        <input
                          type="checkbox"
                          checked={sch.is_active}
                          onChange={() => handleToggleActive(sch)}
                        />
                        <span className="adm-toggle-slider" />
                        <span className="adm-toggle-text">
                          {sch.is_active ? 'Publicly Visible' : 'Hidden'}
                        </span>
                      </label>

                      <div className="adm-card-actions">
                        <button
                          type="button"
                          className="adm-btn adm-btn--ghost adm-btn--sm"
                          onClick={() => setSEditTarget(sch)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn--danger adm-btn--sm"
                          onClick={() => setSDeleteTarget(sch)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODALS: FEE STRUCTURE ADD / EDIT / DELETE                     */}
      {/* ============================================================= */}
      {feeAddOpen && (
        <FeeFormModal
          mode="add"
          token={token}
          onSuccess={handleFeeCreated}
          onClose={() => setFeeAddOpen(false)}
        />
      )}

      {feeEditTarget && (
        <FeeFormModal
          mode="edit"
          fee={feeEditTarget}
          token={token}
          onSuccess={handleFeeUpdated}
          onClose={() => setFeeEditTarget(null)}
        />
      )}

      {feeDeleteTarget && (
        <DeleteConfirmModal
          title="Delete Fee Structure"
          message={`Are you sure you want to delete ${feeDeleteTarget.category} for "${feeDeleteTarget.class_name}" (${fmtINR(feeDeleteTarget.amount)})? This cannot be undone.`}
          onConfirm={async () => {
            await deleteFee(feeDeleteTarget.id, token);
            handleFeeDeleted(feeDeleteTarget.id);
          }}
          onClose={() => setFeeDeleteTarget(null)}
        />
      )}

      {/* ============================================================= */}
      {/* MODALS: SCHOLARSHIP ADD / EDIT / DELETE                      */}
      {/* ============================================================= */}
      {sAddOpen && (
        <ScholarshipFormModal
          mode="add"
          token={token}
          onSuccess={handleScholarshipCreated}
          onClose={() => setSAddOpen(false)}
        />
      )}

      {sEditTarget && (
        <ScholarshipFormModal
          mode="edit"
          scholarship={sEditTarget}
          token={token}
          onSuccess={handleScholarshipUpdated}
          onClose={() => setSEditTarget(null)}
        />
      )}

      {sDeleteTarget && (
        <DeleteConfirmModal
          title="Delete Scholarship"
          message={`Are you sure you want to delete "${sDeleteTarget.title}"? This cannot be undone.`}
          onConfirm={async () => {
            await deleteScholarship(sDeleteTarget.id, token);
            handleScholarshipDeleted(sDeleteTarget.id);
          }}
          onClose={() => setSDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fee Form Modal (Add / Edit)
// ─────────────────────────────────────────────────────────────────────────────
function FeeFormModal({ mode, fee, token, onSuccess, onClose }) {
  const [className, setClassName] = useState(fee?.class_name || CLASS_OPTIONS[0]);
  const [customClass, setCustomClass] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(
    fee ? !CLASS_OPTIONS.includes(fee.class_name) : false
  );

  const [category, setCategory] = useState(fee?.category || CATEGORY_OPTIONS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(
    fee ? !CATEGORY_OPTIONS.includes(fee.category) : false
  );

  const [amount, setAmount] = useState(fee?.amount || '');
  const [frequency, setFrequency] = useState(fee?.frequency || 'annual');
  const [academicYear, setAcademicYear] = useState(fee?.academic_year || '2027-28');
  const [notes, setNotes] = useState(fee?.notes || '');
  const [displayOrder, setDisplayOrder] = useState(fee?.display_order ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalClass = isCustomClass ? customClass.trim() : className;
    const finalCat = isCustomCat ? customCategory.trim() : category;

    if (!finalClass) { setError('Class name is required.'); return; }
    if (!finalCat) { setError('Category is required.'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      setError('Please provide a valid non-negative amount.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      class_name: finalClass,
      category: finalCat,
      amount: Number(amount),
      frequency,
      academic_year: academicYear.trim() || '2027-28',
      notes: notes.trim() || null,
      display_order: Number(displayOrder) || 0,
    };

    try {
      if (mode === 'add') {
        const res = await createFee(payload, token);
        onSuccess(res);
      } else {
        const res = await updateFee(fee.id, payload, token);
        onSuccess(res);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">
            {mode === 'add' ? 'Add Fee Structure Row' : 'Edit Fee Structure Row'}
          </h3>
          <button type="button" className="adm-modal__close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="adm-form-grid">
              {/* Class name dropdown / custom */}
              <div className="adm-field">
                <label className="adm-label">Class / Grade <span>*</span></label>
                {!isCustomClass ? (
                  <select
                    className="adm-select"
                    value={className}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setIsCustomClass(true);
                      } else {
                        setClassName(e.target.value);
                      }
                    }}
                  >
                    {CLASS_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">+ Enter Custom Class Name...</option>
                  </select>
                ) : (
                  <div className="adm-custom-input-wrap">
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Playgroup / Daycare"
                      value={customClass}
                      onChange={e => setCustomClass(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      onClick={() => setIsCustomClass(false)}
                    >
                      Use Dropdown
                    </button>
                  </div>
                )}
              </div>

              {/* Category dropdown / custom */}
              <div className="adm-field">
                <label className="adm-label">Fee Category <span>*</span></label>
                {!isCustomCat ? (
                  <select
                    className="adm-select"
                    value={category}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCat(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__custom__">+ Enter Custom Category...</option>
                  </select>
                ) : (
                  <div className="adm-custom-input-wrap">
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Swimming Club Fee"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      onClick={() => setIsCustomCat(false)}
                    >
                      Use Dropdown
                    </button>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="adm-field">
                <label className="adm-label">Amount (INR ₹) <span>*</span></label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="adm-input"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Frequency */}
              <div className="adm-field">
                <label className="adm-label">Billing Frequency <span>*</span></label>
                <select
                  className="adm-select"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                >
                  {FREQUENCY_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="adm-field">
                <label className="adm-label">Academic Session</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="2027-28"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                />
              </div>

              {/* Display Order */}
              <div className="adm-field">
                <label className="adm-label">Display Sequence</label>
                <input
                  type="number"
                  className="adm-input"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="adm-field" style={{ marginTop: '0.85rem' }}>
              <label className="adm-label">Notes / Description (Optional)</label>
              <textarea
                className="adm-textarea"
                rows="2"
                placeholder="e.g. Payable once at enrollment, includes activity kit..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? 'Saving…' : mode === 'add' ? 'Create Fee Row' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scholarship Form Modal (Add / Edit)
// ─────────────────────────────────────────────────────────────────────────────
function ScholarshipFormModal({ mode, scholarship, token, onSuccess, onClose }) {
  const [title, setTitle] = useState(scholarship?.title || '');
  const [description, setDescription] = useState(scholarship?.description || '');
  const [eligibilityCriteria, setEligibilityCriteria] = useState(scholarship?.eligibility_criteria || '');
  const [discountType, setDiscountType] = useState(scholarship?.discount_type || 'percentage');
  const [discountValue, setDiscountValue] = useState(scholarship?.discount_value || '');
  const [applicableClasses, setApplicableClasses] = useState(scholarship?.applicable_classes || 'Class 6 – 10');
  const [howToApply, setHowToApply] = useState(scholarship?.how_to_apply || '');
  const [displayOrder, setDisplayOrder] = useState(scholarship?.display_order ?? 1);
  const [isActive, setIsActive] = useState(scholarship ? scholarship.is_active : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!eligibilityCriteria.trim()) { setError('Eligibility criteria is required.'); return; }
    if (!howToApply.trim()) { setError('How to apply instructions are required.'); return; }
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      setError('Please provide a valid discount value greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      eligibility_criteria: eligibilityCriteria.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      applicable_classes: applicableClasses.trim(),
      how_to_apply: howToApply.trim(),
      display_order: Number(displayOrder) || 0,
      is_active: Boolean(isActive),
    };

    try {
      if (mode === 'add') {
        const res = await createScholarship(payload, token);
        onSuccess(res);
      } else {
        const res = await updateScholarship(scholarship.id, payload, token);
        onSuccess(res);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">
            {mode === 'add' ? 'Create Scholarship Scheme' : 'Edit Scholarship Scheme'}
          </h3>
          <button type="button" className="adm-modal__close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div className="adm-field">
              <label className="adm-label">Scholarship Title <span>*</span></label>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. Merit Scholarship / Sibling Concession"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="adm-form-grid" style={{ marginTop: '0.85rem' }}>
              <div className="adm-field">
                <label className="adm-label">Discount Type <span>*</span></label>
                <select
                  className="adm-select"
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="adm-field">
                <label className="adm-label">
                  Discount Value ({discountType === 'percentage' ? '%' : '₹'}) <span>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step={discountType === 'percentage' ? '1' : '100'}
                  max={discountType === 'percentage' ? '100' : '1000000'}
                  className="adm-input"
                  placeholder={discountType === 'percentage' ? '25' : '15000'}
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  required
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Applicable Classes <span>*</span></label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. Class 6 – 10 or Nursery – Class 12"
                  value={applicableClasses}
                  onChange={e => setApplicableClasses(e.target.value)}
                  required
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Display Order</label>
                <input
                  type="number"
                  className="adm-input"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="adm-field" style={{ marginTop: '0.85rem' }}>
              <label className="adm-label">Summary / Description <span>*</span></label>
              <textarea
                className="adm-textarea"
                rows="2"
                placeholder="A brief overview of the concession or scholarship purpose…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="adm-field" style={{ marginTop: '0.85rem' }}>
              <label className="adm-label">Eligibility Criteria <span>*</span></label>
              <textarea
                className="adm-textarea"
                rows="2"
                placeholder="e.g. Minimum 90% aggregate score in previous annual examination…"
                value={eligibilityCriteria}
                onChange={e => setEligibilityCriteria(e.target.value)}
                required
              />
            </div>

            <div className="adm-field" style={{ marginTop: '0.85rem' }}>
              <label className="adm-label">How to Apply <span>*</span></label>
              <textarea
                className="adm-textarea"
                rows="2"
                placeholder="e.g. Submit previous mark sheet and parent declaration to Admissions office by 30th April…"
                value={howToApply}
                onChange={e => setHowToApply(e.target.value)}
                required
              />
            </div>

            <div className="adm-checkbox-row" style={{ marginTop: '1rem' }}>
              <input
                type="checkbox"
                id="sch-is-active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <label htmlFor="sch-is-active" style={{ fontWeight: 600, color: '#0f1d38', cursor: 'pointer' }}>
                Active &amp; Visible to Parents on Public Fees Page
              </label>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? 'Saving…' : mode === 'add' ? 'Create Scholarship' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Delete Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({ title, message, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="adm-modal__header">
          <h3 className="adm-modal__title" style={{ color: '#b91c1c' }}>{title}</h3>
          <button type="button" className="adm-modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="adm-modal__body">
          <p style={{ fontSize: '0.94rem', lineHeight: 1.55, color: '#334155', margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="adm-modal__footer">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--danger" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
