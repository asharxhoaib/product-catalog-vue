import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useBroadcastChannel } from '@vueuse/core'

const CHANNEL_NAME = 'product-catalog-handoff'
const TAB_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export interface HandoffMessage {
  productId: string
  productName: string
  tabId: string
  timestamp: number
}

/**
 * Cross-tab "continue where you left off" handoff, built on VueUse's
 * `useBroadcastChannel`. `announceViewing` is called from the product
 * detail view whenever a product is viewed; other open tabs receive the
 * message.
 *
 * "Newly focused" handling: if the receiving tab is visible when the
 * broadcast arrives, the toast is surfaced immediately. If the tab is
 * hidden, the message is held and only surfaced once the tab regains
 * visibility (a real `visibilitychange` transition to visible) — i.e. once
 * it becomes the newly focused tab.
 */
export function useBroadcastHandoff() {
  const { data, post, isSupported } = useBroadcastChannel<HandoffMessage, HandoffMessage>({ name: CHANNEL_NAME })

  const incoming = ref<HandoffMessage | null>(null)
  const pending = ref<HandoffMessage | null>(null)

  function handleIncoming(message: HandoffMessage | undefined) {
    if (!message || message.tabId === TAB_ID) return
    if (document.visibilityState === 'visible') {
      incoming.value = message
    } else {
      pending.value = message
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && pending.value) {
      incoming.value = pending.value
      pending.value = null
    }
  }

  watch(data, (message) => handleIncoming(message))

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  function announceViewing(productId: string, productName: string) {
    if (!isSupported.value) return
    post({ productId, productName, tabId: TAB_ID, timestamp: Date.now() })
  }

  function dismiss() {
    incoming.value = null
  }

  return { incoming, announceViewing, dismiss, tabId: TAB_ID }
}
