import { footerLinks } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="py-16 border-t border-line">
      <p className="font-mono text-xs text-muted">
        connect:{" "}
        {footerLinks.map((link, i) => (
          <span key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-4 outline-none focus-visible:underline"
            >
              {link.label}
            </a>
            {i < footerLinks.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </footer>
  );
}
