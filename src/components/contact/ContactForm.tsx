"use client";

import { useState } from "react";
import SignalThread from "@/components/SignalThread";
import Magnetic from "@/components/fx/Magnetic";
import styles from "@/app/contact/contact.module.css";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const showEmail = name.trim() !== "";
  const showMsg = showEmail && email.trim() !== "";
  const showSend = showMsg && message.trim() !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!showSend || status === "sending") return;
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrMsg(
          data?.error === "Too many requests. Try again later."
            ? "Too many requests — try the direct links."
            : "Couldn't send — try email directly.",
        );
      }
    } catch {
      setStatus("error");
      setErrMsg("Couldn't send — try email directly.");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <p className={styles.result}>Message sent.</p>
        <SignalThread
          className={styles.sendThread}
          progress={1}
          state="draw"
          tone={0.1}
        />
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={`${styles.field} ${styles.fieldShown}`}>
        <label className={styles.q} htmlFor="cf-name">
          What&apos;s your name?
        </label>
        <input
          id="cf-name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          autoComplete="name"
          placeholder="Talha"
        />
      </div>

      <div
        className={`${styles.field} ${showEmail ? styles.fieldShown : ""}`}
      >
        <label className={styles.q} htmlFor="cf-email">
          How do I reach you?
        </label>
        <input
          id="cf-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          autoComplete="email"
          placeholder="you@email.com"
          tabIndex={showEmail ? 0 : -1}
        />
      </div>

      <div className={`${styles.field} ${showMsg ? styles.fieldShown : ""}`}>
        <label className={styles.q} htmlFor="cf-msg">
          What are we building?
        </label>
        <textarea
          id="cf-msg"
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={2}
          placeholder="A few lines…"
          tabIndex={showMsg ? 0 : -1}
        />
      </div>

      {/* honeypot — gerçek kullanıcı görmez/doldurmaz */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <Magnetic strength={0.3} max={12} className={styles.sendMag}>
        <button
          type="submit"
          className={`${styles.send} ${showSend ? styles.sendShown : ""}`}
          disabled={!showSend || status === "sending"}
          tabIndex={showSend ? 0 : -1}
        >
          {status === "sending" ? "Sending…" : "Send →"}
        </button>
      </Magnetic>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {errMsg}
        </p>
      )}
    </form>
  );
}
