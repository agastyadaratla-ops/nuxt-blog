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
    <header class="border-b border-line">
      <div
        class="mx-auto flex h-20 w-full max-w-5xl items-center justify-between gap-6 px-6"
      >
        <NuxtLink
          to="/"
          class="display text-xl transition-colors hover:text-accent"
        >
          Agastya Daratla
        </NuxtLink>

        <!--
          No sign-in link. Visitors should never see a way in — /login is
          reachable only by typing the URL. Author controls appear once a
          session exists.
        -->
        <nav class="flex items-center gap-6">
          <NuxtLink to="/" class="label transition-colors hover:text-ink">
            Posts
          </NuxtLink>
          <NuxtLink to="/about" class="label transition-colors hover:text-ink">
            About
          </NuxtLink>

          <template v-if="ready && user">
            <NuxtLink
              to="/admin"
              class="label transition-colors hover:text-ink"
            >
              Dashboard
            </NuxtLink>
            <button
              type="button"
              class="label transition-colors hover:text-ink"
              @click="signOut"
            >
              Sign out
            </button>
          </template>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <slot />
    </main>

    <footer class="mt-auto border-t border-line">
      <div
        class="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-8"
      >
        <p class="label">Built with Nuxt and Supabase</p>
        <p class="label">© {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>
