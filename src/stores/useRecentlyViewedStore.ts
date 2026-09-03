import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, RecentlyViewedEntry } from '@/types/Product'
import { addRecentlyViewed, getRecentlyViewed, clearRecentlyViewed } from '@/db/indexedDb'

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  const entries = ref<RecentlyViewedEntry[]>([])
  const loaded = ref(false)

  async function load() {
    entries.value = await getRecentlyViewed()
    loaded.value = true
  }

  async function recordView(product: Product) {
    entries.value = await addRecentlyViewed(product)
  }

  async function clear() {
    await clearRecentlyViewed()
    entries.value = []
  }

  return { entries, loaded, load, recordView, clear }
})
