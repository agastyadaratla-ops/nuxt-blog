<script setup lang="ts">
const ready = useSupabaseReady()
const user = useSupabaseUser()
const { listPublished } = usePostsRepo()

const {
  data: posts,
  error,
  status,
} = await useAsyncData('published-posts', () => listPublished(), {
  default: () => [],
  immediate: ready,
})

useHead({ title: 'Agastya Daratla' })
</script>

<template>
  <div>
    <HeroScene mark="01" class="mb-14 py-6">
      <header class="grid gap-x-6 gap-y-4 md:grid-cols-12">
        <p class="label md:col-span-3 md:pt-3">Writing</p>

        <div class="md:col-span-9">
          <RevealText
            text="Project log"
            as="h1"
            class="display text-5xl sm:text-6xl"
          />
          <ScrollReveal :delay="0.25">
            <p class="mt-4 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              Documentation for the computer science and electronics projects I
              build: the reasoning, the mistakes, and the fixes.
            </p>
          </ScrollReveal>
        </div>
      </header>
    </HeroScene>

    <SetupNotice v-if="!ready" />

    <p v-else-if="status === 'pending'" class="label border-t border-line py-10">
      Loading posts…
    </p>

    <p
      v-else-if="error"
      class="border-t border-line py-10 text-sm text-destructive"
    >
      Could not load posts: {{ error.message }}
    </p>

    <!-- The "write one" prompt is for the author only; to a visitor it would
         be a link straight into a login wall. -->
    <div v-else-if="!posts.length" class="border-t border-line py-10">
      <p class="text-ink-soft">Nothing published yet.</p>
      <NuxtLink
        v-if="user"
        to="/admin/new"
        class="label mt-3 inline-block text-accent"
      >
        Write the first one →
      </NuxtLink>
    </div>

    <div v-else class="border-b border-line">
      <ScrollReveal v-for="post in posts" :key="post.id">
        <PostCard :post="post" />
      </ScrollReveal>
    </div>
  </div>
</template>
