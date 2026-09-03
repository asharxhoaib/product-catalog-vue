export interface ProductVariant {
  id: string
  color?: string
  size?: string
  stock: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number | null
  rating: number
  ratingCount: number
  imageUrls: string[]
  category: string
  brand: string
  inStock: boolean
  variants: ProductVariant[]
  tags: string[]
  lastFetched: number
}

export interface RecentlyViewedEntry {
  id: string
  product: Product
  viewedAt: number
}
