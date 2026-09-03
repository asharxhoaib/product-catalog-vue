import type { Product } from '@/types/Product'
import type { ProductFilters } from '@/types/Filter'

/**
 * Pure predicate factory used to filter an in-memory product list on the
 * client (complements the server-side filtering already applied by the
 * mock API, and is reused for filtering cached/offline data).
 */
export function createFilterPredicate(filters: ProductFilters) {
  return (product: Product): boolean => {
    if (filters.categories.length && !filters.categories.includes(product.category)) {
      return false
    }
    if (filters.brands.length && !filters.brands.includes(product.brand)) {
      return false
    }
    const price = product.salePrice ?? product.price
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false
    }
    if (filters.minRating > 0 && product.rating < filters.minRating) {
      return false
    }
    if (filters.inStockOnly && !product.inStock) {
      return false
    }
    return true
  }
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(createFilterPredicate(filters))
}
