import { type Ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export interface UseInfiniteScrollOptions {
  target: Ref<HTMLElement | null | undefined>
  hasMore: Ref<boolean>
  isFetching: Ref<boolean>
  onLoadMore: () => void
  rootMargin?: string
}

/**
 * Observes a sentinel element (typically the last card in the grid) and
 * triggers `onLoadMore` when it enters the viewport, as long as there is
 * more data and a fetch isn't already in flight.
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { target, hasMore, isFetching, onLoadMore, rootMargin = '400px' } = options

  const { stop, pause, resume } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isFetching.value) {
        onLoadMore()
      }
    },
    { rootMargin }
  )

  watch(hasMore, (value) => {
    if (!value) pause()
    else resume()
  })

  return { stop, pause, resume }
}
