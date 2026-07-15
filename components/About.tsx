import Image from "next/image";
import { bio } from "@/lib/content";
import CornerCard from "./CornerCard";
import SectionHeader from "./SectionHeader";

export default function About() {
  return (
    <section id="about" className="pt-24 pb-12">
      <SectionHeader index="about" title="about" />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_1fr] gap-10">
        <div>
          <CornerCard className="p-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px]">
              <Image
                src="/headshot.jpg"
                alt="Maako Fangajei"
                fill
                className="object-cover grayscale-[15%]"
                sizes="240px"
              />
            </div>
          </CornerCard>
          <p className="mt-2 font-mono text-xs text-muted">
            {bio.photoCaption}
          </p>
        </div>

        <div className="md:pl-10 md:border-l md:border-line">
          <dl className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 md:gap-2 font-mono text-xs mb-8">
            {bio.stats.map((stat) => (
              <div key={stat.label} className="flex md:gap-2">
                <dt className="text-muted">{stat.label}:</dt>
                <dd className="text-secondary md:inline">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-4 text-secondary text-[15px] leading-relaxed">
            {bio.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
