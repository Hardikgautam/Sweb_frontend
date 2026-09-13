// src/config/whyUsContent.js
import { publicUrl } from '../utils/publicUrl';
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update Section 02 ("Why Us" / "Why Our School") content.
// ─────────────────────────────────────────────────────────────────────────────

export const whyUsContent = {
  // Left column image & floating stat badge
  image: publicUrl('images/image2.jpg'),
  imageAlt: "Students reading together in the school library",
  statCard: {
    number: "20,000+",
    label: "books in our library",
  },

  // Right column copy
  kickerNumber: "02",
  kickerLabel: "WHY US",
  headlineLines: [
    "Small class sizes, big",
    "attention to every child.",
  ],
  body: "We believe meaningful education is deeply personal. Rather than treating children as numbers in overcrowded halls, our learning spaces are intentionally kept intimate, collaborative, and guided by dedicated teachers who understand each child's unique pace, interests, and potential.",

  // Checklist of 4 features
  checklist: [
    "Classes are capped at 25 students per section.",
    "Smart classrooms with projectors in every room.",
    "On-campus doctor and counsellor available daily.",
    "Safe, GPS-tracked school transport across the city.",
  ],

  // Footer link
  philosophyLink: {
    label: "Read our school philosophy →",
    href: "#about",
  },
};
