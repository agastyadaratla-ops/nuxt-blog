<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { getBySlug } = usePostsRepo()

const { data: post } = await useAsyncData(`post-${slug.value}`, () =>
  getBySlug(slug.value),
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'That post does not exist.',
    fatal: true,
  })
}

useHead({
  title: post.value.title,
  meta: [{ name: 'description', content: post.value.excerpt }],
})
</script>

<template>
  <article v-if="post">
    <NuxtLink to="/" class="text-sm text-muted hover:text-accent">
      ← All posts
    </NuxtLink>

    <header class="mb-8 mt-6">
      <time :datetime="post.created_at" class="text-sm text-muted">
        {{ formatDate(post.created_at) }}
      </time>
      <h1
        class="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight"
      >
        {{ post.title }}
      </h1>
    </header>

    <img
      v-if="post.cover_url"
      :src="post.cover_url"
      alt=""
      class="mb-10 aspect-[2/1] w-full rounded-lg border border-line object-cover"
    />

    <!--
      The HTML here was produced by the author's own TipTap editor and is
      writable only by authenticated users (see the RLS policies), so it is
      first-party content rather than untrusted input.
    -->
    <div class="prose-post" v-html="post.content" />
  </article>
</template>
