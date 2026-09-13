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
    "There's no entrance exam for Nursery through Class 5. We'll ask to meet your child — a short, relaxed session so we can understand where they are, not test them. The paperwork is minimal. Our admissions desk is reachable by phone every weekday.",

  // 4 steps in the admission journey
  steps: [
    {
      stepNumber: "01",
      title: "Enquire & Visit",
      desc: "Call us or walk in. Our admissions desk is open Monday–Saturday, 9 AM–3 PM. Campus tours run every Tuesday and Friday morning — no appointment needed.",
    },
    {
      stepNumber: "02",
      title: "Submit Application",
      desc: "The form takes about 10 minutes. You'll need a copy of the birth certificate and, if transferring from another school, the last two years' report cards.",
    },
    {
      stepNumber: "03",
      title: "Interaction / Assessment",
      desc: "For Class 6 and above, there's a short written interaction. For younger children, it's a chat — 20 minutes, no pressure. We're checking if the school is a good fit for them, not grading them.",
    },
    {
      stepNumber: "04",
      title: "Admission Confirmation",
      desc: "You'll hear back within a week. The offer letter includes the fee schedule, your child's section, and orientation dates. We don't issue conditional offers.",
    },
  ],

  // Highlighted callout strip below steps
  callout: {
    badgeText: "Admissions for 2027–28 open now · Limited seats per section",
    buttonLabel: "Start Enquiry Form",
    buttonHref: "#contact",
  },
};
