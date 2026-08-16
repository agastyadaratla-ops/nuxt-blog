const COMBINING_MARKS = /[̀-ͯ]/g

/**
 * Turn a post title into a URL-safe slug.
 * "Why I Switched to Nuxt!" -> "why-i-switched-to-nuxt"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Slugs must be unique in the database. If a title collides with an existing
 * post, fall back to appending a short random suffix rather than failing the save.
 */
export function slugWithSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug || 'post'}-${suffix}`
}

/** "2026-08-16T..." -> "August 16, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
