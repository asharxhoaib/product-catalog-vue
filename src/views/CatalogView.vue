<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCatalogStore } from '@/stores/useCatalogStore'
import { useProducts } from '@/composables/useProducts'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { getAllCategories, getAllBrands } from '@/api/mockApi'
import ProductGrid from '@/components/catalog/ProductGrid.vue'
import CategoryTabs from '@/components/catalog/CategoryTabs.vue'
import SortMenu from '@/components/catalog/SortMenu.vue'
import ViewToggle from '@/components/catalog/ViewToggle.vue'
import FilterPanel from '@/components/catalog/FilterPanel.vue'
import FilterChip from '@/components/catalog/FilterChip.vue'
import RecentlyViewedRail from '@/components/shared/RecentlyViewedRail.vue'
import { useMediaQuery } from '@vueuse/core'

const catalogStore = useCatalogStore()
const categories = getAllCategories()
const brands = getAllBrands()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const filterPanelOpen = ref(false)

const search = computed(() => catalogStore.searchQuery)
const category = computed(() => catalogStore.activeCategory)
const filters = computed(() => catalogStore.filters)
const sort = computed(() => catalogStore.sort)

const {
  products,
  total,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetch
} = useProducts({ search, category, filters, sort })

const { pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh({
  onRefresh: () => refetch()
})

function loadMore() {
  if (hasNextPage.value) void fetchNextPage()
}

const filterChips = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = []
  const f = catalogStore.filters
  f.categories.forEach((c) =>
    chips.push({
      key: `cat-${c}`,
      label: c,
      clear: () => catalogStore.updateFilters({ categories: f.categories.filter((x) => x !== c) })
    })
  )
  f.brands.forEach((b) =>
    chips.push({
      key: `brand-${b}`,
      label: b,
      clear: () => catalogStore.updateFilters({ brands: f.brands.filter((x) => x !== b) })
    })
  )
  if (f.minRating > 0) {
    chips.push({
      key: 'rating',
      label: `${f.minRating}+ stars`,
      clear: () => catalogStore.updateFilters({ minRating: 0 })
    })
  }
  if (f.inStockOnly) {
    chips.push({
      key: 'stock',
      label: 'In stock',
      clear: () => catalogStore.updateFilters({ inStockOnly: false })
    })
  }
  return chips
})
</script>

<template>
  <div
    class="min-h-full"
    @touchstart="!isDesktop && onTouchStart($event)"
    @touchmove="!isDesktop && onTouchMove($event)"
    @touchend="!isDesktop && onTouchEnd()"
  >
    <div
      v-if="pullDistance > 0 || isRefreshing"
      class="flex items-center justify-center py-2 text-xs text-gray-400"
      :style="{ height: `${pullDistance}px` }"
    >
      {{ isRefreshing ? 'Refreshing…' : 'Pull to refresh' }}
    </div>

    <header class="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 backdrop-blur">
      <div class="flex items-center justify-between gap-2 px-4 pt-4">
        <h1 class="text-lg font-bold text-gray-900">Catalog</h1>
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
            @click="filterPanelOpen = true"
          >
            Filters
          </button>
          <SortMenu v-model="catalogStore.sort" />
          <ViewToggle v-model="catalogStore.viewMode" />
        </div>
      </div>
      <CategoryTabs
        :categories="categories"
        :active-category="catalogStore.activeCategory"
        @select="catalogStore.setCategory"
      />
      <div v-if="filterChips.length" class="flex flex-wrap gap-2 px-4 pb-3">
        <FilterChip
          v-for="chip in filterChips"
          :key="chip.key"
          :label="chip.label"
          @remove="chip.clear"
        />
        <button class="text-xs text-gray-400 underline" @click="catalogStore.resetFilters">
          Clear all
        </button>
      </div>
    </header>

    <RecentlyViewedRail />

    <div class="px-4 py-2 text-xs text-gray-400">{{ total }} products</div>

    <div class="px-4 pb-8">
      <ProductGrid
        :products="products"
        :layout="catalogStore.viewMode"
        :is-loading="isLoading"
        :is-fetching-next-page="isFetchingNextPage"
        :has-next-page="hasNextPage"
        @load-more="loadMore"
      />
    </div>

    <FilterPanel
      v-model="catalogStore.filters"
      v-model:open="filterPanelOpen"
      :categories="categories"
      :brands="brands"
      :price-ceiling="300"
      @reset="catalogStore.resetFilters"
    />
  </div>
</template>
