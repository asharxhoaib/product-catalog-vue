export interface PriceRange {
  min: number
  max: number
}

export interface ProductFilters {
  categories: string[]
  brands: string[]
  priceRange: PriceRange
  minRating: number
  inStockOnly: boolean
}

export function createDefaultFilters(priceCeiling = 1000): ProductFilters {
  return {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: priceCeiling },
    minRating: 0,
    inStockOnly: false
  }
}

export interface ActiveFilterChip {
  key: string
  label: string
  clear: () => void
}
