import { describe, it, expect } from "vitest";
import { checkBudget } from "../scripts/lib/frameBudget.mjs";

const OPTS = { maxFrameBytes: 120_000, maxTotalBytes: 6_000_000 };

describe("checkBudget", () => {
  it("bütçe içinde → ok, total/max doğru", () => {
    const r = checkBudget([100_000, 90_000, 110_000], OPTS);
    expect(r.ok).toBe(true);
    expect(r.total).toBe(300_000);
    expect(r.max).toBe(110_000);
  });

  it("tek kare maxFrameBytes'i aşarsa → ok=false + öneri", () => {
    const r = checkBudget([100_000, 130_000], OPTS);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/kare|frame/i);
    expect(r.suggestion).toBeTruthy();
  });

  it("toplam maxTotalBytes'i aşarsa → ok=false (total sebebi)", () => {
    const big = new Array(70).fill(100_000); // 7MB > 6MB
    const r = checkBudget(big, OPTS);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/toplam|total/i);
  });

  it("boş liste → ok, total 0", () => {
    const r = checkBudget([], OPTS);
    expect(r.ok).toBe(true);
    expect(r.total).toBe(0);
    expect(r.max).toBe(0);
  });
});
