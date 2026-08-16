export interface ParsedVideo {
  provider: 'youtube' | 'vimeo'
  id: string
  /** Canonical embed URL, built by us rather than taken from user input. */
  src: string
}

const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d+$/

/**
 * Turn a pasted video URL into a canonical embed URL.
 *
 * Only the video ID is ever taken from the input, and the embed URL is then
 * rebuilt from a fixed template. That way whatever ends up in an iframe `src`
 * is something this function constructed, not something a URL talked us into.
 *
 * Returns null for anything unrecognised, which the caller reports rather than
 * embedding blindly.
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\./, '').toLowerCase()

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0] ?? ''
    return youtube(id)
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    // watch?v=<id>
    const query = url.searchParams.get('v')
    if (query) return youtube(query)

    // /embed/<id>, /shorts/<id>, /live/<id>
    const match = url.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]+)/)
    if (match?.[2]) return youtube(match[2])

    return null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    // Vimeo ids are the last purely numeric path segment.
    const numeric = url.pathname
      .split('/')
      .filter(Boolean)
      .filter((segment) => VIMEO_ID.test(segment))
      .pop()

    return numeric ? vimeo(numeric) : null
  }

  return null
}

function youtube(id: string): ParsedVideo | null {
  if (!YOUTUBE_ID.test(id)) return null
  return {
    provider: 'youtube',
    id,
    // nocookie avoids setting tracking cookies until the reader actually plays.
    src: `https://www.youtube-nocookie.com/embed/${id}`,
  }
}

function vimeo(id: string): ParsedVideo | null {
  if (!VIMEO_ID.test(id)) return null
  return {
    provider: 'vimeo',
    id,
    src: `https://player.vimeo.com/video/${id}`,
  }
}
