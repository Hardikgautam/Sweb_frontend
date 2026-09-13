// src/config/siteConfig.js
import { publicUrl } from '../utils/publicUrl';
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
  logo:            publicUrl('images/logo.png'),
  logoWhite:       publicUrl('images/logo-white.png'),

  // Contact
  phone:    "+91 XXXXXXXXXX",           // TODO: replace with real phone number
  email:    "info@xyzpublicschool.in",   // TODO: replace with real email address
  address:  "XYZ Public School, Sector 12, Panipat, Haryana – 132103, India",

  // ─────────────────────────────────────────────────────────────────────────
  // CAMPUS LOCATION & COORDINATES (EDIT THIS SECTION FOR REAL SCHOOL LOCATION)
  // Replace `address`, `lat`, and `lng` below with your real campus values.
  // ─────────────────────────────────────────────────────────────────────────
  location: {
    // Exact street address displayed in text for parents, screen readers & SEO
    address: "XYZ Public School, Sector 12, Panipat, Haryana – 132103, India",
    
    // Landmark or nearby prominent junction
    landmark: "Near City Centre & Main GT Road Junction",

    // Exact GPS coordinates used for Google Map pin & "Get Directions" navigation:
    coordinates: {
      lat: 29.3909,  // <-- REPLACE with real latitude (e.g. 29.390946)
      lng: 76.9635,  // <-- REPLACE with real longitude (e.g. 76.963502)
    },

    // Default map zoom level (14 to 17 recommended for campus view)
    mapZoom: 15,

    // Visiting hours for prospective parents and visitors
    visitingHours: [
      { days: "Monday – Friday",   hours: "8:30 AM – 3:30 PM" },
      { days: "Saturday",          hours: "9:00 AM – 1:00 PM" },
      { days: "Sunday & Holidays", hours: "Closed (Prior appointment only)" },
    ],

    // Contact desks for campus visits
    admissionsHelpdesk: "+91 98765 43210",
    transportEnquiry:   "+91 98765 43211",
    receptionEmail:     "info@xyzpublicschool.in",

    // Note regarding campus walk-throughs & scheduling
    tourNotice: "Campus walk-throughs are conducted Monday through Saturday. Prior appointment via the enquiry form is recommended to ensure counselor availability.",
  },

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
    { label: "E-books",      href: "/ebooks",         desc: "NCERT Digital Textbooks & Curriculum" },
    { label: "Calendar",     href: "/calendar",       desc: "Events, Vacations & Exam Schedules" },
    { label: "Visit Campus", href: "/visit-campus",   desc: "Location, Map, Directions & Tour Timings" },
  ],

  // Navbar right-side actions
  visitUsLink: { label: "Visit Us", href: "/visit-campus" },
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
        { label: "Fees & scholarships",    href: "/fees-scholarships" },
        { label: "Visit campus",           href: "/visit-campus" },
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
      text: "We send a monthly parent bulletin — term dates, result updates, school events. No spam, unsubscribe any time.",
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
