import { createSupabaseServerClient } from '@/lib/supabase/server';

// Write an audit entry for an admin action. AuditLog has an admin-only insert
// policy; the RPC-based order actions log themselves inside the DB function.
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    const sb = await createSupabaseServerClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    await sb.from('AuditLog').insert({
      id: crypto.randomUUID(),
      actorId: user?.id ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      meta: meta ?? null,
    });
  } catch {
    // Never let audit logging break the action.
  }
}
