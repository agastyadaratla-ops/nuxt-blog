export interface SeoOptions {
  title: string
  description: string
  /** Absolute or root-relative image for social cards. */
  image?: string | null
  type?: 'website' | 'article'
  publishedAt?: string
  modifiedAt?: string
  noindex?: boolean
  /** Extra JSON-LD to emit alongside the tags. */
  jsonLd?: Record<string, unknown>
}

/**
 * One place that sets everything a search engine or a link preview reads.
 *
 * The origin comes from the incoming request rather than a hardcoded domain,
 * so canonical and Open Graph URLs are correct on localhost, on the
 * .vercel.app domain, and on a custom domain without a code change. Set
 * NUXT_PUBLIC_SITE_URL to pin it to one canonical host once a domain exists.
 *
 * The optional tags are added by separate useHead calls rather than by
 * spreading into one array, because unhead types meta names as literal unions
 * and a conditionally spread array loses that typing.
 */
export function useSeo(options: SeoOptions) {
  const route = useRoute()
  const requestUrl = useRequestURL()
  const config = useRuntimeConfig().public
  const configured = config.siteUrl as string

  const origin = (configured || requestUrl.origin).replace(/\/$/, '')
  const canonical = `${origin}${route.path}`

  // The GitHub Pages mirror must never be indexed. It is a reachability
  // workaround for one blocked network, and letting it into search results
  // would put a slower, canonical-less copy in front of readers.
  const noindex = options.noindex || Boolean(config.isMirror)

  const image = options.image
    ? options.image.startsWith('http')
      ? options.image
      : `${origin}${options.image}`
    : null

  useHead({
    title: options.title,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: options.description },
      {
        name: 'robots',
        content: noindex ? 'noindex, nofollow' : 'index, follow',
      },
      { property: 'og:type', content: options.type ?? 'website' },
      { property: 'og:title', content: options.title },
      { property: 'og:description', content: options.description },
      { property: 'og:url', content: canonical },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:locale', content: 'en_US' },
      {
        name: 'twitter:card',
        content: image ? 'summary_large_image' : 'summary',
      },
      { name: 'twitter:title', content: options.title },
      { name: 'twitter:description', content: options.description },
    ],
  })

  if (image) {
    useHead({
      meta: [
        { property: 'og:image', content: image },
        { name: 'twitter:image', content: image },
      ],
    })
  }

  if (options.publishedAt) {
    useHead({
      meta: [
        { property: 'article:published_time', content: options.publishedAt },
      ],
    })
  }

  if (options.modifiedAt) {
    useHead({
      meta: [
        { property: 'article:modified_time', content: options.modifiedAt },
      ],
    })
  }

  if (options.jsonLd) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(options.jsonLd),
        },
      ],
    })
  }

  return { origin, canonical }
}

/**
 * Describes the author as a Person, with sameAs pointing at the profiles that
 * are already top results for the name. That is what lets a search engine
 * connect this site to the same identity rather than treating it as unrelated.
 */
export function personSchema(origin: string) {
  const sameAs: string[] = []
  if (siteConfig.github) {
    sameAs.push(`https://github.com/${siteConfig.github}`)
  }

  return {
    '@type': 'Person',
    '@id': `${origin}/#person`,
    name: siteConfig.name,
    url: origin,
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: [
      'Computer science',
      'Electronics',
      'Software engineering',
      'Computer vision',
      'Operating systems',
    ],
  }
}
