# Greenwood Public School — Frontend

React 19 + Vite single-page application for Greenwood Public School.

> **Full Detailed Architecture & Route Guide**: See [docs/FRONTEND_DOCUMENTATION.md](../docs/FRONTEND_DOCUMENTATION.md)

---

## Quick Reference

### Running the Frontend
```bash
cd frontend
npm install    # if dependencies not yet installed
npm run dev    # runs dev server on http://localhost:5173
npm run build  # produces production bundle in dist/
```

- **Environment Variable**: `VITE_API_URL` (defaults to `http://localhost:8000/api`)

---

## Route Overview

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | `Home.jsx` | Full homepage with 10 sections (Hero, Stats, Academics, Why Us, Numbers, School Life, Admissions, Teachers, Events & News, Final CTA) |
| `/e-books` | `EBooks.jsx` | Complete NCERT digital library (Classes 1–12, Science/Commerce/Humanities streams, PDF reader & downloader) |
| `/calendar` | `HolidayCalendar.jsx` | Academic Year 2026–27 school calendar with term breakdowns |
| `/classes` | `ClassesPage.jsx` | Academic stages (Foundational, Preparatory, Middle, Secondary) |
| `/subjects/:id` | `SubjectPage.jsx` | Dedicated pages for Languages, Mathematics, Science, Social Studies, Computer Science, and Arts |
