import {
  publications,
  publicationGroups,
  selfAuthor,
  type Publication,
} from "@/lib/content";
import SectionHeader from "./SectionHeader";

// "A, B, and C" for a full list; "A, B, C, et al." for a truncated one
function separatorAfter(index: number, count: number, etAl?: boolean) {
  if (index === count - 1) return etAl ? ", et al." : "";
  if (index === count - 2 && !etAl) return count > 2 ? ", and " : " and ";
  return ", ";
}

function AuthorList({ authors, etAl }: Pick<Publication, "authors" | "etAl">) {
  return (
    <p className="text-sm text-secondary">
      {authors.map((name, i) => (
        <span key={name}>
          {name === selfAuthor ? (
            <strong className="font-semibold text-graphite">{name}</strong>
          ) : (
            name
          )}
          {separatorAfter(i, authors.length, etAl)}
        </span>
      ))}
    </p>
  );
}

function PublicationItem({
  label,
  publication,
}: {
  label: string;
  publication: Publication;
}) {
  const { title, authors, etAl, venue, year, status, link } = publication;
  const isAccepted = status === "accepted";
  const meta = [venue, year].filter(Boolean).join(" · ") || status;

  return (
    <li className="grid grid-cols-[3rem_1fr] gap-x-3 sm:grid-cols-[3.5rem_1fr]">
      <span className="pt-0.5 font-mono text-xs text-accent">[{label}]</span>
      <div className="min-w-0 space-y-1.5">
        <h3 className="text-base font-medium leading-snug text-graphite">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-none hover:text-accent focus-visible:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        <AuthorList authors={authors} etAl={etAl} />
        <div className="flex items-center gap-2 font-mono text-xs text-secondary">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isAccepted ? "bg-status-live" : "bg-status-idle"
            }`}
            aria-hidden="true"
          />
          <span>{meta}</span>
        </div>
      </div>
    </li>
  );
}

export default function Publications() {
  const groups = publicationGroups
    .map((status) => ({
      status,
      items: publications.filter((p) => p.status === status),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <section id="publications" className="py-12">
      <SectionHeader index="publications" />
      <div className="space-y-10">
        {groups.map(({ status, items }, groupIndex) => {
          const letter = String.fromCharCode(65 + groupIndex);
          return (
            <div key={status}>
              <p className="mb-4 border-b border-line pb-2 font-mono text-xs text-muted">
                {status}
              </p>
              <ol className="space-y-6">
                {items.map((publication, i) => (
                  <PublicationItem
                    key={publication.title}
                    label={`${letter}.${i + 1}`}
                    publication={publication}
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
