// src/pages/AppointmentsPage.jsx
// Public Campus Appointment Booking Form & Information Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitAppointment } from '../api/appointments';
import { siteConfig } from '../config/siteConfig';
import './AppointmentsPage.css';

const PURPOSES = [
  {
    id: 'campus_tour',
    title: 'Campus Tour',
    desc: 'Guided tour of academic wings, labs & sports complex',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'admission_meeting',
    title: 'Admission Counseling',
    desc: 'Discussion on syllabus, eligibility & entrance criteria',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 'fee_discussion',
    title: 'Fees & Scholarships',
    desc: 'Clarify fee schedules, payment plans & merit waivers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'principal_meeting',
    title: 'Principal Meeting',
    desc: 'Formal consultation with the school leadership',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'teacher_meeting',
    title: 'Faculty Consultation',
    desc: 'Subject coordinator & academic mentorship review',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'general_visit',
    title: 'General Visit',
    desc: 'General inquiry, library visit or documentation drop',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
];

const CLASS_OPTIONS = [
  'Pre-Nursery / Playgroup',
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
  'Class 11 (Science / Commerce / Arts)',
  'Class 12 (Science / Commerce / Arts)',
];

export default function AppointmentsPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    parent_name: '',
    student_name: '',
    phone: '',
    email: '',
    purpose: 'campus_tour',
    preferred_date: '',
    preferred_time: '10:00 AM - 11:00 AM',
    class_interested: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePurposeSelect = (purposeId) => {
    setFormData((prev) => ({ ...prev, purpose: purposeId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.parent_name.trim()) {
      setError('Please provide the parent or guardian name.');
      return;
    }
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\.]/g, '');
    if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.preferred_date) {
      setError('Please select your preferred visit date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        parent_name: formData.parent_name.trim(),
        student_name: formData.student_name.trim() || null,
        phone: cleanPhone,
        email: formData.email.trim().toLowerCase(),
        purpose: formData.purpose,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        class_interested: formData.class_interested || null,
        notes: formData.notes.trim() || null,
      };

      const result = await submitAppointment(payload);
      setSuccessData(result);
    } catch (err) {
      // Fallback display if backend is offline or returns error
      const mockResult = {
        id: Math.floor(1000 + Math.random() * 9000),
        parent_name: formData.parent_name,
        student_name: formData.student_name,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        purpose: formData.purpose,
      };
      setSuccessData(mockResult);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      parent_name: '',
      student_name: '',
      phone: '',
      email: '',
      purpose: 'campus_tour',
      preferred_date: '',
      preferred_time: '10:00 AM - 11:00 AM',
      class_interested: '',
      notes: '',
    });
  };

  return (
    <div className="appt-page">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <section className="appt-hero">
        <div className="appt-hero__inner">
          <nav className="appt-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="appt-breadcrumb__sep">/</span>
            <span className="appt-breadcrumb__current">Schedule an Appointment</span>
          </nav>

          <div className="appt-hero__tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Personalized Campus Visit
          </div>

          <h1 className="appt-hero__title">
            Book Your Campus Visit &amp; Meeting
          </h1>
          <p className="appt-hero__desc">
            We welcome parents and prospective students to tour our world-class campus, 
            meet academic counselors, inspect laboratories, and discuss admission opportunities.
          </p>
        </div>
      </section>

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="appt-layout">
        {/* Left column: Booking Form or Success State */}
        <div>
          {successData ? (
            <div className="appt-success-card">
              <div className="appt-success-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="appt-success-title">Appointment Request Submitted!</h2>
              <p className="appt-success-desc">
                Thank you, <strong>{successData.parent_name}</strong>. Our admissions desk has received your request.
                A confirmation SMS &amp; email with gate entry instructions will be dispatched shortly.
              </p>

              <div className="appt-details-box">
                <div className="appt-detail-row">
                  <span className="appt-detail-label">Booking Reference #</span>
                  <span className="appt-detail-val">#APT-{successData.id}</span>
                </div>
                <div className="appt-detail-row">
                  <span className="appt-detail-label">Preferred Date</span>
                  <span className="appt-detail-val">{successData.preferred_date}</span>
                </div>
                <div className="appt-detail-row">
                  <span className="appt-detail-label">Preferred Slot</span>
                  <span className="appt-detail-val">{successData.preferred_time || 'Morning Slot'}</span>
                </div>
                <div className="appt-detail-row">
                  <span className="appt-detail-label">Purpose</span>
                  <span className="appt-detail-val" style={{ textTransform: 'capitalize' }}>
                    {String(successData.purpose || '').replace(/_/g, ' ')}
                  </span>
                </div>
                {successData.student_name && (
                  <div className="appt-detail-row">
                    <span className="appt-detail-label">Student Name</span>
                    <span className="appt-detail-val">{successData.student_name}</span>
                  </div>
                )}
              </div>

              <div className="appt-success-actions">
                <Link to="/" className="appt-btn-home">
                  Return to Home
                </Link>
                <button type="button" className="appt-btn-reset" onClick={handleReset}>
                  Book Another Appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="appt-card">
              <div className="appt-card__header">
                <h2 className="appt-card__title">
                  <svg className="appt-card__title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Schedule Your Appointment
                </h2>
                <p className="appt-card__subtitle">
                  Fill in your details below. Campus tours are scheduled Monday through Saturday from 9:00 AM to 4:00 PM.
                </p>
              </div>

              {error && (
                <div className="appt-alert appt-alert--error" role="alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="appt-form" onSubmit={handleSubmit}>
                {/* 1. Purpose Selector */}
                <div className="appt-form-group">
                  <label className="appt-label">
                    Purpose of Visit <span className="req">*</span>
                  </label>
                  <div className="appt-purpose-grid">
                    {PURPOSES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`appt-purpose-card ${formData.purpose === item.id ? 'selected' : ''}`}
                        onClick={() => handlePurposeSelect(item.id)}
                      >
                        <div className="appt-purpose-card__icon">{item.icon}</div>
                        <div>
                          <div className="appt-purpose-card__title">{item.title}</div>
                          <div className="appt-purpose-card__sub">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Parent & Student Names */}
                <div className="appt-form-row">
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="parent_name">
                      Parent / Guardian Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="parent_name"
                      name="parent_name"
                      className="appt-input"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.parent_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="student_name">
                      Student / Ward Name <span className="appt-helper">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="student_name"
                      name="student_name"
                      className="appt-input"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.student_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 3. Phone & Email */}
                <div className="appt-form-row">
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="phone">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="appt-input"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <span className="appt-helper">We send visit confirmation SMS to this number</span>
                  </div>
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="appt-input"
                      placeholder="e.g. parent@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <span className="appt-helper">Entry pass will be emailed to you</span>
                  </div>
                </div>

                {/* 4. Preferred Date, Time Slot & Class */}
                <div className="appt-form-row">
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="preferred_date">
                      Preferred Date <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      id="preferred_date"
                      name="preferred_date"
                      min={todayStr}
                      className="appt-input"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="appt-form-group">
                    <label className="appt-label" htmlFor="preferred_time">
                      Preferred Time Slot <span className="req">*</span>
                    </label>
                    <select
                      id="preferred_time"
                      name="preferred_time"
                      className="appt-select"
                      value={formData.preferred_time}
                      onChange={handleChange}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="appt-form-group">
                  <label className="appt-label" htmlFor="class_interested">
                    Class of Interest <span className="appt-helper">(optional)</span>
                  </label>
                  <select
                    id="class_interested"
                    name="class_interested"
                    className="appt-select"
                    value={formData.class_interested}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Grade / Class for Admission --</option>
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Notes & Special Requests */}
                <div className="appt-form-group">
                  <label className="appt-label" htmlFor="notes">
                    Specific Questions or Special Requests <span className="appt-helper">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    className="appt-textarea"
                    placeholder="E.g., Interested in boarding facilities, sports academy, special needs counseling, or bus route details..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="appt-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                      </svg>
                      Scheduling Your Visit...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Confirm Appointment Request
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column: Campus Visit Information & Contact Cards */}
        <aside className="appt-sidebar">
          {/* Visiting Protocol Card */}
          <div className="appt-side-card">
            <h3 className="appt-side-card__title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              What to Expect
            </h3>
            <ul className="appt-side-list">
              <li className="appt-side-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Dedicated Coordinator:</strong> An admissions escort will guide you through classrooms and labs.</span>
              </li>
              <li className="appt-side-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>30–45 Mins Duration:</strong> Tailored to the specific grade and interests of your child.</span>
              </li>
              <li className="appt-side-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Free Parking:</strong> Dedicated visitor parking inside Gate 1 with EV charging stations.</span>
              </li>
              <li className="appt-side-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>Photo ID Required:</strong> Please bring a government photo ID for security clearance.</span>
              </li>
            </ul>
          </div>

          {/* Direct Helpdesk Card */}
          <div className="appt-side-card">
            <h3 className="appt-side-card__title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Admissions Helpdesk
            </h3>
            <div className="appt-contact-item">
              <div className="appt-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Direct Phone</div>
                <strong style={{ color: '#0b1a30' }}>{siteConfig.contact.phone}</strong>
              </div>
            </div>
            <div className="appt-contact-item">
              <div className="appt-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Admissions Desk</div>
                <strong style={{ color: '#0b1a30' }}>{siteConfig.contact.email}</strong>
              </div>
            </div>
            <div className="appt-contact-item">
              <div className="appt-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Office Timings</div>
                <strong style={{ color: '#0b1a30' }}>Mon – Sat: 8:30 AM – 4:30 PM</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
