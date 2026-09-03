<script setup lang="ts">
import { ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const local = ref(props.modelValue)
const debounced = refDebounced(local, 300)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== local.value) local.value = v
  }
)

watch(debounced, (v) => emit('update:modelValue', v))

function clear() {
  local.value = ''
}
</script>

<template>
  <div class="relative">
    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
    <input
      v-model="local"
      type="search"
      :placeholder="placeholder ?? 'Search products…'"
      class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm focus:border-brand-500 focus:outline-none"
    />
    <button
      v-if="local"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      aria-label="Clear search"
      @click="clear"
    >
      ×
    </button>
  </div>
</template>
