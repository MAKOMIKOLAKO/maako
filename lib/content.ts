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
    "I'm drawn to the problem of getting physical systems to act well under uncertainty — sensing a noisy signal, closing a control loop, learning a policy that holds up outside the lab. Most of my research lives at that intersection: building the sensing hardware and embedded pipelines that let a learning system act on a body, human or robotic, in real time.",
    "Concretely, that's meant designing and fabricating wearable hardware for a hip-knee exoskeleton platform, and training temporal models on multimodal biosignals to classify physiological state — the same throughline of sense, process, learn, act, just applied first to human health because that's where I found the research. I'm a Computer Engineering student at Georgia Tech pursuing Robotics and Signal & Information Processing threads.",
    "Growing up between the U.S., Switzerland, and Ghana shaped how I think about community and responsibility, and it's part of why I care about building systems that actually work for the people using them, not just in a demo.",
  ],
};

export const currentWork = [
  {
    logIndex: "log_003",
    title: "TCN — levodopa state classification",
    org: "inan lab",
    description: "Multimodal biosignal model — EEG, ECG, respiratory",
    status: "active" as Status,
    statusDetail: "pytorch / grad-cam",
    dateRange: "2025.09 —> present",
    detail: "also: SCG beat quality — accepted, Nature Sensors",
    waveform: "bio" as const,
    fullDetail:
      "Training a Temporal Convolutional Network in PyTorch on multimodal physiological data (EEG, ECG, respiratory) from Parkinson's patients to classify levodopa usage state; applying Grad-CAM analysis to identify predictive biomarkers. Developed a classical ML pipeline (Random Forest, XGBoost, KNN, Logistic Regression, SVM) to classify SCG beat quality; k-fold and LOSO validation; contributing author on accepted Nature Sensors paper. Also assisted with PCB redesign for a wrist-worn stress/vagus-nerve-modulation device.",
  },
  {
    logIndex: "log_004",
    title: "Hip-knee exoskeleton platform",
    org: "epic lab",
    description: "Sensor hardware, PCB layout, embedded enclosures",
    status: "active" as Status,
    statusDetail: "solidworks / easyeda",
    dateRange: "2026.01 —> present",
    detail: "human subjects testing — biomechanical data collection",
    waveform: "control" as const,
    fullDetail:
      "Designing and fabricating sensor hardware, structural enclosures, and PCB layouts for a hip-knee lower-limb exoskeleton research platform, and assisting with biomechanical data collection sessions involving instrumented human subjects.",
  },
];

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
    role: "incoming learning assistant",
    org: "Georgia Tech Tutoring and Learning Enrichment",
    logo: null,
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
      "Fabricated custom IMU sensor cables via soldering and mechanical assembly to establish a dedicated data collection kit, eliminating cross-team hardware contention across shared lab resources.",
      "Designed and 3D printed structural wearable backpack components in resin (Formlabs SLA) using SolidWorks and Cura, improving durability over prior prototypes for field data collection use.",
      "Redesigned battery and Raspberry Pi enclosure in SolidWorks with focus on weight reduction and structural durability; fabricated final version in Formlabs resin.",
      "Assisted with biomechanical data collection sessions involving external human subjects instrumented with a hip-knee lower-limb exoskeleton.",
      "Redesigning power system breaker board PCB layout in EasyEDA for wearable exoskeleton platform, targeting improved reliability and form factor for embedded deployment.",
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
      "Developing and training a TCN in PyTorch on multimodal physiological data (EEG, ECG, respiratory) from Parkinson's disease patients to classify levodopa usage state; applying Grad-CAM analysis to identify predictive biomarkers.",
      "Developed a classical ML pipeline to classify SCG beat quality for automated biosignal quality assessment using Random Forest, XGBoost, KNN, Logistic Regression, and SVM; applied k-fold and LOSO validation — contributing author on accepted Nature Sensors paper.",
      "Assisted with PCB redesign initiative for a wrist-worn physiological sensing device targeting stress identification and vagus nerve modulation, mapping component placement strategy across board revisions integrating new temperature and PPG sensing modalities.",
    ],
  },
  {
    logIndex: "log_008",
    role: "treasurer",
    org: "WEAR @ GT (Wearable Exoskeletons and Assistive Robotics @ Georgia Tech)",
    logo: null,
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
    logo: null,
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
    status: "expected 2029.05",
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
    title: "Corpus",
    description:
      "Collaborative research platform for organizing, annotating, and semantically searching academic sources in real time.",
    status: "live",
    dateRange: "2025 —> present",
    stack: [
      "Next.js 14",
      "TypeScript",
      "PostgreSQL (Neon)",
      "Prisma",
      "pgvector",
      "Stripe",
      "NextAuth",
      "Gemini Flash",
      "OpenAI Embeddings",
      "Chrome Extension",
    ],
    link: "https://usecorpus.app",
    linkLabel: "usecorpus.app",
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
  { label: "resume", href: "/resume.pdf" },
  { label: "linkedin", href: "https://www.linkedin.com/in/mfangajei" },
];

export const footerLinks = [
  { label: "email", href: "mailto:reachmaako@gmail.com" },
  { label: "linkedin", href: "https://www.linkedin.com/in/mfangajei" },
  { label: "github", href: "https://github.com/MAKOMIKOLAKO" },
];

export const sectionIds = [
  "hero",
  "about",
  "current-work",
  "experience",
  "education",
  "projects",
] as const;
