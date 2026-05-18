import { z } from "zod";

export const MAX_NAME = 80;
export const MAX_MSG = 2000;

// Sürümden bağımsız basit e-posta kontrolü (zod .email() API'sine bağımlı
// kalmamak için kendi regex'imiz).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => EMAIL_RE.test(v), "invalid email"),
  message: z.string().trim().min(1).max(MAX_MSG),
  // Honeypot: gerçek kullanıcı doldurmaz; doluysa spam.
  company: z
    .string()
    .optional()
    .refine((v) => !v || v.trim() === "", "spam"),
});

export type ContactData = {
  name: string;
  email: string;
  message: string;
};

type Result =
  | { ok: true; data: ContactData }
  | { ok: false; error: string };

/** Güvenli doğrulama + sanitize. Bilinmeyen/yanlış tip girdi reddedilir. */
export function validateContact(raw: unknown): Result {
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "invalid input" };
  }
  const { name, email, message } = parsed.data;
  return {
    ok: true,
    data: {
      name,
      email: email.toLowerCase(),
      message,
    },
  };
}
