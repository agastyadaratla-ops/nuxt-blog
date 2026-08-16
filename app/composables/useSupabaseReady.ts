/**
 * True once real Supabase credentials are in `.env`.
 *
 * The project ships with placeholder values so `npm run dev` works before the
 * database exists. Pages check this and show setup instructions instead of
 * firing doomed requests at a host that isn't there.
 */
export function useSupabaseReady() {
  const url = useRuntimeConfig().public.supabase?.url ?? ''
  return Boolean(url) && !url.includes('placeholder')
}
