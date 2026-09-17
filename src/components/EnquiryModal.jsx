// components/EnquiryModal.jsx
// Interactive admission enquiry modal popup that POSTs to /api/enquiries.

import { useState, useEffect } from 'react';
import { submitEnquiry } from '../api/enquiries';
import './EnquiryModal.css';

export default function EnquiryModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    }
    setInternalOpen(false);
  };

  const [formData, setFormData] = useState({
    child_name: '',
    parent_name: '',
    phone: '',
    email: '',
    class_applying_for: 'Nursery',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Listen for open-enquiry-modal custom event
  useEffect(() => {
    const handleOpen = () => {
      setInternalOpen(true);
      setSuccess(false);
      setError(null);
    };
    window.addEventListener('open-enquiry-modal', handleOpen);
    return () => window.removeEventListener('open-enquiry-modal', handleOpen);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset form when reopened
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitEnquiry(formData);
      setSuccess(true);
    } catch (err) {
      console.error('Enquiry error:', err);
      setError(
        err.response?.data?.detail ||
        'Unable to submit your enquiry at the moment. Please try again or call our admissions desk.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enquiry-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="enquiry-modal" onClick={(e) => e.stopPropagation()}>

        {/* Sticky Header */}
        <div className="enquiry-modal__header">
          <div className="enquiry-modal__header-text">
            <p className="enquiry-modal__kicker">ADMISSIONS 2027–28</p>
            <h2 id="modal-title" className="enquiry-modal__title">Admission Enquiry Form</h2>
          </div>
          <button className="enquiry-modal__close-btn" onClick={handleClose} aria-label="Close enquiry form">
            &times;
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="enquiry-modal__body">
          {success ? (
            <div className="enquiry-success">
              <div className="enquiry-success__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="enquiry-success__title">Enquiry Received</h3>
              <p className="enquiry-success__body">
                Thank you, <strong>{formData.parent_name}</strong>! We have received your admission enquiry for{' '}
                <strong>{formData.child_name}</strong> ({formData.class_applying_for}).
                <br /><br />
                Our admissions team will review your application and contact you at <strong>{formData.phone}</strong> or{' '}
                <strong>{formData.email}</strong> within 24 to 48 hours.
              </p>
              <button className="btn btn--primary enquiry-success__done-btn" onClick={handleClose}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="enquiry-modal__subtitle">
                Fill out this quick 2-minute enquiry to receive prospectus details, class availability, and schedule a campus tour.
              </p>

              {error && <div className="enquiry-form__error">{error}</div>}

              <form className="enquiry-form" onSubmit={handleSubmit}>
              <div className="enquiry-form__row">
                <div className="enquiry-form__field">
                  <label className="enquiry-form__label" htmlFor="child_name">
                    Child's Full Name *
                  </label>
                  <input
                    type="text"
                    id="child_name"
                    name="child_name"
                    required
                    value={formData.child_name}
                    onChange={handleChange}
                    className="enquiry-form__input"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="enquiry-form__field">
                  <label className="enquiry-form__label" htmlFor="class_applying_for">
                    Class Applying For *
                  </label>
                  <select
                    id="class_applying_for"
                    name="class_applying_for"
                    required
                    value={formData.class_applying_for}
                    onChange={handleChange}
                    className="enquiry-form__select"
                  >
                    <option value="Nursery">Nursery (Age 3+)</option>
                    <option value="Junior KG">Junior KG (Age 4+)</option>
                    <option value="Senior KG">Senior KG (Age 5+)</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div className="enquiry-form__field">
                <label className="enquiry-form__label" htmlFor="parent_name">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  id="parent_name"
                  name="parent_name"
                  required
                  value={formData.parent_name}
                  onChange={handleChange}
                  className="enquiry-form__input"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="enquiry-form__row">
                <div className="enquiry-form__field">
                  <label className="enquiry-form__label" htmlFor="phone">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="enquiry-form__input"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="enquiry-form__field">
                  <label className="enquiry-form__label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="enquiry-form__input"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="enquiry-form__field">
                <label className="enquiry-form__label" htmlFor="message">
                  Additional Notes / Questions (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="enquiry-form__textarea"
                  placeholder="Any questions about curriculum, school transport, or campus visits..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="enquiry-form__submit-btn"
              >
                {loading ? 'Submitting Enquiry…' : 'Submit Enquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  </div>
  );
}

