export type Status = "live" | "active" | "dev" | "current" | "closed";

export const bio = {
  photos: [{ src: "/headshot.jpg", caption: "img_003 · headshot.jpg" }],
  stats: [
    { label: "focus", value: "machine intelligence" },
    { label: "labs", value: "dynamic mobility lab, epic lab, inan lab" },
    { label: "gpa", value: "4.00" },
    { label: "base", value: "atlanta, ga" },
  ],
  paragraphs: [
    "I'm interested in machine intelligence broadly — how systems learn representations, make predictions, and act — with a particular pull toward reinforcement learning techniques, and toward applying learning techniques to complex problems involving multimodal data, locomotion and manipulation under uncertainty.",
    "I'm a Computer Engineering student at Georgia Tech pursuing Robotics and Distributed System & Software Design threads.",
    "Growing up between the U.S., Switzerland, and Ghana shaped how I think about community and responsibility, and it's part of why I care about building systems that actually work for the people using them, not just in a demo.",
    "Outside the lab, I play football (not soccer), snowboard, travel, and am currently learning videography / editing."
  ],
};

export type ExperienceEntry = {
  logIndex: string;
  role: string;
  org: string;
  logo: string | null;
  logoDark?: boolean;
  status: Status;
  dateRange: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    logIndex: "log_005",
    role: "undergraduate research assistant",
    org: "Dynamic Mobility Lab",
    logo: "/logos/dm_logo.png",
    status: "current",
    dateRange: "2026.09 —> present",
    bullets: [
      "multi-objective reinforcement learning for locomotion tasks",
    ],
  },
  {
    logIndex: "log_006",
    role: "machine learning engineer",
    org: "Georgia Tech Research Institute",
    logo: "/logos/gtri.jpg",
    status: "current",
    dateRange: "2026.08 —> present",
    bullets: [
      "machine learning engineer for gtri arcaid (advanced research in computing & artificial intelligence).",
    ],
  },
  {
    logIndex: "log_007",
    role: "undergraduate research assistant",
    org: "EPIC Lab",
    logo: "/logos/epic.png",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "ml for wearable-sensing based energy estimation",
      "hip-knee exoskeleton development"
    ],
  },
  {
    logIndex: "log_008",
    role: "undergraduate research assistant",
    org: "Inan Research Lab",
    logo: "/logos/inan.png",
    logoDark: true,
    status: "current",
    dateRange: "2025.09 —> present",
    bullets: [
      "c implementation of kalman filter-based pipeline for event identification in scg data",
      "tcn-based interpretability analysis towards understanding impact of levodopa dosage for different stages of Parkinson's",
      "ml for signal quality classification of multimodal biosignal data"
    ],
  },
];

export const involvements: ExperienceEntry[] = [
  {
    logIndex: "log_009",
    role: "founding treasurer",
    org: "WEAR @ GT (Wearable Exoskeletons and Assistive Robotics @ Georgia Tech)",
    logo: "/logos/wearlogo.jpg",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "manage club finances, budget planning, and funding request review.",
    ],
  },
  {
    logIndex: "log_010",
    role: "treasurer",
    org: "Delta Chi Fraternity",
    logo: "/logos/deltachi.jpg",
    status: "current",
    dateRange: "2026.08 —> present",
    bullets: [
      "manage $300K+ annual budget for 100+ member fraternity chapter (dues + expenses + reporting)",
    ],
  },
  {
    logIndex: "log_011",
    role: "peer instructor",
    org: "The Hive Makerspace",
    logo: "/logos/hive.png",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "front-desk operations, 3d printing support and troubleshooting",
    ],
  },
];

export type EducationEntry = {
  logIndex: string;
  degree: string;
  school: string;
  logo: string | null;
  status: string;
  detailLines: string[];
};

export const education: EducationEntry[] = [
  {
    logIndex: "log_012",
    degree: "B.S. Computer Engineering",
    school: "Georgia Institute of Technology",
    logo: "/logos/gt.png",
    status: "expected 2029.05",
    detailLines: [
      "threads: Robotics & Autonomous Systems, Distributed System & Software Design",
      "distinctions: Stamps President's Scholars Program · Ron Brown Captain · Faculty Honors (x2)",
      "gpa: 4.00",
      "coursework: Intro to Robotics & Perception (CS 3630) · Intro to Signal Processing (ECE 2026) · Programming for Hardware/Software Systems (ECE 2035) · Digital System Design (ECE 2020) · Data Structures & Algorithms (CS 1332)",
    ],
  },
  {
    logIndex: "log_013",
    degree: "Bilingual IB Diploma",
    school: "International School of Lausanne",
    logo: "/logos/isl.jpg",
    status: "graduated 2025.05",
    detailLines: [
      "higher level: Mathematics Analysis and Approaches · Physics · Computer Science",
      "IB Bilingual Diploma — English, French",
      "final grade: 43/45",
    ],
  },
];

export type PublicationStatus = "accepted" | "in preparation";

export type Publication = {
  title: string;
  authors: string[];
  etAl?: boolean;
  venue?: string;
  year?: number;
  status: PublicationStatus;
  link?: string;
};

// rendered in bold wherever it appears in an author list
export const selfAuthor = "M. Fangajei";

// listed in display order; groups and [A.1]-style labels are derived from status
export const publicationGroups: PublicationStatus[] = ["accepted", "in preparation"];

export const publications: Publication[] = [
  {
    title:
      "Implementation and validation of a real-time algorithm for wearable seismocardiogram fiducial point detection",
    authors: [
      "F. Rahman",
      "M. Fangajei",
      "A. Nawar",
      "O. Selim Kilic",
      "C. Okan Yaldiz",
      "J. Hahn",
      "O. T. Inan",
    ],
    venue: "IEEE Sensors",
    year: 2026,
    status: "accepted",
  },
  {
    title:
      "Cross-species transfer learning for seismocardiography signal quality assessment via few-shot adaptation from pre-trained porcine models",
    authors: [
      "M. Cho",
      "O. Kilic",
      "C. Yaldiz",
      "V. Abbaraju",
      "A. Nawar",
      "M. Fangajei",
      "A. Emirdagi",
      "D. Tangolar",
      "F. Rahman",
      "G. Cestero",
      "Z. Bouzid",
      "O. Inan",
    ],
    status: "in preparation",
  },
];

export type ProjectEntry = {
  title: string;
  description: string;
  status: Status;
  stack: string[];
  link: string | null;
  linkLabel: string;
};

export const projects: ProjectEntry[] = [
  {
    title: "BuzzBoard",
    description:
      "Searchable directory of Georgia Tech VIP teams, research labs, and technical student orgs, with scraper pipelines, LLM-based classification, and a crowdsourced submission + review queue.",
    status: "active",
    stack: ["Postgres", "Playwright", "LLM classification", "full-text search"],
    link: "https://gt-opportunities.vercel.app/",
    linkLabel: "in progress",
  },
  {
    title: "Corpus",
    description:
      "Full-stack reading tracker web app with keyword search and Gemini-powered metadata extraction, deployed on Vercel.",
    status: "active",
    stack: [
      "Next.js 14",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Stripe",
      "Gemini",
    ],
    link: "https://usecorpus.app",
    linkLabel: "in progress",
  },
];

export const heroLinks = [
  { label: "linkedin", href: "https://www.linkedin.com/in/mfangajei" },
  { label: "github", href: "https://github.com/MAKOMIKOLAKO" },
  { label: "google scholar", href: "https://scholar.google.com/citations?user=-2sBsfMAAAAJ&hl=en"}
];

export const footerLinks = [
  { label: "email", href: "mailto:maako.fangajei@gmail.com" },
  { label: "linkedin", href: "https://www.linkedin.com/in/mfangajei" },
];

export const sectionIds = [
  "hero",
  "about",
  "experience",
  "publications",
  "involvements",
  "education",
  "projects",
] as const;
