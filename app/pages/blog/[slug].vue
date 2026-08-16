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

const requestUrl = useRequestURL()
const origin = (
  (useRuntimeConfig().public.siteUrl as string) || requestUrl.origin
).replace(/\/$/, '')

const entry = post.value

useSeo({
  title: entry.title,
  // Falling back to the title beats an empty description, which search
  // engines replace with whatever text they scrape first.
  description:
    entry.excerpt ||
    `${entry.title}. A project write-up by ${siteConfig.name}.`,
  image: entry.cover_url,
  type: 'article',
  publishedAt: entry.created_at,
  modifiedAt: entry.updated_at,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: siteConfig.name,
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: entry.title,
            item: `${origin}/blog/${entry.slug}`,
          },
        ],
      },
      {
        '@type': 'BlogPosting',
        '@id': `${origin}/blog/${entry.slug}#post`,
        headline: entry.title,
        description: entry.excerpt || entry.title,
        datePublished: entry.created_at,
        dateModified: entry.updated_at,
        author: personSchema(origin),
        publisher: { '@id': `${origin}/#person` },
        mainEntityOfPage: `${origin}/blog/${entry.slug}`,
        ...(entry.cover_url ? { image: entry.cover_url } : {}),
        inLanguage: 'en',
      },
    ],
  },
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
      <!-- Byline and date parked in the margin, newspaper-fashion. The byline
           is a real link to /about, which both puts the author's name as
           visible text on every post and connects each post back to the
           profile page describing the person. -->
      <div class="md:col-span-3">
        <div class="md:sticky md:top-10">
          <p class="label">
            By
            <NuxtLink
              to="/about"
              rel="author"
              class="text-accent transition-colors hover:text-ink"
            >
              {{ siteConfig.name }}
            </NuxtLink>
          </p>

          <time :datetime="post.created_at" class="label mt-2 block">
            {{ formatDate(post.created_at) }}
          </time>
        </div>
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
