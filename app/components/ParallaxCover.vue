<script setup lang="ts">
/**
 * A cover image that drifts against the scroll.
 *
 * The frame holds a fixed aspect ratio so the space is reserved before the
 * image loads — parallax that causes layout shift is a net loss. The picture
 * is 120% of the frame height, so travelling ±8% never exposes an edge.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    ratio?: string
    eager?: boolean
  }>(),
  { alt: '', ratio: '16 / 9', eager: false },
)

const root = useTemplateRef<HTMLElement>('root')

onMounted(async () => {
  const motion = await loadScrollMotion()
  if (!motion || !root.value || isCoarsePointer()) return

  const image = root.value.querySelector('img')
  if (!image) return

  motion.gsap.fromTo(
    image,
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        ...trackWillChange(image),
      },
    },
  )
})
</script>

<template>
  <div ref="root" class="parallax-frame" :style="{ aspectRatio: props.ratio }">
    <img
      :src="props.src"
      :alt="props.alt"
      :loading="props.eager ? 'eager' : 'lazy'"
      decoding="async"
    />
  </div>
</template>
