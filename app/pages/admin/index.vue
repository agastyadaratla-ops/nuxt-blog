<script setup lang="ts">
import type { Post } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })

const { listMine } = usePostsRepo()

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    posts.value = await listMine()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})

useHead({ title: 'Dashboard' })
</script>

<template>
  <div>
    <header class="mb-8 flex items-center justify-between">
      <h1 class="font-serif text-3xl font-semibold">Your posts</h1>
      <NuxtLink
        to="/admin/new"
        class="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-accent"
      >
        New post
      </NuxtLink>
    </header>

    <p v-if="loading" class="text-muted">Loading…</p>

    <p v-else-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
    </p>

    <p v-else-if="!posts.length" class="text-muted">
      Nothing written yet. Start with a
      <NuxtLink to="/admin/new" class="text-accent underline">new post</NuxtLink>.
    </p>

    <ul v-else class="divide-y divide-line rounded-lg border border-line bg-surface">
      <li v-for="post in posts" :key="post.id">
        <NuxtLink
          :to="`/admin/${post.id}`"
          class="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper"
        >
          <div class="min-w-0">
            <p class="truncate font-medium">
              {{ post.title || 'Untitled' }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              Edited {{ formatDate(post.updated_at) }}
            </p>
          </div>

          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
            :class="
              post.published
                ? 'bg-accent-soft text-accent'
                : 'bg-line text-muted'
            "
          >
            {{ post.published ? 'Published' : 'Draft' }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
