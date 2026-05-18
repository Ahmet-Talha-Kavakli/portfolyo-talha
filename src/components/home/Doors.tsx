import Link from "next/link";
import SignalThread from "@/components/SignalThread";
import styles from "@/app/home.module.css";

const DOORS = [
  { href: "/projects", label: "Projects", tag: "built" },
  { href: "/about", label: "About", tag: "who" },
  { href: "/contact", label: "Contact", tag: "talk" },
] as const;

/** Üç tipografik kapı (kart değil — satır); hover'da imza ipliği çizilir. */
export default function Doors() {
  return (
    <nav className={styles.doors} aria-label="Sections">
      {DOORS.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          className={styles.door}
          prefetch={false}
        >
          <span>{d.label}</span>
          <span className={styles.doorTag}>{d.tag}</span>
          <SignalThread
            className={styles.doorThread}
            progress={1}
            state="idle"
            tone={0.15}
          />
        </Link>
      ))}
    </nav>
  );
}
