// pages/EBooks.jsx
// Route: /e-books
// Lists NCERT textbooks with Class and Subject filter dropdowns.
// Download button links directly to official NCERT website in a new tab.

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEbooks, getEbookClasses, getEbookSubjects, getEbookDownloadUrl, getEbookCoverUrl } from '../api/ebooks';
import './EBooks.css';

// ── Fallback book icon (shown when cover_image_url is absent or fails to load) ─
function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="12" y1="6" x2="16" y2="6" />
      <line x1="12" y1="10" x2="16" y2="10" />
    </svg>
  );
}

// ── Single book card ────────────────────────────────────────────────────────
function EBookCard({ book }) {
  // Primary: backend proxy (avoids CORS / NCERT hotlink restrictions)
  // Fallback 1: direct cover_image_url from DB
  // Fallback 2: SVG placeholder
  const proxyCoverUrl = getEbookCoverUrl(book.id);
  const [imgSrc, setImgSrc] = useState(proxyCoverUrl);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = () => {
    if (imgSrc === proxyCoverUrl && book.cover_image_url) {
      // Try direct NCERT URL as fallback
      setImgSrc(book.cover_image_url);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <article className="ebook-card">
      {/* Cover image with fallback placeholder */}
      <div className="ebook-card__cover-wrap">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={`${book.book_title} cover`}
            className="ebook-card__cover-img"
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div className="ebook-card__cover-placeholder" aria-hidden="true">
            <BookIcon />
            <span>NCERT</span>
          </div>
        )}
      </div>

      {/* Book details */}
      <div className="ebook-card__body">
        <p className="ebook-card__tag">
          {book.class_name}&nbsp;·&nbsp;{book.subject}{book.stream ? ` · ${book.stream}` : ''}
        </p>
        <h3 className="ebook-card__title">{book.book_title}</h3>

        {/*
          Download button: native in-browser PDF download via server streaming proxy.
          The server always responds with Content-Type: application/pdf and a .pdf filename.
        */}
        <a
          href={getEbookDownloadUrl(book.id)}
          download
          className="btn-download"
        >
          Download PDF
        </a>
      </div>
    </article>
  );
}

// ── Loading skeletons ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="ebooks-page__loading" aria-busy="true" aria-label="Loading books…">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="ebooks-skeleton" />
      ))}
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────
export default function EBooks() {
  // 1. STATE & URL QUERY PARAMS:
  const [searchParams] = useSearchParams();
  const paramClass = searchParams.get('class');
  const paramSubject = searchParams.get('subject');
  const paramStream = searchParams.get('stream');

  const [selectedClass, setSelectedClass]     = useState(paramClass || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState(paramSubject || '');
  const [selectedStream, setSelectedStream]   = useState(paramStream || '');
  const [classes, setClasses]                 = useState([]);
  const [subjects, setSubjects]               = useState([]);
  const [books, setBooks]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  const isSeniorClass = selectedClass === 'Class 11' || selectedClass === 'Class 12';

  useEffect(() => {
    if (paramClass) setSelectedClass(paramClass);
    if (paramSubject !== null && paramSubject !== undefined) setSelectedSubject(paramSubject);
    if (paramStream !== null && paramStream !== undefined) setSelectedStream(paramStream);
  }, [paramClass, paramSubject, paramStream]);

  // 2. CLASS DROPDOWN: Fetch on mount
  useEffect(() => {
    let isMounted = true;
    getEbookClasses()
      .then((data) => {
        if (isMounted) {
          setClasses(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error('[EBooks] Error fetching ebook classes:', {
          error: err,
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // When selectedClass changes away from 11/12, reset selectedStream
  useEffect(() => {
    if (!isSeniorClass) {
      setSelectedStream('');
    }
  }, [selectedClass, isSeniorClass]);

  // 3. SUBJECT DROPDOWN: Fetch when selectedClass or selectedStream changes
  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (selectedClass && selectedClass !== 'All Classes') {
      params.class_name = selectedClass;
    }
    if (isSeniorClass && selectedStream && selectedStream !== 'All Streams') {
      params.stream = selectedStream;
    }

    getEbookSubjects(params, { signal: controller.signal })
      .then((data) => {
        const newSubjects = Array.isArray(data) ? data : [];
        setSubjects(newSubjects);

        // If selectedSubject is no longer in the new subject list, reset it to ''
        setSelectedSubject((prev) => (newSubjects.includes(prev) ? prev : ''));
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('[EBooks] Error fetching ebook subjects:', {
          error: err,
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [selectedClass, selectedStream, isSeniorClass]);

  // 4. BOOK LIST FETCH: Separate effect depending on [selectedClass, selectedSubject, selectedStream, subjects]
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = {};
    if (selectedClass && selectedClass !== 'All Classes') {
      params.class_name = selectedClass;
    }
    if (selectedSubject && selectedSubject !== 'All Subjects' && (!subjects.length || subjects.includes(selectedSubject))) {
      params.subject = selectedSubject;
    }
    if (isSeniorClass && selectedStream && selectedStream !== 'All Streams') {
      params.stream = selectedStream;
    }

    getEbooks(params, { signal: controller.signal })
      .then((data) => {
        setBooks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error('[EBooks] Error fetching ebooks:', {
          error: err,
          message: err?.message,
          code: err?.code,
          status: err?.response?.status,
          data: err?.response?.data,
          params,
          stack: err?.stack,
        });
        setError("Couldn't load books right now, please try again");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [selectedClass, selectedSubject, selectedStream, isSeniorClass]);

  return (
    <div className="ebooks-page">

      {/* ── Navy hero header ──────────────────────────────────────────────── */}
      <header className="ebooks-page__hero">
        <div className="container">
          <div className="ebooks-page__kicker">
            <span className="ebooks-page__kicker-line" aria-hidden="true" />
            <span className="ebooks-page__kicker-text">E-Books</span>
          </div>
          <h1 className="ebooks-page__headline">
            Download your NCERT textbooks.
          </h1>
          <p className="ebooks-page__intro">
            Official NCERT textbooks for Classes 1–12, published by the
            National Council of Educational Research and Training (NCERT),
            Government of India. All books are free to read and download
            directly from the NCERT website.
          </p>
        </div>
      </header>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="ebooks-page__filters">
        <div className="container">
          {/* Class filter */}
          <label htmlFor="ebook-class-filter" className="ebooks-filter__label">
            Class
          </label>
          <select
            id="ebook-class-filter"
            className="ebooks-filter__select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Subject filter */}
          <label htmlFor="ebook-subject-filter" className="ebooks-filter__label">
            Subject
          </label>
          <select
            id="ebook-subject-filter"
            className="ebooks-filter__select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Stream filter (Classes 11 and 12 only) */}
          {isSeniorClass && (
            <>
              <label htmlFor="ebook-stream-filter" className="ebooks-filter__label">
                Select Stream
              </label>
              <select
                id="ebook-stream-filter"
                className="ebooks-filter__select"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                aria-label="Filter by stream"
              >
                <option value="">All</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Humanities">Humanities</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* ── Book grid area ───────────────────────────────────────────────── */}
      <main className="ebooks-page__body">
        <div className="container">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="ebooks-page__error">
              <span className="ebooks-page__empty-icon" aria-hidden="true">⚠️</span>
              <h3>Unable to load books</h3>
              <p>{error}</p>
            </div>
          ) : books.length === 0 ? (
            <div className="ebooks-page__empty">
              <span className="ebooks-page__empty-icon" aria-hidden="true">📚</span>
              <h3>No books found</h3>
              <p>No books found for this class/subject.</p>
            </div>
          ) : (
            <div className="ebooks-page__grid">
              {books.map((book) => (
                <EBookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
