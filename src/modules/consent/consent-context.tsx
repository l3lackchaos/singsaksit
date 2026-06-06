'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { recordConsentAction } from './actions';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
}

interface ConsentContextValue extends ConsentState {
  accept: () => void;
  reject: () => void;
  openSettings: () => void;
}

const STORAGE_KEY = 'singsaksit_consent_v1';
const POLICY_VERSION = '1.0';

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConsentState>({
    analytics: false,
    marketing: false,
    decided: false,
  });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentState;
        setState({ ...parsed, decided: true });
      } else {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const persist = React.useCallback((next: ConsentState) => {
    setState(next);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    void recordConsentAction({
      analytics: next.analytics,
      marketing: next.marketing,
      version: POLICY_VERSION,
    });
  }, []);

  const value: ConsentContextValue = {
    ...state,
    accept: () => persist({ analytics: true, marketing: true, decided: true }),
    reject: () => persist({ analytics: false, marketing: false, decided: true }),
    openSettings: () => setOpen(true),
  };

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {open && (
        <div
          role="dialog"
          aria-label="การตั้งค่าคุกกี้"
          className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur"
        >
          <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              เราใช้คุกกี้ที่จำเป็นเพื่อให้เว็บทำงาน และคุกกี้วิเคราะห์/การตลาด
              (โหลดเมื่อคุณยินยอมเท่านั้น) ตาม PDPA
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={value.reject}>
                ปฏิเสธ
              </Button>
              <Button size="sm" onClick={value.accept}>
                ยอมรับทั้งหมด
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = React.useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
