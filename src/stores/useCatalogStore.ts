import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createDefaultFilters, type ProductFilters } from '@/types/Filter'
import type { SortOption } from '@/types/Sort'

export const useCatalogStore = defineStore('catalog', () => {
  const searchQuery = ref('')
  const activeCategory = ref<string | null>(null)
  const sort = ref<SortOption>('relevance')
  const filters = ref<ProductFilters>(createDefaultFilters())
  const viewMode = ref<'grid' | 'list'>('grid')

  const activeFilterCount = computed(() => {
    const f = filters.value
    let count = 0
    count += f.categories.length
    count += f.brands.length
    if (f.minRating > 0) count += 1
    if (f.inStockOnly) count += 1
    if (f.priceRange.min > 0 || f.priceRange.max < 1000) count += 1
    return count
  })

  function setCategory(category: string | null) {
    activeCategory.value = category
  }

  function setSort(next: SortOption) {
    sort.value = next
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function updateFilters(patch: Partial<ProductFilters>) {
    filters.value = { ...filters.value, ...patch }
  }

  function resetFilters() {
    filters.value = createDefaultFilters()
  }

  function toggleViewMode() {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  }

  return {
    searchQuery,
    activeCategory,
    sort,
    filters,
    viewMode,
    activeFilterCount,
    setCategory,
    setSort,
    setSearchQuery,
    updateFilters,
    resetFilters,
    toggleViewMode
  }
})
