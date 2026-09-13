// components/TeachersSection.jsx
// Section 06: "Meet Our Teachers" with a 4-teacher responsive card grid powered by live API data.

import { useState, useEffect } from 'react';
import { teachersContent } from '../config/teachersContent';
import { getTeachers } from '../api/teachers';
import './TeachersSection.css';

export default function TeachersSection() {
  const { kickerNumber, kickerLabel, headlineLines, description, teachers: fallbackTeachers } = teachersContent;
  const [teachers, setTeachers] = useState(fallbackTeachers);

  useEffect(() => {
    getTeachers()
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.map((t) => ({
            id: t.id,
            name: t.name,
            role: t.subject_role,
            bio: t.bio,
            photo: t.photo_url,
          }));
          setTeachers(formatted);
        }
      })
      .catch((err) => {
        console.warn('Could not load teachers from API, using fallback:', err);
      });
  }, []);

  return (
    <section id="teachers" className="teachers-section" aria-label="Our Teachers">
      <div className="container">

        {/* ── Section Header Row ───────────────────────────────────────── */}
        <div className="teachers-section__header">
          <div className="teachers-section__header-left">
            <div className="teachers-section__kicker">
              <span className="teachers-section__kicker-line" aria-hidden="true" />
              <span className="teachers-section__kicker-text">
                {kickerNumber} &nbsp;{kickerLabel}
              </span>
            </div>
            <h2 className="teachers-section__headline">
              {headlineLines.map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </h2>
          </div>

          <p className="teachers-section__description">
            {description}
          </p>
        </div>

        {/* ── 4-Teacher Card Grid ──────────────────────────────────────── */}
        <div className="teachers-section__grid">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="teacher-card">
              <div className="teacher-card__photo-wrapper">
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="teacher-card__photo"
                  loading="lazy"
                />
              </div>

              <div className="teacher-card__content">
                <h3 className="teacher-card__name">{teacher.name}</h3>
                <p className="teacher-card__role">{teacher.role}</p>
                <p className="teacher-card__bio">{teacher.bio}</p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
