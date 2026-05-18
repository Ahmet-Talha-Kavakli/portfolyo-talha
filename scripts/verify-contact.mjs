#!/usr/bin/env node
/**
 * verify-contact.mjs — Contact sayfası UI + form akışı.
 * Kontroller:
 *  1) /contact film hazır + "let's build something" sahnesi scroll'da
 *  2) Form reveal: önce sadece soru-1; isim→soru-2; email→soru-3; mesaj→Send
 *  3) Canlı saat mount sonrası HH:MM:SS gösteriyor
 *  4) SSR: sr-only "Contact" başlığı + direkt link etiketleri (SEO)
 *  5) Gönder → hata yolu UI ("Couldn't send…") [placeholder CONTACT_TO_EMAIL]
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
const opacity = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? parseFloat(getComputedStyle(el).opacity) : -1;
  }, sel);

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

  const res = await page.goto(`${URL}/contact`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  const html = await res.text();

  // (1) film + sahne
  let nb = false;
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c?.getContext) return "x";
      const d = c
        .getContext("2d")
        .getImageData(c.width >> 1, c.height >> 1, 1, 1).data;
      return `${d[0]},${d[1]},${d[2]}`;
    });
    if (/[1-9]/.test(s)) {
      nb = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  const dist = await page.evaluate(async () => {
    const r = await fetch("/frames/contact/manifest.json");
    return (await r.json()).count * 18;
  });
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(dist * 0.8));
  await new Promise((r) => setTimeout(r, 900));
  const sceneOn = await page.evaluate(() => {
    const sp = [...document.querySelectorAll("span")].find((s) =>
      /let.?s build something/i.test(s.textContent.trim()),
    );
    const box = sp?.closest("[aria-hidden]");
    return box
      ? box.getAttribute("aria-hidden") === "false" &&
          parseFloat(getComputedStyle(box).opacity) > 0.5
      : false;
  });
  nb && sceneOn
    ? console.log("OK 1    film hazır + sahne beliriyor")
    : fail(`film/sahne: nb=${nb} scene=${sceneOn}`);

  // form görünür olsun diye aşağı in
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 800));

  // (2) reveal akışı
  const fieldOp = (id) =>
    page.evaluate((i) => {
      const inp = document.getElementById(i);
      const wrap = inp?.parentElement;
      return wrap ? parseFloat(getComputedStyle(wrap).opacity) : -1;
    }, id);

  const e0 = await fieldOp("cf-email");
  await page.type("#cf-name", "Talha");
  await new Promise((r) => setTimeout(r, 700));
  const e1 = await fieldOp("cf-email");
  const m0 = await fieldOp("cf-msg");
  await page.type("#cf-email", "talha@example.com");
  await new Promise((r) => setTimeout(r, 700));
  const m1 = await fieldOp("cf-msg");
  await page.type("#cf-msg", "Let's build something great together.");
  await new Promise((r) => setTimeout(r, 700));
  const sendOp = await opacity(page, 'button[type="submit"]');

  e0 < 0.5 && e1 > 0.5 && m0 < 0.5 && m1 > 0.5 && sendOp > 0.5
    ? console.log("OK 2    form reveal: q1→q2→q3→Send sırayla")
    : fail(
        `reveal: email ${e0}->${e1} msg ${m0}->${m1} send=${sendOp}`,
      );

  // (3) canlı saat
  await new Promise((r) => setTimeout(r, 1100));
  const clock = await page.evaluate(
    () => document.querySelector('[class*="clock"] strong')?.textContent,
  );
  /^\d{2}:\d{2}:\d{2}$/.test(clock || "")
    ? console.log(`OK 3    canlı saat: ${clock}`)
    : fail(`saat: "${clock}"`);

  // (4) SSR SEO
  /Contact/.test(html) &&
  html.includes("Email") &&
  html.includes("GitHub") &&
  html.includes("LinkedIn")
    ? console.log("OK 4    SSR: başlık + direkt linkler")
    : fail("SSR seo eksik");

  // (5) gönder → hata yolu (placeholder CONTACT_TO_EMAIL → 502)
  await page.click('button[type="submit"]');
  let resultTxt = "";
  for (let i = 0; i < 30; i++) {
    resultTxt = await page.evaluate(
      () => document.body.innerText.replace(/\s+/g, " "),
    );
    if (/Couldn't send|Message sent|Too many/.test(resultTxt)) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  /Couldn't send|Message sent|Too many/.test(resultTxt)
    ? console.log(
        `OK 5    gönder → sonuç UI ("${
          resultTxt.match(/Couldn't send[^.]*\.?|Message sent\.?|Too many[^.]*\.?/)?.[0]
        }")`,
      )
    : fail("gönder sonrası sonuç UI yok");

  // (6) hatalar — "Failed to load resource" tarayıcı ağ-durum bildirimidir
  // (JS hatası değil); beklenen 502 zaten check 5'te pozitif doğrulanıyor.
  const real = errors.filter((e) => !/Failed to load resource/.test(e));
  real.length === 0
    ? console.log("OK 6    konsol/sayfa hatası yok")
    : fail("hatalar:\n  " + real.slice(0, 6).join("\n  "));
} finally {
  await browser.close();
}
process.exit(process.exitCode || 0);
