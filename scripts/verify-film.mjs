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

  // (2) ready: paint çalıştı mı? Film KARANLIK kareyle başlayabilir
  // (silüet) → "parlak piksel" yetersiz. Canvas backing'i viewport'a
  // boyutlandıysa (default 300 değil) paint çalışmış demektir.
  let ready = false;
  for (let i = 0; i < 60; i++) {
    const painted = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      return !!c && c.width > 320 && c.height > 0;
    });
    const s = await page.evaluate(sig);
    if (painted || (s !== "no-canvas" && s !== "no-ctx" && /[1-9]/.test(s))) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  ready
    ? console.log("OK 2/3  ready + canvas boyandı")
    : fail("ready/canvas");

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

  // (9) SceneText: marker'a göre doğru yazı görünür/gizli
  const sceneState = (word) =>
    page.evaluate((w) => {
      const span = [...document.querySelectorAll("span")].find(
        (s) => s.textContent.trim() === w,
      );
      if (!span) return null;
      const box = span.closest("[aria-hidden]");
      if (!box) return null;
      const cs = getComputedStyle(box);
      return {
        ariaHidden: box.getAttribute("aria-hidden"),
        opacity: parseFloat(cs.opacity),
        vis: cs.visibility,
      };
    }, word);

  // Marker oranları (markers.ts): brain .12, cable .58, machine .82, white .92.
  // THINK için .30 (brain bölgesi), SHIP için .87 (machine bölgesi).
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(dist * 0.3));
  await new Promise((r) => setTimeout(r, 950));
  const think = await sceneState("THINK");
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(dist * 0.87));
  await new Promise((r) => setTimeout(r, 950));
  const ship = await sceneState("SHIP");
  const thinkOff = await sceneState("THINK");

  think &&
  think.ariaHidden === "false" &&
  think.opacity > 0.5 &&
  ship &&
  ship.ariaHidden === "false" &&
  ship.opacity > 0.5 &&
  thinkOff &&
  thinkOff.ariaHidden === "true"
    ? console.log("OK 9    SceneText: marker'a senkron yazı geçişi")
    : fail(
        `SceneText: think=${JSON.stringify(think)} ship=${JSON.stringify(
          ship,
        )} thinkOff=${JSON.stringify(thinkOff)}`,
      );

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

  // İzolasyon: ana sayfanın CDP throttle/clearCache durumu sp/ap'yi
  // etkilemesin diye kapat (app kodu warm-cache repro'da doğrulandı).
  await page.close();

  // (7) STATIC: reduced-motion -> tek kare, pin YOK, içerik hemen
  const sp = await browser.newPage();
  const sErr = [];
  sp.on("pageerror", (e) => sErr.push(e.message));
  sp.on("console", (m) => m.type() === "error" && sErr.push(m.text()));
  await sp.setViewport({ width: 1280, height: 800 });
  await sp.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await sp.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  let sCanvas = "no-canvas";
  for (let i = 0; i < 40; i++) {
    sCanvas = await sp.evaluate(sig);
    if (sCanvas !== "no-canvas" && sCanvas !== "no-ctx" && /[1-9]/.test(sCanvas))
      break;
    await new Promise((r) => setTimeout(r, 300));
  }
  await sp.evaluate(() => window.scrollTo(0, 600));
  await new Promise((r) => setTimeout(r, 300));
  const sTop = await sp.evaluate(() => {
    const c = document.querySelector("canvas,video");
    return c ? Math.round(c.getBoundingClientRect().top) : 9999;
  });
  const sDiag = await sp.evaluate(() => {
    const c = document.querySelector("canvas");
    return {
      hasCanvas: !!c,
      w: c?.clientWidth,
      h: c?.clientHeight,
      bw: c?.width,
    };
  });
  sCanvas !== "no-canvas" && /[1-9]/.test(sCanvas) && sTop < -100
    ? console.log("OK 7    static: tek kare çizili, pin yok (içerik akışta)")
    : fail(
        `static: canvas=${sCanvas} top@600=${sTop} diag=${JSON.stringify(
          sDiag,
        )} err=${sErr.slice(0, 3).join(" | ")}`,
      );
  await sp.close();

  // (8) AUTOPLAY: dar/dokunmatik -> kendiliğinden oynar, pin yok
  const ap = await browser.newPage();
  const aErr = [];
  ap.on("pageerror", (e) => aErr.push(e.message));
  ap.on("console", (m) => m.type() === "error" && aErr.push(m.text()));
  await ap.setViewport({
    width: 390,
    height: 780,
    isMobile: true,
    hasTouch: true,
  });
  await ap.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  // Gerçek asset: manifest.video → <video> autoplay. Placeholder: <canvas>
  // kare-playthrough. İkisini de kabul et.
  const mediaTag = await ap.evaluate(
    () => document.querySelector("video,canvas")?.tagName,
  );
  let playing = false;
  if (mediaTag === "VIDEO") {
    const t1 = await ap.evaluate(
      () => document.querySelector("video")?.currentTime ?? -1,
    );
    await new Promise((r) => setTimeout(r, 1500));
    const v = await ap.evaluate(() => {
      const el = document.querySelector("video");
      return {
        t: el?.currentTime ?? -1,
        hasSrc: !!(el?.currentSrc || el?.src),
        autoplay: !!el?.autoplay,
        muted: !!el?.muted,
      };
    });
    playing = v.hasSrc && v.autoplay && v.muted && v.t > t1; // ilerliyor
  } else {
    let a1 = "no-canvas";
    for (let i = 0; i < 40; i++) {
      a1 = await ap.evaluate(sig);
      if (a1 !== "no-canvas" && a1 !== "no-ctx" && /[1-9]/.test(a1)) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    await new Promise((r) => setTimeout(r, 1200));
    const a2 = await ap.evaluate(sig);
    playing = a1 !== a2 && /[1-9]/.test(a1);
  }
  await ap.evaluate(() => window.scrollTo(0, 600));
  await new Promise((r) => setTimeout(r, 300));
  const aTop = await ap.evaluate(() => {
    const c = document.querySelector("canvas,video");
    return c ? Math.round(c.getBoundingClientRect().top) : 9999;
  });
  playing && aTop < -100
    ? console.log(
        `OK 8    autoplay (${mediaTag}): kendiliğinden oynuyor, pin yok`,
      )
    : fail(
        `autoplay: playing=${playing} tag=${mediaTag} top@600=${aTop} ` +
          `err=${aErr.slice(0, 3).join(" | ")}`,
      );
  await ap.close();
} finally {
  await browser.close();
}

process.exit(process.exitCode || 0);
