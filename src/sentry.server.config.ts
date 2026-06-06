import * as Sentry from '@sentry/nextjs';

// Activates only when a DSN is configured; otherwise a no-op so the app runs
// without Sentry.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
