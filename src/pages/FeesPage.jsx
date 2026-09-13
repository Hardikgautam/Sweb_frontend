// src/pages/FeesPage.jsx — Public Fees & Scholarships page
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFees, getScholarships } from '../api/fees';
import { openEnquiryModal } from '../api/enquiries';
import './FeesPage.css';

// Fallback fee data in case backend server is initializing
const FALLBACK_FEES = [
  { id: 1, class_name: 'Nursery & KG', category: 'Admission Fee', amount: 15000, frequency: 'one-time', academic_year: '2027-28', notes: 'Payable once at the time of initial enrollment', display_order: 1 },
  { id: 2, class_name: 'Nursery & KG', category: 'Annual Charges', amount: 12000, frequency: 'annual', academic_year: '2027-28', notes: 'Includes activity kits, learning materials, and periodic health checks', display_order: 2 },
  { id: 3, class_name: 'Nursery & KG', category: 'Tuition Fee', amount: 3500, frequency: 'monthly', academic_year: '2027-28', notes: 'Billed quarterly in advance', display_order: 3 },

  { id: 4, class_name: 'Class 1 – 5', category: 'Admission Fee', amount: 18000, frequency: 'one-time', academic_year: '2027-28', notes: 'Payable once for new admissions', display_order: 4 },
  { id: 5, class_name: 'Class 1 – 5', category: 'Annual Charges', amount: 14000, frequency: 'annual', academic_year: '2027-28', notes: 'Covers library access, digital learning portal, sports, and insurance', display_order: 5 },
  { id: 6, class_name: 'Class 1 – 5', category: 'Tuition Fee', amount: 4200, frequency: 'monthly', academic_year: '2027-28', notes: 'Comprehensive curriculum and co-curricular programs', display_order: 6 },

  { id: 7, class_name: 'Class 6 – 8', category: 'Admission Fee', amount: 20000, frequency: 'one-time', academic_year: '2027-28', notes: 'Payable once for new admissions', display_order: 7 },
  { id: 8, class_name: 'Class 6 – 8', category: 'Annual Charges', amount: 16000, frequency: 'annual', academic_year: '2027-28', notes: 'Includes laboratory usage, library, workshops, and sports equipment', display_order: 8 },
  { id: 9, class_name: 'Class 6 – 8', category: 'Tuition Fee', amount: 4800, frequency: 'monthly', academic_year: '2027-28', notes: 'Subject-expert faculty and junior robotics/science labs', display_order: 9 },

  { id: 10, class_name: 'Class 9 – 10', category: 'Admission Fee', amount: 22000, frequency: 'one-time', academic_year: '2027-28', notes: 'Payable once for new admissions', display_order: 10 },
  { id: 11, class_name: 'Class 9 – 10', category: 'Annual Charges', amount: 18000, frequency: 'annual', academic_year: '2027-28', notes: 'Board registration support, practical examinations, and career counseling', display_order: 11 },
  { id: 12, class_name: 'Class 9 – 10', category: 'Tuition Fee', amount: 5500, frequency: 'monthly', academic_year: '2027-28', notes: 'Board exam mentoring, test series, and remedial coaching', display_order: 12 },

  { id: 13, class_name: 'Class 11 – 12', category: 'Admission Fee', amount: 25000, frequency: 'one-time', academic_year: '2027-28', notes: 'Payable once for new admissions', display_order: 13 },
  { id: 14, class_name: 'Class 11 – 12', category: 'Annual Charges', amount: 20000, frequency: 'annual', academic_year: '2027-28', notes: 'Advanced laboratories, competitive entrance orientation, and seminars', display_order: 14 },
  { id: 15, class_name: 'Class 11 – 12', category: 'Tuition Fee', amount: 6500, frequency: 'monthly', academic_year: '2027-28', notes: 'Science, Commerce & Humanities specialized coursework', display_order: 15 },
];

const FALLBACK_SCHOLARSHIPS = [
  {
    id: 1,
    title: 'Academic Merit Scholarship',
    description: 'Awarded to outstanding academic achievers scoring 90% or above in the previous academic year’s final evaluation.',
    eligibility_criteria: 'Students of Class 6–12 with ≥ 90% aggregate in the annual examination and consistent attendance (≥ 85%).',
    discount_type: 'percentage',
    discount_value: 25,
    applicable_classes: 'Class 6 – 12',
    how_to_apply: 'Submit the previous year’s verified report card and a recommendation letter from the class teacher to the Admissions office by 30th April.',
    display_order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: 'Sibling Concession',
    description: 'Financial concession offered to families enrolling two or more children concurrently at Greenwood Academy.',
    eligibility_criteria: 'Second and third biological sibling currently enrolled in the school. Applies directly to the younger child’s tuition fee.',
    discount_type: 'percentage',
    discount_value: 15,
    applicable_classes: 'Nursery – Class 12',
    how_to_apply: 'Attach sibling admission numbers and birth certificates along with the admission / re-enrollment form.',
    display_order: 2,
    is_active: true,
  },
  {
    id: 3,
    title: 'Sports & Cultural Excellence Grant',
    description: 'Recognizes young athletes and artists representing the district, state, or nation in recognized federations and competitions.',
    eligibility_criteria: 'State or National level medal winners or participants in SGFI/recognized federations within the past 12 months.',
    discount_type: 'fixed_amount',
    discount_value: 12000,
    applicable_classes: 'Class 3 – 12',
    how_to_apply: 'Submit federation achievement certificates and verification from the School Sports or Arts Department to the Principal’s Desk.',
    display_order: 3,
    is_active: true,
  },
  {
    id: 4,
    title: 'Staff Ward Concession',
    description: 'Staff welfare benefit supporting the education of teaching and administrative staff children.',
    eligibility_criteria: 'Children of permanent staff members with at least 1 year of continuous service.',
    discount_type: 'percentage',
    discount_value: 50,
    applicable_classes: 'Nursery – Class 12',
    how_to_apply: 'Submit internal staff ward application through the administrative portal before each academic term.',
    display_order: 4,
    is_active: true,
  },
  {
    id: 5,
    title: 'Single Girl Child Support Scheme',
    description: 'Special initiative to empower female education and encourage sustained academic excellence for single daughters.',
    eligibility_criteria: 'Verified single girl child in the family enrolled from Nursery through Class 10.',
    discount_type: 'percentage',
    discount_value: 10,
    applicable_classes: 'Nursery – Class 10',
    how_to_apply: 'Submit an affidavit / notarized declaration confirming single girl child status at the time of fee payment.',
    display_order: 5,
    is_active: true,
  },
];

const FREQUENCY_LABELS = {
  'one-time': 'One-Time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

const FREQUENCY_BADGES = {
  'one-time': 'fees-badge--onetime',
  monthly: 'fees-badge--monthly',
  quarterly: 'fees-badge--quarterly',
  annual: 'fees-badge--annual',
};

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'scholarships'

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [feesData, scholarshipsData] = await Promise.allSettled([
          getFees(),
          getScholarships(),
        ]);

        if (!mounted) return;

        if (feesData.status === 'fulfilled' && Array.isArray(feesData.value) && feesData.value.length > 0) {
          setFees(feesData.value);
        } else {
          setFees(FALLBACK_FEES);
        }

        if (scholarshipsData.status === 'fulfilled' && Array.isArray(scholarshipsData.value) && scholarshipsData.value.length > 0) {
          setScholarships(scholarshipsData.value.filter(s => s.is_active));
        } else {
          setScholarships(FALLBACK_SCHOLARSHIPS.filter(s => s.is_active));
        }
      } catch (err) {
        if (!mounted) return;
        setFees(FALLBACK_FEES);
        setScholarships(FALLBACK_SCHOLARSHIPS);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  // Distinct classes for filter chips
  const classNames = useMemo(() => {
    const set = new Set();
    fees.forEach(f => {
      if (f.class_name) set.add(f.class_name);
    });
    return Array.from(set);
  }, [fees]);

  // Group fees by class_name
  const groupedFees = useMemo(() => {
    const groups = {};
    const filtered = selectedClass === 'all'
      ? fees
      : fees.filter(f => f.class_name === selectedClass);

    filtered.forEach(fee => {
      if (!groups[fee.class_name]) {
        groups[fee.class_name] = [];
      }
      groups[fee.class_name].push(fee);
    });

    return groups;
  }, [fees, selectedClass]);

  const formatCurrency = (amt) => {
    const num = Number(amt);
    if (isNaN(num)) return `₹${amt}`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fees-page">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <section className="fees-hero">
        <div className="container">
          <nav className="fees-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="fees-breadcrumb__sep">/</span>
            <span className="fees-breadcrumb__current">Fees &amp; Scholarships</span>
          </nav>

          <div className="fees-hero__content">
            <div className="fees-hero__kicker">
              <span className="fees-hero__kicker-line" aria-hidden="true" />
              <span>Transparent &amp; Predictable Financial Planning</span>
            </div>
            <h1 className="fees-hero__title">Fees Structure &amp; Scholarship Programs</h1>
            <p className="fees-hero__subtitle">
              We believe quality education should come with honest, complete clarity. No hidden levies,
              no unexpected mid-term additions — just straightforward value for your child’s learning journey.
            </p>
          </div>

          <div className="fees-nav-pills">
            <button
              type="button"
              className={`fees-nav-pill ${activeTab === 'fees' ? 'active' : ''}`}
              onClick={() => setActiveTab('fees')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Fee Structure
            </button>
            <button
              type="button"
              className={`fees-nav-pill ${activeTab === 'scholarships' ? 'active' : ''}`}
              onClick={() => setActiveTab('scholarships')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Scholarships &amp; Concessions
              <span className="fees-nav-pill__count">{scholarships.length}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Fee Philosophy Highlights ───────────────────────────────── */}
      <section className="fees-philosophy">
        <div className="container">
          <div className="fees-philosophy__grid">
            <div className="fees-phi-card">
              <div className="fees-phi-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>100% Transparent Schedule</h3>
              <p>Every single academic cost — from tuition to lab usage — is published well before session commencement. Zero unexpected surprise charges.</p>
            </div>

            <div className="fees-phi-card">
              <div className="fees-phi-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>Flexible Payment Windows</h3>
              <p>Pay annually, quarterly, or monthly with multiple digital modes (UPI, Net Banking, Debit/Credit Card, or NACH Mandate) with automated receipts.</p>
            </div>

            <div className="fees-phi-card">
              <div className="fees-phi-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h3>Merit &amp; Need-Based Support</h3>
              <p>We actively support dedicated scholars, multi-sibling families, and sports achievers through substantial fee remission schemes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: FEE STRUCTURE ────────────────────────────────── */}
      {activeTab === 'fees' && (
        <section className="fees-section">
          <div className="container">
            <div className="fees-section__header">
              <div>
                <span className="fees-section__tag">Schedule of Fees</span>
                <h2 className="fees-section__title">Class-Wise Fee Breakdown</h2>
                <p className="fees-section__desc">
                  Academic Year 2027–28. All amounts are displayed in Indian Rupees (INR).
                </p>
              </div>

              {/* Class filter chips */}
              <div className="fees-filters" role="group" aria-label="Class filter">
                <button
                  type="button"
                  className={`fees-filter-chip ${selectedClass === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedClass('all')}
                >
                  All Classes
                </button>
                {classNames.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    className={`fees-filter-chip ${selectedClass === cls ? 'active' : ''}`}
                    onClick={() => setSelectedClass(cls)}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="fees-skeleton-wrap">
                <div className="fees-skeleton fees-skeleton--header" />
                <div className="fees-skeleton fees-skeleton--table" />
                <div className="fees-skeleton fees-skeleton--table" />
              </div>
            ) : Object.keys(groupedFees).length === 0 ? (
              <div className="fees-empty">
                <p>No fee structure records found for the selected category.</p>
              </div>
            ) : (
              <div className="fees-tables-stack">
                {Object.entries(groupedFees).map(([className, items]) => {
                  // Calculate monthly tuition & one-time
                  const monthlyTuition = items.find(i => i.frequency === 'monthly');
                  const annualCharges = items.find(i => i.frequency === 'annual');
                  const admissionFee = items.find(i => i.frequency === 'one-time');

                  return (
                    <div key={className} className="fees-class-card">
                      <div className="fees-class-card__header">
                        <div className="fees-class-card__title-group">
                          <span className="fees-class-card__badge">Grade</span>
                          <h3 className="fees-class-card__name">{className}</h3>
                        </div>

                        <div className="fees-class-card__quick-stats">
                          {monthlyTuition && (
                            <div className="fees-quick-stat">
                              <span className="fees-quick-stat__label">Tuition / Mo</span>
                              <span className="fees-quick-stat__value">{formatCurrency(monthlyTuition.amount)}</span>
                            </div>
                          )}
                          {annualCharges && (
                            <div className="fees-quick-stat">
                              <span className="fees-quick-stat__label">Annual Charges</span>
                              <span className="fees-quick-stat__value">{formatCurrency(annualCharges.amount)}</span>
                            </div>
                          )}
                          {admissionFee && (
                            <div className="fees-quick-stat">
                              <span className="fees-quick-stat__label">Admission (One-Time)</span>
                              <span className="fees-quick-stat__value">{formatCurrency(admissionFee.amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="fees-table-responsive">
                        <table className="fees-table">
                          <thead>
                            <tr>
                              <th>Fee Head / Category</th>
                              <th>Billing Frequency</th>
                              <th style={{ textAlign: 'right' }}>Amount</th>
                              <th>Description &amp; Coverage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(item => (
                              <tr key={item.id}>
                                <td className="fees-table__cat">
                                  <strong>{item.category}</strong>
                                </td>
                                <td>
                                  <span className={`fees-badge ${FREQUENCY_BADGES[item.frequency] || 'fees-badge--annual'}`}>
                                    {FREQUENCY_LABELS[item.frequency] || item.frequency}
                                  </span>
                                </td>
                                <td className="fees-table__amount" style={{ textAlign: 'right' }}>
                                  {formatCurrency(item.amount)}
                                </td>
                                <td className="fees-table__notes">
                                  {item.notes || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Disclaimer & Policy Notice */}
            <div className="fees-notice-box">
              <div className="fees-notice-box__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="fees-notice-box__content">
                <h4>Important Financial Notes &amp; Policies</h4>
                <ul>
                  <li><strong>Annual Revision:</strong> Fees are subject to moderate annual revision (typically 5%–8%) determined in consultation with the Parent-Teacher Advisory Council, aligned with inflation and campus infrastructural expansions.</li>
                  <li><strong>Optional Facilities:</strong> School transport and specialized cafeteria meals are optional services and billed separately based on route distance and term subscription.</li>
                  <li><strong>Late Fee Policy:</strong> Dues must be settled within the first 10 calendar days of each billing cycle. A nominal grace period of 7 days is provided before late charges apply.</li>
                  <li><strong>Refundable Caution Deposit:</strong> Any security deposits taken at the time of admission are fully refundable upon issuance of the Transfer Certificate (TC) following clearance of all library and lab dues.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: SCHOLARSHIPS & CONCESSIONS ────────────────────── */}
      {activeTab === 'scholarships' && (
        <section className="scholarships-section">
          <div className="container">
            <div className="fees-section__header">
              <div>
                <span className="fees-section__tag">Merit &amp; Welfare</span>
                <h2 className="fees-section__title">Scholarships &amp; Concessions</h2>
                <p className="fees-section__desc">
                  Rewarding hard work, celebrating exceptional talent, and ensuring quality education remains accessible to all families.
                </p>
              </div>
              <button
                type="button"
                className="fees-cta-btn"
                onClick={() => openEnquiryModal()}
              >
                Apply for Scholarship
              </button>
            </div>

            {loading ? (
              <div className="fees-skeleton-wrap">
                <div className="fees-skeleton fees-skeleton--table" />
                <div className="fees-skeleton fees-skeleton--table" />
              </div>
            ) : scholarships.length === 0 ? (
              <div className="fees-empty">
                <p>No active scholarships available at this time. Please check back soon.</p>
              </div>
            ) : (
              <div className="scholarships-grid">
                {scholarships.map(s => (
                  <div key={s.id} className="scholarship-card">
                    <div className="scholarship-card__top">
                      <div className="scholarship-card__discount-pill">
                        {s.discount_type === 'percentage' ? (
                          <>
                            <span className="scholarship-card__discount-num">{s.discount_value}%</span>
                            <span className="scholarship-card__discount-type">TUITION WAIVER</span>
                          </>
                        ) : (
                          <>
                            <span className="scholarship-card__discount-num">{formatCurrency(s.discount_value)}</span>
                            <span className="scholarship-card__discount-type">GRANT CONCESSION</span>
                          </>
                        )}
                      </div>
                      <span className="scholarship-card__classes-tag">
                        {s.applicable_classes}
                      </span>
                    </div>

                    <h3 className="scholarship-card__title">{s.title}</h3>
                    <p className="scholarship-card__desc">{s.description}</p>

                    <div className="scholarship-card__detail-block">
                      <div className="scholarship-card__detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Eligibility Criteria:
                      </div>
                      <p className="scholarship-card__detail-text">{s.eligibility_criteria}</p>
                    </div>

                    <div className="scholarship-card__detail-block">
                      <div className="scholarship-card__detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        How to Apply:
                      </div>
                      <p className="scholarship-card__detail-text">{s.how_to_apply}</p>
                    </div>

                    <div className="scholarship-card__footer">
                      <button
                        type="button"
                        className="scholarship-card__apply-btn"
                        onClick={() => openEnquiryModal()}
                      >
                        Enquire / Submit Claim &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scholarship assistance callout */}
            <div className="scholarship-callout">
              <div className="scholarship-callout__content">
                <h3>Need Personalized Financial Guidance?</h3>
                <p>Our Admissions &amp; Accounts counseling team is available Monday through Saturday (9 AM – 3 PM) to discuss installment schedules, fee waivers, and documentation.</p>
              </div>
              <button
                type="button"
                className="fees-cta-btn fees-cta-btn--gold"
                onClick={() => openEnquiryModal()}
              >
                Schedule Financial Consultation
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom Call to Action ───────────────────────────────────── */}
      <section className="fees-bottom-cta">
        <div className="container fees-bottom-cta__inner">
          <div className="fees-bottom-cta__text">
            <h2>Ready to Take the Next Step in Your Child’s Education?</h2>
            <p>Admissions are now open for the upcoming academic session. Connect with our counselors or schedule an in-person campus walk-through today.</p>
          </div>
          <div className="fees-bottom-cta__actions">
            <button
              type="button"
              className="fees-cta-btn fees-cta-btn--white"
              onClick={() => openEnquiryModal()}
            >
              Fill Admission Enquiry
            </button>
            <Link to="/#contact" className="fees-cta-btn fees-cta-btn--outline">
              Visit Campus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
