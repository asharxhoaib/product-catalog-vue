<script setup lang="ts">
import { useCartStore } from '@/stores/useCartStore'
import { useOfflineSync } from '@/composables/useOfflineSync'

const cartStore = useCartStore()
const { isOnline, isSyncing, pendingCount, flushQueue } = useOfflineSync(async (action) => {
  // In a real backend this would replay the action against the server.
  console.info('Synced offline action', action)
})
</script>

<template>
  <div class="p-4 pb-28">
    <h1 class="mb-4 text-lg font-bold text-gray-900">Cart</h1>

    <div
      v-if="!isOnline || pendingCount > 0"
      class="mb-4 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700"
    >
      <span>
        <template v-if="!isOnline">You're offline. Cart changes will sync automatically.</template>
        <template v-else>{{ pendingCount }} action(s) waiting to sync.</template>
      </span>
      <button v-if="isOnline && pendingCount > 0" class="font-semibold" :disabled="isSyncing" @click="flushQueue">
        {{ isSyncing ? 'Syncing…' : 'Sync now' }}
      </button>
    </div>

    <div v-if="cartStore.items.length === 0" class="py-16 text-center text-sm text-gray-400">
      Your cart is empty.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in cartStore.items"
        :key="item.id"
        class="flex gap-3 rounded-xl border border-gray-100 bg-white p-3"
      >
        <img :src="item.imageUrl" :alt="item.name" class="h-20 w-20 shrink-0 rounded-lg object-cover" />
        <div class="flex flex-1 flex-col justify-between">
          <div>
            <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
            <p class="text-sm text-gray-500">${{ item.unitPrice.toFixed(2) }}</p>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center rounded-lg border border-gray-200">
              <button
                class="px-2.5 py-1 text-gray-500"
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              >
                −
              </button>
              <span class="w-6 text-center text-xs">{{ item.quantity }}</span>
              <button
                class="px-2.5 py-1 text-gray-500"
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              >
                +
              </button>
            </div>
            <button class="text-xs text-red-500" @click="cartStore.removeItem(item.id)">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="cartStore.items.length > 0"
      class="fixed inset-x-0 bottom-16 z-20 border-t border-gray-100 bg-white p-4 lg:static lg:mt-6 lg:rounded-xl lg:border"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Subtotal</span>
        <span class="font-semibold text-gray-900">${{ cartStore.subtotal.toFixed(2) }}</span>
      </div>
      <button class="mt-3 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white">
        Checkout
      </button>
    </div>
  </div>
</template>
