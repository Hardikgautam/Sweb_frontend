// src/config/siteConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update the school's identity, contact, social handles,
// and footer columns across the entire website.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  // School identity
  schoolName:      "XYZ Public School",
  schoolNameShort: "XPS",
  tagline:         "CBSE · Est. 1998",   // shown under logo in navbar
  motto:           "विद्या ददाति विनयं · Knowledge Bestows Humility", // footer motto
  board:           "CBSE",
  established:     "1998",
  city:            "Panipat",

  // Logo paths (relative to /public)
  logo:            "/images/logo.png",
  logoWhite:       "/images/logo-white.png",

  // Contact
  phone:    "+91 XXXXXXXXXX",           // TODO: replace with real phone number
  email:    "info@xyzpublicschool.in",   // TODO: replace with real email address
  address:  "XYZ Public School, Panipat, Haryana – 132103, India",

  // Navbar links
  navLinks: [
    { label: "Home",             href: "/" },
    { label: "Academics",        href: "#academics" },
    { label: "Admissions",       href: "#admissions" },
    { label: "School Life",      href: "#life" },
    { label: "Teachers",         href: "#teachers" },
    { label: "News & Events",    href: "/news" },
  ],

  // Navbar "More" dropdown links
  moreLinks: [
    { label: "E-books",  href: "/ebooks",  desc: "NCERT Digital Textbooks & Curriculum" },
    { label: "Calendar", href: "/calendar", desc: "Events, Vacations & Exam Schedules" },
  ],

  // Navbar right-side actions
  visitUsLink: { label: "Visit Us", href: "#contact" },
  enquireLink: { label: "Enquire Now", href: "#admissions" },

  // Social media handles (outline icons in footer)
  social: [
    { platform: "twitter",   label: "X (Twitter)", href: "https://twitter.com" },
    { platform: "linkedin",  label: "LinkedIn",    href: "https://linkedin.com" },
    { platform: "instagram", label: "Instagram",   href: "https://instagram.com" },
    { platform: "youtube",   label: "YouTube",     href: "https://youtube.com" },
  ],

  // 4 Footer link columns
  footerColumns: [
    {
      title: "ADMISSIONS",
      links: [
        { label: "Apply now",              href: "/#admissions" },
        { label: "Fees & scholarships",    href: "/#admissions" },
        { label: "Visit campus",           href: "/#contact" },
        { label: "Transport info",         href: "/#why-us" },
        { label: "Request info",           href: "/#contact" },
      ],
    },
    {
      title: "ACADEMICS",
      links: [
        { label: "Curriculum & classes",   href: "/classes" },
        { label: "Class 1–5 (Primary)",    href: "/classes/primary" },
        { label: "Class 6–8 (Middle)",     href: "/classes/middle" },
        { label: "Class 9–10 (Secondary)", href: "/classes/secondary" },
        { label: "E-Books",                href: "/e-books" },
        { label: "Academic calendar",      href: "/calendar" },
      ],
    },
    {
      title: "SCHOOL LIFE",
      links: [
        { label: "Sports & athletics",     href: "/#life" },
        { label: "Clubs & societies",      href: "/#life" },
        { label: "Library & media center", href: "/#why-us" },
        { label: "Health & counselling",   href: "/#why-us" },
        { label: "Safety & transport",     href: "/#why-us" },
        { label: "Holiday Calendar",       href: "/calendar" },
      ],
    },
    {
      title: "UPDATES",
      isNewsletter: true,
      text: "Subscribe to our parent bulletin for admission alerts, term dates, and campus event highlights.",
      placeholder: "Enter parent's email address",
      buttonText: "Subscribe",
    },
  ],

  // Bottom bar
  legalLinks: [
    { label: "Privacy Policy",  href: "/#contact" },
    { label: "Accessibility",   href: "/#contact" },
    { label: "Terms of Use",    href: "/#contact" },
  ],
};
