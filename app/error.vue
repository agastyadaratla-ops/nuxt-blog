<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useHead({ title: `${props.error.statusCode}` })
</script>

<template>
  <NuxtLayout>
    <div class="grid gap-x-6 gap-y-4 py-10 md:grid-cols-12">
      <p class="label md:col-span-3 md:pt-4">Error {{ error.statusCode }}</p>

      <div class="md:col-span-9">
        <h1 class="display text-4xl sm:text-5xl">
          {{ error.statusMessage || 'Something went wrong.' }}
        </h1>

        <button type="button" class="btn mt-10" @click="clearError({ redirect: '/' })">
          Back to the blog
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>
