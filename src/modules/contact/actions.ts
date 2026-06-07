'use server';

import { z } from 'zod';
import { checkRateLimit, rateLimitId } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { stripTags } from '@/lib/sanitize';
import { loadSettings } from '@/modules/settings/load';
import { getSetting } from '@/lib/settings';

export interface ContactState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(100, 'ชื่อยาวเกินไป'),
  contact: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกอีเมลหรือเบอร์โทรเพื่อให้เราติดต่อกลับ')
    .max(120, 'ข้อมูลติดต่อยาวเกินไป'),
  message: z
    .string()
    .trim()
    .min(10, 'กรุณาพิมพ์ข้อความอย่างน้อย 10 ตัวอักษร')
    .max(2000, 'ข้อความยาวเกินไป (สูงสุด 2000 ตัวอักษร)'),
});

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    contact: formData.get('contact'),
    message: formData.get('message'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' };
  }

  // IP-based limit (no auth required to contact): 3 messages / 10 min.
  const ok = await checkRateLimit('contact', await rateLimitId(), {
    limit: 3,
    windowSec: 600,
  });
  if (!ok) {
    return { error: 'คุณส่งข้อความบ่อยเกินไป โปรดลองใหม่อีกครั้งในอีกสักครู่' };
  }

  await loadSettings();
  const to = getSetting('contact.email');
  const storeName = getSetting('store.name');

  // Strip any markup from user input before composing the notification email.
  const name = stripTags(parsed.data.name);
  const contact = stripTags(parsed.data.contact);
  const message = stripTags(parsed.data.message);

  const html = `
    <h2>ข้อความติดต่อใหม่ — ${esc(storeName)}</h2>
    <p><strong>ชื่อ:</strong> ${esc(name)}</p>
    <p><strong>ติดต่อกลับที่:</strong> ${esc(contact)}</p>
    <p><strong>ข้อความ:</strong></p>
    <p>${esc(message)}</p>
  `;

  if (to) {
    await sendEmail(to, `ข้อความติดต่อใหม่จาก ${name}`, html);
  } else {
    // No recipient configured yet — record it so nothing is silently lost.
    console.info('[contact] message received (no contact.email configured):', {
      name,
      contact,
    });
  }

  return { ok: true };
}
