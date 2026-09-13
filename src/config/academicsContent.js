// src/config/academicsContent.js
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update the Academics section content and the 6 subject cards.
// ─────────────────────────────────────────────────────────────────────────────

export const academicsContent = {
  kickerNumber: "01",
  kickerLabel: "ACADEMICS",
  headlineLines: [
    "Six subjects. One school.",
    "All the way to Class 10.",
  ],
  description:
    "We follow CBSE from Nursery straight through to the Class 10 boards. The framework is solid — we spend our energy making it feel less like a checklist and more like something worth showing up for.",

  subjects: [
    {
      id: "languages",
      icon: "languages",
      title: "Languages",
      desc: "English, Hindi, and Sanskrit from phonics in KG to CBSE board literature in Class 10. Three languages, one school.",
      levels: "Nursery – Class 10",
      link: "/subjects/languages",
    },
    {
      id: "mathematics",
      icon: "mathematics",
      title: "Mathematics",
      desc: "Starts with blocks and abacus in the early grades. By Class 9, students work through board-level problems they actually chose to solve.",
      levels: "KG – Class 10",
      link: "/subjects/mathematics",
    },
    {
      id: "science",
      icon: "science",
      title: "Science",
      desc: "Nature study in the early years, then three dedicated labs from Class 6 onward — Physics, Chemistry, Biology — 12 students per session.",
      levels: "Classes 1 – 10",
      link: "/subjects/science",
    },
    {
      id: "social",
      icon: "social",
      title: "Social Studies",
      desc: "History, geography, civics, and economics. Field trips to monuments. Map projects. Actual debates, not just reading about them.",
      levels: "Classes 3 – 10",
      link: "/subjects/social-studies",
    },
    {
      id: "computer",
      icon: "computer",
      title: "Computer Science",
      desc: "HTML by Class 6, Python and MySQL by Class 9. Two labs with 1:1 terminal access — no sharing machines.",
      levels: "Classes 1 – 10",
      link: "/subjects/computer",
    },
    {
      id: "arts",
      icon: "arts",
      title: "Arts, Music & Sports",
      desc: "The art studio, music room, and 4-acre sports field run parallel to academics, not as extras. The school band performed at district level last March.",
      levels: "Nursery – Class 10",
      link: "/subjects/arts",
    },
  ],
};
