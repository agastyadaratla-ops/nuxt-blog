<script setup lang="ts">
import type { Post } from '~/types/database.types'

defineProps<{ post: Post }>()
</script>

<template>
  <article class="grid gap-x-6 gap-y-4 border-t border-line py-10 md:grid-cols-12">
    <!-- Date sits in its own narrow column: the asymmetric split is what makes
         the grid read as a grid rather than a stack of cards. -->
    <div class="md:col-span-3">
      <time :datetime="post.created_at" class="label">
        {{ formatDate(post.created_at) }}
      </time>
    </div>

    <div class="md:col-span-9">
      <NuxtLink :to="`/blog/${post.slug}`" class="group block">
        <img
          v-if="post.cover_url"
          :src="post.cover_url"
          alt=""
          class="mb-6 aspect-[16/9] w-full object-cover"
          loading="lazy"
        />

        <h2
          class="display text-3xl transition-colors group-hover:text-accent sm:text-4xl"
        >
          {{ post.title }}
        </h2>

        <p
          v-if="post.excerpt"
          class="mt-3 max-w-[58ch] text-ink-soft leading-relaxed"
        >
          {{ post.excerpt }}
        </p>

        <span class="label mt-4 inline-block text-accent">Read →</span>
      </NuxtLink>
    </div>
  </article>
</template>
