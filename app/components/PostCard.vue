<script setup lang="ts">
import type { Post } from '~/types/database.types'

defineProps<{ post: Post }>()
</script>

<template>
  <article class="group">
    <NuxtLink :to="`/blog/${post.slug}`" class="block">
      <img
        v-if="post.cover_url"
        :src="post.cover_url"
        :alt="''"
        class="mb-4 aspect-[2/1] w-full rounded-lg border border-line object-cover"
        loading="lazy"
      />

      <time :datetime="post.created_at" class="text-sm text-muted">
        {{ formatDate(post.created_at) }}
      </time>

      <h2
        class="mt-1 font-serif text-2xl font-semibold leading-snug group-hover:text-accent"
      >
        {{ post.title }}
      </h2>

      <p v-if="post.excerpt" class="mt-2 leading-relaxed text-muted">
        {{ post.excerpt }}
      </p>
    </NuxtLink>
  </article>
</template>
