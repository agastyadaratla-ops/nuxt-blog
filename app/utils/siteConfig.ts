/**
 * Everything personal in one place.
 *
 * Any field left as an empty string is simply not rendered, so clearing one
 * removes the link rather than shipping a broken one.
 */
export const siteConfig = {
  name: 'Agastya Daratla',

  /** Shown as a mailto: link. Clear it to hide the email link entirely. */
  email: 'pdaratla@gmail.com',

  /** GitHub username, not a full URL. */
  github: 'agastyadaratla-ops',
} as const

export interface SiteLink {
  label: string
  href: string
}

export function siteLinks(): SiteLink[] {
  const links: SiteLink[] = []

  if (siteConfig.github) {
    links.push({
      label: 'GitHub',
      href: `https://github.com/${siteConfig.github}`,
    })
  }

  if (siteConfig.email) {
    links.push({ label: 'Email', href: `mailto:${siteConfig.email}` })
  }

  return links
}
