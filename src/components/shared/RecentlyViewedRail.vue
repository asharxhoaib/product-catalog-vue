<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'

const store = useRecentlyViewedStore()
</script>

<template>
  <section v-if="store.entries.length" class="px-4 py-3">
    <h2 class="mb-2 text-sm font-semibold text-gray-700">Recently viewed</h2>
    <div class="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      <RouterLink
        v-for="entry in store.entries"
        :key="entry.id"
        :to="`/product/${entry.product.id}`"
        class="w-28 shrink-0"
      >
        <div class="aspect-square w-28 overflow-hidden rounded-lg bg-gray-100">
          <img
            :src="entry.product.imageUrls[0]"
            :alt="entry.product.name"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>
        <p class="mt-1 line-clamp-2 text-xs text-gray-600">{{ entry.product.name }}</p>
      </RouterLink>
    </div>
  </section>
</template>
