export type Status = "live" | "active" | "dev" | "current" | "closed";

export const bio = {
  photoCaption: "img_003 · headshot.jpg",
  stats: [
    { label: "focus", value: "robotics / reinforcement learning" },
    { label: "labs", value: "2 active" },
    { label: "gpa", value: "4.00" },
    { label: "base", value: "atlanta, ga" },
  ],
  paragraphs: [
    "I'm drawn to the problem of getting systems to perform under uncertainty — sensing a noisy signal, closing a control loop, learning a policy that holds up outside the lab. Most of my research lives at that intersection: building the sensing hardware and embedded pipelines that let a learning system act in real time.",
    "Concretely, that's meant designing and fabricating wearable hardware for a hip-knee exoskeleton platform, and training temporal models on multimodal biosignals to classify physiological state — the same throughline of sense, process, learn, act. I'm an Electrical Engineering student at Georgia Tech pursuing Robotics and Signal & Information Processing threads.",
    "Growing up between the U.S., Switzerland, and Ghana shaped how I think about community and responsibility, and it's part of why I care about building systems that actually work for the people using them, not just in a demo.",
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
    role: "learning assistant",
    org: "Georgia Tech Tutoring and Learning Enrichment",
    logo: "/logos/gt-tutoring.jpg",
    status: "current",
    dateRange: "2026.03 —> present",
    bullets: [
      "Facilitate problem-solving and conceptual understanding in STEM courses through office hours and small-group instruction.",
      "Support course coordination and communication between students and instructional staff.",
    ],
  },
  {
    logIndex: "log_006",
    role: "undergraduate research assistant",
    org: "EPIC Lab",
    logo: "/logos/epic.png",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "Redesigning power system breaker board PCB layout in EasyEDA for a wearable exoskeleton platform.",
      "Redesigned battery and Raspberry Pi enclosure for the exoskeleton backpack system; fabricated final version using SLA printing.",
      "Fabricated custom IMU sensor cables (soldering + mechanical cutting) to establish a dedicated data collection kit.",
      "Assisted with motion capture and biomechanics data collection sessions with external human subjects using a hip-knee exoskeleton platform under IRB-compliant experimental protocols.",
      "3D printed structural backpack components in resin to improve durability over prior PLA/FDM parts.",
    ],
  },
  {
    logIndex: "log_007",
    role: "undergraduate research assistant",
    org: "Inan Research Lab",
    logo: "/logos/inan.png",
    logoDark: true,
    status: "current",
    dateRange: "2025.09 —> present",
    bullets: [
      "Built and benchmarked a classical ML pipeline (Random Forest, XGBoost, KNN, Logistic Regression, SVM) for SCG beat quality classification; submitted as co-author to ACM Health.",
      "Designed and implemented a C port of a Kalman-filter based methodology to identify AO and AC events (HIKAF), including a scalar Kalman filter and SCG beat segmentation; submitted as co-author to IEEE Sensors 2026.",
      "Led PCB redesign initiative for a physiological sensing device targeting stress identification and vagus nerve modulation, integrating new sensing modalities (temperature sensor, secondary PPG).",
      "Developing a multimodal temporal convolutional network (TCN) for Parkinson's levodopa state detection, using a late-fusion multi-encoder design to combine heterogeneous biosignal modalities.",
      "Implementing modality-level interpretability methods to identify which biosignal channels drive model predictions.",
    ],
  },
  {
    logIndex: "log_008",
    role: "treasurer",
    org: "WEAR @ GT (Wearable Exoskeletons and Assistive Robotics @ Georgia Tech)",
    logo: "/logos/wearlogo.jpg",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "Manage club finances, budget planning, and funding request review.",
    ],
  },
  {
    logIndex: "log_009",
    role: "peer instructor",
    org: "The Hive Makerspace",
    logo: "/logos/hive.png",
    status: "current",
    dateRange: "2026.01 —> present",
    bullets: [
      "Front-desk operations, 3D printing support and troubleshooting.",
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
    logIndex: "log_010",
    degree: "B.S. Electrical Engineering, minor in Computer Science",
    school: "Georgia Institute of Technology",
    logo: "/logos/gt.png",
    status: "expected 2028.05",
    detailLines: [
      "threads: Robotics, Signal & Information Processing (pursuing)",
      "distinctions: Stamps President's Scholars Program · Ron Brown Captain · Faculty Honors (x1)",
      "gpa: 4.00",
      "coursework: Digital System Design (ECE 2020) · Linear Algebra (MATH 1554) · Principles of Physics II (PHYS 2212) · Intro to Object-Oriented Programming (CS 1331) · Data Structures & Algorithms (CS 1332)",
    ],
  },
  {
    logIndex: "log_011",
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

export type ProjectEntry = {
  title: string;
  description: string;
  status: Status;
  dateRange: string;
  stack: string[];
  link: string | null;
  linkLabel: string;
};

export const projects: ProjectEntry[] = [
  {
    title: "Journal Club Coordinator",
    description:
      "A simple coordination tool for live research reading groups. Invite your team, pull in papers from arXiv, vote on what's next, and schedule your meetings — all in one place.",
    status: "active",
    dateRange: "2026.07 —> present",
    stack: ["Next.js", "Typescript", "Prisma", "PostgreSQL", "Auth.js"],
    link: "https://journalclub.vercel.app/",
    linkLabel: "in progress",
  },
  {
    title: "GT Campus Opportunity Finder",
    description:
      "Searchable directory of Georgia Tech VIP teams, research labs, and technical student orgs, with scraper pipelines, LLM-based classification, and a crowdsourced submission + review queue.",
    status: "active",
    dateRange: "2026.07 —> present",
    stack: ["Postgres", "Playwright", "LLM classification", "full-text search"],
    link: "https://gt-opportunities.vercel.app/",
    linkLabel: "in progress",
  },
  {
    title: "Standing-Balance Control Policy for Humanoid Robot",
    description:
      "Custom reinforcement learning environment for humanoid balance recovery, training a PPO policy on the Berkeley Humanoid robot model.",
    status: "dev",
    dateRange: "2026.06 —> present",
    stack: ["MuJoCo Playground", "Brax", "PPO", "reinforcement learning"],
    link: "https://github.com/MAKOMIKOLAKO/humanoid_balance",
    linkLabel: "in progress",
  },
  {
    title: "ESP32 Multi-Sensor Real-Time Data Logger",
    description:
      "Embedded firmware integrating time-of-flight and PPG sensors over I2C, with a real-time signal processing pipeline for heart rate extraction.",
    status: "dev",
    dateRange: "2026.06 —> present",
    stack: ["C", "ESP-IDF", "FreeRTOS", "I2C", "VL53L0X", "MAX30102"],
    link: "https://github.com/MAKOMIKOLAKO/esp32-sensor-integration",
    linkLabel: "repo",
  },
  {
    title: "Corpus",
    description:
      "Full-stack reading tracker web app with keyword search and Gemini-powered metadata extraction, deployed on Vercel.",
    status: "active",
    dateRange: "2026.03 —> present",
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
  {
    title: "drift.",
    description:
      "Voice-first personal context engine — speak and forget. Update named threads of persistent information by voice, no ambient listening, no typing.",
    status: "dev",
    dateRange: "2026 —> present",
    stack: ["FastAPI", "Supabase", "pgvector", "Deepgram", "Claude API", "Python"],
    link: null,
    linkLabel: "build in progress",
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
  { label: "github", href: "https://github.com/MAKOMIKOLAKO" },
];

export const sectionIds = [
  "hero",
  "about",
  "experience",
  "education",
  "projects",
] as const;
