// pages/NewsPage.jsx
// Public-facing News & Events page.
// Fetches GET /api/news, renders responsive 3-col card grid.
// Pinned items show a gold badge (backend already returns them sorted first).
// No edit/delete/upload controls — read-only for public visitors.

import { useState, useEffect, useCallback, useRef } from 'react';
import { getNews } from '../api/news';
import './NewsPage.css';

const PAGE_SIZE = 9; // how many cards to show per "Load More" step

// ─── Helper: format ISO date string → "12 Sep 2026" ──────────────────────────
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <article className="news-card news-card--skeleton" aria-hidden="true">
      <div className="skeleton-shimmer skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-shimmer skeleton-title" />
        <div className="skeleton-shimmer skeleton-title-short" />
        <div className="skeleton-shimmer skeleton-line" style={{ marginTop: '0.5rem' }} />
        <div className="skeleton-shimmer skeleton-line" />
        <div className="skeleton-shimmer skeleton-line-short" />
      </div>
    </article>
  );
}

// ─── News card ────────────────────────────────────────────────────────────────
function NewsCard({ article }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={`news-card${article.is_pinned ? ' news-card--pinned' : ''}`}
      aria-labelledby={`news-title-${article.id}`}
    >
      {/* Image */}
      <div className="news-card__img-wrap">
        {!imgError && article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="news-card__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="news-card__img-placeholder">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Pinned badge — top-left */}
        {article.is_pinned && (
          <span className="news-card__pinned-badge" role="img" aria-label="Pinned announcement">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7z" />
            </svg>
            Pinned
          </span>
        )}

        {/* Date chip — top-right */}
        {article.created_at && (
          <span className="news-card__date-chip" aria-label={`Published ${formatDate(article.created_at)}`}>
            {formatDate(article.created_at)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="news-card__body">
        <h2
          id={`news-title-${article.id}`}
          className="news-card__title"
          title={article.title}
        >
          {article.title}
        </h2>
        <p className="news-card__description" title={article.description}>
          {article.description}
        </p>
      </div>
    </article>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function NewsPage() {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debounceRef = useRef(null);

  // ── Fetch (re-fires whenever searchQuery changes after debounce) ────────────
  const fetchNews = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE); // reset pagination on new search
    try {
      const data = await getNews(query ? { search: query } : {});
      setAllArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError('Could not load news. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNews('');
  }, [fetchNews]);

  // ── Debounced search ────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNews(value.trim());
    }, 420);
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearTimeout(debounceRef.current);
    fetchNews('');
  };

  // ── Slice for pagination ────────────────────────────────────────────────────
  const visibleArticles = allArticles.slice(0, visibleCount);
  const hasMore = visibleCount < allArticles.length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="news-page">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <header className="news-page__hero" role="banner">
        <div className="container">
          <div className="news-page__kicker">
            <span className="news-page__kicker-line" aria-hidden="true" />
            <span className="news-page__kicker-text">Latest Updates</span>
          </div>
          <h1 className="news-page__headline">News &amp; Events</h1>
          <p className="news-page__subtext">
            Stay up to date with campus announcements, achievements, upcoming events,
            and everything happening at school.
          </p>
        </div>
      </header>

      {/* ── Sticky search bar ───────────────────────────────────── */}
      <div className="news-page__search-bar" role="search">
        <div className="container">
          <div className="news-page__search-inner">
            <div className="news-page__search-wrap">
              {/* Search icon */}
              <svg
                className="news-page__search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                id="news-search-input"
                type="search"
                className="news-page__search-input"
                placeholder="Search news and announcements…"
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search news articles"
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {searchQuery && (
              <button
                className="news-page__search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}

            {!loading && (
              <span className="news-page__result-count" aria-live="polite" aria-atomic="true">
                {allArticles.length === 0
                  ? 'No results'
                  : `${allArticles.length} article${allArticles.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="news-page__content">
        <div className="container">

          {/* Loading — skeleton grid */}
          {loading && (
            <div
              className="news-page__grid news-page__grid--skeleton"
              aria-label="Loading news articles"
              role="status"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="news-page__error" role="alert">
              <div className="news-page__error-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="news-page__error-title">Unable to Load News</p>
              <p className="news-page__error-sub">{error}</p>
              <button
                className="news-page__error-retry"
                onClick={() => fetchNews(searchQuery.trim())}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && allArticles.length === 0 && (
            <div className="news-page__empty" role="status" aria-live="polite">
              <div className="news-page__empty-icon" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="news-page__empty-title">
                {searchQuery ? 'No results found' : 'No news yet'}
              </p>
              <p className="news-page__empty-sub">
                {searchQuery
                  ? `No articles matched "${searchQuery}". Try a different keyword.`
                  : 'Check back soon — the school will publish news and announcements here.'}
              </p>
              {searchQuery && (
                <button className="news-page__error-retry" onClick={clearSearch}>
                  Show all articles
                </button>
              )}
            </div>
          )}

          {/* Article grid */}
          {!loading && !error && visibleArticles.length > 0 && (
            <>
              <section
                className="news-page__grid"
                aria-label={`News articles — showing ${visibleArticles.length} of ${allArticles.length}`}
              >
                {visibleArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </section>

              {/* Load More */}
              {hasMore && (
                <div className="news-page__load-more-wrap">
                  <button
                    id="news-load-more-btn"
                    className="news-page__load-more"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    aria-label={`Load more news articles (${allArticles.length - visibleCount} remaining)`}
                  >
                    Load more
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              )}

              {/* All loaded indicator */}
              {!hasMore && allArticles.length > PAGE_SIZE && (
                <p className="news-page__all-loaded" role="status">
                  All articles shown
                </p>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
