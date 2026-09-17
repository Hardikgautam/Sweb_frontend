// src/components/admin/AnalyticsTab.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceArea,
} from 'recharts';
import {
  getEnquiriesAnalytics,
  getNewsletterAnalytics,
  getVisitorsAnalytics,
  getVisitorsTable,
} from '../../api/analytics';
import {
  fallbackEnquiries,
  fallbackNewsletter,
  fallbackVisitors,
  fallbackVisitorTable,
} from '../../config/analyticsFallback';
import './AnalyticsTab.css';

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function parseBrowser(userAgent) {
  if (!userAgent) return 'Web Browser';
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Microsoft Edge';
  if (ua.includes('chrome/')) return 'Google Chrome';
  if (ua.includes('firefox/')) return 'Mozilla Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Apple Safari';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile Device';
  return 'Standard Browser';
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltips
// ─────────────────────────────────────────────────────────────────────────────

function EnquiriesCustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="an-tooltip">
      <div className="an-tooltip-title">
        <span>📅</span>
        <span>{data.month_name} {data.year}</span>
      </div>
      <div className="an-tooltip-row">
        <span>Admission Queries:</span>
        <strong>{data.count}</strong>
      </div>
      {data.is_peak_season ? (
        <div className="an-tooltip-peak-note">
          ⭐ India CBSE Admission Peak Season (Jan – Apr)
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
          Standard Academic Term
        </div>
      )}
    </div>
  );
}

function NewsletterCustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="an-tooltip">
      <div className="an-tooltip-title">
        <span>📬</span>
        <span>{data.month_name} {data.year}</span>
      </div>
      <div className="an-tooltip-row">
        <span>New Subscribers:</span>
        <strong>{data.count}</strong>
      </div>
      <div className="an-tooltip-row">
        <span>Cumulative Total:</span>
        <strong>{data.cumulative_count || '—'}</strong>
      </div>
    </div>
  );
}

function VisitorsCustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="an-tooltip">
      <div className="an-tooltip-title">
        <span>👁️</span>
        <span>{item.label || item.month_name || item.year}</span>
      </div>
      <div className="an-tooltip-row">
        <span>Total Visits:</span>
        <strong>{item.count}</strong>
      </div>
      {item.unique_visitors !== undefined && (
        <div className="an-tooltip-row">
          <span>Unique Visitors:</span>
          <strong>{item.unique_visitors}</strong>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsTab({ token, toast }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);

  // Data states with immediate fallback data (prevents blank charts on load or when backend is starting)
  const [enquiriesData, setEnquiriesData] = useState(fallbackEnquiries);
  const [newsletterData, setNewsletterData] = useState(fallbackNewsletter);
  const [visitorsData, setVisitorsData] = useState(fallbackVisitors);
  const [visitorTableData, setVisitorTableData] = useState(fallbackVisitorTable);

  // View & Pagination
  const [visitorView, setVisitorView] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  const [tablePage, setTablePage] = useState(1);
  const tableLimit = 20;

  // Loading flags (false initially because fallback data is already ready!)
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  // ── Load Charts Data ────────────────────────────────────────────────────────
  const fetchAllAnalytics = useCallback(async (year) => {
    try {
      const [enq, news, vis] = await Promise.all([
        getEnquiriesAnalytics(year, token).catch(() => null),
        getNewsletterAnalytics(year, token).catch(() => null),
        getVisitorsAnalytics(year, token).catch(() => null),
      ]);

      if (enq && enq.monthly_data && enq.monthly_data.length > 0) {
        setEnquiriesData(enq);
      }
      if (news && news.monthly_data && news.monthly_data.length > 0) {
        setNewsletterData(news);
      }
      if (vis && (vis.daily || vis.monthly)) {
        setVisitorsData(vis);
      }

      // Merge available years from responses
      const yearsSet = new Set([
        currentYear,
        ...(enq?.available_years || []),
        ...(news?.available_years || []),
        ...(vis?.available_years || []),
        ...(fallbackEnquiries.available_years || []),
      ]);
      setAvailableYears(Array.from(yearsSet).sort((a, b) => b - a));
    } catch (err) {
      console.warn('[Analytics Live API skipped/fallback kept]', err);
    }
  }, [token, currentYear]);

  // ── Load Visitor Table Data ─────────────────────────────────────────────────
  const fetchVisitorTable = useCallback(async (page) => {
    setLoadingTable(true);
    try {
      const res = await getVisitorsTable(page, tableLimit, token);
      setVisitorTableData(res || { total: 0, items: [] });
    } catch (err) {
      console.error('[Visitor Table Error]', err);
    } finally {
      setLoadingTable(false);
    }
  }, [token, tableLimit]);

  useEffect(() => {
    fetchAllAnalytics(selectedYear);
  }, [selectedYear, fetchAllAnalytics]);

  useEffect(() => {
    fetchVisitorTable(tablePage);
  }, [tablePage, fetchVisitorTable]);

  // ── Derived Metrics: Enquiries ──────────────────────────────────────────────
  const enquiryMetrics = useMemo(() => {
    if (!enquiriesData) return { total: 0, peakTotal: 0, peakPct: 0, peakMonth: '—' };
    const total = enquiriesData.total || 0;
    const peakTotal = enquiriesData.peak_season_total || 0;
    const peakPct = total > 0 ? Math.round((peakTotal / total) * 100) : 0;

    let maxCnt = -1;
    let peakMonth = '—';
    (enquiriesData.monthly_data || []).forEach((m) => {
      if (m.count > maxCnt) {
        maxCnt = m.count;
        peakMonth = `${m.month_name} (${m.count})`;
      }
    });

    return { total, peakTotal, peakPct, peakMonth };
  }, [enquiriesData]);

  // ── Derived Metrics: Newsletter ─────────────────────────────────────────────
  const newsletterMetrics = useMemo(() => {
    if (!newsletterData) return { totalYear: 0, totalAllTime: 0, peakMonth: '—' };
    let maxCnt = -1;
    let peakMonth = '—';
    (newsletterData.monthly_data || []).forEach((m) => {
      if (m.count > maxCnt) {
        maxCnt = m.count;
        peakMonth = `${m.month_name} (${m.count})`;
      }
    });
    return {
      totalYear: newsletterData.total_year || 0,
      totalAllTime: newsletterData.total_all_time || 0,
      peakMonth,
    };
  }, [newsletterData]);

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!visitorTableData?.items?.length) {
      toast?.('No visitor records to export', 'info');
      return;
    }
    const headers = ['ID', 'Visit Time (ISO)', 'Page Visited', 'Masked Identifier', 'User Agent'];
    const rows = visitorTableData.items.map((it) => [
      it.id,
      `"${it.visited_at}"`,
      `"${it.page}"`,
      `"${it.ip_hash_masked}"`,
      `"${(it.user_agent || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenwood_visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast?.('Visitor log CSV downloaded successfully', 'success');
  };

  const totalPages = Math.max(1, Math.ceil((visitorTableData.total || 0) / tableLimit));

  return (
    <div className="an-wrap">
      {/* ──────────────── Top Controls & Year Selector ──────────────── */}
      <div className="an-header">
        <div className="an-title-group">
          <h2>
            <span>📊</span> Analytics & Visitor Intelligence
          </h2>
          <p className="an-subtitle">
            Comprehensive graphical analysis of admission enquiries, newsletter subscribers, and website visitor traffic.
          </p>
        </div>

        <div className="an-controls">
          <label htmlFor="an-year-select" className="an-select-label">
            Target Year:
          </label>
          <select
            id="an-year-select"
            className="an-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr} Academic Year
              </option>
            ))}
          </select>

          <button
            type="button"
            className="an-refresh-btn"
            onClick={() => {
              fetchAllAnalytics(selectedYear);
              fetchVisitorTable(tablePage);
              toast?.('Analytics refreshed with latest data', 'info');
            }}
            title="Refresh All Analytics"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ──────────────── KPI Summary Cards Grid ──────────────── */}
      <div className="an-stats-grid">
        <div className="an-stat-card gold">
          <span className="an-stat-label">Admission Queries ({selectedYear})</span>
          <span className="an-stat-value">{enquiryMetrics.total}</span>
          <div className="an-stat-meta">
            <span className="an-stat-badge">⭐ {enquiryMetrics.peakPct}% in Peak Season</span>
            <span>(Jan–Apr)</span>
          </div>
        </div>

        <div className="an-stat-card crimson">
          <span className="an-stat-label">Newsletter Subscribers</span>
          <span className="an-stat-value">{newsletterMetrics.totalAllTime}</span>
          <div className="an-stat-meta">
            <span>+{newsletterMetrics.totalYear} joined in {selectedYear}</span>
          </div>
        </div>

        <div className="an-stat-card teal">
          <span className="an-stat-label">Website Visits Today</span>
          <span className="an-stat-value">{visitorsData?.today_visitors ?? 0}</span>
          <div className="an-stat-meta">
            <span>{visitorsData?.this_month_visitors ?? 0} this month</span>
          </div>
        </div>

        <div className="an-stat-card">
          <span className="an-stat-label">All-Time Unique Visitors</span>
          <span className="an-stat-value">{visitorsData?.unique_visitors_all_time ?? 0}</span>
          <div className="an-stat-meta">
            <span>{visitorsData?.total_visitors ?? 0} total lifetime page views</span>
          </div>
        </div>
      </div>

      {/* ──────────────── SECTION 1: Admission Enquiries Graph ──────────────── */}
      <div className="an-section">
        <div className="an-section-header">
          <div>
            <h3 className="an-section-title">
              <span>🏫</span> Admission Queries by Month — {selectedYear}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Analyst View: Highlights India's primary CBSE admission window (January – April) in gold.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="an-legend-pill">
              <span className="an-color-dot" style={{ background: '#d4af37' }} />
              India Peak Season (Jan – Apr)
            </span>
            <span className="an-legend-pill">
              <span className="an-color-dot" style={{ background: '#0b1a30' }} />
              Off-Season Months
            </span>
          </div>
        </div>

        {loadingCharts ? (
          <div className="an-skeleton" style={{ height: '330px' }} />
        ) : (
          <div className="an-chart-container">
            <ResponsiveContainer width="100%" height={330} minWidth={100} minHeight={330}>
              <BarChart
                data={enquiriesData?.monthly_data || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month_name"
                  tickLine={false}
                  stroke="#64748b"
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<EnquiriesCustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Queries">
                  {(enquiriesData?.monthly_data || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.is_peak_season ? '#d4af37' : '#0b1a30'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ──────────────── SECTION 2: Newsletter Subscribers Graph ──────────────── */}
      <div className="an-section">
        <div className="an-section-header">
          <div>
            <h3 className="an-section-title">
              <span>📬</span> Newsletter Subscriber Growth — {selectedYear}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Monthly acquisitions (bars/area) with cumulative total trajectory line.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="an-legend-pill">
              <span className="an-color-dot" style={{ background: '#8b1528' }} />
              New Subscribers
            </span>
            <span className="an-legend-pill">
              <span className="an-color-dot" style={{ background: '#d4af37' }} />
              Cumulative Total
            </span>
          </div>
        </div>

        {loadingCharts ? (
          <div className="an-skeleton" style={{ height: '330px' }} />
        ) : (
          <div className="an-chart-container">
            <ResponsiveContainer width="100%" height={330} minWidth={100} minHeight={330}>
              <AreaChart
                data={newsletterData?.monthly_data || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b1528" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b1528" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month_name"
                  tickLine={false}
                  stroke="#64748b"
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<NewsletterCustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b1528"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubscribers)"
                  name="New Subscribers"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative_count"
                  stroke="#d4af37"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#d4af37' }}
                  name="Cumulative Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ──────────────── SECTION 3: Website Visitor Analytics ──────────────── */}
      <div className="an-section">
        <div className="an-section-header">
          <div>
            <h3 className="an-section-title">
              <span>👁️</span> Website Visitor Traffic Trends
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Track visitor volumes everyday (last 30 days), every month, or every year.
            </p>
          </div>

          <div className="an-subtabs">
            <button
              type="button"
              className={`an-subtab-btn ${visitorView === 'daily' ? 'active' : ''}`}
              onClick={() => setVisitorView('daily')}
            >
              Daily (Last 30 Days)
            </button>
            <button
              type="button"
              className={`an-subtab-btn ${visitorView === 'monthly' ? 'active' : ''}`}
              onClick={() => setVisitorView('monthly')}
            >
              Monthly ({selectedYear})
            </button>
            <button
              type="button"
              className={`an-subtab-btn ${visitorView === 'yearly' ? 'active' : ''}`}
              onClick={() => setVisitorView('yearly')}
            >
              Every Year
            </button>
          </div>
        </div>

        {loadingCharts ? (
          <div className="an-skeleton" style={{ height: '330px' }} />
        ) : (
          <div className="an-chart-container">
            <ResponsiveContainer width="100%" height={330}>
              {visitorView === 'daily' ? (
                <BarChart
                  data={visitorsData?.daily || []}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    stroke="#64748b"
                    interval={2}
                    tick={{ fill: '#475569', fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip content={<VisitorsCustomTooltip />} />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} name="Total Visits" />
                  <Bar dataKey="unique_visitors" fill="#0d9488" radius={[4, 4, 0, 0]} name="Unique Visitors" />
                  <Legend />
                </BarChart>
              ) : visitorView === 'monthly' ? (
                <BarChart
                  data={visitorsData?.monthly || []}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month_name"
                    tickLine={false}
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip content={<VisitorsCustomTooltip />} />
                  <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} name="Visits" />
                  <Bar dataKey="unique_visitors" fill="#d4af37" radius={[6, 6, 0, 0]} name="Unique Visitors" />
                  <Legend />
                </BarChart>
              ) : (
                <BarChart
                  data={visitorsData?.yearly || []}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip content={<VisitorsCustomTooltip />} />
                  <Bar dataKey="count" fill="#0b1a30" radius={[6, 6, 0, 0]} name="Yearly Visits" />
                  <Bar dataKey="unique_visitors" fill="#8b1528" radius={[6, 6, 0, 0]} name="Unique Visitors" />
                  <Legend />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ──────────────── SECTION 4: Dedicated Visitors Table ──────────────── */}
      <div className="an-table-card">
        <div className="an-table-header">
          <div>
            <h3 className="an-section-title">
              <span>📋</span> Website Visitors Log
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Live privacy-safe audit table tracking guests who came to the website to explore the school.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="an-btn an-btn-export"
              onClick={handleExportCSV}
              title="Download CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>

            <button
              type="button"
              className="an-btn"
              onClick={() => fetchVisitorTable(tablePage)}
            >
              Refresh Table
            </button>
          </div>
        </div>

        <div className="an-table-wrap">
          <table className="an-table" aria-label="Website visitors table">
            <thead>
              <tr>
                <th style={{ width: 60 }}># ID</th>
                <th>Visit Time</th>
                <th>Page Visited</th>
                <th>Visitor Hash</th>
                <th>Device / Browser</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div className="an-skeleton" style={{ height: '24px', width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : !visitorTableData?.items?.length ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No visitor records found yet. Visits are automatically logged once per session as users explore the site!
                  </td>
                </tr>
              ) : (
                visitorTableData.items.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{row.id}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatDateTime(row.visited_at)}
                    </td>
                    <td>
                      <span className="an-badge-page">{row.page || '/'}</span>
                    </td>
                    <td>
                      <span className="an-badge-hash" title="SHA-256 masked IP">
                        {row.ip_hash_masked}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.8rem' }}>
                      {parseBrowser(row.user_agent)}
                    </td>
                    <td>
                      <span className="an-badge-status">Viewed School</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="an-pagination">
          <div>
            Showing page <strong>{tablePage}</strong> of <strong>{totalPages}</strong> ({visitorTableData.total || 0} total visits logged)
          </div>

          <div className="an-page-btns">
            <button
              type="button"
              className="an-btn"
              disabled={tablePage <= 1 || loadingTable}
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="an-btn"
              disabled={tablePage >= totalPages || loadingTable}
              onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
