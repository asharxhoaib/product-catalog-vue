<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Product } from '@/types/Product'

defineProps<{ products: Product[] }>()
</script>

<template>
  <section v-if="products.length" class="py-4">
    <h2 class="mb-2 px-4 text-sm font-semibold text-gray-700">You may also like</h2>
    <div class="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
      <RouterLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="w-36 shrink-0 rounded-xl border border-gray-100 bg-white p-2"
      >
        <div class="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            :src="product.imageUrls[0]"
            :alt="product.name"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>
        <p class="mt-1.5 line-clamp-2 text-xs text-gray-700">{{ product.name }}</p>
        <p class="text-xs font-semibold text-gray-800">
          ${{ (product.salePrice ?? product.price).toFixed(2) }}
        </p>
      </RouterLink>
    </div>
  </section>
</template>
