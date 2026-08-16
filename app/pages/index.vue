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

useHead({ title: 'The Blog' })
</script>

<template>
  <div>
    <header class="mb-12">
      <h1 class="font-serif text-4xl font-semibold tracking-tight">
        The Blog
      </h1>
      <p class="mt-2 text-muted">Writing about whatever I'm building.</p>
    </header>

    <SetupNotice v-if="!ready" />

    <p v-else-if="status === 'pending'" class="text-muted">Loading posts…</p>

    <p v-else-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
      Could not load posts: {{ error.message }}
    </p>

    <!-- The "write one" prompt is for the author only; to a visitor it would
         be a link straight into a login wall. -->
    <p v-else-if="!posts.length" class="text-muted">
      No posts yet.
      <NuxtLink v-if="user" to="/admin/new" class="text-accent underline">
        Write the first one.
      </NuxtLink>
    </p>

    <div v-else class="space-y-12">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>
