import SignalThread from "@/components/SignalThread";
import { site } from "@content";
import styles from "@/app/contact/contact.module.css";

/** Form sevmeyenler için: büyük tıklanır direkt satırlar. */
export default function DirectLinks() {
  return (
    <div className={styles.links}>
      <div className={styles.linksHead}>or, directly</div>
      {site.socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          className={styles.link}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {s.label}
          <SignalThread
            className={styles.linkThread}
            progress={1}
            state="idle"
            tone={0.15}
          />
        </a>
      ))}
    </div>
  );
}
