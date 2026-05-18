/**
 * Basit in-memory sabit-pencere rate limiter.
 *
 * NOT (spec §10.9): Vercel'de serverless instance/cold-start başına
 * sıfırlanır → best-effort spam yavaşlatma, kesin garanti değil. Kalıcı
 * garanti gerekirse Vercel KV'ye geçilir.
 */
export type RateResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type Opts = {
  limit: number;
  windowMs: number;
  /** Test için enjekte edilebilir saat. */
  now?: () => number;
};

export function createRateLimiter(opts: Opts) {
  const { limit, windowMs } = opts;
  const now = opts.now ?? (() => Date.now());
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string): RateResult {
    const t = now();
    const rec = hits.get(key);

    if (!rec || t >= rec.resetAt) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (rec.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: rec.resetAt - t,
      };
    }

    rec.count += 1;
    return {
      allowed: true,
      remaining: limit - rec.count,
      retryAfterMs: 0,
    };
  };
}

/** Contact route için paylaşılan örnek: 5 istek / 10 dakika. */
export const contactRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
});
