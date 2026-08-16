<script setup lang="ts">
// "Post title | Agastya Daratla", but never "Agastya Daratla | Agastya
// Daratla" on the pages already titled with the name.
useHead({
  titleTemplate: (title) =>
    title && title !== siteConfig.name
      ? `${title} | ${siteConfig.name}`
      : siteConfig.name,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
