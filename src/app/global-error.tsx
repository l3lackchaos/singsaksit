'use client';

import * as React from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error));
    }
  }, [error]);

  return (
    <html lang="th">
      <body
        style={{
          fontFamily: 'sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1>เกิดข้อผิดพลาด</h1>
          <p>ขออภัย ระบบมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </body>
    </html>
  );
}
