import { Redis } from '@upstash/redis';

// Upstash Redis client, only when configured. Used for rate limiting and the
// short-link resolve cache. The app works without it (graceful fallbacks).
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;
