// components/MonthCalendar.jsx
// Reusable month-grid calendar.
//
// Props:
//   year        {number}           — currently displayed year
//   month       {number}           — currently displayed month (1-based, Jan=1)
//   holidays    {Array<object>}    — holiday objects: { id, title, holiday_date, day_of_week, … }
//   onPrev      {() => void}       — navigate to previous month
//   onNext      {() => void}       — navigate to next month

import './MonthCalendar.css';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DOW_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/**
 * Build a flat array of 42 cells (6 rows × 7 cols).
 * Cells before the 1st and after the last day are null.
 */
function buildCalendarCells(year, month) {
  // JS Date months are 0-based
  const firstDay  = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);           // leading empty
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);          // actual days
  while (cells.length % 7 !== 0) cells.push(null);               // trailing empty
  return cells;
}

/**
 * Build a lookup map: day-of-month (number) → holiday object
 * Supports both single dates (start_date) and multi-day spans (start_date to end_date).
 */
function buildHolidayMap(holidays, year, month) {
  const map = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (const h of holidays) {
    const sDateStr = h.start_date || h.holiday_date;
    const eDateStr = h.end_date || sDateStr;
    if (!sDateStr) continue;

    for (let d = 1; d <= daysInMonth; d++) {
      const curStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (curStr >= sDateStr && curStr <= eDateStr) {
        if (!map[d]) {
          map[d] = {
            ...h,
            title: h.name || h.title,
          };
        }
      }
    }
  }
  return map;
}

function isToday(year, month, day) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

export default function MonthCalendar({ year, month, holidays = [], onPrev, onNext }) {
  const cells      = buildCalendarCells(year, month);
  const holidayMap = buildHolidayMap(holidays, year, month);

  return (
    <div className="month-cal" role="grid" aria-label={`${MONTH_NAMES[month - 1]} ${year}`}>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="month-cal__nav">
        <button
          className="month-cal__nav-btn"
          onClick={onPrev}
          aria-label="Previous month"
        >
          ‹ Prev
        </button>

        <span className="month-cal__month-label">
          {MONTH_NAMES[month - 1]} {year}
        </span>

        <button
          className="month-cal__nav-btn"
          onClick={onNext}
          aria-label="Next month"
        >
          Next ›
        </button>
      </div>

      {/* ── Day-of-week header ───────────────────────────────────────────── */}
      <div className="month-cal__dow-row" aria-hidden="true">
        {DOW_LABELS.map((d) => (
          <div key={d} className="month-cal__dow-cell">{d}</div>
        ))}
      </div>

      {/* ── Day grid ─────────────────────────────────────────────────────── */}
      <div className="month-cal__grid">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="month-cal__day month-cal__day--empty" aria-hidden="true" />;
          }

          const holiday  = holidayMap[day];
          const today    = isToday(year, month, day);

          const classes = [
            'month-cal__day',
            holiday ? 'month-cal__day--holiday' : '',
            today   ? 'month-cal__day--today'   : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={day}
              className={classes}
              role="gridcell"
              aria-label={
                holiday
                  ? `${day} ${MONTH_NAMES[month - 1]}: ${holiday.title}`
                  : `${day} ${MONTH_NAMES[month - 1]}`
              }
            >
              <span className="month-cal__day-num">{day}</span>

              {holiday && (
                <span
                  className="month-cal__holiday-pill"
                  title={holiday.title}
                >
                  {holiday.title}
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
