// src/config/subjectsData.js
// Complete content for all 6 Subject Detail Pages.
// Contains hero video, curriculum breakdown, gallery photos, and closing CTA content.
import { publicUrl } from '../utils/publicUrl';

export const subjectsData = {
  languages: {
    id: "languages",
    title: "Languages & Literature",
    kicker: "CURRICULUM · LANGUAGES",
    levels: "NURSERY – CLASS 10",
    video: publicUrl('videos/languages.mp4'),
    poster: publicUrl('images/subjects/languages-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/languages-hero.jpg'),
    intro:
      "Fostering articulate expression, rich literary appreciation, and multi-lingual mastery across English, Hindi, and Sanskrit through interactive phonics, classical literature, creative prose, and competitive debate.",
    stats: [
      { number: "3", label: "Languages Taught" },
      { number: "100%", label: "CBSE Board Pass" },
      { number: "15+", label: "Literary Awards" },
      { number: "5,000+", label: "Library Titles" },
    ],
    gradeBands: [
      {
        badge: "Nursery – KG",
        title: "Foundational Stage",
        focus: "Phonemic Awareness & Oral Storytelling",
        points: [
          "Interactive sound-letter associations through structured phonics games and rhythmic chants",
          "Daily story-circle sessions expanding spoken vocabulary, active listening, and conversational confidence",
          "Picture-talk activities, creative roleplay, and pencil-grip pre-writing motor exercises",
        ],
      },
      {
        badge: "Classes 1 – 5",
        title: "Primary School",
        focus: "Reading Fluency & Creative Composition",
        points: [
          "Guided reading programs cultivating comprehension, character empathy, and critical curiosity",
          "Grammar essentials: sentence structures, parts of speech, punctuation, and active spelling drills",
          "Creative journal writing, picture description, and expressive poetry recitation in English and Hindi",
          "Bilingual literacy building rich expression across both national and international languages",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School",
        focus: "Classical Literature & Analytical Rhetoric",
        points: [
          "Introduction to Sanskrit as a third language with foundational grammar, shlokas, and cultural ethos",
          "In-depth analysis of prose, drama, narrative poetry, and thematic character motivations",
          "Formal communicative writing: editorial letters, argumentative essays, notices, and debate drafts",
          "Inter-house elocution championships, literary festivals, and annual theatrical plays",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School",
        focus: "CBSE Board Rigor & Public Oratory",
        points: [
          "Comprehensive mastery of CBSE prescribed texts (First Flight, Footprints Without Feet, Kshitij, Sparsh)",
          "Advanced unseen passage analysis, critical commentary, and synthesis of multifaceted perspectives",
          "Model United Nations preparation, formal declamation, and persuasive public discourse",
          "Exhaustive board exam practice with model question papers, answer framing, and assessment rubrics",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/languages-1.jpg'),
        title: "Scholarly Library Reading Circles",
        desc: "Students engaged in collaborative literary analysis and reading circles in our school library.",
      },
      {
        src: publicUrl('images/subjects/languages-2.jpg'),
        title: "Podium Debates & Public Rhetoric",
        desc: "Young orators developing poise and persuasive debate delivery at inter-house championships.",
      },
    ],
    cta: {
      kicker: "NCERT DIGITAL TEXTBOOKS",
      headline: "Access Official Language Textbooks & Readers",
      paragraph:
        "Download complete CBSE English, Hindi, and Sanskrit textbooks directly as single PDFs with zero waiting and instant access.",
      primaryButtonText: "Browse Language E-Books →",
      primaryButtonLink: "/e-books?subject=English",
      secondaryButtonText: "Enquire for Admissions",
      isModal: true,
    },
  },

  mathematics: {
    id: "mathematics",
    title: "Mathematics & Analytical Logic",
    kicker: "CURRICULUM · MATHEMATICS",
    levels: "KG – CLASS 10",
    video: publicUrl('videos/mathematics.mp4'),
    poster: publicUrl('images/subjects/math-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/math-hero.jpg'),
    intro:
      "Developing fearless, creative mathematical problem solvers through concrete-to-abstract learning, interactive math lab discovery, mental calculation drills, and rigorous CBSE conceptual mastery.",
    stats: [
      { number: "100%", label: "Lab Activity Based" },
      { number: "98.4%", label: "Top Board Score" },
      { number: "10+", label: "Olympiad Ranks" },
      { number: "1:1", label: "Concept Mentoring" },
    ],
    gradeBands: [
      {
        badge: "KG – Class 2",
        title: "Foundational Numeracy",
        focus: "Concrete Number Sense & Spatial Shapes",
        points: [
          "Joyful manipulatives: abacus frames, counting blocks, and 2D/3D tactile shape exploration",
          "Intuitive addition, subtraction, and number bonds through real-world contextual storytelling",
          "Pattern recognition, spatial reasoning puzzles, and interactive math games building early confidence",
        ],
      },
      {
        badge: "Classes 3 – 5",
        title: "Primary School",
        focus: "Core Operations & Geometric Foundations",
        points: [
          "Mastery of multiplication tables, mental calculation drills, and multi-digit long division",
          "Fractions, decimals, unitary method, and practical applications in time, measurement, and money",
          "Perimeter, area of rectilinear figures, angle classifications, and symmetrical designs",
          "Math-Magic worksheets linking mathematical patterns to everyday problem-solving scenarios",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School",
        focus: "Algebraic Thinking & Deductive Proofs",
        points: [
          "Transition to generalized arithmetic: variables, algebraic expressions, and linear equations",
          "Integers, rational numbers, exponents, powers, and ratio, proportion, and percentage modeling",
          "Euclidean geometry foundations: triangles, quadrilaterals, angle sum properties, and compass construction",
          "Data handling: statistical graphs, frequency distributions, and introductory probability concepts",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School",
        focus: "CBSE Board Mastery & Advanced Theorems",
        points: [
          "Real numbers, polynomials, pairs of linear equations, and quadratic equation solution strategies",
          "Coordinate geometry, arithmetic progressions, and comprehensive trigonometry with real-world heights and distances",
          "Rigorous geometric proof theorems: circles, triangles similarity, and surface area & volume computations",
          "CBSE Class 10 board exam preparation with exemplar problems, past-year papers, and timed mock tests",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/math-1.jpg'),
        title: "Mathematics Laboratory Modeling",
        desc: "Hands-on polyhedral models and 3D geometric tools turning abstract theory into tangible insight.",
      },
      {
        src: publicUrl('images/subjects/math-2.jpg'),
        title: "Interactive Proofs & Blackboard Calculations",
        desc: "Students collaborating on step-by-step trigonometric proofs and theorem derivations.",
      },
    ],
    cta: {
      kicker: "NCERT MATHEMATICS REPOSITORY",
      headline: "Download Official Math Textbooks & Exemplars",
      paragraph:
        "Instant one-click access to complete CBSE Mathematics textbooks for all grades, with zero waiting and single-file PDF downloads.",
      primaryButtonText: "Browse Mathematics E-Books →",
      primaryButtonLink: "/e-books?subject=Mathematics",
      secondaryButtonText: "Book a Campus Visit",
      isModal: true,
    },
  },

  science: {
    id: "science",
    title: "Science & Experimental Inquiry",
    kicker: "CURRICULUM · SCIENCE",
    levels: "CLASSES 1 – 10",
    video: publicUrl('videos/science.mp4'),
    poster: publicUrl('images/subjects/science-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/science-hero.jpg'),
    intro:
      "Igniting lifelong scientific curiosity through observational discovery in nature, guided scientific method, and hands-on laboratory experimentation across Physics, Chemistry, and Biology.",
    stats: [
      { number: "3", label: "Dedicated Labs" },
      { number: "100+", label: "Hands-on Experiments" },
      { number: "12:1", label: "Lab Student Ratio" },
      { number: "Annual", label: "Science Fair Expo" },
    ],
    gradeBands: [
      {
        badge: "Classes 1 – 5",
        title: "Environmental Studies (EVS)",
        focus: "Nature Observation & Everyday Science",
        points: [
          "Living and non-living world: plant diversity, animal habitats, food chains, and the human body",
          "Water cycle, weather patterns, clean air properties, and preservation of natural resources",
          "Hands-on junior science kits: magnifying lenses, seed germination trials, and soil composition tests",
          "Eco-club projects: composting, tree planting drives, and sustainable green habits",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School Science",
        focus: "Dedicated Laboratory Exploration",
        points: [
          "Physics: Light ray propagation, shadows, mirrors, electrical circuits, force, pressure, and sound",
          "Chemistry: Separation of substances, acids, bases, salts, physical vs chemical reactions, and metals",
          "Biology: Cell structure, plant and animal nutrition, respiration, reproduction, and biodiversity",
          "Weekly structured laboratory practicals with safety goggles, glassware, and investigative lab journals",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School Science",
        focus: "CBSE Disciplines & Laboratory Rigor",
        points: [
          "Physics: Newton's laws of motion, universal gravitation, work & energy, ray optics, and electromagnetism",
          "Chemistry: Balancing chemical equations, periodic table periodicities, carbon compounds, and metallurgy",
          "Biology: In-depth life processes (circulation, excretion, neural control), genetics, heredity, and ecosystem dynamics",
          "CBSE practical exam mastery: compound microscopy, salt analysis, focal length determination, and Ohm's Law verification",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/science-1.jpg'),
        title: "Chemistry Titration & Reaction Trials",
        desc: "Middle and senior students performing safe chemical reactions and quantitative solution analysis.",
      },
      {
        src: publicUrl('images/subjects/science-2.jpg'),
        title: "Compound Optical Microscopy",
        desc: "Microscopic observation and botanical specimen analysis under high-magnification optical lenses.",
      },
    ],
    cta: {
      kicker: "NCERT SCIENCE REPOSITORY",
      headline: "Explore Verified Science Textbooks & Lab Manuals",
      paragraph:
        "Download official NCERT Science textbooks, lab exercise guides, and chapter notes directly from our digital library.",
      primaryButtonText: "Browse Science E-Books →",
      primaryButtonLink: "/e-books?subject=Science",
      secondaryButtonText: "Schedule a Lab Tour",
      isModal: true,
    },
  },

  social: {
    id: "social",
    title: "Social Studies & Global Perspectives",
    kicker: "CURRICULUM · SOCIAL STUDIES",
    levels: "CLASSES 3 – 10",
    video: publicUrl('videos/social_studies.mp4'),
    poster: publicUrl('images/subjects/social-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/social-hero.jpg'),
    intro:
      "Developing empathetic, responsible global citizens through immersive Indian and world history, geographical analysis, democratic political institutions, and socio-economic understanding.",
    stats: [
      { number: "4", label: "Core Disciplines" },
      { number: "100%", label: "CBSE Aligned" },
      { number: "8+", label: "Field Study Visits" },
      { number: "Active", label: "Heritage Club" },
    ],
    gradeBands: [
      {
        badge: "Classes 3 – 5",
        title: "Primary Social Studies",
        focus: "Community, Geography & Heritage",
        points: [
          "Our neighborhood, local administrative bodies, civic helpers, and India's rich cultural calendar",
          "Physical features of India: mountains, northern plains, peninsular plateau, coastal strips, and islands",
          "Map skills: understanding scales, cardinal directions, legends, and physical vs political boundaries",
          "Heritage awareness: monuments, ancient architecture, and environmental preservation traditions",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School",
        focus: "History, Geography & Democratic Civics",
        points: [
          "History: Indus Valley civilization, Vedic period, Mauryan & Gupta empires, Delhi Sultanate, Mughals, and colonial transition",
          "Geography: Earth's motions, latitude/longitude coordinate grid, atmospheric layers, and global climate domains",
          "Civics: The Indian Constitution, democratic governance, parliamentary functions, and rural/urban administration",
          "Hands-on project work: relief map modeling, archaeological timeline charts, and museum field trips",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School",
        focus: "CBSE Board Syllabus & Contemporary World",
        points: [
          "History: Nationalism in Europe and India, industrialization, and the making of a global interconnected world",
          "Geography: Resource planning, water resources, agriculture, minerals, energy, and lifelines of national economy",
          "Democratic Politics: Federal power sharing, gender, religion, caste dynamics, political parties, and democratic outcomes",
          "Economics: Development metrics, economic sectors, money, banking credit systems, and globalization impacts",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/social-1.jpg'),
        title: "Geographical Mapping & Terrestrial Globes",
        desc: "Interactive topographical relief analysis and cartographic projects in our humanities lab.",
      },
      {
        src: publicUrl('images/subjects/social-2.jpg'),
        title: "Parliamentary Simulations & History Displays",
        desc: "Student-led historical exhibitions, heritage research presentations, and mock parliamentary debates.",
      },
    ],
    cta: {
      kicker: "NCERT SOCIAL SCIENCE REPOSITORY",
      headline: "Download History, Geography & Civics Textbooks",
      paragraph:
        "Access official CBSE Social Science textbooks, historical maps, and democratic politics curriculum modules as single-file PDFs.",
      primaryButtonText: "Browse Social Studies E-Books →",
      primaryButtonLink: "/e-books?subject=Social%20Science",
      secondaryButtonText: "Enquire for Admissions",
      isModal: true,
    },
  },

  computer: {
    id: "computer",
    title: "Computer Science & Digital Innovation",
    kicker: "CURRICULUM · COMPUTER SCIENCE",
    levels: "CLASSES 1 – 10",
    video: publicUrl('videos/computer_science.mp4'),
    poster: publicUrl('images/subjects/cs-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/cs-hero.jpg'),
    intro:
      "Empowering students with 21st-century digital literacy, computational thinking, algorithmic logic, and programming fundamentals from visual block coding to Python and Artificial Intelligence.",
    stats: [
      { number: "2", label: "Air-Conditioned Labs" },
      { number: "1:1", label: "Terminal Access" },
      { number: "Python & AI", label: "Modern Curriculum" },
      { number: "100%", label: "Safe Digital Campus" },
    ],
    gradeBands: [
      {
        badge: "Classes 1 – 2",
        title: "Early Digital Literacy",
        focus: "Hardware Familiarity & Creative Drawing",
        points: [
          "Understanding computing hardware: CPU, monitor, keyboard, and ergonomic mouse handling",
          "Creative digital art with TuxPaint: brush tools, stamps, geometric shapes, and color palettes",
          "Keyboard home-row finger placement, typing games, and healthy screen-time habits",
        ],
      },
      {
        badge: "Classes 3 – 5",
        title: "Primary Coding & Productivity",
        focus: "Visual Programming & Office Suites",
        points: [
          "Document formatting, typing speed development, and slide presentations with images and transitions",
          "Visual block programming using MIT Scratch: creating animations, interactive games, and loops",
          "Algorithmic thinking: logical sequencing, conditions, variables, and step-by-step problem decomposition",
          "Cyber ethics: creating strong passwords, safe online behavior, and understanding digital footprints",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School",
        focus: "Web Technologies & Textual Coding",
        points: [
          "HTML5 and CSS3: structure of web pages, styling, navigation links, and modern page layouts",
          "Introduction to Python programming: syntax, variables, user input, conditional if-else statements, and for/while loops",
          "Spreadsheet data analysis: formulas, mathematical functions, chart creation, and data sorting",
          "Cybersecurity fundamentals: recognizing phishing, understanding malware, and protecting personal data",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School",
        focus: "CBSE AI & Computer Applications",
        points: [
          "CBSE prescribed curriculum in Artificial Intelligence and Computer Applications",
          "Advanced Python: data structures (lists, tuples, dictionaries), user-defined functions, and modules",
          "Relational database management (RDBMS) and structured queries with MySQL (SELECT, WHERE, ORDER BY)",
          "Capstone project creation: automated software scripts, web applications, and ethical AI case studies",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/cs-1.jpg'),
        title: "Interactive Coding Terminals",
        desc: "Students programming Python scripts and web applications in our contemporary computer lab.",
      },
      {
        src: publicUrl('images/subjects/cs-2.jpg'),
        title: "Robotics & Hardware Interfacing",
        desc: "Students building and coding robotic kits, micro-controller boards, and autonomous sensors.",
      },
    ],
    cta: {
      kicker: "TECH CURRICULUM REPOSITORY",
      headline: "Discover Digital Textbooks & Coding Materials",
      paragraph:
        "Access CBSE Computer Science textbooks, Python reference manuals, and practical coding blueprints directly.",
      primaryButtonText: "Explore Tech E-Books →",
      primaryButtonLink: "/e-books?subject=Computer%20Science",
      secondaryButtonText: "Enquire About STEM Program",
      isModal: true,
    },
  },

  arts: {
    id: "arts",
    title: "Arts, Music & Physical Education",
    kicker: "CURRICULUM · ARTS, MUSIC & SPORTS",
    levels: "NURSERY – CLASS 10",
    video: publicUrl('videos/arts_sports.mp4'),
    poster: publicUrl('images/subjects/arts-hero.jpg'),
    fallbackImage: publicUrl('images/subjects/arts-hero.jpg'),
    intro:
      "Nurturing creative self-expression, acoustic musicality, physical vitality, and teamwork through structured visual arts, performing arts, and comprehensive athletics.",
    stats: [
      { number: "2", label: "Dedicated Art Studios" },
      { number: "1", label: "Acoustic Music Suite" },
      { number: "4 Acres", label: "Outdoor Sports Field" },
      { number: "10+", label: "Sport Disciplines" },
    ],
    gradeBands: [
      {
        badge: "Nursery – KG",
        title: "Foundational Expression",
        focus: "Sensory Arts & Motor Coordination",
        points: [
          "Sensory discovery: tactile clay modeling, finger painting, paper folding (origami), and collage crafts",
          "Nursery rhymes, vocal warmups, rhythm clapping, and percussion instrument exploration",
          "Gross motor coordination: balance obstacle courses, running, skipping, ball catching, and tumbling",
          "Playful physical education fostering body awareness, spatial balance, and joy of movement",
        ],
      },
      {
        badge: "Classes 1 – 5",
        title: "Primary School",
        focus: "Artistic Technique & Coordinated Play",
        points: [
          "Visual Arts: Color wheel theory, watercolor washes, pencil shading, and traditional Indian folk styles (Madhubani, Warli)",
          "Music & Performing Arts: Indian classical swaras, Western choral singing, rhythm beats (Taals), and theatre skits",
          "Physical Education: Track sprints, basic gymnastics, yoga asanas, and recreational agility team games",
          "Mini-sports clinics: football dribbling, basketball chest passes, and cricket batting basics",
        ],
      },
      {
        badge: "Classes 6 – 8",
        title: "Middle School",
        focus: "Specialized Studios & Competitive Leagues",
        points: [
          "Visual Arts: Acrylic on stretched canvas, 3D perspective drawing, ceramic sculpture, and digital poster design",
          "Music: Instrumental training (keyboards, acoustic guitar, tabla, drums) and school ensemble rehearsals",
          "Sports: Structured coaching in football, basketball, cricket, volleyball, badminton, and track & field",
          "Sportsmanship ethos: peer leadership, strategic game communication, endurance building, and fair play",
        ],
      },
      {
        badge: "Classes 9 – 10",
        title: "Secondary School",
        focus: "CBSE HPE & Elite Coaching",
        points: [
          "CBSE Health & Physical Education (HPE) strand with standardized fitness testing and health journals",
          "Annual sports day championships, inter-school tournament trials, and specialized athletics conditioning",
          "Art portfolio curation for state competitions, gallery exhibitions, and school design publications",
          "School marching band performances, musical concerts, and district cultural stage representation",
        ],
      },
    ],
    highlights: [
      {
        src: publicUrl('images/subjects/arts-1.jpg'),
        title: "Visual Arts Studio & Painting",
        desc: "Students practicing fine art techniques, color harmony, and canvas painting in our sunlit studio.",
      },
      {
        src: publicUrl('images/subjects/arts-2.jpg'),
        title: "Track Athletics & Field Sports",
        desc: "Students training and competing on our athletic sprint tracks and lush outdoor sports complex.",
      },
    ],
    cta: {
      kicker: "CO-CURRICULAR & HOLISTIC EXCELLENCE",
      headline: "Where Passion Meets Discipline",
      paragraph:
        "Discover how our art galleries, acoustic music suites, and competitive sports academies cultivate balanced champions. Connect with our admissions counselors today.",
      primaryButtonText: "Enquire for Admissions →",
      primaryButtonLink: "#contact",
      secondaryButtonText: "Explore Student Life",
      isModal: true,
    },
  },
};
