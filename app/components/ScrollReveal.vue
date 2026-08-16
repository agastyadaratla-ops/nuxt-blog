<script setup lang="ts">
/**
 * Reveals its contents once, as they enter the viewport.
 *
 * Rendered in the finished state; the start state is applied by JavaScript
 * only when motion is wanted. `once: true` means the trigger is torn down
 * after firing rather than recomputing on every scroll.
 */
const props = withDefaults(
  defineProps<{
    y?: number
    duration?: number
    delay?: number
  }>(),
  { y: 28, duration: 0.8, delay: 0 },
)

const root = useTemplateRef<HTMLElement>('root')

onMounted(async () => {
  const motion = await loadScrollMotion()
  if (!motion || !root.value) return

  const element = root.value

  motion.gsap.set(element, { opacity: 0, y: props.y })
  motion.gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: props.duration,
    delay: props.delay,
    ease: 'power2.out',
    scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    onComplete: () => {
      element.style.willChange = ''
    },
    onStart: () => {
      element.style.willChange = 'transform, opacity'
    },
  })
})
</script>

<template>
  <div ref="root">
    <slot />
  </div>
</template>
