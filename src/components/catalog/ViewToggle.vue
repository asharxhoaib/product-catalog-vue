<script setup lang="ts">
defineProps<{ modelValue: 'grid' | 'list' }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: 'grid' | 'list'): void }>()
</script>

<template>
  <div class="flex overflow-hidden rounded-lg border border-gray-200">
    <button
      class="px-2.5 py-1.5 text-sm"
      :class="modelValue === 'grid' ? 'bg-brand-600 text-white' : 'bg-white text-gray-500'"
      aria-label="Grid view"
      @click="emit('update:modelValue', 'grid')"
    >
      ▦
    </button>
    <button
      class="px-2.5 py-1.5 text-sm"
      :class="modelValue === 'list' ? 'bg-brand-600 text-white' : 'bg-white text-gray-500'"
      aria-label="List view"
      @click="emit('update:modelValue', 'list')"
    >
      ☰
    </button>
  </div>
</template>
