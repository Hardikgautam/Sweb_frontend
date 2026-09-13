// pages/ClassesPage.jsx
// Dedicated academic stage detail pages:
// - /classes/primary    -> Classes 1–5 (Primary Wing)
// - /classes/middle     -> Classes 6–8 (Middle Wing)
// - /classes/secondary  -> Classes 9–10 (Secondary Wing)
// - /classes            -> Full Overview

import { useParams, Link, useNavigate } from 'react-router-dom';
import { openEnquiryModal } from '../api/enquiries';
import { publicUrl } from '../utils/publicUrl';
import './ClassesPage.css';

const STAGES_DATA = {
  primary: {
    key: 'primary',
    slug: 'primary',
    badge: 'FOUNDATIONAL & PRIMARY',
    title: 'Classes 1–5 (Primary Wing)',
    subtitle: 'Nurturing curiosity, foundational literacy, and joyful experiential discovery.',
    heroImage: publicUrl('images/image2.jpg'),
    defaultEbookClass: 'Class 1',
    stats: [
      { number: '15:1', label: 'Student-Teacher Ratio' },
      { number: '100%', label: 'Activity-Based Discovery' },
      { number: 'Daily', label: 'Library & Sports Hour' },
      { number: 'CBSE', label: 'Affiliated Curriculum' },
    ],
    overview:
      'The Primary Wing at XYZ Public School provides a warm, stimulating environment where young minds transition from informal play to structured conceptual thinking. Our pedagogical framework blends hands-on manipulatives, storytelling, and inquiry-led exploration across languages, environmental studies, and foundational numeracy.',
    pillars: [
      {
        title: 'Bilingual Literacy & Phonics',
        desc: 'Immersive reading circles in English and Hindi developing phonemic mastery, creative composition, and public recitation confidence.',
      },
      {
        title: 'Hands-on Math & Logic',
        desc: 'Concrete-to-abstract learning with abacus frames, geometric shape modeling, and real-world calculation games.',
      },
      {
        title: 'Environmental Studies (EVS)',
        desc: 'Nature trails, junior science kits, soil study, and living-world observation igniting scientific curiosity early.',
      },
      {
        title: 'Arts, Rhythm & Physical Play',
        desc: 'Daily exposure to drawing, craft, vocal music, yoga asanas, and playground agility games building balance and coordination.',
      },
    ],
    subjects: [
      { name: 'English & Hindi Literature', path: '/subjects/languages' },
      { name: 'Mathematics & Number Sense', path: '/subjects/mathematics' },
      { name: 'Environmental Science (EVS)', path: '/subjects/science' },
      { name: 'Early Digital Literacy', path: '/subjects/computer' },
      { name: 'Visual Arts & Sports', path: '/subjects/arts' },
    ],
  },
  middle: {
    key: 'middle',
    slug: 'middle',
    badge: 'MIDDLE SCHOOL WING',
    title: 'Classes 6–8 (Middle Wing)',
    subtitle: 'Cultivating analytical reasoning, laboratory exploration, and multidisciplinary skills.',
    heroImage: publicUrl('images/image5.jpg'),
    defaultEbookClass: 'Class 6',
    stats: [
      { number: '3', label: 'Dedicated Science Labs' },
      { number: '3rd Lang', label: 'Sanskrit & Regional' },
      { number: '1:1', label: 'Computer Lab Terminals' },
      { number: '10+', label: 'Clubs & Sports Leagues' },
    ],
    overview:
      'Middle school marks a vital intellectual leap where abstract concepts, deductive logic, and specialized disciplines are introduced. Students engage in weekly science practicals, algorithmic coding, historical inquiry, and inter-house debates under the guidance of subject-matter specialist faculty.',
    pillars: [
      {
        title: 'Dedicated Laboratory Science',
        desc: 'Separation of sciences into Physics, Chemistry, and Biology practicals with safety glassware, microscopes, and guided lab journals.',
      },
      {
        title: 'Algebraic Logic & Geometry',
        desc: 'Rigorous transition to algebraic equations, coordinate systems, geometric proofs, and data visualization.',
      },
      {
        title: 'Classical & Modern Languages',
        desc: 'Deep literary analysis in English and Hindi, complemented by foundational Sanskrit as a third language honoring cultural heritage.',
      },
      {
        title: 'Web & Visual Programming',
        desc: 'Hands-on coding with MIT Scratch, HTML/CSS fundamentals, and introductory Python algorithmic problem-solving.',
      },
    ],
    subjects: [
      { name: 'Languages (English, Hindi, Sanskrit)', path: '/subjects/languages' },
      { name: 'Mathematics & Pre-Algebra', path: '/subjects/mathematics' },
      { name: 'Integrated Sciences (PCB)', path: '/subjects/science' },
      { name: 'Social Studies & Indian Civics', path: '/subjects/social-studies' },
      { name: 'Computer Coding & Digital Skills', path: '/subjects/computer' },
      { name: 'Sports, Music & Fine Arts', path: '/subjects/arts' },
    ],
  },
  secondary: {
    key: 'secondary',
    slug: 'secondary',
    badge: 'SECONDARY SCHOOL WING',
    title: 'Classes 9–10 (Secondary Wing)',
    subtitle: 'CBSE board exam rigor, advanced experimentation, and visionary leadership.',
    heroImage: publicUrl('images/subjects/math-hero.jpg'),
    defaultEbookClass: 'Class 10',
    stats: [
      { number: '100%', label: 'CBSE Board Pass Rate' },
      { number: '98.4%', label: 'Top Board Percentage' },
      { number: '12:1', label: 'Senior Mentor Ratio' },
      { number: 'Olympiad', label: 'State & National Ranks' },
    ],
    overview:
      'Our Secondary Wing prepares Class 9 and 10 scholars for outstanding academic achievement in the CBSE All India Secondary School Examination (AISSE). Through structured revision cycles, exemplar problem-solving, advanced science practicals, and career orientation, we empower learners to excel with poise and distinction.',
    pillars: [
      {
        title: 'CBSE Board Exam Mastery',
        desc: 'Comprehensive syllabus coverage, model question banks, time-management mock exams, and personalized concept clinics.',
      },
      {
        title: 'Advanced Science Practicals',
        desc: 'Individual lab stations for ray optics, chemical titration, Ohm’s law, and specimen biology under CBSE examination protocols.',
      },
      {
        title: 'Artificial Intelligence & Python',
        desc: 'Cutting-edge CBSE curriculum in AI applications, relational databases (MySQL), and Python algorithms.',
      },
      {
        title: 'Leadership & Career Guidance',
        desc: 'Model United Nations, parliamentary debating, aptitude counseling, and entrance foundation mentoring.',
      },
    ],
    subjects: [
      { name: 'English & Hindi Course A', path: '/subjects/languages' },
      { name: 'Mathematics (Standard & Basic)', path: '/subjects/mathematics' },
      { name: 'Science (Physics, Chem, Bio)', path: '/subjects/science' },
      { name: 'Social Science & Economics', path: '/subjects/social-studies' },
      { name: 'Artificial Intelligence & IT', path: '/subjects/computer' },
      { name: 'Health & Physical Education (HPE)', path: '/subjects/arts' },
    ],
  },
};

export default function ClassesPage() {
  const { stage } = useParams();
  const navigate = useNavigate();

  const currentKey = stage && STAGES_DATA[stage] ? stage : 'primary';
  const stageData = STAGES_DATA[currentKey];

  return (
    <main className="classes-page">
      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <section className="classes-hero">
        <img
          src={stageData.heroImage}
          alt={stageData.title}
          className="classes-hero__bg"
        />
        <div className="classes-hero__overlay" />

        <div className="container classes-hero__content">
          <div className="classes-stage-nav" aria-label="Class wings">
            <button
              className={`classes-stage-tab ${currentKey === 'primary' ? 'classes-stage-tab--active' : ''}`}
              onClick={() => navigate('/classes/primary')}
            >
              Class 1–5 (Primary)
            </button>
            <button
              className={`classes-stage-tab ${currentKey === 'middle' ? 'classes-stage-tab--active' : ''}`}
              onClick={() => navigate('/classes/middle')}
            >
              Class 6–8 (Middle)
            </button>
            <button
              className={`classes-stage-tab ${currentKey === 'secondary' ? 'classes-stage-tab--active' : ''}`}
              onClick={() => navigate('/classes/secondary')}
            >
              Class 9–10 (Secondary)
            </button>
          </div>

          <span className="classes-hero__badge">{stageData.badge}</span>
          <h1 className="classes-hero__title">{stageData.title}</h1>
          <p className="classes-hero__subtitle">{stageData.subtitle}</p>

          <div className="classes-hero__actions">
            <Link
              to={`/e-books?class=${encodeURIComponent(stageData.defaultEbookClass)}`}
              className="btn btn--cta-gold"
            >
              Browse {stageData.title.split(' ')[0]} E-Books &rarr;
            </Link>
            <button
              className="btn btn--cta-outlined-light"
              onClick={() => openEnquiryModal()}
            >
              Admissions Enquiry
            </button>
          </div>
        </div>
      </section>

      {/* ── Key Metrics Strip ────────────────────────────────────────── */}
      <section className="classes-stats">
        <div className="container classes-stats__grid">
          {stageData.stats.map((s, idx) => (
            <div key={idx} className="classes-stats__item">
              <span className="classes-stats__num">{s.number}</span>
              <span className="classes-stats__lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Curriculum Overview & Pillars ────────────────────────────── */}
      <section className="classes-curriculum container">
        <div className="classes-overview-card">
          <h2 className="classes-section-title">Academic Philosophy & Learning Pathway</h2>
          <p className="classes-overview-text">{stageData.overview}</p>
        </div>

        <div className="classes-pillars-grid">
          {stageData.pillars.map((p, idx) => (
            <div key={idx} className="classes-pillar-card">
              <div className="classes-pillar-num">0{idx + 1}</div>
              <h3 className="classes-pillar-title">{p.title}</h3>
              <p className="classes-pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Subjects Offered ────────────────────────────────────── */}
      <section className="classes-subjects-section">
        <div className="container">
          <div className="classes-section-header">
            <span className="classes-kicker">SUBJECT CURRICULUM</span>
            <h2 className="classes-headline">Core Disciplines Taught in {stageData.title}</h2>
            <p className="classes-subtext">Click any subject to explore syllabus, faculty, and learning facilities.</p>
          </div>

          <div className="classes-subjects-grid">
            {stageData.subjects.map((sub, idx) => (
              <Link key={idx} to={sub.path} className="classes-subject-card">
                <span className="classes-subject-name">{sub.name}</span>
                <span className="classes-subject-arrow">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ────────────────────────────────────── */}
      <section className="classes-cta-banner">
        <div className="container classes-cta-inner">
          <div>
            <h2 className="classes-cta-title">Looking to Enroll in {stageData.title}?</h2>
            <p className="classes-cta-desc">
              Admissions for the upcoming academic session are now open. Visit campus or connect with our academic counseling team today.
            </p>
          </div>
          <div className="classes-cta-btns">
            <button className="btn btn--cta-gold" onClick={() => openEnquiryModal()}>
              Apply for Admission
            </button>
            <Link to="/calendar" className="btn btn--cta-outlined-light">
              View School Calendar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
