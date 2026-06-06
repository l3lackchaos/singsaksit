import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Rate limiting. Uses Upstash sliding-window when Redis is configured; otherwise
// falls back to a per-instance in-memory limiter (good enough for dev / single
// instance, degrades safely on serverless).

const limiters = new Map<string, Ratelimit>();
const memory = new Map<string, { count: number; reset: number }>();

function upstashLimiter(name: string, limit: number, windowSec: number): Ratelimit | null {
  if (!redis) return null;
  const key = `${name}:${limit}:${windowSec}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(key, l);
  }
  return l;
}

export async function checkRateLimit(
  name: string,
  identifier: string,
  opts: { limit: number; windowSec: number },
): Promise<boolean> {
  const l = upstashLimiter(name, opts.limit, opts.windowSec);
  if (l) {
    const { success } = await l.limit(identifier);
    return success;
  }
  const id = `${name}:${identifier}`;
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const e = memory.get(id);
  if (!e || e.reset < now) {
    memory.set(id, { count: 1, reset: now + windowMs });
    return true;
  }
  if (e.count >= opts.limit) return false;
  e.count += 1;
  return true;
}

/** Identify the caller for rate limiting: user id when known, else client IP. */
export async function rateLimitId(userId?: string | null): Promise<string> {
  if (userId) return `u:${userId}`;
  try {
    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'anon';
    return `ip:${ip}`;
  } catch {
    return 'anon';
  }
}
