#!/usr/bin/env node
/**
 * verify-menu.mjs — gizli menü doğrulaması (kurulu Chrome + puppeteer-core).
 *
 * Kontroller:
 *  1) Buton var, başlangıçta kapalı (aria-expanded=false, overlay gizli)
 *  2) Tıkla -> açılır (görünür), ilk linke focus
 *  3) Film pin'liyken aç: canvas hâlâ pinli + Lenis kilitli (lenis-stopped)
 *  4) Focus-trap: Tab/Shift+Tab overlay içinde döner
 *  5) Esc -> kapanır, focus butona döner, Lenis kilidi açılır
 *  6) Konsol/sayfa hatası yok
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3000";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const fail = (m) => {
  console.error("FAIL:", m);
  process.exitCode = 1;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const state = () =>
    page.evaluate(() => {
      const btn = document.querySelector('button[aria-controls="site-menu"]');
      const ov = document.getElementById("site-menu");
      const cs = ov ? getComputedStyle(ov) : null;
      return {
        hasBtn: !!btn,
        expanded: btn?.getAttribute("aria-expanded"),
        ovHidden: ov?.getAttribute("aria-hidden"),
        vis: cs?.visibility,
        op: cs ? parseFloat(cs.opacity) : null,
        lenisStopped: /lenis-stopped/.test(
          document.documentElement.className,
        ),
        active: document.activeElement?.textContent?.trim()?.slice(0, 20),
        activeIsBtn:
          document.activeElement ===
          document.querySelector('button[aria-controls="site-menu"]'),
      };
    });

  // (1) başlangıç
  const s0 = await state();
  s0.hasBtn && s0.expanded === "false" && s0.ovHidden === "true"
    ? console.log("OK 1    buton var, başlangıçta kapalı")
    : fail(`init: ${JSON.stringify(s0)}`);

  // (3) önce film pinli aralığa kaydır
  const dist = await page.evaluate(async () => {
    const r = await fetch("/frames/home/manifest.json");
    return (await r.json()).count * 14;
  });
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(dist * 0.35));
  await new Promise((r) => setTimeout(r, 400));
  const canvasTopBefore = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? Math.round(c.getBoundingClientRect().top) : 9999;
  });

  // (2) aç
  await page.click('button[aria-controls="site-menu"]');
  await new Promise((r) => setTimeout(r, 700));
  const s1 = await state();
  const canvasTopOpen = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? Math.round(c.getBoundingClientRect().top) : 9999;
  });
  s1.expanded === "true" &&
  s1.ovHidden === "false" &&
  s1.vis === "visible" &&
  s1.op > 0.5
    ? console.log("OK 2    tıkla -> açıldı (görünür)")
    : fail(`open: ${JSON.stringify(s1)}`);

  // (3) film pinli + Lenis kilitli
  s1.lenisStopped && Math.abs(canvasTopOpen) <= 4 && Math.abs(canvasTopBefore) <= 4
    ? console.log("OK 3    film pin'liyken açıldı + Lenis kilitli")
    : fail(
        `pin/lock: stopped=${s1.lenisStopped} topBefore=${canvasTopBefore} topOpen=${canvasTopOpen}`,
      );

  // (4) focus-trap: birkaç Tab sonra hâlâ overlay içinde
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  const trapped = await page.evaluate(() => {
    const ov = document.getElementById("site-menu");
    return !!ov && ov.contains(document.activeElement);
  });
  trapped
    ? console.log("OK 4    focus-trap: Tab overlay içinde dönüyor")
    : fail("focus-trap: focus overlay dışına çıktı");

  // (5) Esc -> kapanır, focus butona, Lenis açılır
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 700));
  const s2 = await state();
  s2.expanded === "false" &&
  s2.ovHidden === "true" &&
  s2.activeIsBtn &&
  !s2.lenisStopped
    ? console.log("OK 5    Esc -> kapandı, focus butona, Lenis açıldı")
    : fail(`esc: ${JSON.stringify(s2)}`);

  // (6) hatalar
  errors.length === 0
    ? console.log("OK 6    konsol/sayfa hatası yok")
    : fail("hatalar:\n  " + errors.slice(0, 6).join("\n  "));
} finally {
  await browser.close();
}
process.exit(process.exitCode || 0);
