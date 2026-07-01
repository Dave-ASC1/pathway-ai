import { NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };

// In-memory store. Persists per warm serverless instance. This is intentionally
// simple: it stops casual abuse without any external service. For distributed,
// production-grade limits, swap this for a Redis-backed limiter (e.g. Upstash).
const store = new Map<string, Entry>();

function prune(now: number) {
  if (store.size < 5000) return;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

type RateLimitOptions = {
  name: string;
  limit: number;
  windowMs: number;
};

/**
 * Returns a 429 NextResponse if the caller has exceeded the limit for this
 * route, otherwise null (meaning: proceed).
 */
export function checkRateLimit(req: Request, options: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  prune(now);

  const key = `${options.name}:${getClientIp(req)}`;
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (entry.count >= options.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: `Too many requests. Please wait ${retryAfter} seconds and try again.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  entry.count += 1;
  return null;
}
