import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartLineItem, OfflineQueueAction } from '@/types/Cart'
import type { Product, ProductVariant } from '@/types/Product'
import { enqueueOfflineAction } from '@/db/indexedDb'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartLineItem[]>([])

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  )

  async function addToCart(
    product: Product,
    variant: ProductVariant | null,
    quantity: number,
    isOffline = false
  ) {
    const unitPrice = product.salePrice ?? product.price
    const existing = items.value.find(
      (i) => i.productId === product.id && i.variantId === (variant?.id ?? null)
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        id: uid(),
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        imageUrl: product.imageUrls[0],
        unitPrice,
        quantity,
        addedAt: Date.now()
      })
    }

    if (isOffline) {
      const action: OfflineQueueAction = {
        id: uid(),
        type: 'add-to-cart',
        payload: { productId: product.id, variantId: variant?.id ?? null, quantity },
        createdAt: Date.now()
      }
      await enqueueOfflineAction(action)
    }
  }

  function updateQuantity(lineId: string, quantity: number) {
    const item = items.value.find((i) => i.id === lineId)
    if (!item) return
    if (quantity <= 0) {
      removeItem(lineId)
      return
    }
    item.quantity = quantity
  }

  function removeItem(lineId: string) {
    items.value = items.value.filter((i) => i.id !== lineId)
  }

  function clearCart() {
    items.value = []
  }

  return { items, itemCount, subtotal, addToCart, updateQuantity, removeItem, clearCart }
})
