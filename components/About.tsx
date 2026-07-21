"use client";

import Image from "next/image";
import { useState } from "react";
import { bio } from "@/lib/content";
import CornerCard from "./CornerCard";
import SectionHeader from "./SectionHeader";

export default function About() {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = bio.photos[photoIndex];
  const hasMultiplePhotos = bio.photos.length > 1;

  function showPrev() {
    setPhotoIndex((i) => (i - 1 + bio.photos.length) % bio.photos.length);
  }

  function showNext() {
    setPhotoIndex((i) => (i + 1) % bio.photos.length);
  }

  return (
    <section id="about" className="pt-24 pb-12">
      <SectionHeader index="about" title="about" />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_1fr] gap-10">
        <div>
          <CornerCard className="p-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px]">
              <Image
                key={photo.src}
                src={photo.src}
                alt="Maako Fangajei"
                fill
                className="object-cover grayscale-[15%]"
                sizes="240px"
              />

              {hasMultiplePhotos && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="previous photo"
                    className="absolute left-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-paper/70 font-mono text-xs text-secondary hover:text-accent focus-visible:text-accent outline-none"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="next photo"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-paper/70 font-mono text-xs text-secondary hover:text-accent focus-visible:text-accent outline-none"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
                    {bio.photos.map((p, i) => (
                      <span
                        key={p.src}
                        className={`h-1 w-1 rounded-full ${
                          i === photoIndex ? "bg-accent" : "bg-paper/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </CornerCard>
          <p className="mt-2 font-mono text-xs text-muted">{photo.caption}</p>
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
