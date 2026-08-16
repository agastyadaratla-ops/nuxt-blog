<script setup lang="ts">
/**
 * The body lives in the posts table under a reserved slug so it can be edited
 * from /admin/about. If that row does not exist yet, the page falls back to
 * DEFAULT_ABOUT_HTML rather than rendering an empty shell.
 */
const ready = useSupabaseReady()
const { getBySlug } = usePostsRepo()

const { data: aboutPost } = await useAsyncData(
  'about-page',
  () => getBySlug(ABOUT_SLUG),
  { immediate: ready },
)

const body = computed(() => aboutPost.value?.content || DEFAULT_ABOUT_HTML)

const requestUrl = useRequestURL()
const origin = (
  (useRuntimeConfig().public.siteUrl as string) || requestUrl.origin
).replace(/\/$/, '')

useSeo({
  // Just "About": the template appends the name, and "About Agastya Daratla |
  // Agastya Daratla" says it twice.
  title: 'About',
  description: `Who ${siteConfig.name} is and how each project write-up is structured: the goal, the decisions and their rejected alternatives, what went wrong, and the fix.`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      personSchema(origin),
      {
        '@type': 'AboutPage',
        '@id': `${origin}/about#page`,
        url: `${origin}/about`,
        name: `About ${siteConfig.name}`,
        mainEntity: { '@id': `${origin}/#person` },
        inLanguage: 'en',
      },
    ],
  },
})
</script>

<template>
  <div>
    <header class="grid gap-x-6 gap-y-4 md:grid-cols-12">
      <p class="label md:col-span-3 md:pt-3">About</p>

      <div class="md:col-span-9">
        <RevealText
          :text="siteConfig.name"
          as="h1"
          class="display text-5xl sm:text-6xl"
        />
      </div>
    </header>

    <ScrollReveal>
      <section class="mt-14 grid gap-x-6 gap-y-4 border-t border-line pt-10 md:grid-cols-12">
        <div class="md:col-span-3" />

        <!-- First-party content, written by the author in their own editor
             and writable only by an authenticated session under RLS. -->
        <div
          class="about-body prose-post max-w-[62ch] md:col-span-9"
          v-html="body"
        />
      </section>
    </ScrollReveal>

    <ScrollReveal>
      <section class="mt-20 grid gap-x-6 gap-y-4 border-t border-line pt-10 md:grid-cols-12">
        <h2 class="label md:col-span-3">Elsewhere</h2>

        <div class="md:col-span-9">
          <SiteLinks />
        </div>
      </section>
    </ScrollReveal>

    <ScrollReveal>
      <section class="mt-20 border-t border-line pt-10">
        <p class="display max-w-[24ch] text-3xl sm:text-4xl">
          Start with the most recent build.
        </p>
        <NuxtLink to="/" class="btn mt-8">Read the posts</NuxtLink>
      </section>
    </ScrollReveal>
  </div>
</template>
