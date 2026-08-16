<script setup lang="ts">
// "Post title | Agastya Daratla", but never "Agastya Daratla | Agastya
// Daratla" on the pages already titled with the name.
useHead({
  titleTemplate: (title) =>
    title && title !== siteConfig.name
      ? `${title} | ${siteConfig.name}`
      : siteConfig.name,
  link: [
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: siteConfig.name,
      href: '/rss.xml',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
