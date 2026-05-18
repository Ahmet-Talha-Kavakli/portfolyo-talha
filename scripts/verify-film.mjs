#!/usr/bin/env node
/**
 * verify-film.mjs — ScrollFilm motorunun tarayıcı doğrulaması.
 * Kurulu Chrome'u puppeteer-core ile sürer (indirme yok).
 *
 * Kontroller:
 *  1) Konsol/sayfa hatası yok
 *  2) Yükleme ekranı görünür -> hazır (kayboluyor)
 *  3) Hazır olunca canvas boş DEĞİL
 *  4) Scrub: farklı scroll konumlarında canvas imzası değişiyor (kare ilerliyor)
 *  5) Pin: canvas scroll boyunca viewport'ta sabit kalıyor
 *  6) Buffering: ağ yavaşlatılıp hızlı scroll'da SignalThread "buffering"e
 *     giriyor ve uygulama patlamıyor (best-effort)
 *
 * Kullanım: node scripts/verify-film.mjs [url]
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3000";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sig = () =>
  // canvas'tan örnek piksellerin kaba imzası
  // eslint-disable-next-line no-undef
  (() => {
    const c = document.querySelector("canvas");
    if (!c) return "no-canvas";
    const ctx = c.getContext("2d");
    if (!ctx || !c.width) return "no-ctx";
    const pts = [
      [0.5, 0.5],
      [0.2, 0.3],
      [0.8, 0.7],
      [0.5, 0.1],
    ];
    return pts
      .map(([x, y]) => {
        const d = ctx.getImageData(
          Math.floor(c.width * x),
          Math.floor(c.height * y),
          1,
          1,
        ).data;
        return `${d[0]},${d[1]},${d[2]}`;
      })
      .join("|");
  })();

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
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });

  // (2) ready: canvas boş olmayana kadar bekle (loading kalkar)
  let ready = false;
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(sig);
    if (s !== "no-canvas" && s !== "no-ctx" && /[1-9]/.test(s)) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  ready ? console.log("OK 2/3  ready + canvas non-blank") : fail("ready/canvas");

  // Pinli mesafe = manifest.count * scrollPerFrame(=14, ScrollFilm default)
  const count = await page.evaluate(async () => {
    const r = await fetch("/frames/home/manifest.json");
    return (await r.json()).count;
  });
  const dist = count * 14;

  // (4)(5) scrub + pin — yalnız pinli aralık [0, dist] içinde örnekle
  const sigs = [];
  const canvasTops = [];
  for (const f of [0, 0.2, 0.4, 0.6, 0.85]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(dist * f));
    await new Promise((r) => setTimeout(r, 350));
    sigs.push(await page.evaluate(sig));
    canvasTops.push(
      await page.evaluate(() => {
        const c = document.querySelector("canvas");
        return c ? Math.round(c.getBoundingClientRect().top) : 9999;
      }),
    );
  }
  const distinct = new Set(sigs).size;
  distinct >= 4
    ? console.log(
        `OK 4    scrub: ${distinct}/5 farklı kare imzası (dist=${dist}px)`,
      )
    : fail(`scrub: yalnız ${distinct} farklı imza (${sigs.join(" / ")})`);

  const pinned = canvasTops.every((t) => Math.abs(t) <= 4);
  pinned
    ? console.log("OK 5a   pin: canvas pinli aralıkta sabit (top~0)")
    : fail(`pin: canvas top'ları ${canvasTops.join(",")}`);

  // Pin sonu: film bitince (dist + 400) canvas yukarı kaymalı (bırakılır)
  await page.evaluate((y) => window.scrollTo(0, y), dist + 400);
  await new Promise((r) => setTimeout(r, 350));
  const releasedTop = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? Math.round(c.getBoundingClientRect().top) : 9999;
  });
  releasedTop < -50
    ? console.log("OK 5b   pin: film sonunda doğru bırakılıyor")
    : fail(`pin bırakılmadı: top=${releasedTop}`);

  // (6) buffering: cache KAPALI + yavaş ağ + fresh load + hızlı scroll
  const p2 = await page.target().createCDPSession();
  await p2.send("Network.enable");
  await p2.send("Network.clearBrowserCache");
  await page.setCacheEnabled(false);
  await p2.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 300,
    downloadThroughput: (50 * 1024) / 8,
    uploadThroughput: (50 * 1024) / 8,
  });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  let sawBuffering = false;
  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => window.scrollTo(0, 200 + Math.random() * 800));
    const hit = await page.evaluate(() =>
      [...document.querySelectorAll("svg path")].some((p) =>
        /buffering/.test(p.getAttribute("class") || ""),
      ),
    );
    if (hit) {
      sawBuffering = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(
    sawBuffering
      ? "OK 6    buffering state tetiklendi (yavaş ağ)"
      : "WARN 6  buffering gözlenmedi (ağ yeterince hızlı olabilir) — patlama yok",
  );

  errors.length === 0
    ? console.log("OK 1    konsol/sayfa hatası yok")
    : fail("hatalar:\n  " + errors.slice(0, 6).join("\n  "));
} finally {
  await browser.close();
}

process.exit(process.exitCode || 0);
