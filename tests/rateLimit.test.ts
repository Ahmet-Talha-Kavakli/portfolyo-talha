import { describe, it, expect } from "vitest";
import { createRateLimiter } from "@/lib/rateLimit";

describe("createRateLimiter (token-bucket)", () => {
  it("pencere içinde limit kadar isteğe izin verir, sonrasını reddeder", () => {
    let t = 1_000_000;
    const rl = createRateLimiter({ limit: 5, windowMs: 600_000, now: () => t });
    for (let i = 0; i < 5; i++) {
      expect(rl("ip-1").allowed).toBe(true);
    }
    const sixth = rl("ip-1");
    expect(sixth.allowed).toBe(false);
    expect(sixth.retryAfterMs).toBeGreaterThan(0);
  });

  it("pencere geçince sıfırlanır", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(rl("a").allowed).toBe(true);
    expect(rl("a").allowed).toBe(true);
    expect(rl("a").allowed).toBe(false);
    t += 1001;
    expect(rl("a").allowed).toBe(true);
  });

  it("anahtarlar bağımsızdır", () => {
    let t = 5;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(rl("x").allowed).toBe(true);
    expect(rl("x").allowed).toBe(false);
    expect(rl("y").allowed).toBe(true);
  });
});
