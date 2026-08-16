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
    <!-- An introduction, not a section label. Someone arriving here should
         learn who this is and what the blog is for; the About page is where
         they go if they want the longer version. -->
    <section class="grid gap-x-6 gap-y-4 pb-16 md:grid-cols-12">
      <div class="md:col-span-9 md:col-start-4">
        <RevealText
          text="Agastya Daratla"
          as="h1"
          class="display text-5xl sm:text-6xl"
        />

        <ScrollReveal :delay="0.2">
          <p class="mt-5 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
            I build things with computers and circuits, and I document how it
            actually went. Every project here walks through the reasoning, the
            options I turned down, what broke, and how I got past it.
          </p>

          <NuxtLink
            to="/about"
            class="label mt-6 inline-block text-accent transition-colors hover:text-ink"
          >
            More about me and how I write these →
          </NuxtLink>
        </ScrollReveal>
      </div>
    </section>

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

    <section v-else>
      <h2 class="label">Recent posts</h2>

      <div class="mt-4 border-b border-line">
        <ScrollReveal v-for="post in posts" :key="post.id">
          <PostCard :post="post" />
        </ScrollReveal>
      </div>
    </section>
  </div>
</template>
