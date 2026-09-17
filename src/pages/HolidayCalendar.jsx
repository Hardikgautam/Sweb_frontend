// pages/HolidayCalendar.jsx
// Route: /calendar
// Combined School Calendar: Feeds from GET /api/holidays and GET /api/events.
// Displays both single-day events and multi-day ranges (vacations/exams),
// sorted chronologically with distinct visual color badges and date spans.

import { useState, useEffect, useMemo, useCallback } from 'react';
import MonthCalendar from '../components/MonthCalendar';
import { getHolidays } from '../api/holidays';
import { getEvents } from '../api/events';
import './HolidayCalendar.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Format date string "YYYY-MM-DD" → "15 Aug 2026" */
function fmtSimpleDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

/** Format date range: "20 May – 30 Jun 2026" or "8 – 13 Nov 2026" or "15 Aug 2026" */
function fmtDisplaySpan(startStr, endStr) {
  if (!startStr) return '';
  if (!endStr || startStr === endStr) {
    return fmtSimpleDate(startStr);
  }
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  if (sy === ey && sm === em) {
    return `${sd} – ${ed} ${MONTH_NAMES[sm - 1].slice(0, 3)} ${sy}`;
  }
  if (sy === ey) {
    return `${sd} ${MONTH_NAMES[sm - 1].slice(0, 3)} – ${ed} ${MONTH_NAMES[em - 1].slice(0, 3)} ${sy}`;
  }
  return `${sd} ${MONTH_NAMES[sm - 1].slice(0, 3)} ${sy} – ${ed} ${MONTH_NAMES[em - 1].slice(0, 3)} ${ey}`;
}

function calculateDays(startStr, endStr) {
  if (!startStr) return 1;
  if (!endStr || startStr === endStr) return 1;
  const s = new Date(startStr);
  const e = new Date(endStr);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

function getWeekdayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return WEEKDAYS[d.getDay()] || '';
}

export default function HolidayCalendar() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based

  const [holidays, setHolidays] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all'); // 'all' | 'vacation' | 'exam' | 'national' | 'event' | 'school'
  const [search, setSearch]     = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [hData, eData] = await Promise.all([
        getHolidays().catch(() => []),
        getEvents().catch(() => []),
      ]);
      setHolidays(Array.isArray(hData) ? hData : []);
      setEvents(Array.isArray(eData) ? eData : []);
    } catch (err) {
      console.warn('Failed to load calendar data:', err);
      setError('Unable to load calendar schedules right now. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine and normalize both data sources into unified items
  const combinedItems = useMemo(() => {
    const list = [];

    // 1. Add Holidays (vacations, exams, national holidays, school holidays)
    holidays.forEach(h => {
      const isRange = h.start_date !== h.end_date;
      const days = calculateDays(h.start_date, h.end_date);
      list.push({
        id: `h-${h.id}`,
        rawId: h.id,
        kind: 'holiday',
        category: (h.type || 'school').toLowerCase(), // 'national' | 'school' | 'exam' | 'vacation'
        title: h.name,
        startDate: h.start_date,
        endDate: h.end_date || h.start_date,
        description: h.description || '',
        isRange,
        durationDays: days,
        weekday: getWeekdayName(h.start_date),
      });
    });

    // 2. Add School Events
    events.forEach(e => {
      list.push({
        id: `e-${e.id}`,
        rawId: e.id,
        kind: 'event',
        category: 'event',
        eventCategory: e.category || 'Event',
        title: e.title,
        startDate: e.event_date,
        endDate: e.event_date,
        time: e.event_time || '',
        location: e.location || '',
        description: [e.location && `Venue: ${e.location}`, e.event_time && `Time: ${e.event_time}`].filter(Boolean).join(' · '),
        isRange: false,
        durationDays: 1,
        weekday: getWeekdayName(e.event_date),
      });
    });

    // Sort chronologically ascending
    return list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [holidays, events]);

  // Filtered & searched items
  const filteredItems = useMemo(() => {
    return combinedItems.filter(item => {
      // Category filter
      if (filter !== 'all') {
        if (filter === 'vacation' && item.category !== 'vacation') return false;
        if (filter === 'exam' && item.category !== 'exam') return false;
        if (filter === 'national' && item.category !== 'national') return false;
        if (filter === 'event' && item.kind !== 'event') return false;
        if (filter === 'school' && item.category !== 'school') return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc  = item.description.toLowerCase().includes(q);
        const matchCat   = (item.eventCategory || item.category).toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat;
      }
      return true;
    });
  }, [combinedItems, filter, search]);

  // Month navigation for MonthCalendar grid
  function goPrevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else              { setMonth(m => m - 1); }
  }

  function goNextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else               { setMonth(m => m + 1); }
  }

  // Count stats
  const counts = useMemo(() => {
    return {
      all: combinedItems.length,
      vacations: combinedItems.filter(i => i.category === 'vacation').length,
      exams: combinedItems.filter(i => i.category === 'exam').length,
      national: combinedItems.filter(i => i.category === 'national').length,
      events: combinedItems.filter(i => i.kind === 'event').length,
    };
  }, [combinedItems]);

  return (
    <div className="hcal-page">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <header className="hcal-page__hero">
        <div className="container">
          <div className="hcal-page__kicker">
            <span className="hcal-page__kicker-line" aria-hidden="true" />
            <span className="hcal-page__kicker-text">Combined Academic Schedule</span>
          </div>
          <h1 className="hcal-page__headline">
            Events, Holidays &amp; Examination Calendar
          </h1>
          <p className="hcal-page__intro">
            Official consolidated timeline for XYZ Public School. View upcoming campus events,
            vacation breaks, exam schedules, and national holidays.
          </p>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <main className="hcal-page__body">
        <div className="container">

          {/* ── Toolbar: Filter Pills, Search, View Toggle ────────────── */}
          <div className="hcal-toolbar">
            <div className="hcal-filters" role="tablist" aria-label="Filter calendar by category">
              <button
                type="button"
                className={`hcal-pill ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Entries <span className="hcal-pill__count">{counts.all}</span>
              </button>
              <button
                type="button"
                className={`hcal-pill hcal-pill--vacation ${filter === 'vacation' ? 'active' : ''}`}
                onClick={() => setFilter('vacation')}
              >
                Vacations &amp; Breaks <span className="hcal-pill__count">{counts.vacations}</span>
              </button>
              <button
                type="button"
                className={`hcal-pill hcal-pill--exam ${filter === 'exam' ? 'active' : ''}`}
                onClick={() => setFilter('exam')}
              >
                Exams <span className="hcal-pill__count">{counts.exams}</span>
              </button>
              <button
                type="button"
                className={`hcal-pill hcal-pill--national ${filter === 'national' ? 'active' : ''}`}
                onClick={() => setFilter('national')}
              >
                National Holidays <span className="hcal-pill__count">{counts.national}</span>
              </button>
              <button
                type="button"
                className={`hcal-pill hcal-pill--event ${filter === 'event' ? 'active' : ''}`}
                onClick={() => setFilter('event')}
              >
                School Events <span className="hcal-pill__count">{counts.events}</span>
              </button>
            </div>

            <div className="hcal-controls-right">
              <div className="hcal-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="search"
                  className="hcal-search-input"
                  placeholder="Search dates, exams, events…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search calendar entries"
                />
              </div>

              <div className="hcal-view-toggle">
                <button
                  type="button"
                  className={`hcal-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Timeline List View"
                  aria-label="Timeline List View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <button
                  type="button"
                  className={`hcal-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Month Grid View"
                  aria-label="Month Grid View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── View Mode: Month Grid ─────────────────────────────────── */}
          {viewMode === 'grid' && (
            <section className="hcal-page__cal-wrap" aria-label="Month grid view">
              <MonthCalendar
                year={year}
                month={month}
                holidays={holidays}
                onPrev={goPrevMonth}
                onNext={goNextMonth}
              />
              <p className="hcal-grid-note">
                Showing holidays and vacation periods. Switch to <strong>Timeline View</strong> for the combined event and exam schedule.
              </p>
            </section>
          )}

          {/* ── View Mode: Timeline List ──────────────────────────────── */}
          {viewMode === 'list' && (
            <section className="hcal-timeline-wrap" aria-label="Combined timeline">
              {loading && (
                <div className="hcal-page__loading" aria-busy="true" aria-label="Loading calendar…" />
              )}

              {error && (
                <div className="hcal-error-banner" role="alert">
                  {error}
                </div>
              )}

              {!loading && filteredItems.length === 0 && (
                <div className="hcal-empty-state">
                  <span className="hcal-empty-icon" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <h3>No calendar entries found</h3>
                  <p>Try adjusting your search query or selecting a different category filter.</p>
                </div>
              )}

              {!loading && filteredItems.length > 0 && (
                <div className="hcal-timeline-list">
                  {filteredItems.map(item => {
                    const spanLabel = fmtDisplaySpan(item.startDate, item.endDate);

                    return (
                      <article
                        key={item.id}
                        className={`hcal-card hcal-card--${item.category}`}
                      >
                        {/* Date column */}
                        <div className="hcal-card__date-col">
                          <div className="hcal-card__date-span">
                            {spanLabel}
                          </div>
                          <div className="hcal-card__subdate">
                            {item.isRange ? (
                              <span className="hcal-card__duration-pill">
                                {item.durationDays} Days Duration
                              </span>
                            ) : (
                              <span className="hcal-card__weekday">
                                {item.weekday}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details column */}
                        <div className="hcal-card__details">
                          <div className="hcal-card__tag-row">
                            {item.kind === 'event' ? (
                              <span className="hcal-tag hcal-tag--event">
                                {item.eventCategory || 'School Event'}
                              </span>
                            ) : item.category === 'vacation' ? (
                              <span className="hcal-tag hcal-tag--vacation">
                                Vacation Break
                              </span>
                            ) : item.category === 'exam' ? (
                              <span className="hcal-tag hcal-tag--exam">
                                Exam Session
                              </span>
                            ) : item.category === 'national' ? (
                              <span className="hcal-tag hcal-tag--national">
                                National Holiday
                              </span>
                            ) : (
                              <span className="hcal-tag hcal-tag--school">
                                School Holiday
                              </span>
                            )}

                            {item.isRange && (
                              <span className="hcal-tag hcal-tag--range">
                                Multi-Day Span
                              </span>
                            )}
                          </div>

                          <h3 className="hcal-card__title">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="hcal-card__desc">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

        </div>
      </main>

    </div>
  );
}
