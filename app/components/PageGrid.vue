<template>
  <!--
    The Swiss grid, made visible across the whole page rather than only behind
    a masthead. Fixed rather than absolute so it reads as paper the content
    moves over, and so it never needs a scroll handler.

    Lines land on the container edges and every third column of the 12-column
    grid, which is why they line up with the date column in the post list.
  -->
  <div
    class="pointer-events-none fixed inset-0 z-0 flex justify-center"
    aria-hidden="true"
  >
    <div class="flex w-full max-w-5xl justify-between px-6">
      <span v-for="n in 5" :key="n" class="block w-px bg-line/70" />
    </div>
  </div>
</template>
