"use client";

import { useState } from "react";
import Image from "next/image";
import { experience } from "@/lib/content";
import CornerCard from "./CornerCard";
import LogKicker from "./LogKicker";
import StatusLine from "./StatusLine";
import SectionHeader from "./SectionHeader";

function LogoSlot({
  logo,
  org,
  dark,
}: {
  logo: string | null;
  org: string;
  dark?: boolean;
}) {
  if (logo) {
    return (
      <div
        className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line ${
          dark ? "bg-graphite" : "bg-paper"
        }`}
      >
        <Image src={logo} alt={org} fill className="object-contain p-1" />
      </div>
    );
  }
  const initials = org
    .split(" ")
    .filter((w) => /^[A-Z@]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2) || org.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-card font-mono text-xs text-accent">
      {initials}
    </div>
  );
}

function ExperienceCard({
  entry,
  logIndex,
}: {
  entry: (typeof experience)[number];
  logIndex: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <CornerCard>
      <LogKicker index={logIndex} />
      <div className="flex items-start gap-3 mb-3">
        <LogoSlot logo={entry.logo} org={entry.org} dark={entry.logoDark} />
        <div className="min-w-0">
          <h3 className="text-graphite font-medium text-base leading-tight">
            {entry.role}
          </h3>
          <p className="text-secondary text-sm">{entry.org}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <StatusLine status={entry.status} dateRange={entry.dateRange} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1 font-mono text-xs text-accent outline-none focus-visible:underline"
        >
          details
          <svg
            viewBox="0 0 12 12"
            className={`h-3 w-3 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? "480px" : "0px" }}
      >
        <ul className="mt-4 space-y-2 text-secondary text-sm list-disc pl-4">
          {entry.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </CornerCard>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-24">
      <SectionHeader index="experience" title="experience" />
      <div className="space-y-4">
        {experience.map((entry) => (
          <ExperienceCard
            key={entry.logIndex}
            entry={entry}
            logIndex={entry.logIndex}
          />
        ))}
      </div>
    </section>
  );
}
