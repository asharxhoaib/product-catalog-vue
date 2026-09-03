<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ProductFilters } from '@/types/Filter'

const props = defineProps<{
  modelValue: ProductFilters
  open: boolean
  categories: string[]
  brands: string[]
  priceCeiling?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductFilters): void
  (e: 'update:open', value: boolean): void
  (e: 'reset'): void
}>()

const local = reactive<ProductFilters>({
  categories: [...props.modelValue.categories],
  brands: [...props.modelValue.brands],
  priceRange: { ...props.modelValue.priceRange },
  minRating: props.modelValue.minRating,
  inStockOnly: props.modelValue.inStockOnly
})

watch(
  () => props.modelValue,
  (value) => {
    local.categories = [...value.categories]
    local.brands = [...value.brands]
    local.priceRange = { ...value.priceRange }
    local.minRating = value.minRating
    local.inStockOnly = value.inStockOnly
  },
  { deep: true }
)

function toggleFromList(list: string[], value: string) {
  const idx = list.indexOf(value)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(value)
}

function apply() {
  emit('update:modelValue', {
    categories: [...local.categories],
    brands: [...local.brands],
    priceRange: { ...local.priceRange },
    minRating: local.minRating,
    inStockOnly: local.inStockOnly
  })
  emit('update:open', false)
}

function close() {
  emit('update:open', false)
}

function resetAll() {
  emit('reset')
  emit('update:open', false)
}
</script>

<template>
  <Transition name="slide-over">
    <div v-if="open" class="fixed inset-0 z-40 flex justify-end">
      <div class="absolute inset-0 bg-black/30" @click="close" />
      <div class="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 class="text-base font-semibold text-gray-800">Filters</h2>
          <button class="text-sm text-gray-400" @click="close">Close</button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
          <section class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">Price range</h3>
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>${{ local.priceRange.min }}</span>
              <input
                v-model.number="local.priceRange.max"
                type="range"
                min="0"
                :max="priceCeiling ?? 1000"
                class="flex-1"
              />
              <span>${{ local.priceRange.max }}</span>
            </div>
          </section>

          <section class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">Category</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category"
                class="rounded-full border px-3 py-1 text-xs"
                :class="
                  local.categories.includes(category)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                "
                @click="toggleFromList(local.categories, category)"
              >
                {{ category }}
              </button>
            </div>
          </section>

          <section class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">Brand</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="brand in brands"
                :key="brand"
                class="rounded-full border px-3 py-1 text-xs"
                :class="
                  local.brands.includes(brand)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                "
                @click="toggleFromList(local.brands, brand)"
              >
                {{ brand }}
              </button>
            </div>
          </section>

          <section class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">Minimum rating</h3>
            <div class="flex gap-2">
              <button
                v-for="n in [0, 3, 3.5, 4, 4.5]"
                :key="n"
                class="rounded-full border px-3 py-1 text-xs"
                :class="
                  local.minRating === n
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                "
                @click="local.minRating = n"
              >
                {{ n === 0 ? 'Any' : `${n}+` }}
              </button>
            </div>
          </section>

          <section class="mb-6 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-700">In stock only</h3>
            <button
              class="h-6 w-11 rounded-full transition-colors"
              :class="local.inStockOnly ? 'bg-brand-600' : 'bg-gray-200'"
              @click="local.inStockOnly = !local.inStockOnly"
            >
              <span
                class="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform"
                :class="local.inStockOnly ? 'translate-x-5' : ''"
              />
            </button>
          </section>
        </div>

        <div class="flex gap-2 border-t border-gray-100 px-4 py-3">
          <button
            class="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600"
            @click="resetAll"
          >
            Reset
          </button>
          <button
            class="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white"
            @click="apply"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-over-enter-active,
.slide-over-leave-active {
  transition: opacity 0.2s ease;
}
.slide-over-enter-from,
.slide-over-leave-to {
  opacity: 0;
}
</style>
