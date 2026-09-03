<script setup lang="ts">
defineProps<{
  recent: string[]
  popular: string[]
}>()
const emit = defineEmits<{
  (e: 'select', term: string): void
  (e: 'clear-recent'): void
}>()
</script>

<template>
  <div class="space-y-4 px-4 py-3">
    <div v-if="recent.length">
      <div class="mb-1.5 flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase text-gray-400">Recent</h3>
        <button class="text-xs text-brand-600" @click="emit('clear-recent')">Clear</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="term in recent"
          :key="term"
          class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
          @click="emit('select', term)"
        >
          {{ term }}
        </button>
      </div>
    </div>

    <div>
      <h3 class="mb-1.5 text-xs font-semibold uppercase text-gray-400">Popular</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="term in popular"
          :key="term"
          class="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700"
          @click="emit('select', term)"
        >
          {{ term }}
        </button>
      </div>
    </div>
  </div>
</template>
