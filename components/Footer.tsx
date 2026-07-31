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
      <p className="mt-3 font-mono text-xs text-muted">
        please reach out! always happy to connect / meet / give advice. if i know you through a mutual or have non-professional inquiries just dm me on insta :)
      </p>
    </footer>
  );
}
