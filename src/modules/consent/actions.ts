'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

// Record a consent decision in ConsentLog (PDPA audit trail). Insert is allowed
// for anyone by RLS; we attach the user id when signed in.
export async function recordConsentAction(input: {
  analytics: boolean;
  marketing: boolean;
  version: string;
}): Promise<void> {
  try {
    const sb = await createSupabaseServerClient();
    const {
      data: { user },
    } = await sb.auth.getUser();

    const rows = [
      { type: 'COOKIE' as const, granted: true },
      { type: 'MARKETING' as const, granted: input.marketing },
    ].map((r) => ({
      id: crypto.randomUUID(),
      userId: user?.id ?? null,
      type: r.type,
      granted: r.granted,
      version: input.version,
    }));

    await sb.from('ConsentLog').insert(rows);
  } catch {
    // Consent UX should never break on a logging failure.
  }
}
