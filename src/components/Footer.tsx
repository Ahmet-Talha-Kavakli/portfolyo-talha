import { site, type Social } from "@content";
import styles from "./Footer.module.css";

// İkonlar inline SVG (emoji yok — hafıza/spec §4). Brand glyph'leri fill,
// e-posta stroke; renk currentColor (CSS .icon color).
function Icon({ label }: { label: Social["label"] }) {
  switch (label) {
    case "Email":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M4 7l8 6 8-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "GitHub":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-4z" />
        </svg>
      );
    case "X":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05z" />
        </svg>
      );
  }
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div>
        <div className={styles.brand}>{site.name}</div>
        <div className={styles.meta}>
          {site.city} · © {year}
        </div>
      </div>
      <nav className={styles.socials} aria-label="Social links">
        {site.socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className={styles.icon}
            aria-label={s.label}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            <Icon label={s.label} />
          </a>
        ))}
      </nav>
    </footer>
  );
}
