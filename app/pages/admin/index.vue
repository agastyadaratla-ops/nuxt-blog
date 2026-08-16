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
    <header
      class="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8"
    >
      <div>
        <p class="label">Dashboard</p>
        <h1 class="display mt-3 text-4xl sm:text-5xl">Your posts</h1>
      </div>

      <NuxtLink to="/admin/new" class="btn">New post</NuxtLink>
    </header>

    <p v-if="loading" class="label">Loading…</p>

    <p
      v-else-if="error"
      class="bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {{ error }}
    </p>

    <div v-else-if="!posts.length">
      <p class="text-ink-soft">Nothing written yet.</p>
      <NuxtLink to="/admin/new" class="label mt-3 inline-block text-accent">
        Start a post →
      </NuxtLink>
    </div>

    <ul v-else class="border-t border-line">
      <li v-for="post in posts" :key="post.id" class="border-b border-line">
        <NuxtLink
          :to="`/admin/${post.id}`"
          class="group grid items-baseline gap-x-6 gap-y-2 py-6 md:grid-cols-12"
        >
          <div class="flex items-center gap-3 md:col-span-3">
            <span
              class="inline-block size-1.5 shrink-0 rounded-full"
              :class="post.published ? 'bg-accent-bright' : 'bg-line'"
            />
            <span class="label">
              {{ post.published ? 'Published' : 'Draft' }}
            </span>
          </div>

          <p
            class="display truncate text-xl transition-colors group-hover:text-accent md:col-span-6"
          >
            {{ post.title || 'Untitled' }}
          </p>

          <span class="label md:col-span-3 md:text-right">
            {{ formatDate(post.updated_at) }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Standing pages live in the same table under reserved slugs, so they
         are filtered out of the list above and surfaced here instead. -->
    <section class="mt-16">
      <h2 class="label">Pages</h2>

      <ul class="mt-4 border-t border-line">
        <li class="border-b border-line">
          <NuxtLink
            to="/admin/about"
            class="group grid items-baseline gap-x-6 gap-y-2 py-6 md:grid-cols-12"
          >
            <span class="label md:col-span-3">Always live</span>

            <p
              class="display text-xl transition-colors group-hover:text-accent md:col-span-6"
            >
              About
            </p>

            <span class="label md:col-span-3 md:text-right">Edit →</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
