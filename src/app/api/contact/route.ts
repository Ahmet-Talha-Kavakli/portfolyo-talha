import { Resend } from "resend";
import { validateContact } from "@/lib/contact";
import { contactRateLimiter } from "@/lib/rateLimit";

// Resend Node SDK gerektirir → nodejs runtime (edge değil).
export const runtime = "nodejs";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  // Rate limit (best-effort, spec §10.9).
  const rl = contactRateLimiter(clientIp(request));
  if (!rl.allowed) {
    return Response.json(
      { ok: false, error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      },
    );
  }

  // Gövde JSON.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Doğrulama + sanitize + honeypot.
  const v = validateContact(body);
  if (!v.ok) {
    return Response.json({ ok: false, error: v.error }, { status: 400 });
  }

  // Konfig (anahtarlar .env.local / Vercel env — koda yazılmaz).
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  if (!apiKey || !to) {
    console.error("Contact: RESEND_API_KEY / CONTACT_TO_EMAIL eksik");
    return Response.json(
      { ok: false, error: "Mail is not configured." },
      { status: 500 },
    );
  }

  const { name, email, message } = v.data;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Portfolio <${from}>`,
      to: [to],
      replyTo: email,
      subject: `Portfolio — message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error("Resend error:", error);
      return Response.json(
        { ok: false, error: "Couldn't send." },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("Resend threw:", e);
    return Response.json(
      { ok: false, error: "Couldn't send." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
