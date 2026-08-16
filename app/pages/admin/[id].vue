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
    <div class="flex items-center justify-between">
      <NuxtLink to="/admin" class="text-sm text-muted hover:text-accent">
        ← Dashboard
      </NuxtLink>

      <div class="flex items-center gap-4 text-sm text-muted">
        <span v-if="savedAt">Saved at {{ savedAt }}</span>
        <NuxtLink
          v-if="post?.published"
          :to="`/blog/${post.slug}`"
          class="hover:text-accent"
        >
          View live ↗
        </NuxtLink>
      </div>
    </div>

    <p v-if="loading" class="mt-8 text-muted">Loading…</p>

    <p
      v-else-if="!post"
      class="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </p>

    <div v-else class="mt-6">
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
