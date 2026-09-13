// components/EventsNewsSection.jsx
// Sections 07 & 08 side by side: "Upcoming Events" (Left) and "Latest News" (Right).
// Powered by live API data with graceful fallback to eventsNewsContent.js.

import { useState, useEffect } from 'react';
import { eventsNewsContent } from '../config/eventsNewsContent';
import { getEvents } from '../api/events';
import { getNews } from '../api/news';
import './EventsNewsSection.css';

function formatEventDate(dateStr) {
  if (!dateStr) return { day: '01', month: 'OCT' };
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIndex, dayNum);
    const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(dayNum).padStart(2, '0');
    return { day, month };
  }
  return { day: '01', month: 'OCT' };
}

function formatNewsDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

export default function EventsNewsSection() {
  const { events: fallbackEvents, news: fallbackNews } = eventsNewsContent;
  const [eventsList, setEventsList] = useState(fallbackEvents.list);
  const [newsData, setNewsData] = useState({
    featured: fallbackNews.featured,
    smaller: fallbackNews.smaller,
  });

  useEffect(() => {
    Promise.allSettled([getEvents(), getNews()])
      .then(([eventsRes, newsRes]) => {
        if (eventsRes.status === 'fulfilled' && eventsRes.value && eventsRes.value.length > 0) {
          const formattedEvents = eventsRes.value.map((item) => {
            const { day, month } = formatEventDate(item.event_date);
            return {
              id: item.id,
              day,
              month,
              tag: item.category || 'EVENT',
              title: item.title,
              meta: [item.event_time, item.location].filter(Boolean).join(' · '),
            };
          });
          setEventsList(formattedEvents);
        }

        if (newsRes.status === 'fulfilled' && newsRes.value && newsRes.value.length > 0) {
          const formatted = newsRes.value.map((item) => ({
            id: item.id,
            image: item.image_url || '/images/image13.jpg',
            alt: item.headline || item.title || 'News',
            tag: item.category || (item.is_pinned ? 'PINNED' : 'NEWS'),
            date: formatNewsDate(item.published_date || item.created_at?.split('T')[0]),
            title: item.headline || item.title,
            summary: item.summary || item.description,
            link: '/news',
            is_featured: item.is_featured ?? item.is_pinned,
          }));

          const feat = formatted.find((n) => n.is_featured) || formatted[0];
          const sm = formatted.filter((n) => n.id !== feat?.id).slice(0, 2);
          setNewsData({
            featured: feat,
            smaller: sm.length > 0 ? sm : fallbackNews.smaller,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load events/news from API, using fallback:', err);
      });
  }, []);

  return (
    <section id="news" className="events-news-section" aria-label="Events and News">
      <div className="container events-news-section__grid">

        {/* ── LEFT COLUMN: Section 07 — Upcoming Events ──────────────── */}
        <div className="events-column">
          <div className="column-kicker">
            <span className="column-kicker__line" aria-hidden="true" />
            <span className="column-kicker__text">
              {fallbackEvents.kickerNumber} &nbsp;{fallbackEvents.kickerLabel}
            </span>
          </div>

          <h2 className="column-heading">{fallbackEvents.headline}</h2>

          <ul className="events-column__list" role="list">
            {eventsList.map((item) => (
              <li key={item.id} className="event-row">
                {/* Dark navy date box */}
                <div className="event-row__date-box">
                  <span className="event-row__day">{item.day}</span>
                  <span className="event-row__month">{item.month}</span>
                </div>

                {/* Event details */}
                <div className="event-row__content">
                  <span className="event-row__tag">{item.tag}</span>
                  <h3 className="event-row__title">{item.title}</h3>
                  <p className="event-row__meta">{item.meta}</p>
                </div>
              </li>
            ))}
          </ul>

          <a href={fallbackEvents.fullCalendarLink.href} className="events-column__calendar-link">
            {fallbackEvents.fullCalendarLink.label}
          </a>
        </div>

        {/* ── RIGHT COLUMN: Section 08 — Latest News ─────────────────── */}
        <div className="news-column">
          <div className="column-kicker">
            <span className="column-kicker__line" aria-hidden="true" />
            <span className="column-kicker__text">
              {fallbackNews.kickerNumber} &nbsp;{fallbackNews.kickerLabel}
            </span>
          </div>

          <h2 className="column-heading">{fallbackNews.headline}</h2>

          {/* Featured News Card on Top */}
          {newsData.featured && (
            <article className="news-featured-card">
              <div className="news-featured-card__image-wrapper">
                <img
                  src={newsData.featured.image}
                  alt={newsData.featured.alt}
                  className="news-featured-card__image"
                  loading="lazy"
                />
              </div>
              <div className="news-featured-card__body">
                <div className="news-meta-row">
                  <span className="news-tag-pill">{newsData.featured.tag}</span>
                  <span className="news-date-text">{newsData.featured.date}</span>
                </div>
                <h3 className="news-featured-card__title">{newsData.featured.title}</h3>
                <p className="news-featured-card__summary">{newsData.featured.summary}</p>
              </div>
            </article>
          )}

          {/* 2 Smaller News Cards Side-by-Side Below */}
          <div className="news-smaller-grid">
            {newsData.smaller.map((item) => (
              <article key={item.id} className="news-small-card">
                <div className="news-small-card__image-wrapper">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="news-small-card__image"
                    loading="lazy"
                  />
                </div>
                <div className="news-small-card__body">
                  <div className="news-meta-row">
                    <span className="news-tag-pill">{item.tag}</span>
                    <span className="news-date-text">{item.date}</span>
                  </div>
                  <h3 className="news-small-card__title">{item.title}</h3>
                  <p className="news-small-card__summary">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
