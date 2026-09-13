// src/config/heroContent.js
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
  body: "Located in Panipat, Haryana, XYZ Public School is a CBSE-affiliated institution nurturing children from Nursery through Class 10. We combine academic rigour with a warm, inclusive environment — giving every child the confidence to flourish.",

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
  image:    "/images/image1.jpg",
  imageAlt: "Students walking across the XYZ Public School campus",

  // Circular badge overlapping the hero image
  badge: {
    icon: "🌱",
    lines: [
      "NURTURING",
      "TOMORROW'S LEADERS",
    ],
  },
};
