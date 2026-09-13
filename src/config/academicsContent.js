// src/config/academicsContent.js
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update the Academics section content and the 6 subject cards.
// ─────────────────────────────────────────────────────────────────────────────

export const academicsContent = {
  kickerNumber: "01",
  kickerLabel: "ACADEMICS",
  headlineLines: [
    "Six subjects, one",
    "foundation for life.",
  ],
  description:
    "Our CBSE curriculum from Nursery through Class 10 is rooted in inquiry, activity-based discovery, and strong conceptual foundations. We prepare learners to think independently, solve real-world problems, and grow into articulate, confident individuals.",

  subjects: [
    {
      id: "languages",
      icon: "languages",
      title: "Languages",
      desc: "English, Hindi, and Sanskrit/regional language immersion focusing on phonics, literature, and expressive speaking.",
      levels: "Nursery – Class 10",
      link: "/subjects/languages",
    },
    {
      id: "mathematics",
      icon: "mathematics",
      title: "Mathematics",
      desc: "Concrete-to-abstract progression through hands-on math labs, mental calculation drills, and analytical logic.",
      levels: "KG – Class 10",
      link: "/subjects/mathematics",
    },
    {
      id: "science",
      icon: "science",
      title: "Science",
      desc: "Observational nature study in early grades leading into physics, chemistry, and biology in dedicated junior laboratories.",
      levels: "Classes 1 – 10",
      link: "/subjects/science",
    },
    {
      id: "social",
      icon: "social",
      title: "Social Studies",
      desc: "History, geography, civics, and environmental awareness taught through field visits, map projects, and debate.",
      levels: "Classes 3 – 10",
      link: "/subjects/social-studies",
    },
    {
      id: "computer",
      icon: "computer",
      title: "Computer Science",
      desc: "Digital literacy, keyboard skills, visual coding (Scratch), and fundamentals of algorithmic thinking and online safety.",
      levels: "Classes 1 – 10",
      link: "/subjects/computer",
    },
    {
      id: "arts",
      icon: "arts",
      title: "Arts, Music & Sports",
      desc: "Visual arts, classical and contemporary music, physical education, gymnastics, and structured team sports.",
      levels: "Nursery – Class 10",
      link: "/subjects/arts",
    },
  ],
};
