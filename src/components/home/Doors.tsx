import Link from "next/link";
import SignalThread from "@/components/SignalThread";
import Reveal from "@/components/fx/Reveal";
import Magnetic from "@/components/fx/Magnetic";
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
      {DOORS.map((d, i) => (
        <Reveal key={d.href} delay={i * 0.08}>
          <Link href={d.href} className={styles.door} prefetch={false}>
            <Magnetic strength={0.25} max={12}>
              <span>{d.label}</span>
            </Magnetic>
            <span className={styles.doorTag}>{d.tag}</span>
            <SignalThread
              className={styles.doorThread}
              progress={1}
              state="idle"
              tone={0.15}
            />
          </Link>
        </Reveal>
      ))}
    </nav>
  );
}
