'use client';

import * as React from 'react';

export interface CartLine {
  productId: string;
  slug: string;
  title: string;
  price: number; // satang
  qty: number;
  maxStock: number;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'singsaksit_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = React.useCallback((line: Omit<CartLine, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === line.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === line.productId
            ? { ...p, qty: Math.min(p.qty + qty, p.maxStock) }
            : p,
        );
      }
      return [...prev, { ...line, qty: Math.min(qty, line.maxStock) }];
    });
  }, []);

  const setQty = React.useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId
            ? { ...p, qty: Math.max(0, Math.min(qty, p.maxStock)) }
            : p,
        )
        .filter((p) => p.qty > 0),
    );
  }, []);

  const remove = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    hydrated,
    add,
    setQty,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
