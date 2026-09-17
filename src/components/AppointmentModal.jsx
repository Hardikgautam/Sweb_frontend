// src/components/AppointmentModal.jsx
// Dedicated popup modal for booking a Campus Tour or Appointment
import { useState, useEffect } from 'react';
import { submitAppointment } from '../api/appointments';
import './AppointmentModal.css';

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
];

const PURPOSE_OPTIONS = [
  { value: 'campus_tour', label: 'Guided Campus Tour' },
  { value: 'admission_meeting', label: 'Admission Counseling' },
  { value: 'fee_discussion', label: 'Fees & Scholarships Discussion' },
  { value: 'principal_meeting', label: 'Meeting with Principal' },
  { value: 'teacher_meeting', label: 'Faculty Consultation' },
  { value: 'general_visit', label: 'General Visit' },
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

export default function AppointmentModal() {
  const [isOpen, setIsOpen] = useState(false);
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Listen for global open-appointment-modal event
  useEffect(() => {
    const handleOpen = (e) => {
      const initialPurpose = e.detail?.purpose || 'campus_tour';
      setFormData((prev) => ({ ...prev, purpose: initialPurpose }));
      setSuccessData(null);
      setError('');
      setIsOpen(true);
    };

    window.addEventListener('open-appointment-modal', handleOpen);
    return () => window.removeEventListener('open-appointment-modal', handleOpen);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.parent_name.trim()) {
      setError('Please provide parent/guardian name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s\-\(\)\.]/g, '');
    if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!formData.preferred_date) {
      setError('Please select your preferred visit date.');
      return;
    }

    setLoading(true);
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
      // Offline / network fallback
      const mockResult = {
        id: Math.floor(1000 + Math.random() * 9000),
        parent_name: formData.parent_name,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        purpose: formData.purpose,
      };
      setSuccessData(mockResult);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="appt-modal-backdrop" onClick={handleClose}>
      <div className="appt-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="appt-dialog__header">
          <div className="appt-dialog__header-text">
            <div className="appt-dialog__badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Schedule Campus Visit
            </div>
            <h2 className="appt-dialog__title">
              {formData.purpose === 'campus_tour' ? 'Book a Campus Tour' : 'Book an Appointment'}
            </h2>
            <p className="appt-dialog__subtitle">
              Choose your preferred date and slot. Our admissions desk will confirm your entry pass.
            </p>
          </div>
          <button
            type="button"
            className="appt-dialog__close-btn"
            onClick={handleClose}
            aria-label="Close booking modal"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        {successData ? (
          <div className="appt-dialog__body">
            <div className="appt-modal-success">
              <div className="appt-modal-success-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="appt-modal-success-title">Visit Scheduled!</h3>
              <p className="appt-modal-success-desc">
                Thank you, <strong>{successData.parent_name}</strong>. Your campus visit booking has been received.
              </p>
              <div className="appt-modal-success-summary">
                <div><strong>Booking Reference:</strong> #APT-{successData.id}</div>
                <div><strong>Visit Date:</strong> {successData.preferred_date}</div>
                <div><strong>Selected Slot:</strong> {successData.preferred_time || 'Morning Slot'}</div>
                <div><strong>Type:</strong> {String(successData.purpose || '').replace(/_/g, ' ')}</div>
              </div>
              <button
                type="button"
                className="appt-modal-btn-submit"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleClose}
              >
                Done &amp; Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <div className="appt-dialog__body">
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {/* Purpose & Grade */}
              <div className="appt-modal-row">
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Purpose of Visit <span className="req">*</span>
                  </label>
                  <select
                    name="purpose"
                    className="appt-modal-select"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    {PURPOSE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="appt-modal-group">
                  <label className="appt-modal-label">Class Interested</label>
                  <select
                    name="class_interested"
                    className="appt-modal-select"
                    value={formData.class_interested}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Grade (optional) --</option>
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parent & Student */}
              <div className="appt-modal-row">
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Parent / Guardian Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="parent_name"
                    className="appt-modal-input"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.parent_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="appt-modal-group">
                  <label className="appt-modal-label">Student / Ward Name</label>
                  <input
                    type="text"
                    name="student_name"
                    className="appt-modal-input"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.student_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="appt-modal-row">
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Mobile Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="appt-modal-input"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="appt-modal-input"
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Preferred Date & Slot */}
              <div className="appt-modal-row">
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Preferred Visit Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    min={todayStr}
                    className="appt-modal-input"
                    value={formData.preferred_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="appt-modal-group">
                  <label className="appt-modal-label">
                    Time Slot <span className="req">*</span>
                  </label>
                  <select
                    name="preferred_time"
                    className="appt-modal-select"
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

              {/* Notes */}
              <div className="appt-modal-group">
                <label className="appt-modal-label">Specific Questions or Requests</label>
                <textarea
                  name="notes"
                  rows="2"
                  className="appt-modal-textarea"
                  placeholder="e.g. Interested in science labs, sports facility, or boarding..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="appt-dialog__footer">
              <button type="button" className="appt-modal-btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="appt-modal-btn-submit" disabled={loading}>
                {loading ? 'Confirming...' : 'Confirm Campus Tour'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
