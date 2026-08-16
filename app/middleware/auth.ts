/**
 * Guards the /admin pages. This is convenience, not security — the real
 * enforcement is the Row Level Security policies in supabase/schema.sql.
 * Someone who bypasses this middleware still cannot read or write anything.
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
