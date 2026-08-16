export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const origin = (
    (config.public.siteUrl as string) || getRequestURL(event).origin
  ).replace(/\/$/, '')

  // /admin and /login are kept out of the index. They are already protected by
  // auth and RLS, so this is about not wasting crawl budget on pages that
  // return a redirect, not about hiding anything.
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

Sitemap: ${origin}/sitemap.xml
`

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=86400')
  return body
})
