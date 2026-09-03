import { computed, unref, type MaybeRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchProductById, fetchRelatedProducts } from '@/api/mockApi'
import { getProduct, upsertProduct } from '@/db/indexedDb'
import type { Product } from '@/types/Product'

export function useProductDetail(productId: MaybeRef<string>) {
  const query = useQuery({
    queryKey: computed(() => ['product', unref(productId)]),
    queryFn: async (): Promise<Product> => {
      const id = unref(productId)
      try {
        const fresh = await fetchProductById(id)
        if (fresh) {
          await upsertProduct(fresh)
          return fresh
        }
        throw new Error('Product not found remotely')
      } catch (err) {
        const cached = await getProduct(id)
        if (cached) return cached
        throw err
      }
    },
    // Show cached data instantly via IndexedDB while the network call resolves.
    placeholderData: (previous) => previous,
    staleTime: 30_000
  })

  const relatedQuery = useQuery({
    queryKey: computed(() => ['related', unref(productId)]),
    queryFn: () => fetchRelatedProducts(unref(productId)),
    enabled: computed(() => !!unref(productId))
  })

  return {
    product: computed(() => query.data.value ?? null),
    isLoading: query.isLoading,
    isError: query.isError,
    related: computed(() => relatedQuery.data.value ?? []),
    isRelatedLoading: relatedQuery.isLoading
  }
}
