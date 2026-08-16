/**
 * The signed-in author's user id, or null.
 *
 * `useSupabaseUser()` does NOT return a Supabase `User` here — the module
 * populates it from `auth.getClaims()`, so it is a decoded JWT payload where
 * the id lives in `sub`. There is no `.id` property.
 *
 * Reading `.id` returns undefined rather than failing to compile, because
 * `JwtPayload` carries an `[key: string]: any` index signature. That silently
 * sent a null `author_id` to Postgres, which the insert policy rejected as
 * "new row violates row-level security policy" — an RLS error for what was
 * really a missing column value.
 */
export function useAuthorId() {
  const user = useSupabaseUser()
  return computed(() => user.value?.sub ?? null)
}
