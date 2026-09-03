<script setup lang="ts">
defineProps<{
  categories: string[]
  activeCategory: string | null
}>()

const emit = defineEmits<{ (e: 'select', category: string | null): void }>()
</script>

<template>
  <div class="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
    <button
      class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
      :class="
        activeCategory === null
          ? 'bg-brand-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      "
      @click="emit('select', null)"
    >
      All
    </button>
    <button
      v-for="category in categories"
      :key="category"
      class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
      :class="
        activeCategory === category
          ? 'bg-brand-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      "
      @click="emit('select', category)"
    >
      {{ category }}
    </button>
  </div>
</template>
