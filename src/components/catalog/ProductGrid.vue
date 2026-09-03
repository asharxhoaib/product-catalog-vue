<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import type { Product } from '@/types/Product'
import ProductCard from './ProductCard.vue'
import SkeletonCard from '@/components/shared/SkeletonCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const props = withDefaults(
  defineProps<{
    products: Product[]
    layout?: 'grid' | 'list'
    isLoading?: boolean
    isFetchingNextPage?: boolean
    hasNextPage?: boolean
  }>(),
  { layout: 'grid', isLoading: false, isFetchingNextPage: false, hasNextPage: false }
)

const emit = defineEmits<{ (e: 'load-more'): void }>()

const sentinel = ref<HTMLElement | null>(null)
const hasNextPageRef = toRef(props, 'hasNextPage')
const isFetchingNextPageRef = toRef(props, 'isFetchingNextPage')

useInfiniteScroll({
  target: sentinel,
  hasMore: hasNextPageRef,
  isFetching: isFetchingNextPageRef,
  onLoadMore: () => emit('load-more')
})
</script>

<template>
  <div>
    <div
      v-if="layout === 'grid'"
      class="grid gap-3"
      style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))"
    >
      <template v-if="isLoading">
        <SkeletonCard v-for="n in 12" :key="`s-${n}`" layout="grid" />
      </template>
      <template v-else>
        <template v-for="(product, idx) in products" :key="product.id">
          <div v-if="idx === products.length - 1" ref="sentinel">
            <ProductCard :product="product" layout="grid" />
          </div>
          <ProductCard v-else :product="product" layout="grid" />
        </template>
      </template>
    </div>

    <div v-else class="flex flex-col gap-2">
      <template v-if="isLoading">
        <SkeletonCard v-for="n in 8" :key="`sl-${n}`" layout="list" />
      </template>
      <template v-else>
        <template v-for="(product, idx) in products" :key="product.id">
          <div v-if="idx === products.length - 1" ref="sentinel">
            <ProductCard :product="product" layout="list" />
          </div>
          <ProductCard v-else :product="product" layout="list" />
        </template>
      </template>
    </div>

    <div v-if="isFetchingNextPage" class="flex justify-center py-4 text-sm text-gray-400">
      Loading more…
    </div>
    <div v-if="!isLoading && products.length === 0" class="py-16 text-center text-gray-400">
      No products found.
    </div>
  </div>
</template>
