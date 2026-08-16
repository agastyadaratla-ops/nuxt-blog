import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-16',
  devtools: { enabled: true },

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

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
