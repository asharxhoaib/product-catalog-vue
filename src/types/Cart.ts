export interface CartLineItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  imageUrl: string
  unitPrice: number
  quantity: number
  addedAt: number
}

export type OfflineActionType = 'add-to-cart' | 'update-quantity' | 'remove-from-cart'

export interface OfflineQueueAction {
  id: string
  type: OfflineActionType
  payload: Record<string, unknown>
  createdAt: number
}
