# nuxt-blog

A small blog with a WYSIWYG writing experience. Nuxt 4 on the front, Supabase
for storage, TipTap for the editor.

- Public reading at `/` and `/blog/<slug>`
- Author dashboard at `/admin` — write, edit, delete, publish
- Posts are drafts until you flip the Published toggle
- Cover images upload straight to Supabase Storage
- Images embed inside a post body three ways: the 🖼 toolbar button, pasting
  from the clipboard, or dragging a file onto the editor

### Images in a post body

All three routes upload to Supabase Storage and insert a URL — nothing is
stored as base64, so post rows stay small.

The toolbar button asks for alt text (skippable). Paste and drag don't ask,
because being prompted on every paste would be unbearable; those images get an
empty `alt`. Dragging drops the image where the pointer is rather than at the
old cursor position.

---

## Setup

You need a Supabase project. It's free and takes about five minutes.

### 1. Create the database

In your Supabase dashboard, open **SQL Editor → New query**, paste the entire
contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.

That creates the `posts` table, the Row Level Security policies, and the
`covers` storage bucket. It's safe to run more than once.

### 2. Add your credentials

Go to **Project Settings → API Keys** and copy the Project URL and the
`anon` `public` key into [`.env`](.env):

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key
```

The anon key is meant to be public — it ships to the browser. The Row Level
Security policies from step 1 are what actually protect your data, which is why
step 1 is not optional.

### 3. Create your author account

**Authentication → Users → Add user**. Give it your email and a password, and
tick "Auto Confirm User" so you can sign in immediately.

There is no public sign-up page — accounts are created by you, in the
dashboard. That's the whole access control story for authors.

### 4. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign in at `/login`, and write something.

---

## How it's put together

```
app/
  pages/
    index.vue           public post list
    blog/[slug].vue     public post view
    login.vue           email + password sign-in
    admin/index.vue     your posts, drafts included
    admin/new.vue       write a new post
    admin/[id].vue      edit an existing post
  components/
    PostCard.vue        one post in the public list
    PostEditor.vue      the whole writing form
    TiptapEditor.vue    the WYSIWYG surface + toolbar
    SetupNotice.vue     shown until .env has real credentials
  composables/
    usePostsRepo.ts     every database and storage call lives here
    useSupabaseReady.ts is the app configured yet?
  middleware/auth.ts    guards /admin
  types/database.types.ts
supabase/schema.sql     run this once in the Supabase SQL editor
```

Pages never touch the Supabase client directly — they go through
`usePostsRepo()`. Swapping the backend later means rewriting that one file.

`app/middleware/auth.ts` bounces signed-out visitors away from `/admin`, but
that's convenience only. The real enforcement is the RLS policies: even a
crafted request with the anon key cannot read a draft or write a row.

---

## Design

The visual system is Swiss Modernism 2.0: a 12-column grid, asymmetric
placement, hairline rules, tight display tracking, and Newsreader over Roboto.
It's documented in
[`design-system/nuxt-blog/MASTER.md`](design-system/nuxt-blog/MASTER.md),
including the three generated recommendations that were overridden and why.

Tokens live in `app/assets/css/main.css` under `@theme`. Everything else is
layered (`@layer base` / `@layer components`) so ordinary Tailwind utilities
still win when a component needs to override a default.

Two rules worth keeping if you change colours:

- `--color-accent` (`#be185d`, 5.78:1) is the only pink safe for text.
  `--color-accent-bright` (`#ec4899`) measures 3.38:1 and must stay decorative.
- Buttons are ink on white, not pink — white on `#ec4899` fails for label text.

Fonts are downloaded at build time by `@nuxt/fonts` and served from your own
origin, so no request reaches Google and there's no swap-in layout shift.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at localhost:3000 |
| `npm run build` | Production build into `.output/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | Type-check the whole project |

## Deploying

The build output is a standard Nitro server, so Vercel, Netlify, and Cloudflare
all work with no config. Set `SUPABASE_URL` and `SUPABASE_KEY` as environment
variables in your host's dashboard — `.env` is gitignored and won't be deployed.

## Notes

- Post bodies are stored as HTML from the editor and rendered with `v-html`.
  That's safe here because only authenticated authors can write posts. If you
  ever add public contributors, sanitize on the way in.
- Slugs are generated from the title but stay editable. If a slug collides with
  an existing post, a short random suffix is appended rather than failing the
  save.
