"use client";

import { useEffect, useState } from "react";
import { site } from "@content";
import styles from "@/app/contact/contact.module.css";

/** Şehir + canlı yerel saat (site.timezone). Hydration-güvenli:
 *  mount'tan önce '—' (sunucu/istemci saat farkı mismatch yapmasın). */
export default function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: site.timezone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.clock} aria-hidden="true">
      {site.city}
      <strong>{time ?? "—"}</strong>
    </div>
  );
}
