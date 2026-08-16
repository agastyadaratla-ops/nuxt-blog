interface FeedPost {
  slug: string
  title: string
  excerpt: string
  created_at: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * An RSS feed, generated per request for the same reason as the sitemap: posts
 * are written through the admin UI, so anything baked at build time is stale
 * the moment something is published.
 *
 * Feeds matter less than they used to for discovery, but they are cheap, they
 * are what a reader expects from a blog, and aggregators that do still crawl
 * them are a source of the inbound links that actually move rankings.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { url, key } = config.public.supabase as { url: string; key: string }

  const origin = (
    (config.public.siteUrl as string) || getRequestURL(event).origin
  ).replace(/\/$/, '')

  let posts: FeedPost[] = []

  try {
    posts = await $fetch<FeedPost[]>(`${url}/rest/v1/posts`, {
      params: {
        select: 'slug,title,excerpt,created_at',
        published: 'eq.true',
        slug: 'neq.about',
        order: 'created_at.desc',
        limit: 50,
      },
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
  } catch {
    posts = []
  }

  const items = posts
    .map(
      (post) => `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${origin}/blog/${post.slug}</link>
    <guid isPermaLink="true">${origin}/blog/${post.slug}</guid>
    <description>${escapeXml(post.excerpt || post.title)}</description>
    <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
  </item>`,
    )
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Agastya Daratla</title>
  <link>${origin}</link>
  <description>Computer science and electronics projects, documented: the reasoning behind each decision, what broke, and how it was fixed.</description>
  <language>en</language>
  <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600')
  return body
})
