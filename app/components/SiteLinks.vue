<script setup lang="ts">
/**
 * Contact links, driven entirely by `siteConfig`. Renders nothing at all if
 * nothing is configured, rather than leaving empty labels behind.
 */
const links = siteLinks()
</script>

<template>
  <ul v-if="links.length" class="flex flex-wrap items-center gap-5">
    <li v-for="link in links" :key="link.href">
      <a
        :href="link.href"
        class="label transition-colors hover:text-ink"
        :target="link.href.startsWith('mailto:') ? undefined : '_blank'"
        :rel="link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
      >
        {{ link.label }} ↗
      </a>
    </li>
  </ul>
</template>
