import { createSupabasePublicClient } from '@/lib/supabase/public';

// Transactional email. Sends via Resend when RESEND_API_KEY is set; otherwise
// logs (no-op) so the app works without email configured. Templates are
// admin-editable rows in EmailTemplate.

export function renderTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '');
}

export async function getEmailTemplate(
  key: string,
): Promise<{ subject: string; body: string } | null> {
  const sb = createSupabasePublicClient();
  const { data } = await sb
    .from('EmailTemplate')
    .select('subject,body')
    .eq('key', key)
    .maybeSingle();
  return (data as { subject: string; body: string } | null) ?? null;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'สิ่งศักดิ์สิทธิ์ <onboarding@resend.dev>';

  if (!apiKey) {
    console.info('[email] (skipped — no RESEND_API_KEY) ->', to, subject);
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch (err) {
    console.error('[email] send failed', err);
  }
}

/** Render a template by key and send it. Safe no-op on missing template/key. */
export async function sendTemplate(
  to: string,
  key: string,
  vars: Record<string, string>,
): Promise<void> {
  const tpl = await getEmailTemplate(key);
  if (!tpl) return;
  await sendEmail(to, renderTemplate(tpl.subject, vars), renderTemplate(tpl.body, vars));
}
