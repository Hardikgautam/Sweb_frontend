// src/config/eventsNewsContent.js
import { publicUrl } from '../utils/publicUrl';
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update Section 07 (Upcoming Events) and Section 08 (Latest News).
// ─────────────────────────────────────────────────────────────────────────────

export const eventsNewsContent = {
  // ── Section 07: Upcoming Events (Left Column) ──────────────────────────────
  events: {
    kickerNumber: "07",
    kickerLabel: "UPCOMING EVENTS",
    headline: "On the calendar",
    fullCalendarLink: {
      label: "View the full calendar →",
      href: "#contact",
    },
    list: [
      {
        id: "ptm-term1",
        day: "18",
        month: "OCT",
        tag: "PARENT MEETING",
        title: "Term 1 Parent–Teacher Conferences",
        meta: "9:00 AM – 1:30 PM · Classrooms & Main Auditorium",
      },
      {
        id: "sports-day",
        day: "04",
        month: "NOV",
        tag: "SPORTS DAY",
        title: "Annual Inter-House Athletics Championship",
        meta: "8:00 AM – 3:30 PM · School Sports Grounds",
      },
      {
        id: "open-day",
        day: "15",
        month: "NOV",
        tag: "ADMISSIONS",
        title: "Campus Open Morning & Nursery Orientation",
        meta: "10:00 AM – 12:30 PM · Admissions Pavilion",
      },
      {
        id: "annual-day",
        day: "12",
        month: "DEC",
        tag: "ANNUAL DAY",
        title: "Winter Cultural Festival & Musical Showcase",
        meta: "5:30 PM – 8:30 PM · School Open Amphitheatre",
      },
    ],
  },

  // ── Section 08: Latest News (Right Column) ─────────────────────────────────
  news: {
    kickerNumber: "08",
    kickerLabel: "FROM THE SCHOOL",
    headline: "Latest news",

    // One featured news card on top
    featured: {
      id: "stem-olympiad",
      image: publicUrl('images/image13.jpg'),
      alt: "Middle school students presenting science model",
      tag: "ACADEMICS",
      date: "October 3, 2026",
      title: "Greenwood Students Secure Top Honors at Regional STEM Olympiad",
      summary:
        "Our junior science and robotics teams earned First Place for their automated rainwater filtration and smart conservation prototype.",
      link: "#news",
    },

    // 2 smaller cards side by side below
    smaller: [
      {
        id: "football-cup",
        image: publicUrl('images/image14.jpg'),
        alt: "Under-14 football team celebrating championship victory",
        tag: "SPORTS",
        date: "September 28, 2026",
        title: "Under-14 Football Team Lifts Interschool Trophy",
        summary:
          "A thrilling 2–1 final victory caps off an undefeated tournament run for our junior squad.",
        link: "#news",
      },
      {
        id: "art-exhibit",
        image: publicUrl('images/image15.jpg'),
        alt: "Student art and painting exhibition",
        tag: "CAMPUS LIFE",
        date: "September 20, 2026",
        title: "Annual Student Art Exhibition Opens in Main Gallery",
        summary:
          "Over 200 original works by Class 1–10 students spanning watercolors, ceramics, and textiles.",
        link: "#news",
      },
    ],
  },
};
