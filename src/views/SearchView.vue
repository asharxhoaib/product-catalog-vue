<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import SearchBar from '@/components/search/SearchBar.vue'
import SearchSuggestions from '@/components/search/SearchSuggestions.vue'
import ProductGrid from '@/components/catalog/ProductGrid.vue'
import { searchRemote, POPULAR_SEARCH_TERMS, getAllCategories } from '@/api/mockApi'
import { searchProductsLocal } from '@/db/indexedDb'
import type { Product } from '@/types/Product'

const route = useRoute()
const router = useRouter()

const query = ref((route.query.q as string) ?? '')
const scope = ref<string>((route.query.category as string) ?? 'all')
const categories = getAllCategories()

const RECENT_KEY = 'pcv-recent-searches'
const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'))

function saveRecent(term: string) {
  if (!term.trim()) return
  const next = [term, ...recentSearches.value.filter((t) => t !== term)].slice(0, 8)
  recentSearches.value = next
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function clearRecent() {
  recentSearches.value = []
  localStorage.removeItem(RECENT_KEY)
}

watch([query, scope], ([q, s]) => {
  router.replace({ query: { ...(q ? { q } : {}), ...(s !== 'all' ? { category: s } : {}) } })
})

onMounted(() => {
  if (route.query.q) query.value = route.query.q as string
})

const searchQuery = useQuery({
  queryKey: computed(() => ['search', query.value, scope.value]),
  queryFn: async (): Promise<Product[]> => {
    const [remote, local] = await Promise.all([
      searchRemote(query.value).catch(() => [] as Product[]),
      searchProductsLocal(query.value)
    ])
    const merged = new Map<string, Product>()
    ;[...remote, ...local].forEach((p) => merged.set(p.id, p))
    let results = Array.from(merged.values())
    if (scope.value !== 'all') {
      results = results.filter((p) => p.category === scope.value)
    }
    if (query.value.trim()) saveRecent(query.value.trim())
    return results
  },
  enabled: computed(() => query.value.trim().length > 0)
})

function selectTerm(term: string) {
  query.value = term
}

const results = computed(() => searchQuery.data.value ?? [])
</script>

<template>
  <div class="p-4">
    <div class="flex items-center gap-2">
      <SearchBar v-model="query" class="flex-1" />
      <select
        v-model="scope"
        class="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-600"
      >
        <option value="all">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <SearchSuggestions
      v-if="!query.trim()"
      :recent="recentSearches"
      :popular="POPULAR_SEARCH_TERMS"
      @select="selectTerm"
      @clear-recent="clearRecent"
    />

    <div v-else class="mt-4">
      <p class="mb-2 text-xs text-gray-400">{{ results.length }} results for "{{ query }}"</p>
      <ProductGrid :products="results" layout="grid" :is-loading="searchQuery.isLoading.value" />
    </div>
  </div>
</template>
