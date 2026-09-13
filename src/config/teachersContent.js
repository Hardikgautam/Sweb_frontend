// src/config/teachersContent.js
import { publicUrl } from '../utils/publicUrl';
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update Section 06 ("Our Teachers") copy and teacher roster.
// ─────────────────────────────────────────────────────────────────────────────

export const teachersContent = {
  kickerNumber: "06",
  kickerLabel: "OUR TEACHERS",
  headlineLines: [
    "Teachers who've been here",
    "long enough to know your child.",
  ],
  description:
    "Most of our teachers have been here for more than eight years. That's not an accident — we invest in CPD, and the work environment shows it. Your child's homeroom teacher will know their name by the end of the first week, and won't need to check a spreadsheet to tell you how they're doing.",

  // 4 teacher cards (add, edit, or reorder freely)
  teachers: [
    {
      id: "sunita-sharma",
      name: "Mrs. Sunita Sharma",
      role: "MATHEMATICS, CLASSES 6–10",
      photo: publicUrl('images/image9.jpg'),
      bio: "14 years here, all of them teaching Maths to Classes 6–10. She's the one students come to before board exams — not because they're panicking, but because they trust her to be honest about where the gaps are.",
    },
    {
      id: "rajesh-nair",
      name: "Mr. Rajesh Nair",
      role: "PRIMARY HOMEROOM, CLASS 3",
      photo: publicUrl('images/image10.jpg'),
      bio: "Class 3 homeroom for the last six years. His classroom has more picture books than shelves can hold, and he times every lesson with a sand timer his students picked out. It works.",
    },
    {
      id: "ananya-sen",
      name: "Mrs. Ananya Sen",
      role: "SCIENCE & COMPUTER LAB",
      photo: publicUrl('images/image11.jpg'),
      bio: "Runs the science lab and the junior robotics club — which won the state-level competition two years in a row. She grades lab reports herself, every single one.",
    },
    {
      id: "vikram-rathore",
      name: "Coach Vikram Rathore",
      role: "PHYSICAL EDUCATION & SPORTS",
      photo: publicUrl('images/image12.jpg'),
      bio: "Former district-level athlete. Has coached the school football team for nine years. The Under-14 squad won the interschool championship last October — his third title here.",
    },
  ],
};
