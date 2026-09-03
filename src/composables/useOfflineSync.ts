import { ref, onMounted, onUnmounted } from 'vue'
import { useOnline } from '@vueuse/core'
import { getOfflineQueue, removeOfflineAction } from '@/db/indexedDb'
import type { OfflineQueueAction } from '@/types/Cart'

/**
 * Watches connectivity and, once back online, flushes any queued offline
 * cart actions (stored in IndexedDB) by replaying them. In this mock-backend
 * app "replaying" simply means resolving each action; a real app would POST
 * them to the server here.
 */
export function useOfflineSync(onFlushAction?: (action: OfflineQueueAction) => Promise<void> | void) {
  const isOnline = useOnline()
  const isSyncing = ref(false)
  const pendingCount = ref(0)

  async function refreshPendingCount() {
    const queue = await getOfflineQueue()
    pendingCount.value = queue.length
  }

  async function flushQueue() {
    if (isSyncing.value) return
    isSyncing.value = true
    try {
      const queue = await getOfflineQueue()
      for (const action of queue) {
        try {
          await onFlushAction?.(action)
          await removeOfflineAction(action.id)
        } catch {
          // Leave the action queued for the next sync attempt.
        }
      }
    } finally {
      await refreshPendingCount()
      isSyncing.value = false
    }
  }

  let stopWatch: (() => void) | undefined

  onMounted(async () => {
    await refreshPendingCount()
    stopWatch = watchOnline()
  })

  function watchOnline() {
    const handler = () => {
      if (navigator.onLine) void flushQueue()
    }
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }

  onUnmounted(() => {
    stopWatch?.()
  })

  return { isOnline, isSyncing, pendingCount, flushQueue, refreshPendingCount }
}
