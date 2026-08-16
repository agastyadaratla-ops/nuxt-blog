<script setup lang="ts">
import type { Post, PostInput } from '~/types/database.types'

/**
 * The full post-writing form: metadata, cover image, WYSIWYG body, draft
 * toggle. It owns the form state and hands a finished `PostInput` to the
 * parent, which decides whether that means an insert or an update.
 */
const props = defineProps<{
  post?: Post | null
  saving: boolean
  error: string | null
}>()

const emit = defineEmits<{
  submit: [input: PostInput]
  remove: []
}>()

const { uploadCover } = usePostsRepo()

const title = ref('')
const slug = ref('')
const excerpt = ref('')
const content = ref('')
const coverUrl = ref<string | null>(null)
const published = ref(false)

// Once the author edits the slug by hand, stop overwriting it from the title.
const slugTouched = ref(false)

const uploading = ref(false)
const uploadError = ref<string | null>(null)

watch(
  () => props.post,
  (post) => {
    if (!post) return
    title.value = post.title
    slug.value = post.slug
    excerpt.value = post.excerpt
    content.value = post.content
    coverUrl.value = post.cover_url
    published.value = post.published
    slugTouched.value = true
  },
  { immediate: true },
)

watch(title, (value) => {
  if (!slugTouched.value) slug.value = slugify(value)
})

const canSave = computed(() => title.value.trim().length > 0 && !props.saving)

async function onCoverSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  uploadError.value = null

  try {
    coverUrl.value = await uploadCover(file)
  } catch (error) {
    uploadError.value = (error as Error).message
  } finally {
    uploading.value = false
    // Let the same file be picked again after a failure.
    input.value = ''
  }
}

function onSubmit() {
  if (!canSave.value) return

  emit('submit', {
    title: title.value.trim(),
    slug: slug.value.trim() || slugify(title.value) || slugWithSuffix(''),
    excerpt: excerpt.value.trim(),
    content: content.value,
    cover_url: coverUrl.value,
    published: published.value,
  })
}

function onDelete() {
  if (window.confirm('Delete this post? This cannot be undone.')) {
    emit('remove')
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <input
      v-model="title"
      type="text"
      placeholder="Post title"
      class="w-full border-0 bg-transparent p-0 font-serif text-4xl font-semibold placeholder:text-muted/50 focus:outline-none"
    />

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-muted">URL slug</span>
        <input
          v-model="slug"
          type="text"
          class="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          @input="slugTouched = true"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm font-medium text-muted">
          Cover image
        </span>
        <input
          type="file"
          accept="image/*"
          :disabled="uploading"
          class="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-line file:px-2 file:py-1 file:text-xs"
          @change="onCoverSelected"
        />
      </label>
    </div>

    <p v-if="uploading" class="text-sm text-muted">Uploading image…</p>
    <p v-if="uploadError" class="text-sm text-red-700">{{ uploadError }}</p>

    <div v-if="coverUrl" class="relative">
      <img
        :src="coverUrl"
        alt="Cover preview"
        class="aspect-[2/1] w-full rounded-lg border border-line object-cover"
      />
      <button
        type="button"
        class="absolute right-3 top-3 rounded-md bg-ink/80 px-3 py-1 text-xs text-white hover:bg-ink"
        @click="coverUrl = null"
      >
        Remove
      </button>
    </div>

    <label class="block">
      <span class="mb-1 block text-sm font-medium text-muted">
        Excerpt
        <span class="font-normal">— the teaser shown on the post list</span>
      </span>
      <textarea
        v-model="excerpt"
        rows="2"
        class="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
    </label>

    <ClientOnly>
      <TiptapEditor v-model="content" />
      <template #fallback>
        <div
          class="h-96 animate-pulse rounded-lg border border-line bg-surface"
        />
      </template>
    </ClientOnly>

    <p v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </p>

    <div
      class="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6"
    >
      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="published"
          type="checkbox"
          class="size-4 rounded border-line accent-[var(--color-accent)]"
        />
        <span>
          {{ published ? 'Published' : 'Draft' }}
          <span class="text-muted">
            — {{ published ? 'visible to everyone' : 'only visible to you' }}
          </span>
        </span>
      </label>

      <div class="flex items-center gap-3">
        <button
          v-if="post"
          type="button"
          class="rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          @click="onDelete"
        >
          Delete
        </button>

        <button
          type="submit"
          :disabled="!canSave"
          class="rounded-md bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </form>
</template>
