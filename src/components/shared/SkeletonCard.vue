<script setup lang="ts">
withDefaults(defineProps<{ layout?: 'grid' | 'list' }>(), { layout: 'grid' })
</script>

<template>
  <div
    v-if="layout === 'grid'"
    class="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white"
  >
    <div class="aspect-square w-full bg-gray-200" />
    <div class="space-y-2 p-3">
      <div class="h-3 w-3/4 rounded bg-gray-200" />
      <div class="h-3 w-1/2 rounded bg-gray-200" />
      <div class="h-3 w-1/3 rounded bg-gray-200" />
    </div>
  </div>
  <div v-else class="flex animate-pulse gap-3 rounded-xl border border-gray-100 bg-white p-3">
    <div class="h-24 w-24 shrink-0 rounded-lg bg-gray-200" />
    <div class="flex-1 space-y-2 py-1">
      <div class="h-3 w-2/3 rounded bg-gray-200" />
      <div class="h-3 w-1/3 rounded bg-gray-200" />
      <div class="h-3 w-1/4 rounded bg-gray-200" />
    </div>
  </div>
</template>
