<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const ready = useSupabaseReady()

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-line bg-surface/70 backdrop-blur">
      <div
        class="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6"
      >
        <NuxtLink
          to="/"
          class="font-serif text-xl font-semibold tracking-tight hover:text-accent"
        >
          The Blog
        </NuxtLink>

        <nav class="flex items-center gap-5 text-sm">
          <NuxtLink to="/" class="text-muted hover:text-ink">Posts</NuxtLink>

          <template v-if="ready">
            <template v-if="user">
              <NuxtLink to="/admin" class="text-muted hover:text-ink">
                Dashboard
              </NuxtLink>
              <button class="text-muted hover:text-ink" @click="signOut">
                Sign out
              </button>
            </template>
            <NuxtLink v-else to="/login" class="text-muted hover:text-ink">
              Sign in
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <slot />
    </main>

    <footer class="border-t border-line">
      <div class="mx-auto w-full max-w-3xl px-6 py-8 text-sm text-muted">
        Built with Nuxt and Supabase.
      </div>
    </footer>
  </div>
</template>
