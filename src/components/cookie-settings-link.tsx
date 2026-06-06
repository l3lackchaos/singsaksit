'use client';

import { useConsent } from '@/modules/consent/consent-context';

export function CookieSettingsLink() {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className="hover:text-primary">
      ตั้งค่าคุกกี้
    </button>
  );
}
