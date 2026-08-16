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
    <p class="label">Authors only</p>
    <h1 class="display mt-3 text-4xl">Sign in</h1>

    <SetupNotice v-if="!ready" class="mt-10" />

    <form v-else class="mt-10 space-y-5" @submit.prevent="onSubmit">
      <div>
        <label for="email" class="label mb-2 block">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="field"
        />
      </div>

      <div>
        <label for="password" class="label mb-2 block">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="field"
        />
      </div>

      <p
        v-if="error"
        class="bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        {{ error }}
      </p>

      <button type="submit" :disabled="submitting" class="btn w-full">
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>
