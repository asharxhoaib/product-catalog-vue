<script setup lang="ts">
import { computed } from 'vue'
import type { ProductVariant } from '@/types/Product'

const props = defineProps<{
  variants: ProductVariant[]
  modelValue: ProductVariant | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: ProductVariant | null): void }>()

const colors = computed(() =>
  Array.from(new Set(props.variants.map((v) => v.color).filter(Boolean))) as string[]
)
const sizes = computed(() =>
  Array.from(new Set(props.variants.map((v) => v.size).filter(Boolean))) as string[]
)

function selectColor(color: string) {
  const size = props.modelValue?.size
  const match =
    props.variants.find((v) => v.color === color && v.size === size) ??
    props.variants.find((v) => v.color === color)
  emit('update:modelValue', match ?? null)
}

function selectSize(size: string) {
  const color = props.modelValue?.color
  const match =
    props.variants.find((v) => v.size === size && v.color === color) ??
    props.variants.find((v) => v.size === size)
  emit('update:modelValue', match ?? null)
}
</script>

<template>
  <div v-if="variants.length" class="space-y-3">
    <div v-if="colors.length">
      <p class="mb-1.5 text-xs font-semibold uppercase text-gray-500">Color</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in colors"
          :key="color"
          class="rounded-full border px-3 py-1 text-sm"
          :class="
            modelValue?.color === color
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-gray-200 text-gray-600'
          "
          @click="selectColor(color)"
        >
          {{ color }}
        </button>
      </div>
    </div>

    <div v-if="sizes.length">
      <p class="mb-1.5 text-xs font-semibold uppercase text-gray-500">Size</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in sizes"
          :key="size"
          class="h-9 min-w-9 rounded-lg border px-2 text-sm"
          :class="
            modelValue?.size === size
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-gray-200 text-gray-600'
          "
          @click="selectSize(size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <p v-if="modelValue && modelValue.stock <= 5" class="text-xs text-amber-600">
      Only {{ modelValue.stock }} left in this variant
    </p>
  </div>
</template>
