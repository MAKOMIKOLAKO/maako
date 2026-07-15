"use client";

import { useState } from "react";
import Image from "next/image";
import { experience, type ExperienceEntry } from "@/lib/content";
import CornerCard from "./CornerCard";
import LogKicker from "./LogKicker";
import StatusLine from "./StatusLine";
import SectionHeader from "./SectionHeader";
import Modal from "./Modal";

function LogoSlot({
  logo,
  org,
  dark,
  expanded,
}: {
  logo: string | null;
  org: string;
  dark?: boolean;
  expanded?: boolean;
}) {
  const size = expanded ? "h-20 w-20" : "h-16 w-16";

  if (logo) {
    return (
      <div
        className={`relative ${size} shrink-0 overflow-hidden rounded-lg border border-line ${
          dark ? "bg-graphite" : "bg-paper"
        }`}
      >
        <Image src={logo} alt={org} fill className="object-contain p-0.5" />
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
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-lg border border-line bg-card font-mono text-xs text-accent`}
    >
      {initials}
    </div>
  );
}

function ExperienceBody({
  entry,
  expanded = false,
}: {
  entry: ExperienceEntry;
  expanded?: boolean;
}) {
  return (
    <>
      <div className={`flex items-start gap-3 ${expanded ? "gap-4 mb-5" : "mb-3"}`}>
        <LogoSlot
          logo={entry.logo}
          org={entry.org}
          dark={entry.logoDark}
          expanded={expanded}
        />
        <div className="min-w-0 pt-0.5">
          <LogKicker index={entry.logIndex} />
          <h3
            className={`text-graphite font-medium leading-tight ${
              expanded ? "text-2xl mb-1" : "text-base"
            }`}
          >
            {entry.role}
          </h3>
          <p className={`text-secondary ${expanded ? "text-base" : "text-sm"}`}>
            {entry.org}
          </p>
        </div>
      </div>

      <StatusLine status={entry.status} dateRange={entry.dateRange} />

      {expanded && (
        <ul className="mt-5 space-y-2.5 text-secondary text-sm list-disc pl-4">
          {entry.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Experience() {
  const [active, setActive] = useState<ExperienceEntry | null>(null);

  return (
    <section id="experience" className="py-12">
      <SectionHeader index="experience" title="experience" />
      <div className="space-y-4">
        {experience.map((entry) => (
          <button
            key={entry.logIndex}
            type="button"
            onClick={() => setActive(entry)}
            className="block w-full text-left outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[4px]"
          >
            <CornerCard hint>
              <ExperienceBody entry={entry} />
            </CornerCard>
          </button>
        ))}
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)}>
        {active && (
          <CornerCard className="p-8 sm:p-10">
            <ExperienceBody entry={active} expanded />
          </CornerCard>
        )}
      </Modal>
    </section>
  );
}
