import Image from "next/image";
import { education } from "@/lib/content";
import CornerCard from "./CornerCard";
import LogKicker from "./LogKicker";
import SectionHeader from "./SectionHeader";

function LogoSlot({ logo, school }: { logo: string | null; school: string }) {
  if (logo) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
        <Image src={logo} alt={school} fill className="object-contain p-1" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-card font-mono text-xs text-accent">
      {school.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function Education() {
  return (
    <section id="education" className="py-24">
      <SectionHeader index="education" title="education" />
      <div className="space-y-4">
        {education.map((entry) => (
          <CornerCard key={entry.logIndex}>
            <LogKicker index={entry.logIndex} />
            <div className="flex items-start gap-3 mb-3">
              <LogoSlot logo={entry.logo} school={entry.school} />
              <div className="min-w-0">
                <h3 className="text-graphite font-medium text-base leading-tight">
                  {entry.degree}
                </h3>
                <p className="text-secondary text-sm">{entry.school}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-secondary mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-live" />
              <span>{entry.status}</span>
            </div>

            <ul className="space-y-1 font-mono text-xs text-muted">
              {entry.detailLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </CornerCard>
        ))}
      </div>
    </section>
  );
}
