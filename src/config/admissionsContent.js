// src/config/admissionsContent.js
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update Section 05 (Admissions) copy, steps, and callout strip.
// ─────────────────────────────────────────────────────────────────────────────

export const admissionsContent = {
  kickerNumber: "05",
  kickerLabel: "ADMISSIONS",
  headlineLines: [
    "Your path from enquiry to",
    "admitted student.",
  ],
  description:
    "We keep our admissions transparent, supportive, and stress-free. Every application is reviewed by experienced educators, and our early-years process focuses on readiness and comfort rather than high-pressure interviews.",

  // 4 steps in the admission journey
  steps: [
    {
      stepNumber: "01",
      title: "Enquire & Visit",
      desc: "Browse our curriculum, schedule a guided campus tour, and meet our admissions desk to see our classrooms in action.",
    },
    {
      stepNumber: "02",
      title: "Submit Application",
      desc: "Fill out a straightforward enquiry form along with the child's birth certificate and previous school grade cards (if applicable).",
    },
    {
      stepNumber: "03",
      title: "Interaction / Assessment",
      desc: "A warm, friendly interaction for younger learners to assess school readiness, accompanied by quick document verification.",
    },
    {
      stepNumber: "04",
      title: "Admission Confirmation",
      desc: "Formal admission offers are issued directly to parents along with a clear fee schedule, welcome pack, and orientation dates.",
    },
  ],

  // Highlighted callout strip below steps
  callout: {
    badgeText: "Admissions for 2027–28 open now · Limited seats per section",
    buttonLabel: "Start Enquiry Form",
    buttonHref: "#contact",
  },
};
