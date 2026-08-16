<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: `${props.error.statusCode}` })
</script>

<template>
  <NuxtLayout>
    <div class="py-16 text-center">
      <p class="font-serif text-6xl font-semibold text-muted">
        {{ error.statusCode }}
      </p>
      <p class="mt-4 text-lg">
        {{ error.statusMessage || 'Something went wrong.' }}
      </p>
      <button
        class="mt-8 rounded-md bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-accent"
        @click="clearError({ redirect: '/' })"
      >
        Back to the blog
      </button>
    </div>
  </NuxtLayout>
</template>
