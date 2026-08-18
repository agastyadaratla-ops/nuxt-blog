import tailwindcss from '@tailwindcss/vite'

/**
 * The GitHub Pages mirror.
 *
 * It exists for one reason: the school network blocks *.vercel.app, and
 * github.io is reachable. It is not the real site.
 *
 * Static hosting has no server, so this build renders entirely in the browser.
 * That sidesteps prerendering (which cannot reach Supabase without a request
 * context) and means posts are always current with no rebuild. The cost is a
 * blank moment on first load and no server-rendered HTML for crawlers, which
 * is why the mirror is marked noindex and points its canonical at the real
 * site. Only PAGES_MIRROR builds are affected; Vercel keeps full SSR.
 */
const isMirror = process.env.PAGES_MIRROR === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-16',
  devtools: { enabled: true },

  ssr: !isMirror,

  // @nuxt/fonts downloads Newsreader and Roboto at build time and serves them
  // from our own origin — no request to Google on page load, and no layout
  // shift while a webfont arrives.
  modules: ['@nuxtjs/supabase', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // The module's built-in redirect guard protects every route by default,
  // which would lock down the public blog too. We guard /admin ourselves
  // with app/middleware/auth.ts instead.
  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    public: {
      // Pin canonical and Open Graph URLs to one host. Leave unset and they
      // are derived from the incoming request, which is correct on localhost
      // and on a .vercel.app URL. Set it once a custom domain is live so the
      // two hosts cannot compete as duplicates.
      siteUrl: '',
      // Read by useSeo to mark the mirror noindex, so it cannot compete with
      // the real site in search results.
      isMirror,
    },
  },

  app: {
    // Project site, so the mirror lives under /<repo>/ rather than at the root.
    baseURL: isMirror ? '/nuxt-blog/' : '/',

    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Google Search Console ownership token. Public by design: it proves
        // control of the site, it does not grant access to anything. Google
        // rechecks it periodically, so it has to stay in place.
        {
          name: 'google-site-verification',
          content: 'JroVbiylgF_M18d1t1dT8bnHdzCnbYkEZS-M2pr2S5A',
        },
        // Baked into the mirror's static shell rather than left to useSeo,
        // which only runs once JavaScript has. A crawler that reads the raw
        // HTML must see noindex immediately.
        ...(isMirror
          ? [{ name: 'robots', content: 'noindex, nofollow' }]
          : []),
      ],
    },
  },
})
