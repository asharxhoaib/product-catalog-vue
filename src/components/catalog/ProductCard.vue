<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/types/Product'
import { useWishlistStore } from '@/stores/useWishlistStore'

const props = withDefaults(
  defineProps<{
    product: Product
    layout?: 'grid' | 'list'
  }>(),
  { layout: 'grid' }
)

const wishlistStore = useWishlistStore()
const imageLoaded = ref(false)
const imageErrored = ref(false)

function onToggleWishlist(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  void wishlistStore.toggleWishlist(props.product)
}

const discountPercent = props.product.salePrice
  ? Math.round(100 - (props.product.salePrice / props.product.price) * 100)
  : 0
</script>

<template>
  <RouterLink
    :to="`/product/${product.id}`"
    class="group relative flex overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    :class="layout === 'grid' ? 'flex-col' : 'flex-row items-stretch gap-3 p-2'"
  >
    <div
      class="relative shrink-0 overflow-hidden bg-gray-100"
      :class="layout === 'grid' ? 'aspect-square w-full' : 'h-24 w-24 rounded-lg'"
    >
      <div v-if="!imageLoaded && !imageErrored" class="absolute inset-0 animate-pulse bg-gray-200" />
      <img
        v-if="!imageErrored"
        :src="product.imageUrls[0]"
        :alt="product.name"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
        @load="imageLoaded = true"
        @error="imageErrored = true"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-xs text-gray-400">
        Image unavailable
      </div>
      <span
        v-if="discountPercent > 0"
        class="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white"
      >
        -{{ discountPercent }}%
      </span>
      <button
        class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm shadow"
        :aria-label="wishlistStore.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
        @click="onToggleWishlist"
      >
        <span :class="wishlistStore.isWishlisted(product.id) ? 'text-red-500' : 'text-gray-400'">♥</span>
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3" :class="layout === 'list' ? 'p-0 py-1' : ''">
      <p class="line-clamp-2 text-sm font-medium text-gray-800">{{ product.name }}</p>
      <p class="text-xs text-gray-400">{{ product.brand }}</p>
      <div class="flex items-center gap-1 text-xs text-amber-500">
        <span v-for="n in 5" :key="n">{{ n <= Math.round(product.rating) ? '★' : '☆' }}</span>
        <span class="text-gray-400">({{ product.ratingCount }})</span>
      </div>
      <div class="mt-auto flex items-center gap-2 pt-1">
        <span v-if="product.salePrice" class="text-sm font-semibold text-red-600">
          ${{ product.salePrice.toFixed(2) }}
        </span>
        <span
          class="text-sm"
          :class="product.salePrice ? 'text-gray-400 line-through' : 'font-semibold text-gray-800'"
        >
          ${{ product.price.toFixed(2) }}
        </span>
      </div>
      <p v-if="!product.inStock" class="text-xs font-medium text-gray-400">Out of stock</p>
    </div>
  </RouterLink>
</template>
