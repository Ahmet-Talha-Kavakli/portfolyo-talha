import { describe, it, expect } from "vitest";
import { validateContact, MAX_NAME, MAX_MSG } from "@/lib/contact";

const ok = {
  name: "Talha",
  email: "talha@example.com",
  message: "Let's build something.",
  company: "", // honeypot — boş olmalı
};

describe("validateContact", () => {
  it("geçerli girdiyi kabul eder ve sanitize edip döner", () => {
    const r = validateContact({ ...ok, name: "  Talha  " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Talha"); // trim
      expect(r.data.email).toBe("talha@example.com");
      expect(r.data.message).toBe("Let's build something.");
    }
  });

  it("boş isim/mesaj reddedilir", () => {
    expect(validateContact({ ...ok, name: "" }).ok).toBe(false);
    expect(validateContact({ ...ok, message: "  " }).ok).toBe(false);
  });

  it("geçersiz e-posta reddedilir", () => {
    expect(validateContact({ ...ok, email: "not-an-email" }).ok).toBe(false);
  });

  it("isim > MAX_NAME reddedilir", () => {
    expect(validateContact({ ...ok, name: "x".repeat(MAX_NAME + 1) }).ok).toBe(
      false,
    );
  });

  it("mesaj > MAX_MSG reddedilir", () => {
    expect(
      validateContact({ ...ok, message: "x".repeat(MAX_MSG + 1) }).ok,
    ).toBe(false);
  });

  it("honeypot doluysa spam → reddedilir", () => {
    expect(validateContact({ ...ok, company: "bot" }).ok).toBe(false);
  });

  it("eksik/yanlış tip girdi güvenli şekilde reddedilir", () => {
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact({}).ok).toBe(false);
    expect(validateContact("nope").ok).toBe(false);
  });
});
