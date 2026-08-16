/**
 * True once real Supabase credentials are in `.env`.
 *
 * The project ships with placeholder values so `npm run dev` works before the
 * database exists. Pages check this and show setup instructions instead of
 * firing doomed requests at a host that isn't there.
 *
 * Both halves are checked deliberately: a real URL paired with a placeholder
 * key would otherwise look "configured" and fail with auth errors rather than
 * the setup notice.
 */
export function useSupabaseReady() {
  const config = useRuntimeConfig().public.supabase
  const url = config?.url ?? ''
  const key = config?.key ?? ''

  const isPlaceholder = (value: string) =>
    !value || value.toLowerCase().includes('placeholder')

  return !isPlaceholder(url) && !isPlaceholder(key)
}
