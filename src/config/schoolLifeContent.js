// src/config/schoolLifeContent.js
import { publicUrl } from '../utils/publicUrl';
// ─────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to update Section 04 ("School Life") text and photo grid paths.
// ─────────────────────────────────────────────────────────────────────────────

export const schoolLifeContent = {
  kickerNumber: "04",
  kickerLabel: "SCHOOL LIFE",
  headlineLines: [
    "Life on campus, from the",
    "morning bell to the last bus.",
  ],
  description:
    "Monday mornings there's football practice before the bell. Wednesday afternoons, the art studio smells like acrylic paint for the rest of the day. The science fair runs three weeks and takes over an entire corridor. This is what school actually looks like here.",

  // 6 photo grid items (3 columns × 2 rows on desktop)
  images: [
    { src: publicUrl('images/image3.jpg'), alt: "Students playing sports on the campus ground" },
    { src: publicUrl('images/image4.jpg'), alt: "Students painting in the art studio" },
    { src: publicUrl('images/image5.jpg'), alt: "Science laboratory practical session" },
    { src: publicUrl('images/image6.jpg'), alt: "Music class with instruments and instructor" },
    { src: publicUrl('images/image7.jpg'), alt: "Students walking across campus gardens" },
    { src: publicUrl('images/image8.jpg'), alt: "Students reading together in the library" },
  ],
};
