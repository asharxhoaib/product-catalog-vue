<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { SORT_LABELS, SORT_OPTIONS, type SortOption } from '@/types/Sort'

const props = defineProps<{ modelValue: SortOption }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: SortOption): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))

function select(option: SortOption) {
  emit('update:modelValue', option)
  open.value = false
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
      @click="open = !open"
    >
      Sort: {{ SORT_LABELS[props.modelValue] }}
      <span class="text-xs">▾</span>
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
    >
      <button
        v-for="option in SORT_OPTIONS"
        :key="option"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
        :class="option === props.modelValue ? 'font-semibold text-brand-700' : 'text-gray-600'"
        @click="select(option)"
      >
        {{ SORT_LABELS[option] }}
      </button>
    </div>
  </div>
</template>
