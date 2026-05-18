"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/LenisProvider";
import styles from "./Menu.module.css";

const LINKS = [
  { href: "/", label: "Home", tag: "start" },
  { href: "/projects", label: "Projects", tag: "built" },
  { href: "/about", label: "About", tag: "who" },
  { href: "/contact", label: "Contact", tag: "talk" },
] as const;

export default function Menu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { stop, start } = useLenis();
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Rota değişince kapan (link tıklanınca da garanti).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Açıkken: Lenis kilit + focus-trap + Esc; kapanınca focus butona döner.
  useEffect(() => {
    if (!open) {
      start();
      return;
    }
    stop(); // film pin'liyken bile scroll kilitli kalır (Lenis durur)

    const overlay = overlayRef.current;
    const focusables = overlay
      ? Array.from(
          overlay.querySelectorAll<HTMLElement>("a[href], button"),
        )
      : [];
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      btnRef.current?.focus();
    };
  }, [open, stop, start]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.button}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <div
        ref={overlayRef}
        id="site-menu"
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
      >
        <nav>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              tabIndex={open ? 0 : -1}
              onClick={close}
              // /projects,/about,/contact Faz 4-6'da kurulacak; o zamana
              // kadar prefetch 404 gürültüsü yapmasın.
              prefetch={false}
            >
              <span>{l.label}</span>
              <span className={styles.tag}>{l.tag}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
