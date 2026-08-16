<script setup lang="ts">
import type { PostInput } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })

const { create } = usePostsRepo()
const authorId = useAuthorId()

const saving = ref(false)
const error = ref<string | null>(null)

async function onSubmit(input: PostInput) {
  if (!authorId.value) return

  saving.value = true
  error.value = null

  try {
    const post = await create(input, authorId.value)
    // Move to the edit route so a second save updates rather than duplicates.
    await navigateTo(`/admin/${post.id}`)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    saving.value = false
  }
}

useHead({ title: 'New post' })
</script>

<template>
  <div>
    <NuxtLink to="/admin" class="text-sm text-muted hover:text-accent">
      ← Dashboard
    </NuxtLink>

    <div class="mt-6">
      <PostEditor :saving="saving" :error="error" @submit="onSubmit" />
    </div>
  </div>
</template>
