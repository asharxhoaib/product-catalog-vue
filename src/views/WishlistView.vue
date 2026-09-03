<script setup lang="ts">
import { onMounted } from 'vue'
import { useWishlistStore } from '@/stores/useWishlistStore'
import ProductGrid from '@/components/catalog/ProductGrid.vue'

const wishlistStore = useWishlistStore()

onMounted(() => {
  void wishlistStore.init()
})
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-lg font-bold text-gray-900">Wishlist</h1>
    <ProductGrid
      :products="wishlistStore.items"
      layout="grid"
      :is-loading="false"
      :has-next-page="false"
    />
  </div>
</template>
