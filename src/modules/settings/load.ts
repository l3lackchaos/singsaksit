import { createSupabasePublicClient } from '@/lib/supabase/public';
import { applySettingOverrides } from '@/lib/settings';

/**
 * Load admin-managed settings from the DB and merge them over the defaults.
 * GlobalSetting has a public read policy, so the anon client can fetch them.
 * Call this in a server context before reading settings that an admin may have changed.
 */
export async function loadSettings(): Promise<void> {
  try {
    const sb = createSupabasePublicClient();
    const { data } = await sb.from('GlobalSetting').select('key,value');
    if (data) applySettingOverrides(data);
  } catch {
    // Fall back to safe defaults if settings can't be loaded.
  }
}
