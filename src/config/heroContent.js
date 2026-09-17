// src/config/heroContent.js
import { publicUrl } from '../utils/publicUrl';
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update all Hero section text and image paths.
// ─────────────────────────────────────────────────────────────────────────────

export const heroContent = {
  // Small kicker line above the headline (the "— NURSERY TO CLASS 10" line)
  kicker: "Nursery to Class 10",

  // Main headline — split into lines for the serif display treatment
  // Each entry = one visual line
  headlineLines: [
    "Where every child's",
    "curiosity finds room",
    "to grow.",
  ],

  // Body paragraph below the headline
  body: "We've been part of Panipat since 1998. Our 1,200 students come from across the district — some travel 30 km each way. What keeps families choosing us is straightforward: small classes, teachers who stay long enough to actually know your child, and results that speak for themselves.",

  // Primary CTA button (solid maroon)
  ctaPrimary: {
    label: "Admissions 2027–28",
    href:  "#admissions",
  },

  // Secondary CTA button (outlined)
  ctaSecondary: {
    label: "Book a Campus Tour",
    href:  "#contact",
  },

  // Small stats line below the buttons
  statsLine: "Ranked #1 school in the city · 15:1 student–teacher ratio · 3,200+ students",

  // Hero image — place your photo at this path
  image:    publicUrl('images/image1.jpg'),
  imageAlt: "Students walking across the XYZ Public School campus",

  // Circular badge overlapping the hero image
  badge: {
    icon: null,
    lines: [
      "CBSE",
      "EST. 1998",
    ],
  },
};
