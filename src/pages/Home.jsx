// pages/Home.jsx
// Main homepage — sections are assembled here.
// The Hero is the first real section. Others remain as stubs.

import Hero from '../components/Hero';
import StatsStrip from '../components/StatsStrip';
import AcademicsSection from '../components/AcademicsSection';
import WhyUsSection from '../components/WhyUsSection';
import NumbersBannerSection from '../components/NumbersBannerSection';
import SchoolLifeSection from '../components/SchoolLifeSection';
import AdmissionsSection from '../components/AdmissionsSection';
import TeachersSection from '../components/TeachersSection';
import EventsNewsSection from '../components/EventsNewsSection';
import FinalCtaBanner from '../components/FinalCtaBanner';
import './Home.css';

export default function Home() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      <StatsStrip />

      {/* ── Section 01: Academics ────────────────────────────────────────── */}
      <AcademicsSection />

      {/* ── Section 02: Why Us ───────────────────────────────────────────── */}
      <WhyUsSection />

      {/* ── Section 03: The Numbers Behind Our Name ──────────────────────── */}
      <NumbersBannerSection />

      {/* ── Section 04: School Life ──────────────────────────────────────── */}
      <SchoolLifeSection />

      {/* ── Section 05: Admissions ───────────────────────────────────────── */}
      <AdmissionsSection />

      {/* ── Section 06: Our Teachers ─────────────────────────────────────── */}
      <TeachersSection />

      {/* ── Sections 07 & 08: Upcoming Events & Latest News ──────────────── */}
      <EventsNewsSection />

      {/* ── Final Admissions CTA Banner ─────────────────────────────────── */}
      <div id="contact" style={{ position: 'relative', top: '-70px', visibility: 'hidden' }} />
      <FinalCtaBanner />
    </main>
  );
}
