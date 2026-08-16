-- ============================================================================
-- TEMPORARY diagnostic helper.
--
-- Reports who Postgres thinks the caller is. The app's insert policy is
--   with check (auth.uid() = author_id)
-- so if auth.uid() is null, or the role is 'anon' rather than 'authenticated',
-- the insert is rejected no matter what the policy says.
--
-- Run this in the Supabase SQL Editor, use the diagnostic button on /admin,
-- then run the DROP at the bottom of this file to remove it again.
-- ============================================================================

create or replace function public.whoami()
returns json
language sql
stable
as $$
  select json_build_object(
    'uid',  auth.uid(),
    'role', auth.role(),
    'jwt',  nullif(current_setting('request.jwt.claims', true), '')::json
  );
$$;

grant execute on function public.whoami() to anon, authenticated;


-- ---------------------------------------------------------------------------
-- Clean-up — run this once the diagnosis is done:
--
--   drop function if exists public.whoami();
-- ---------------------------------------------------------------------------
