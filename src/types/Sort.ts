export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'rating-desc': 'Top Rated',
  newest: 'Newest'
}

export const SORT_OPTIONS: SortOption[] = [
  'relevance',
  'price-asc',
  'price-desc',
  'rating-desc',
  'newest'
]
