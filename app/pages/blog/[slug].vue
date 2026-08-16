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
    <NuxtLink to="/" class="label transition-colors hover:text-ink">
      ← All posts
    </NuxtLink>

    <header class="mt-8 border-b border-line pb-10">
      <RevealText
        :text="post.title"
        as="h1"
        class="display max-w-[18ch] text-4xl sm:text-5xl md:text-6xl"
      />
      <ScrollReveal v-if="post.excerpt" :delay="0.2">
        <p class="mt-5 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
          {{ post.excerpt }}
        </p>
      </ScrollReveal>
    </header>

    <ParallaxCover
      v-if="post.cover_url"
      :src="post.cover_url"
      ratio="2 / 1"
      eager
      class="my-12 w-full"
    />

    <div class="mt-12 grid gap-x-6 gap-y-6 md:grid-cols-12">
      <!-- Publication date parked in the margin, newspaper-fashion. -->
      <div class="md:col-span-3">
        <time :datetime="post.created_at" class="label md:sticky md:top-10">
          {{ formatDate(post.created_at) }}
        </time>
      </div>

      <!--
        The HTML here was produced by the author's own TipTap editor and is
        writable only by authenticated users (see the RLS policies), so it is
        first-party content rather than untrusted input.
      -->
      <div
        class="prose-post max-w-[68ch] md:col-span-9"
        v-html="post.content"
      />
    </div>
  </article>
</template>
