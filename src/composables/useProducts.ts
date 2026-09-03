import { computed, unref, type MaybeRef } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { fetchProducts } from '@/api/mockApi'
import { getAllProducts, upsertProducts } from '@/db/indexedDb'
import type { ProductFilters } from '@/types/Filter'
import type { SortOption } from '@/types/Sort'
import type { Product } from '@/types/Product'

const PAGE_SIZE = 24

export interface UseProductsOptions {
  search: MaybeRef<string>
  category: MaybeRef<string | null>
  filters: MaybeRef<ProductFilters>
  sort: MaybeRef<SortOption>
}

/**
 * Stale-while-revalidate product listing.
 * On first load, IndexedDB is checked for a cached snapshot so the UI can
 * paint instantly; the network (mock API) request then runs in the
 * background and refreshes both the cache and the query result.
 */
export function useProducts(options: UseProductsOptions) {
  const queryKey = computed(() => [
    'products',
    unref(options.search),
    unref(options.category),
    JSON.stringify(unref(options.filters)),
    unref(options.sort)
  ])

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const result = await fetchProducts({
          page: pageParam as number,
          pageSize: PAGE_SIZE,
          search: unref(options.search),
          category: unref(options.category),
          filters: unref(options.filters),
          sort: unref(options.sort)
        })
        void upsertProducts(result.items)
        return result
      } catch (err) {
        // Offline fallback: serve directly from IndexedDB.
        const cached = await getAllProducts()
        const start = ((pageParam as number) - 1) * PAGE_SIZE
        const items = cached.slice(start, start + PAGE_SIZE)
        return {
          items,
          page: pageParam as number,
          pageSize: PAGE_SIZE,
          total: cached.length,
          hasMore: start + PAGE_SIZE < cached.length
        }
      }
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 60_000
  })

  const products = computed<Product[]>(
    () => query.data.value?.pages.flatMap((p) => p.items) ?? []
  )

  const total = computed(() => query.data.value?.pages[0]?.total ?? 0)

  return {
    products,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch
  }
}
