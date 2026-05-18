/**
 * Kare bütçe kapısı (spec §10.2 / §7.1). Saf + deterministik —
 * frames.mjs gerçek pipeline'da çağırır; aşımda build durur.
 */

const kb = (n) => Math.round(n / 1000);

/**
 * @param {number[]} sizes  kare bayt boyutları
 * @param {{maxFrameBytes:number,maxTotalBytes:number,label?:string}} opts
 * @returns {{ok:boolean,total:number,max:number,count:number,reason?:string,suggestion?:string}}
 */
export function checkBudget(sizes, opts) {
  const { maxFrameBytes, maxTotalBytes, label = "desktop" } = opts;
  const total = sizes.reduce((a, b) => a + b, 0);
  const max = sizes.reduce((m, s) => Math.max(m, s), 0);
  const count = sizes.length;

  if (max > maxFrameBytes) {
    return {
      ok: false,
      total,
      max,
      count,
      reason: `${label}: bir kare ${kb(max)}KB > limit ${kb(
        maxFrameBytes,
      )}KB (frame too large)`,
      suggestion:
        "WebP kalitesini düşür (-q) veya çözünürlüğü küçült (--width).",
    };
  }
  if (total > maxTotalBytes) {
    return {
      ok: false,
      total,
      max,
      count,
      reason: `${label}: toplam ${kb(total)}KB > limit ${kb(
        maxTotalBytes,
      )}KB (total too large)`,
      suggestion: `Kare sayısını düşür (şu an ${count}; --count) ya da kaliteyi azalt.`,
    };
  }
  return { ok: true, total, max, count };
}
