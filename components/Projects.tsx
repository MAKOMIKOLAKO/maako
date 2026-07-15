"use client";

import { useState } from "react";
import { projects, type ProjectEntry } from "@/lib/content";
import CornerCard from "./CornerCard";
import StatusLine from "./StatusLine";
import SectionHeader from "./SectionHeader";
import Modal from "./Modal";

function ProjectBody({
  project,
  expanded = false,
}: {
  project: ProjectEntry;
  expanded?: boolean;
}) {
  return (
    <>
      <h3
        className={`text-graphite font-medium mb-2 ${
          expanded ? "text-2xl" : "text-base mb-1.5 pr-14"
        }`}
      >
        {project.title}
      </h3>
      <p
        className={`text-secondary mb-4 ${
          expanded ? "text-base leading-relaxed" : "text-sm"
        }`}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.stack.map((tag) => (
          <span
            key={tag}
            className={`font-mono text-secondary border border-line rounded-full ${
              expanded ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <StatusLine status={project.status} dateRange={project.dateRange} />
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-mono text-xs text-accent outline-none focus-visible:underline"
          >
            {project.linkLabel}
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className="font-mono text-xs text-muted">
            {project.linkLabel}
          </span>
        )}
      </div>
    </>
  );
}

export default function Projects() {
  const [active, setActive] = useState<ProjectEntry | null>(null);

  return (
    <section id="projects" className="pt-12 pb-24">
      <SectionHeader index="projects" title="projects" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((project) => (
          <button
            key={project.title}
            type="button"
            onClick={() => setActive(project)}
            className="text-left outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[4px]"
          >
            <CornerCard hint>
              <ProjectBody project={project} />
            </CornerCard>
          </button>
        ))}
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)}>
        {active && (
          <CornerCard className="p-8 sm:p-10">
            <ProjectBody project={active} expanded />
          </CornerCard>
        )}
      </Modal>
    </section>
  );
}
