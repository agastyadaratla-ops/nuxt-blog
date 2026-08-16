<script setup lang="ts">
/**
 * Masked line reveal: each word sits in an overflow-hidden box and slides up
 * into it, staggered.
 *
 * The words render in their finished position. JavaScript pushes them down
 * only once it has decided animation is wanted — so a reader with JS off, or
 * with reduced motion on, sees the heading normally instead of a blank space.
 */
const props = withDefaults(
  defineProps<{
    text: string
    as?: string
    delay?: number
  }>(),
  { as: 'h1', delay: 0 },
)

const root = useTemplateRef<HTMLElement>('root')

const words = computed(() => props.text.split(/\s+/).filter(Boolean))

onMounted(async () => {
  const motion = await loadScrollMotion()
  if (!motion || !root.value) return

  const lines = root.value.querySelectorAll('[data-reveal-word]')
  if (!lines.length) return

  motion.gsap.set(lines, { yPercent: 115 })
  motion.gsap.to(lines, {
    yPercent: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.055,
    delay: props.delay,
    scrollTrigger: { trigger: root.value, start: 'top 88%', once: true },
  })
})
</script>

<template>
  <component :is="props.as" ref="root">
    <!--
      The `{{ ' ' }}` between words is a real text node, not a CSS margin.
      A margin looks identical but leaves the accessible name, and anything
      copied out of the page, as one run-on word: "TheBlog".

      The padding/negative-margin pair gives descenders room so the clip box
      doesn't slice the tail off a 'g' or 'y'.
    -->
    <template v-for="(word, index) in words" :key="`${index}-${word}`">
      <span class="reveal-line -mb-[0.16em] inline-block pb-[0.16em]">
        <span data-reveal-word class="inline-block">{{ word }}</span>
      </span>{{ ' ' }}
    </template>
  </component>
</template>
