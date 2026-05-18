#!/usr/bin/env node
/**
 * verify-about.mjs — About sayfası.
 * Kontroller:
 *  1) /about film hazır (canvas non-blank)
 *  2) SSR: bio paragrafları + yetenek etiketleri + stack metni var
 *  3) Yetenek hattı scroll'la doluyor (fill genişliği artar — scrub)
 *  4) Konsol/sayfa hatası yok
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

  const res = await page.goto(`${URL}/about`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  const html = await res.text();

  // (1) film hazır
  let nonBlank = false;
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
      nonBlank = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  nonBlank
    ? console.log("OK 1    /about film hazır")
    : fail("about film blank");

  // (2) SSR içerik
  const hasBio =
    /product engineer/i.test(html) && /end to end/i.test(html);
  const hasSkills = ["Software", "Backend", "Frontend", "3D", "AI"].every(
    (s) => html.includes(s),
  );
  const hasStack = /TypeScript/.test(html) && /Three\.js/.test(html);
  hasBio && hasSkills && hasStack
    ? console.log("OK 2    SSR: bio + yetenekler + stack var")
    : fail(`SSR eksik: bio=${hasBio} skills=${hasSkills} stack=${hasStack}`);

  // (3) yetenek hattı scroll'la dolar
  const ratio = () =>
    page.evaluate(() => {
      const fills = [...document.querySelectorAll("span")].filter((s) =>
        /__fill\b/.test(s.className || ""),
      );
      if (!fills.length) return -1;
      // ortalama dolum oranı (fill genişliği / track genişliği)
      let sum = 0;
      for (const f of fills) {
        const track = f.parentElement;
        const tw = track.getBoundingClientRect().width || 1;
        sum += f.getBoundingClientRect().width / tw;
      }
      return sum / fills.length;
    });

  // Düzene dayanmadan: skills bölümünü viewport altına getirip küçük
  // adımlarla tarayarak fill oranının ARTTIĞINI doğrula (film uzunluğu /
  // sayfa düzeni değişse de sağlam).
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));
  const skillsAbs = await page.evaluate(() => {
    const lbl = [...document.querySelectorAll("span")].find(
      (s) => s.textContent.trim() === "Software",
    );
    return lbl ? window.scrollY + lbl.getBoundingClientRect().top : 0;
  });
  const samples = [];
  // skills label viewport'un ~95% altından ~10%'una gelene dek tara
  for (let off = -0.95; off <= -0.1; off += 0.12) {
    const y = Math.max(0, Math.round(skillsAbs + off * 800));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 350));
    samples.push(await ratio());
  }
  const lo = Math.min(...samples);
  const hi = Math.max(...samples);
  const firstIdx = samples.findIndex((v) => v >= 0);
  lo >= 0 &&
  hi - lo > 0.15 &&
  samples[samples.length - 1] >= samples[firstIdx]
    ? console.log(
        `OK 3    yetenek hattı doluyor (${lo.toFixed(2)} → ${hi.toFixed(2)})`,
      )
    : fail(`skill fill artmadı: ${samples.map((v) => v.toFixed(2)).join(",")}`);

  const real = errors.filter((e) => !/Failed to load resource.*404/.test(e));
  real.length === 0
    ? console.log("OK 4    konsol/sayfa hatası yok")
    : fail("hatalar:\n  " + real.slice(0, 6).join("\n  "));
} finally {
  await browser.close();
}
process.exit(process.exitCode || 0);
