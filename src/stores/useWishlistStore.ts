import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/Product'
import { getMeta, setMeta } from '@/db/indexedDb'

const WISHLIST_META_KEY = 'wishlist-ids'

export const useWishlistStore = defineStore('wishlist', () => {
  const productsById = ref<Map<string, Product>>(new Map())
  const initialized = ref(false)

  const items = computed(() => Array.from(productsById.value.values()))
  const count = computed(() => productsById.value.size)

  function isWishlisted(productId: string): boolean {
    return productsById.value.has(productId)
  }

  async function persist() {
    await setMeta(WISHLIST_META_KEY, Array.from(productsById.value.values()))
  }

  async function init() {
    if (initialized.value) return
    const stored = (await getMeta<Product[]>(WISHLIST_META_KEY)) ?? []
    productsById.value = new Map(stored.map((p) => [p.id, p]))
    initialized.value = true
  }

  async function toggleWishlist(product: Product) {
    if (productsById.value.has(product.id)) {
      productsById.value.delete(product.id)
    } else {
      productsById.value.set(product.id, product)
    }
    // trigger reactivity for Map
    productsById.value = new Map(productsById.value)
    await persist()
  }

  async function removeFromWishlist(productId: string) {
    productsById.value.delete(productId)
    productsById.value = new Map(productsById.value)
    await persist()
  }

  return { items, count, isWishlisted, toggleWishlist, removeFromWishlist, init }
})
