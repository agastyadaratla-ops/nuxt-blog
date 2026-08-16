export interface ScrollMotion {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

/** Someone has asked their OS to stop moving things. Non-negotiable. */
export function prefersReducedMotion(): boolean {
  return (
    import.meta.client &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Touch devices get a lighter treatment — parallax on a phone is jank. */
export function isCoarsePointer(): boolean {
  return import.meta.client && window.matchMedia('(pointer: coarse)').matches
}

/**
 * Loads GSAP and ScrollTrigger, but only in a browser that wants motion.
 *
 * Returns null when motion is unwanted, and every caller is expected to bail
 * on null rather than animating anyway. The import is dynamic so GSAP never
 * enters the server bundle and never ships to a reader who won't see it.
 */
export async function loadScrollMotion(): Promise<ScrollMotion | null> {
  if (!import.meta.client || prefersReducedMotion()) return null

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)

  return { gsap, ScrollTrigger }
}

/**
 * How much of the scroll each depth keeps up with. 1.0 travels with the page;
 * lower values lag behind and read as further away.
 */
export const DEPTH_FACTOR: Record<string, number> = {
  '0': 0.1,
  '1': 0.25,
  '2': 0.5,
  '3': 0.8,
  '4': 1,
  '5': 1.2,
}

/**
 * Parallax every `[data-depth]` layer inside `root`. Layers that travel with
 * the page (factor 1) are skipped — no trigger, no cost.
 */
export function applyDepthParallax(
  motion: ScrollMotion,
  root: HTMLElement,
  distance = 220,
) {
  const layers = root.querySelectorAll<HTMLElement>('[data-depth]')

  layers.forEach((layer) => {
    const factor = DEPTH_FACTOR[layer.dataset.depth ?? '4'] ?? 1
    if (factor === 1) return

    motion.gsap.to(layer, {
      y: (1 - factor) * distance,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        ...trackWillChange(layer),
      },
    })
  })
}

/**
 * `will-change` is a promise to the compositor, and leaving it on permanently
 * costs memory on every layer. Set it while a trigger is live, drop it after.
 */
export function trackWillChange(element: Element) {
  return {
    onToggle: (self: { isActive: boolean }) => {
      ;(element as HTMLElement).style.willChange = self.isActive
        ? 'transform'
        : ''
    },
  }
}
