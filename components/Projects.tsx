import { projects } from "@/lib/content";
import CornerCard from "./CornerCard";
import StatusLine from "./StatusLine";
import SectionHeader from "./SectionHeader";

export default function Projects() {
  return (
    <section id="projects" className="py-24">
      <SectionHeader index="projects" title="projects" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((project) => (
          <CornerCard key={project.title}>
            <h3 className="text-graphite font-medium text-base mb-1.5">
              {project.title}
            </h3>
            <p className="text-secondary text-sm mb-4">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.stack.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-secondary border border-line rounded-full px-2 py-0.5"
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
          </CornerCard>
        ))}
      </div>
    </section>
  );
}
