<script setup lang="ts">
defineProps<{ label: string }>()
const emit = defineEmits<{ (e: 'remove'): void }>()
</script>

<template>
  <button
    class="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
    @click="emit('remove')"
  >
    {{ label }}
    <span class="text-brand-400">×</span>
  </button>
</template>
