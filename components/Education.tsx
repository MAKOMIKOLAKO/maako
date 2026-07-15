"use client";

import { useState } from "react";
import Image from "next/image";
import { education, type EducationEntry } from "@/lib/content";
import CornerCard from "./CornerCard";
import LogKicker from "./LogKicker";
import SectionHeader from "./SectionHeader";
import Modal from "./Modal";

function LogoSlot({
  logo,
  school,
  expanded,
}: {
  logo: string | null;
  school: string;
  expanded?: boolean;
}) {
  const size = expanded ? "h-20 w-20" : "h-16 w-16";

  if (logo) {
    return (
      <div className={`relative ${size} shrink-0 overflow-hidden rounded-lg border border-line bg-paper`}>
        <Image src={logo} alt={school} fill className="object-contain p-0.5" />
      </div>
    );
  }
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-lg border border-line bg-card font-mono text-xs text-accent`}>
      {school.slice(0, 2).toUpperCase()}
    </div>
  );
}

function EducationBody({
  entry,
  expanded = false,
}: {
  entry: EducationEntry;
  expanded?: boolean;
}) {
  return (
    <>
      <div className={`flex items-start gap-3 ${expanded ? "gap-4 mb-5" : "mb-3"}`}>
        <LogoSlot logo={entry.logo} school={entry.school} expanded={expanded} />
        <div className="min-w-0 pt-0.5">
          <LogKicker index={entry.logIndex} />
          <h3
            className={`text-graphite font-medium leading-tight ${
              expanded ? "text-2xl mb-1" : "text-base"
            }`}
          >
            {entry.degree}
          </h3>
          <p className={`text-secondary ${expanded ? "text-base" : "text-sm"}`}>
            {entry.school}
          </p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 font-mono text-secondary ${
          expanded ? "text-sm mb-5" : "text-xs mb-3"
        }`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-live" />
        <span>{entry.status}</span>
      </div>

      <ul
        className={`font-mono text-muted ${
          expanded ? "space-y-2.5 text-sm" : "space-y-1 text-xs"
        }`}
      >
        {entry.detailLines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </>
  );
}

export default function Education() {
  const [active, setActive] = useState<EducationEntry | null>(null);

  return (
    <section id="education" className="py-12">
      <SectionHeader index="education" title="education" />
      <div className="space-y-4">
        {education.map((entry) => (
          <button
            key={entry.logIndex}
            type="button"
            onClick={() => setActive(entry)}
            className="block w-full text-left outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[4px]"
          >
            <CornerCard hint>
              <EducationBody entry={entry} />
            </CornerCard>
          </button>
        ))}
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)}>
        {active && (
          <CornerCard className="p-8 sm:p-10">
            <EducationBody entry={active} expanded />
          </CornerCard>
        )}
      </Modal>
    </section>
  );
}
