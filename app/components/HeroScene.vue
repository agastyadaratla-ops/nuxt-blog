<script setup lang="ts">
/**
 * Layered masthead, drawn entirely in CSS: there are no image assets in this
 * project, and post covers are author-uploaded content rather than art
 * direction, so the depth is built from type and rules alone.
 *
 * Deliberately achromatic. An earlier version carried a large blurred colour
 * wash at depth 1; it was removed by request, and the layers now read as
 * structure rather than atmosphere.
 */
const props = withDefaults(defineProps<{ mark?: string }>(), { mark: '01' })

const root = useTemplateRef<HTMLElement>('root')

onMounted(async () => {
  const motion = await loadScrollMotion()
  if (!motion || !root.value) return

  // Touch devices get the layers but not the scrub — parallax on a phone
  // fights the browser's own scroll compositing.
  if (isCoarsePointer()) return

  applyDepthParallax(motion, root.value, 200)
})
</script>

<template>
  <div ref="root" class="scene">
    <!-- depth 0 — an oversized numeral, blurred back into the paper -->
    <div class="scene__layer depth-0" data-depth="0" aria-hidden="true">
      <span
        class="display absolute -right-4 top-1/2 -translate-y-1/2 text-[22rem] leading-none text-ink/[0.04] sm:text-[30rem]"
      >
        {{ props.mark }}
      </span>
    </div>

    <!-- depth 2 — the grid itself, made visible as hairlines -->
    <div
      class="scene__layer depth-2 flex justify-between px-[12%]"
      data-depth="2"
      aria-hidden="true"
    >
      <span v-for="n in 5" :key="n" class="block w-px bg-line/70" />
    </div>

    <!-- depth 4 — the actual content, travelling with the page -->
    <div class="scene__content" data-depth="4">
      <slot />
    </div>

    <!-- depth 5 — a small foreground accent, moving faster than everything -->
    <div class="scene__layer depth-5" data-depth="5" aria-hidden="true">
      <span
        class="absolute bottom-[18%] right-[14%] block size-2 bg-accent-bright"
      />
    </div>
  </div>
</template>
