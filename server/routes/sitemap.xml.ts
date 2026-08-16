interface SitemapPost {
  slug: string
  updated_at: string
}

/**
 * Generated per request rather than at build time, because posts are written
 * through the admin UI and a build-time sitemap would go stale the moment
 * something is published.
 *
 * Queries PostgREST directly with the publishable key. RLS already restricts
 * anonymous reads to published rows, so this cannot leak a draft even if the
 * filter below were wrong.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { url, key } = config.public.supabase as { url: string; key: string }

  const origin = (
    (config.public.siteUrl as string) || getRequestURL(event).origin
  ).replace(/\/$/, '')

  let posts: SitemapPost[] = []

  try {
    posts = await $fetch<SitemapPost[]>(`${url}/rest/v1/posts`, {
      params: {
        select: 'slug,updated_at',
        published: 'eq.true',
        slug: 'neq.about',
        order: 'updated_at.desc',
      },
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
  } catch {
    // A sitemap listing only the standing pages beats a 500. Search engines
    // retry, and the fixed pages are the ones that matter for a name query.
    posts = []
  }

  const entries = [
    { loc: `${origin}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${origin}/about`, priority: '0.8', changefreq: 'monthly' },
    ...posts.map((post) => ({
      loc: `${origin}/blog/${post.slug}`,
      lastmod: post.updated_at,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => {
    const lastmod =
      'lastmod' in entry && entry.lastmod
        ? `\n    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>`
        : ''
    return `  <url>
    <loc>${entry.loc}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600')
  return body
})
