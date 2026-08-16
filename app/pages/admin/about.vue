<script setup lang="ts">
import type { Post, PostInput } from '~/types/database.types'

definePageMeta({ middleware: 'auth' })

/**
 * Edits the About page, which is a post under a reserved slug. The row may
 * not exist yet, so the first save creates it and every later save updates.
 */
const { getBySlug, create, update } = usePostsRepo()
const authorId = useAuthorId()

const draft = ref<Post | null>(null)
const existingId = ref<string | null>(null)

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const savedAt = ref<string | null>(null)

onMounted(async () => {
  try {
    const existing = await getBySlug(ABOUT_SLUG)

    if (existing) {
      existingId.value = existing.id
      draft.value = existing
      return
    }

    // Seed from what the page already shows, so the first edit starts from
    // the current words rather than an empty editor.
    draft.value = {
      id: '',
      slug: ABOUT_SLUG,
      title: siteConfig.name,
      excerpt: '',
      content: DEFAULT_ABOUT_HTML,
      cover_url: null,
      published: true,
      author_id: '',
      created_at: '',
      updated_at: '',
    }
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})

async function onSubmit(input: PostInput) {
  if (!authorId.value) return

  saving.value = true
  error.value = null

  // The slug and published flag are not the author's to change here: a
  // standing page is always live, and its URL is what /about looks up.
  const payload: PostInput = {
    ...input,
    slug: ABOUT_SLUG,
    published: true,
  }

  try {
    const saved = existingId.value
      ? await update(existingId.value, payload)
      : await create(payload, authorId.value)

    existingId.value = saved.id
    draft.value = saved
    savedAt.value = new Date().toLocaleTimeString()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    saving.value = false
  }
}

useHead({ title: 'Edit About' })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <NuxtLink to="/admin" class="label transition-colors hover:text-ink">
        ← Dashboard
      </NuxtLink>

      <div class="flex items-center gap-5">
        <span v-if="savedAt" class="label">Saved {{ savedAt }}</span>
        <NuxtLink to="/about" class="label transition-colors hover:text-ink">
          View live ↗
        </NuxtLink>
      </div>
    </div>

    <p v-if="loading" class="label mt-10">Loading…</p>

    <div v-else class="mt-8">
      <PostEditor
        :post="draft"
        :saving="saving"
        :error="error"
        variant="page"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>
