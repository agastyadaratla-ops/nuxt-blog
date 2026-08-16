# Nuxt blog with WYSIWYG authoring — design

Date: 2026-08-16

## Goal

A personal blog where posts are written in a rich-text editor in the browser
rather than as Markdown files, and where drafts can be saved without publishing.

## Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Framework | Nuxt 4 | Requested. File-based routing, SSR, server routes if ever needed. |
| Authoring | TipTap WYSIWYG | The user wants to write in a visual editor, not Markdown. |
| Storage | Supabase (Postgres + Storage + Auth) | Writing must work from any device and survive redeploys, which rules out writing files to local disk. |
| Styling | Tailwind CSS v4 | No config file needed; tokens declared in CSS. |
| Images | Supabase Storage, `covers` bucket | Same account, no second service. |

Rejected: Nuxt Content with Markdown files (no WYSIWYG); a dev-only editor
writing to disk (can't publish from a phone or a deployed site).

## Architecture

```
Browser
  ├── public pages     /  and  /blog/[slug]        anon reads, published only
  └── admin pages      /admin, /admin/new, /admin/[id]   authenticated
            │
            ▼
      usePostsRepo()          the only module that talks to Supabase
            │
            ▼
        Supabase
          ├── posts table   (RLS enforced)
          ├── auth.users
          └── storage: covers bucket
```

### Data model

One table, `posts`:

`id` uuid pk · `slug` text unique · `title` text · `excerpt` text ·
`content` text (HTML) · `cover_url` text null · `published` bool default false ·
`author_id` uuid → auth.users · `created_at` · `updated_at`

`updated_at` is maintained by a trigger rather than by the client, so the
dashboard's "edited" timestamps can't drift.

### Security model

The anon key ships to the browser, so Row Level Security is the actual boundary:

- `SELECT` where `published = true` — open to everyone, signed in or not
- `SELECT` where `auth.uid() = author_id` — authors see their own drafts
- `INSERT` / `UPDATE` / `DELETE` — authenticated, own rows only

`app/middleware/auth.ts` redirects signed-out visitors away from `/admin`, but
it is a convenience layer. Bypassing it grants nothing.

No public sign-up. Author accounts are created by hand in the Supabase
dashboard, which is appropriate for a single-author blog.

### Component boundaries

- `usePostsRepo()` — every query and upload. Pages never import the Supabase
  client. Replacing the backend touches this file only.
- `TiptapEditor.vue` — owns the editing surface and toolbar, communicates
  purely through a `v-model` HTML string. Knows nothing about posts.
- `PostEditor.vue` — owns form state, emits a finished `PostInput`. Does not
  know whether that becomes an insert or an update.
- `admin/new.vue` and `admin/[id].vue` — decide insert vs update, own the
  saving/error state, and pass it down as props.

### Error handling

- Missing or placeholder credentials → `SetupNotice` with the three setup
  steps, instead of a crash or a hanging request.
- Failed save → inline message, editor content preserved.
- Slug collision (Postgres `23505`) → retry once with a random suffix rather
  than surfacing a database error.
- Unknown slug → 404 through `createError`.

## Out of scope for v1

Tags, dark mode toggle, comments, RSS, multi-author, image-in-body uploads.

## Verification

Type-check (`nuxt typecheck`) and production build both clean. Routes smoke
tested against the built server: `/` 200, `/login` 200, `/admin` 302 to login,
`/blog/<unknown>` 404. Live database behaviour is unverified until real
Supabase credentials are supplied.
