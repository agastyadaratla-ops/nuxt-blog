<script setup lang="ts">
const ready = useSupabaseReady()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

const destination = computed(() => String(route.query.redirect || '/admin'))

// Covers both "already signed in" and "just signed in" — the module keeps
// `user` reactive, so one watcher handles the redirect for both cases.
watch(
  user,
  (value) => {
    if (value) navigateTo(destination.value)
  },
  { immediate: true },
)

async function onSubmit() {
  submitting.value = true
  error.value = null

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })

  if (signInError) error.value = signInError.message
  submitting.value = false
}

// Unlinked from the site, so keep it out of search results too. This is
// obscurity, not security — the actual protection is Supabase auth plus the
// RLS policies, which hold regardless of who finds this page.
useHead({
  title: 'Sign in',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <div class="mx-auto max-w-sm">
    <h1 class="font-serif text-3xl font-semibold">Sign in</h1>
    <p class="mt-2 text-muted">Author access only.</p>

    <SetupNotice v-if="!ready" class="mt-8" />

    <form v-else class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-muted">Email</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-md border border-line bg-surface px-3 py-2 focus:border-accent focus:outline-none"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm font-medium text-muted">Password</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-md border border-line bg-surface px-3 py-2 focus:border-accent focus:outline-none"
        />
      </label>

      <p v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-700">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-accent disabled:opacity-40"
      >
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
