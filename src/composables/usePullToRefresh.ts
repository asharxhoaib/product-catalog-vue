import { ref } from 'vue'

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<unknown> | unknown
  threshold?: number
}

/**
 * Minimal touch-based pull-to-refresh for mobile. Attach the returned
 * handlers to a scroll container's touch events; `pullDistance` and
 * `isRefreshing` drive the visual indicator.
 */
export function usePullToRefresh(options: UsePullToRefreshOptions) {
  const { onRefresh, threshold = 70 } = options
  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  let startY = 0
  let tracking = false

  function onTouchStart(event: TouchEvent) {
    const container = event.currentTarget as HTMLElement
    if (container.scrollTop > 0) return
    startY = event.touches[0].clientY
    tracking = true
  }

  function onTouchMove(event: TouchEvent) {
    if (!tracking || isRefreshing.value) return
    const delta = event.touches[0].clientY - startY
    if (delta > 0) {
      pullDistance.value = Math.min(delta * 0.5, threshold * 1.6)
    }
  }

  async function onTouchEnd() {
    if (!tracking) return
    tracking = false
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
      }
    }
    pullDistance.value = 0
  }

  return { pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd }
}
