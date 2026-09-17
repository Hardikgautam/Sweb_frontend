// src/components/admin/AnalyticsTab.jsx
// Analytics terminal — trading-desk layout over live database values only.
//
// Data policy: there is no seeded/demo fallback here. If the backend is offline
// or a table is empty, every figure reads 0 and the panel says so, so an admin
// is never shown numbers the school did not actually record.
//
// Chart decisions worth keeping:
//  - No dual-axis anywhere. Newsletter growth is a price/volume pair of stacked
//    panels sharing one x-axis, because cumulative totals (~1,200) and monthly
//    additions (~40) cannot share a scale without flattening the smaller series
//    into the baseline — which is exactly how the previous version read.
//  - Traffic keeps two series on ONE axis (total vs unique visits are the same
//    unit), drawn as area + line.
//  - Deltas pair colour with a ▲/▼ glyph and a sign, never colour alone.

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  getEnquiriesAnalytics,
  getNewsletterAnalytics,
  getVisitorsAnalytics,
  getVisitorsTable,
} from '../../api/analytics';
import './AnalyticsTab.css';

// ─────────────────────────────────────────────────────────────────────────────
// Series palette — validated against the #0d1626 terminal surface for the
// lightness band, chroma floor, CVD separation and 3:1 contrast.
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  blue:   '#3987e5',  // traffic — total visits
  aqua:   '#199e70',  // traffic — unique visitors
  gold:   '#c98500',  // enquiries — CBSE peak window
  orange: '#d95926',  // newsletter
  up:     '#0ca30c',  // status: good  (always paired with ▲)
  down:   '#d03b3b',  // status: poor  (always paired with ▼)
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// India's CBSE admission enquiry window.
const PEAK_MONTHS = new Set([1, 2, 3, 4]);

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/** 18450 -> "18.4k" — keeps y-axis ticks narrow without losing magnitude. */
function compact(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}k`;
  return String(v);
}

function full(n) {
  return (Number(n) || 0).toLocaleString('en-IN');
}

function parseBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Microsoft Edge';
  if (ua.includes('firefox/')) return 'Mozilla Firefox';
  if (ua.includes('chrome/')) return ua.includes('mobile') ? 'Chrome Mobile' : 'Google Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Apple Safari';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile Browser';
  return 'Other Browser';
}

/**
 * Percent change between the last two periods that actually recorded activity.
 * Skipping empty periods keeps a part-way-through month from reading as a
 * collapse; use `dayOverDayDelta` where the comparison must be literal.
 */
function trailingDelta(rows, key) {
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const withValues = rows.filter((r) => Number(r?.[key]) > 0);
  if (withValues.length < 2) return null;
  const curr = Number(withValues[withValues.length - 1][key]) || 0;
  const prev = Number(withValues[withValues.length - 2][key]) || 0;
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

/**
 * Literal last-point-vs-previous-point change.
 * Used for "Visits Today", where quoting a rise while the headline figure
 * reads 0 would plainly contradict itself.
 */
function dayOverDayDelta(rows, key) {
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const curr = Number(rows[rows.length - 1]?.[key]) || 0;
  const prev = Number(rows[rows.length - 2]?.[key]) || 0;
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

function mean(rows, key) {
  const vals = (rows || []).map((r) => Number(r?.[key]) || 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function hasAnyValue(rows, keys) {
  return (rows || []).some((r) => keys.some((k) => Number(r?.[k]) > 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// Zero-state scaffolds — an axis of twelve zeroed months reads as "nothing
// recorded yet", which is more legible than an empty plot area.
// ─────────────────────────────────────────────────────────────────────────────

function zeroMonths(extraKeys = {}) {
  return MONTH_NAMES.map((name, i) => ({
    month: i + 1,
    month_name: name,
    count: 0,
    is_peak_season: PEAK_MONTHS.has(i + 1),
    ...extraKeys,
  }));
}

const EMPTY_ENQUIRIES = { total: 0, peak_season_total: 0, monthly_data: [], available_years: [] };
const EMPTY_NEWSLETTER = { total_year: 0, total_all_time: 0, monthly_data: [], available_years: [] };
const EMPTY_VISITORS = {
  total_visitors: 0, unique_visitors_all_time: 0, today_visitors: 0,
  this_month_visitors: 0, daily: [], monthly: [], yearly: [], available_years: [],
};
const EMPTY_TABLE = { total: 0, page: 1, items: [] };

// ─────────────────────────────────────────────────────────────────────────────
// Chart chrome shared by every panel
// ─────────────────────────────────────────────────────────────────────────────

const AXIS_TICK = { fill: '#7e93b8', fontSize: 11, fontWeight: 500 };
const GRID_STROKE = 'rgba(255,255,255,0.055)';
const CROSSHAIR = { stroke: 'rgba(255,255,255,0.22)', strokeWidth: 1, strokeDasharray: '3 3' };

function gridProps() {
  return {
    strokeDasharray: '2 6',
    vertical: false,
    stroke: GRID_STROKE,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltips — a quote box, not a legend dump
// ─────────────────────────────────────────────────────────────────────────────

function QuoteBox({ heading, rows, tag }) {
  return (
    <div className="an-tip" role="tooltip">
      <div className="an-tip__head">{heading}</div>
      {rows.map((r) => (
        <div className="an-tip__row" key={r.label}>
          <span className="an-tip__key">
            <i className="an-tip__swatch" style={{ background: r.color }} aria-hidden="true" />
            {r.label}
          </span>
          <strong className="an-tip__val">{full(r.value)}</strong>
        </div>
      ))}
      {tag && <div className="an-tip__tag">{tag}</div>}
    </div>
  );
}

function EnquiriesTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <QuoteBox
      heading={`${d.month_name} ${d.year || ''}`.trim()}
      rows={[{ label: 'Enquiries', value: d.count, color: d.is_peak_season ? C.gold : C.blue }]}
      tag={d.is_peak_season ? 'CBSE peak admission window' : null}
    />
  );
}

function CumulativeTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <QuoteBox
      heading={`${d.month_name} ${d.year || ''}`.trim()}
      rows={[{ label: 'Total subscribers', value: d.cumulative_count, color: C.orange }]}
    />
  );
}

function NewJoinsTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <QuoteBox
      heading={`${d.month_name} ${d.year || ''}`.trim()}
      rows={[{ label: 'New sign-ups', value: d.count, color: C.orange }]}
    />
  );
}

function TrafficTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const rows = [{ label: 'Total visits', value: d.count, color: C.blue }];
  if (d.unique_visitors !== undefined && d.unique_visitors !== null) {
    rows.push({ label: 'Unique visitors', value: d.unique_visitors, color: C.aqua });
  }
  const share = Number(d.count) > 0 && d.unique_visitors != null
    ? Math.round((Number(d.unique_visitors) / Number(d.count)) * 100)
    : null;
  return (
    <QuoteBox
      heading={d.label || d.month_name || String(d.year || '')}
      rows={rows}
      tag={share !== null ? `${share}% of visits were unique` : null}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small parts
// ─────────────────────────────────────────────────────────────────────────────

/** Delta pill. Colour is backed by a ▲/▼ glyph so it never relies on hue. */
function Delta({ value, suffix = '%' }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="an-delta an-delta--flat">— no trend yet</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={`an-delta ${up ? 'an-delta--up' : 'an-delta--down'}`}
      style={{ color: up ? C.up : C.down }}
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      {`${up ? '+' : ''}${value.toFixed(1)}${suffix}`}
    </span>
  );
}

function Sparkline({ data, dataKey, color, ariaLabel }) {
  const live = (data || []).filter((d) => d && d[dataKey] !== undefined);
  if (live.length < 2) return <div className="an-spark-empty" aria-hidden="true" />;
  const gid = `sp-${dataKey}-${color.replace('#', '')}`;
  return (
    <div className="an-spark" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={live} margin={{ top: 3, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.75}
            fill={`url(#${gid})`} dot={false} isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Share-of-total meter. Replaces a second sparkline that merely retraced the
 *  first one's shape — this encodes a ratio the sparkline never showed. */
function ShareMeter({ pct, label }) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div className="an-meter">
      <div
        className="an-meter__track"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="an-meter__fill" style={{ width: `${clamped}%`, background: C.aqua }} />
      </div>
      <span className="an-meter__caption">{clamped}% {label}</span>
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="an-legend">
      {items.map((it) => (
        <span className="an-leg" key={it.label}>
          <span className="an-leg__dot" style={{ background: it.color }} aria-hidden="true" />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function EmptyPanel({ height = 260, message }) {
  return (
    <div className="an-empty-panel" style={{ minHeight: height }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

function ChartSkeleton({ height = 260 }) {
  return <div className="an-skeleton" style={{ height }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsTab({ token, toast }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);

  const [enquiriesData, setEnquiriesData] = useState(EMPTY_ENQUIRIES);
  const [newsletterData, setNewsletterData] = useState(EMPTY_NEWSLETTER);
  const [visitorsData, setVisitorsData] = useState(EMPTY_VISITORS);
  const [visitorTableData, setVisitorTableData] = useState(EMPTY_TABLE);

  const [visitorView, setVisitorView] = useState('daily');
  const [tablePage, setTablePage] = useState(1);
  const tableLimit = 20;

  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  // Surfaced in the header so "all zeros" is never mistaken for "no traffic".
  const [offline, setOffline] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAllAnalytics = useCallback(async (year) => {
    setLoadingCharts(true);
    try {
      const [enq, news, vis] = await Promise.all([
        getEnquiriesAnalytics(year, token).catch(() => null),
        getNewsletterAnalytics(year, token).catch(() => null),
        getVisitorsAnalytics(year, token).catch(() => null),
      ]);

      // A null from every endpoint means the API is unreachable — say so rather
      // than letting three zeroed panels imply a quiet month.
      setOffline(!enq && !news && !vis);

      setEnquiriesData(enq || EMPTY_ENQUIRIES);
      setNewsletterData(news || EMPTY_NEWSLETTER);
      setVisitorsData(vis || EMPTY_VISITORS);

      const years = new Set([
        currentYear,
        ...(enq?.available_years || []),
        ...(news?.available_years || []),
        ...(vis?.available_years || []),
      ]);
      setAvailableYears(Array.from(years).filter(Boolean).sort((a, b) => b - a));
    } catch (err) {
      console.error('[Analytics] fetch failed', err);
      setOffline(true);
      setEnquiriesData(EMPTY_ENQUIRIES);
      setNewsletterData(EMPTY_NEWSLETTER);
      setVisitorsData(EMPTY_VISITORS);
    } finally {
      setLoadingCharts(false);
    }
  }, [token, currentYear]);

  const fetchVisitorTable = useCallback(async (page) => {
    setLoadingTable(true);
    try {
      const res = await getVisitorsTable(page, tableLimit, token);
      setVisitorTableData(res && Array.isArray(res.items) ? res : EMPTY_TABLE);
    } catch (err) {
      console.error('[Analytics] visitor table failed', err);
      setVisitorTableData(EMPTY_TABLE);
    } finally {
      setLoadingTable(false);
    }
  }, [token, tableLimit]);

  useEffect(() => { fetchAllAnalytics(selectedYear); }, [selectedYear, fetchAllAnalytics]);
  useEffect(() => { fetchVisitorTable(tablePage); }, [tablePage, fetchVisitorTable]);

  // ── Derived series ───────────────────────────────────────────────────────
  const enqRows = enquiriesData?.monthly_data?.length
    ? enquiriesData.monthly_data
    : zeroMonths();
  const enqHasData = hasAnyValue(enquiriesData?.monthly_data, ['count']);

  const newsRows = newsletterData?.monthly_data?.length
    ? newsletterData.monthly_data
    : zeroMonths({ cumulative_count: 0 });
  const newsHasData = hasAnyValue(newsletterData?.monthly_data, ['count', 'cumulative_count']);

  const trafficRows = useMemo(() => {
    if (visitorView === 'daily') return visitorsData?.daily || [];
    if (visitorView === 'monthly') return visitorsData?.monthly || [];
    return visitorsData?.yearly || [];
  }, [visitorView, visitorsData]);

  const trafficXKey = visitorView === 'daily'
    ? 'label' : visitorView === 'monthly' ? 'month_name' : 'year';
  const trafficHasData = hasAnyValue(trafficRows, ['count', 'unique_visitors']);

  // ── KPI metrics ──────────────────────────────────────────────────────────
  const enquiryMetrics = useMemo(() => {
    const rows = enquiriesData?.monthly_data || [];
    const total = enquiriesData?.total || 0;
    const peakTotal = enquiriesData?.peak_season_total || 0;
    let best = null;
    rows.forEach((m) => {
      if (Number(m.count) > 0 && (!best || m.count > best.count)) best = m;
    });
    return {
      total,
      peakPct: total > 0 ? Math.round((peakTotal / total) * 100) : 0,
      peakMonth: best ? `${best.month_name} (${full(best.count)})` : '—',
      delta: trailingDelta(rows, 'count'),
    };
  }, [enquiriesData]);

  const newsletterMetrics = useMemo(() => {
    const rows = newsletterData?.monthly_data || [];
    let best = null;
    rows.forEach((m) => {
      if (Number(m.count) > 0 && (!best || m.count > best.count)) best = m;
    });
    return {
      totalYear: newsletterData?.total_year || 0,
      totalAllTime: newsletterData?.total_all_time || 0,
      peakMonth: best ? `${best.month_name} (${full(best.count)})` : '—',
      delta: trailingDelta(rows, 'count'),
    };
  }, [newsletterData]);

  const trafficMetrics = useMemo(() => {
    const daily = visitorsData?.daily || [];
    const totalVisits = visitorsData?.total_visitors || 0;
    const uniqueAll = visitorsData?.unique_visitors_all_time || 0;
    return {
      today: visitorsData?.today_visitors || 0,
      thisMonth: visitorsData?.this_month_visitors || 0,
      totalVisits,
      uniqueAll,
      uniqueSharePct: totalVisits > 0 ? Math.round((uniqueAll / totalVisits) * 100) : 0,
      dailyDelta: dayOverDayDelta(daily, 'count'),
      spark: daily.slice(-14),
    };
  }, [visitorsData]);

  const enqAvg = useMemo(() => mean(enquiriesData?.monthly_data, 'count'), [enquiriesData]);
  const trafficAvg = useMemo(() => mean(trafficRows, 'count'), [trafficRows]);

  // ── CSV export ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const items = visitorTableData?.items || [];
    if (!items.length) {
      toast?.('No visitor records to export', 'info');
      return;
    }
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['ID', 'Visit Time (ISO)', 'Page', 'Masked Identifier', 'Device / Browser', 'User Agent'];
    const rows = items.map((it) => [
      it.id, esc(it.visited_at), esc(it.page), esc(it.ip_hash_masked),
      esc(parseBrowser(it.user_agent)), esc(it.user_agent),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');

    // Blob + object URL handles large exports that a data: URI would truncate.
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `school_visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast?.(`Exported ${items.length} visitor records`, 'success');
  };

  const totalPages = Math.max(1, Math.ceil((visitorTableData?.total || 0) / tableLimit));

  const refreshAll = () => {
    fetchAllAnalytics(selectedYear);
    fetchVisitorTable(tablePage);
    toast?.('Analytics refreshed', 'info');
  };

  const trafficRangeLabel = visitorView === 'daily'
    ? 'Last 30 days' : visitorView === 'monthly' ? `Month by month · ${selectedYear}` : 'Year on year';

  return (
    <div className="an-wrap">

      {/* ── Terminal header ────────────────────────────────────────────── */}
      <header className="an-header">
        <div className="an-header__titles">
          <h2 className="an-header__title">Analytics Terminal</h2>
          <p className="an-header__sub">
            Admission enquiries, newsletter growth and website traffic — live database values.
          </p>
        </div>

        <div className="an-header__controls">
          {offline && (
            <span className="an-status an-status--warn" role="status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Backend unreachable — showing zeros
            </span>
          )}
          {!offline && (
            <span className="an-status an-status--live" role="status">
              <i className="an-status__pulse" aria-hidden="true" />
              Live
            </span>
          )}

          <label className="an-field">
            <span className="an-field__label">Year</span>
            <select
              className="an-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select analytics year"
            >
              {availableYears.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
            </select>
          </label>

          <button type="button" className="an-btn an-btn--ghost" onClick={refreshAll} title="Refresh analytics">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* ── KPI strip ──────────────────────────────────────────────────── */}
      <div className="an-kpis">

        <article className="an-kpi" style={{ '--kpi-accent': C.gold }}>
          <div className="an-kpi__top">
            <h3 className="an-kpi__label">Admission Enquiries</h3>
            <Delta value={enquiryMetrics.delta} />
          </div>
          <p className="an-kpi__value">{full(enquiryMetrics.total)}</p>
          <p className="an-kpi__meta">
            {selectedYear} · {enquiryMetrics.peakPct}% in peak window · Best: {enquiryMetrics.peakMonth}
          </p>
          <Sparkline data={enquiriesData?.monthly_data} dataKey="count" color={C.gold}
            ariaLabel="Monthly admission enquiries trend" />
        </article>

        <article className="an-kpi" style={{ '--kpi-accent': C.orange }}>
          <div className="an-kpi__top">
            <h3 className="an-kpi__label">Newsletter Subscribers</h3>
            <Delta value={newsletterMetrics.delta} />
          </div>
          <p className="an-kpi__value">{full(newsletterMetrics.totalAllTime)}</p>
          <p className="an-kpi__meta">
            All-time · +{full(newsletterMetrics.totalYear)} in {selectedYear} · Best: {newsletterMetrics.peakMonth}
          </p>
          <Sparkline data={newsletterData?.monthly_data} dataKey="cumulative_count" color={C.orange}
            ariaLabel="Cumulative newsletter subscriber trend" />
        </article>

        <article className="an-kpi" style={{ '--kpi-accent': C.blue }}>
          <div className="an-kpi__top">
            <h3 className="an-kpi__label">Visits Today</h3>
            <Delta value={trafficMetrics.dailyDelta} />
          </div>
          <p className="an-kpi__value">{full(trafficMetrics.today)}</p>
          <p className="an-kpi__meta">
            {full(trafficMetrics.thisMonth)} this month · {full(trafficMetrics.totalVisits)} all-time
          </p>
          <Sparkline data={trafficMetrics.spark} dataKey="count" color={C.blue}
            ariaLabel="Daily website visits over the last 14 days" />
        </article>

        {/* The old fourth sparkline retraced the third one's shape (unique
            visits track total visits almost exactly). A share meter earns the
            space instead by showing the ratio between them. */}
        <article className="an-kpi" style={{ '--kpi-accent': C.aqua }}>
          <div className="an-kpi__top">
            <h3 className="an-kpi__label">Unique Visitors</h3>
            <span className="an-kpi__chip">All time</span>
          </div>
          <p className="an-kpi__value">{full(trafficMetrics.uniqueAll)}</p>
          <p className="an-kpi__meta">
            Distinct devices out of {full(trafficMetrics.totalVisits)} page views
          </p>
          <ShareMeter pct={trafficMetrics.uniqueSharePct} label="unique share" />
        </article>

      </div>

      {/* ── Panel 1: Admission enquiries ───────────────────────────────── */}
      <section className="an-panel">
        <div className="an-panel__head">
          <div>
            <h3 className="an-panel__title">Admission Enquiries · {selectedYear}</h3>
            <p className="an-panel__sub">
              Monthly volume. Gold marks the CBSE peak admission window (January–April).
            </p>
          </div>
          <Legend items={[
            { label: 'Peak window', color: C.gold },
            { label: 'Off-season', color: C.blue },
          ]} />
        </div>

        <div className="an-panel__body">
          {loadingCharts ? <ChartSkeleton height={280} /> : !enqHasData ? (
            <EmptyPanel height={280} message={`No admission enquiries recorded for ${selectedYear} yet.`} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enqRows} margin={{ top: 12, right: 16, left: 4, bottom: 4 }} barCategoryGap="34%">
                <defs>
                  <linearGradient id="anBarGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.gold} stopOpacity={1} />
                    <stop offset="100%" stopColor={C.gold} stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="anBarBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity={1} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps()} />
                <XAxis dataKey="month_name" tickLine={false} axisLine={false} tick={AXIS_TICK} dy={4} />
                <YAxis
                  tickLine={false} axisLine={false} tick={AXIS_TICK}
                  allowDecimals={false} width={44} tickFormatter={compact}
                />
                <Tooltip content={<EnquiriesTip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                {enqAvg > 0 && (
                  <ReferenceLine
                    y={enqAvg}
                    stroke="rgba(255,255,255,0.3)"
                    strokeDasharray="4 4"
                    label={{
                      value: `avg ${Math.round(enqAvg)}`,
                      position: 'insideTopRight',
                      fill: '#7e93b8',
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={38} name="Enquiries">
                  {enqRows.map((row, i) => (
                    <Cell key={i} fill={row.is_peak_season ? 'url(#anBarGold)' : 'url(#anBarBlue)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Panel 2: Newsletter growth — price + volume, one shared x-axis ── */}
      <section className="an-panel">
        <div className="an-panel__head">
          <div>
            <h3 className="an-panel__title">Newsletter Growth · {selectedYear}</h3>
            <p className="an-panel__sub">
              Running subscriber total above, new sign-ups per month below. Split into two
              panels because the two measures differ by an order of magnitude.
            </p>
          </div>
        </div>

        <div className="an-panel__body">
          {loadingCharts ? <ChartSkeleton height={300} /> : !newsHasData ? (
            <EmptyPanel height={300} message={`No newsletter activity recorded for ${selectedYear} yet.`} />
          ) : (
            <>
              <div className="an-subpanel-label">Total subscribers</div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={newsRows} margin={{ top: 8, right: 16, left: 4, bottom: 0 }} syncId="anNewsletter">
                  <CartesianGrid {...gridProps()} />
                  <XAxis dataKey="month_name" tick={false} axisLine={false} tickLine={false} height={1} />
                  <YAxis
                    tickLine={false} axisLine={false} tick={AXIS_TICK}
                    width={44} tickFormatter={compact} allowDecimals={false}
                    domain={['dataMin - 20', 'dataMax + 20']}
                  />
                  <Tooltip content={<CumulativeTip />} cursor={CROSSHAIR} />
                  {/* A line, not a filled area: this axis is zoomed to the data
                      range, and a fill anchored to a non-zero baseline would
                      overstate the growth. */}
                  <Line
                    type="monotone" dataKey="cumulative_count" name="Total subscribers"
                    stroke={C.orange} strokeWidth={2.25} dot={false}
                    activeDot={{ r: 4, fill: C.orange, stroke: '#0d1626', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="an-subpanel-label an-subpanel-label--volume">New sign-ups per month</div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={newsRows} margin={{ top: 4, right: 16, left: 4, bottom: 4 }} syncId="anNewsletter" barCategoryGap="38%">
                  <CartesianGrid {...gridProps()} />
                  <XAxis dataKey="month_name" tickLine={false} axisLine={false} tick={AXIS_TICK} dy={4} />
                  <YAxis
                    tickLine={false} axisLine={false} tick={AXIS_TICK}
                    width={44} tickFormatter={compact} allowDecimals={false}
                  />
                  <Tooltip content={<NewJoinsTip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" name="New sign-ups" fill={C.orange} fillOpacity={0.75} radius={[3, 3, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </section>

      {/* ── Panel 3: Website traffic ───────────────────────────────────── */}
      <section className="an-panel">
        <div className="an-panel__head">
          <div>
            <h3 className="an-panel__title">Website Traffic</h3>
            <p className="an-panel__sub">{trafficRangeLabel} · total visits against unique visitors</p>
          </div>
          <div className="an-range" role="group" aria-label="Traffic time range">
            {[['daily', '30D'], ['monthly', '12M'], ['yearly', 'ALL']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`an-range__btn${visitorView === key ? ' is-active' : ''}`}
                onClick={() => setVisitorView(key)}
                aria-pressed={visitorView === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="an-panel__body">
          {loadingCharts ? <ChartSkeleton height={300} /> : !trafficHasData ? (
            <EmptyPanel height={300} message="No visits recorded for this range yet." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trafficRows} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="anAreaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity={0.42} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps()} />
                <XAxis
                  dataKey={trafficXKey} tickLine={false} axisLine={false} tick={AXIS_TICK} dy={4}
                  interval="preserveStartEnd"
                  minTickGap={visitorView === 'daily' ? 28 : 8}
                />
                <YAxis
                  tickLine={false} axisLine={false} tick={AXIS_TICK}
                  width={44} tickFormatter={compact} allowDecimals={false}
                />
                <Tooltip content={<TrafficTip />} cursor={CROSSHAIR} />
                {trafficAvg > 0 && (
                  <ReferenceLine
                    y={trafficAvg}
                    stroke="rgba(255,255,255,0.28)"
                    strokeDasharray="4 4"
                    label={{
                      value: `avg ${compact(Math.round(trafficAvg))}`,
                      position: 'insideTopRight',
                      fill: '#7e93b8',
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}
                <Area
                  type="monotone" dataKey="count" name="Total visits"
                  stroke={C.blue} strokeWidth={2} fill="url(#anAreaBlue)" dot={false}
                  activeDot={{ r: 4, fill: C.blue, stroke: '#0d1626', strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="unique_visitors" name="Unique visitors"
                  stroke={C.aqua} strokeWidth={2} strokeDasharray="5 3" dot={false}
                  activeDot={{ r: 4, fill: C.aqua, stroke: '#0d1626', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {/* One legend for this panel — the duplicate footer copy is gone. */}
          <Legend items={[
            { label: 'Total visits', color: C.blue },
            { label: 'Unique visitors', color: C.aqua },
          ]} />
        </div>
      </section>

      {/* ── Visitor log ────────────────────────────────────────────────── */}
      <section className="an-panel">
        <div className="an-panel__head">
          <div>
            <h3 className="an-panel__title">Visitor Log</h3>
            <p className="an-panel__sub">
              Privacy-safe session audit · IP addresses are stored only as salted SHA-256 hashes
            </p>
          </div>
          <div className="an-panel__actions">
            <button type="button" className="an-btn an-btn--ghost" onClick={() => fetchVisitorTable(tablePage)}>
              Refresh
            </button>
            <button type="button" className="an-btn an-btn--accent" onClick={handleExportCSV}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="an-table-scroll">
          <table className="an-table">
            <caption className="an-sr-only">Recent website visitors</caption>
            <thead>
              <tr>
                <th scope="col" style={{ width: 70 }}>#</th>
                <th scope="col">Visit time</th>
                <th scope="col">Page</th>
                <th scope="col">Visitor hash</th>
                <th scope="col">Device / browser</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}><div className="an-skeleton" style={{ height: 20 }} /></td>
                  </tr>
                ))
              ) : !visitorTableData?.items?.length ? (
                <tr>
                  <td colSpan={5} className="an-table__empty">
                    No visitor records yet. Each visit is logged once per browser session.
                  </td>
                </tr>
              ) : (
                visitorTableData.items.map((row) => (
                  <tr key={row.id}>
                    <td className="an-td-num">#{row.id}</td>
                    <td className="an-td-time">{formatDateTime(row.visited_at)}</td>
                    <td><code className="an-chip an-chip--page">{row.page || '/'}</code></td>
                    <td><code className="an-chip an-chip--hash" title="Salted SHA-256 of the IP address">{row.ip_hash_masked}</code></td>
                    <td className="an-td-muted">{parseBrowser(row.user_agent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="an-pager">
          <span className="an-pager__info">
            Page <strong>{tablePage}</strong> of <strong>{totalPages}</strong>
            {' · '}{full(visitorTableData?.total || 0)} visits logged
          </span>
          <div className="an-pager__btns">
            <button
              type="button" className="an-btn an-btn--ghost"
              disabled={tablePage <= 1 || loadingTable}
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <button
              type="button" className="an-btn an-btn--ghost"
              disabled={tablePage >= totalPages || loadingTable}
              onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
