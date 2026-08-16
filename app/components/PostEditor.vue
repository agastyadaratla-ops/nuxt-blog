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

const { uploadImage } = usePostsRepo()

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
    coverUrl.value = await uploadImage(file)
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
  <form class="space-y-8" @submit.prevent="onSubmit">
    <div>
      <label for="post-title" class="label mb-3 block">Title</label>
      <input
        id="post-title"
        v-model="title"
        type="text"
        placeholder="Untitled"
        class="display w-full border-0 border-b border-line bg-transparent px-0 pb-3 text-4xl placeholder:text-muted/40 focus:border-ink"
      />
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <div>
        <label for="post-slug" class="label mb-2 block">URL slug</label>
        <input
          id="post-slug"
          v-model="slug"
          type="text"
          class="field"
          @input="slugTouched = true"
        />
      </div>

      <div>
        <label for="post-cover" class="label mb-2 block">Cover image</label>
        <input
          id="post-cover"
          type="file"
          accept="image/*"
          :disabled="uploading"
          class="field cursor-pointer file:mr-3 file:cursor-pointer file:border-0 file:bg-line file:px-2 file:py-1 file:font-sans file:text-xs"
          @change="onCoverSelected"
        />
      </div>
    </div>

    <p v-if="uploading" class="label">Uploading image…</p>
    <p
      v-if="uploadError"
      class="bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {{ uploadError }}
    </p>

    <div v-if="coverUrl" class="relative">
      <img
        :src="coverUrl"
        alt="Cover preview"
        class="aspect-[2/1] w-full object-cover"
      />
      <button
        type="button"
        class="label absolute right-3 top-3 bg-ink px-3 py-1.5 text-white transition-colors hover:bg-accent"
        @click="coverUrl = null"
      >
        Remove
      </button>
    </div>

    <div>
      <label for="post-excerpt" class="label mb-2 block">
        Excerpt — the teaser shown on the post list
      </label>
      <textarea
        id="post-excerpt"
        v-model="excerpt"
        rows="2"
        class="field resize-y"
      />
    </div>

    <div>
      <p class="label mb-2">Body</p>
      <ClientOnly>
        <TiptapEditor v-model="content" :upload="uploadImage" />
        <template #fallback>
          <div class="h-96 animate-pulse border border-line bg-surface" />
        </template>
      </ClientOnly>
    </div>

    <p v-if="error" class="bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {{ error }}
    </p>

    <div
      class="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8"
    >
      <label class="flex cursor-pointer items-center gap-3">
        <input
          v-model="published"
          type="checkbox"
          class="size-4 cursor-pointer accent-[var(--color-ink)]"
        />
        <span class="text-sm">
          <span class="font-medium">
            {{ published ? 'Published' : 'Draft' }}
          </span>
          <span class="text-muted">
            — {{ published ? 'visible to everyone' : 'only visible to you' }}
          </span>
        </span>
      </label>

      <div class="flex items-center gap-3">
        <button
          v-if="post"
          type="button"
          class="btn-ghost text-destructive"
          @click="onDelete"
        >
          Delete
        </button>

        <button type="submit" :disabled="!canSave" class="btn">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </form>
</template>
