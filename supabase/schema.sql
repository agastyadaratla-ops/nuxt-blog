-- ============================================================================
-- nuxt-blog database schema
--
-- Run this whole file once in your Supabase dashboard:
--   SQL Editor -> New query -> paste -> Run
--
-- It is safe to re-run: every statement is idempotent.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. The posts table
-- ----------------------------------------------------------------------------

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  excerpt    text not null default '',
  content    text not null default '',   -- HTML produced by the TipTap editor
  cover_url  text,
  published  boolean not null default false,
  author_id  uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The public blog list queries published posts newest-first; this index serves it.
create index if not exists posts_published_created_at_idx
  on public.posts (published, created_at desc);


-- ----------------------------------------------------------------------------
-- 2. Keep updated_at honest
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 3. Row Level Security
--
-- This is what makes it safe to ship the anon key to the browser. Without
-- these policies enabled, the anon key would be a wide-open door.
-- ----------------------------------------------------------------------------

alter table public.posts enable row level security;

-- Anyone, logged in or not, can read PUBLISHED posts. Drafts stay invisible.
drop policy if exists "Published posts are readable by everyone" on public.posts;
create policy "Published posts are readable by everyone"
  on public.posts for select
  using (published = true);

-- Signed-in authors can additionally read their own drafts (for /admin).
drop policy if exists "Authors can read their own posts" on public.posts;
create policy "Authors can read their own posts"
  on public.posts for select
  to authenticated
  using (auth.uid() = author_id);

drop policy if exists "Authors can create posts" on public.posts;
create policy "Authors can create posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Authors can update their own posts" on public.posts;
create policy "Authors can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Authors can delete their own posts" on public.posts;
create policy "Authors can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);


-- ----------------------------------------------------------------------------
-- 4. Storage bucket for cover images
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "Cover images are publicly readable" on storage.objects;
create policy "Cover images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "Authors can upload covers" on storage.objects;
create policy "Authors can upload covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "Authors can update covers" on storage.objects;
create policy "Authors can update covers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers')
  with check (bucket_id = 'covers');

drop policy if exists "Authors can delete covers" on storage.objects;
create policy "Authors can delete covers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'covers');
