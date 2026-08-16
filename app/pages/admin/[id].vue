<script setup lang="ts">
import type { Post, PostInput } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = String(route.params.id)

const { getById, update, remove } = usePostsRepo()

const post = ref<Post | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const savedAt = ref<string | null>(null)

onMounted(async () => {
  try {
    post.value = await getById(id)
    if (!post.value) error.value = 'That post does not exist.'
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})

async function onSubmit(input: PostInput) {
  saving.value = true
  error.value = null

  try {
    post.value = await update(id, input)
    savedAt.value = new Date().toLocaleTimeString()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    saving.value = false
  }
}

async function onRemove() {
  saving.value = true
  error.value = null

  try {
    await remove(id)
    await navigateTo('/admin')
  } catch (err) {
    error.value = (err as Error).message
    saving.value = false
  }
}

useHead({ title: 'Edit post' })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <NuxtLink to="/admin" class="label transition-colors hover:text-ink">
        ← Dashboard
      </NuxtLink>

      <div class="flex items-center gap-5">
        <span v-if="savedAt" class="label">Saved {{ savedAt }}</span>
        <NuxtLink
          v-if="post?.published"
          :to="`/blog/${post.slug}`"
          class="label transition-colors hover:text-ink"
        >
          View live ↗
        </NuxtLink>
      </div>
    </div>

    <p v-if="loading" class="label mt-10">Loading…</p>

    <p
      v-else-if="!post"
      class="mt-10 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {{ error }}
    </p>

    <div v-else class="mt-8">
      <PostEditor
        :post="post"
        :saving="saving"
        :error="error"
        @submit="onSubmit"
        @remove="onRemove"
      />
    </div>
  </div>
</template>
