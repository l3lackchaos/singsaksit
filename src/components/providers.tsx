'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/modules/cart/cart-store';
import { ConsentProvider } from '@/modules/consent/consent-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>
          <CartProvider>{children}</CartProvider>
        </ConsentProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
