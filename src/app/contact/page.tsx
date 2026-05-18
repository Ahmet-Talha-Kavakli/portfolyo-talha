import type { Metadata } from "next";
import ScrollFilm from "@/components/ScrollFilm";
import SceneText from "@/components/SceneText";
import ContactForm from "@/components/contact/ContactForm";
import DirectLinks from "@/components/contact/DirectLinks";
import LiveClock from "@/components/contact/LiveClock";
import { CONTACT_MARKERS } from "@/lib/markers";
import { site } from "@content";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: `Contact — ${site.name}`,
  description: `Let's build something. Reach ${site.name} by message or directly.`,
  openGraph: {
    title: `Contact — ${site.name}`,
    description: "Let's build something.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main>
      <ScrollFilm
        framesDir="/frames/contact"
        markers={CONTACT_MARKERS}
        scrollPerFrame={18}
      >
        <SceneText name="cursor" className={styles.cursor}>
          <span>let&apos;s build something</span>
        </SceneText>
      </ScrollFilm>

      <section className={styles.after}>
        <h1 className="sr-only">Contact</h1>
        <div className={styles.grid}>
          <ContactForm />
          <DirectLinks />
        </div>
        <LiveClock />
      </section>
    </main>
  );
}
