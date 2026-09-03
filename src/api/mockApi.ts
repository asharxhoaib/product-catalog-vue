import type { Product } from '@/types/Product'
import type { ProductFilters } from '@/types/Filter'
import type { SortOption } from '@/types/Sort'

// ---- deterministic pseudo-random generator (mulberry32) ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CATEGORIES = [
  'Sneakers',
  'Apparel',
  'Accessories',
  'Home',
  'Electronics',
  'Beauty',
  'Outdoors',
  'Toys'
]

const BRANDS = ['Aero', 'Nimbus', 'Kestrel', 'Voyage', 'Orbit', 'Fable', 'Lumen', 'Cinder']

const ADJECTIVES = [
  'Classic',
  'Modern',
  'Vintage',
  'Ultra',
  'Pro',
  'Eco',
  'Urban',
  'Alpine',
  'Compact',
  'Signature'
]

const NOUNS = [
  'Runner',
  'Jacket',
  'Backpack',
  'Watch',
  'Lamp',
  'Speaker',
  'Mug',
  'Chair',
  'Tent',
  'Headphones'
]

const TOTAL_PRODUCTS = 240

function seededImage(seed: number, index: number): string {
  return `https://picsum.photos/seed/pcv-${seed}-${index}/640/640`
}

function generateCatalog(): Product[] {
  const rand = mulberry32(42)
  const products: Product[] = []
  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)]
    const brand = BRANDS[Math.floor(rand() * BRANDS.length)]
    const adjective = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(rand() * NOUNS.length)]
    const basePrice = Math.round((10 + rand() * 240) * 100) / 100
    const onSale = rand() < 0.3
    const salePrice = onSale ? Math.round(basePrice * (0.6 + rand() * 0.25) * 100) / 100 : null
    const rating = Math.round((2.5 + rand() * 2.5) * 10) / 10
    const ratingCount = Math.floor(5 + rand() * 950)
    const inStock = rand() > 0.12
    const hasVariants = rand() > 0.4
    const colors = ['Black', 'White', 'Navy', 'Olive', 'Rust']
    const sizes = ['XS', 'S', 'M', 'L', 'XL']
    const variants = hasVariants
      ? Array.from({ length: 2 + Math.floor(rand() * 3) }).map((_, vIdx) => ({
          id: `v${i}-${vIdx}`,
          color: colors[Math.floor(rand() * colors.length)],
          size: sizes[Math.floor(rand() * sizes.length)],
          stock: Math.floor(rand() * 40)
        }))
      : []

    products.push({
      id: `p${i + 1}`,
      name: `${adjective} ${noun} ${i + 1}`,
      description: `The ${adjective} ${noun} from ${brand} combines durable materials with a refined silhouette. Designed for everyday performance in the ${category.toLowerCase()} category, it pairs comfort with a considered aesthetic that holds up to daily use.`,
      price: basePrice,
      salePrice,
      rating,
      ratingCount,
      imageUrls: [
        seededImage(i + 1, 1),
        seededImage(i + 1, 2),
        seededImage(i + 1, 3),
        seededImage(i + 1, 4)
      ],
      category,
      brand,
      inStock,
      variants,
      tags: [category.toLowerCase(), brand.toLowerCase(), adjective.toLowerCase()],
      lastFetched: 0
    })
  }
  return products
}

const CATALOG: Product[] = generateCatalog()

export function getAllCategories(): string[] {
  return CATEGORIES
}

export function getAllBrands(): string[] {
  return BRANDS
}

function simulateLatency(min = 250, max = 700): Promise<void> {
  const delay = min + Math.random() * (max - min)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export interface FetchProductsParams {
  page: number
  pageSize: number
  search?: string
  category?: string | null
  filters?: Partial<ProductFilters>
  sort?: SortOption
}

export interface FetchProductsResult {
  items: Product[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

function applyFilters(list: Product[], params: FetchProductsParams): Product[] {
  let result = list

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    )
  }

  if (params.category) {
    result = result.filter((p) => p.category === params.category)
  }

  const f = params.filters
  if (f?.categories?.length) {
    result = result.filter((p) => f.categories!.includes(p.category))
  }
  if (f?.brands?.length) {
    result = result.filter((p) => f.brands!.includes(p.brand))
  }
  if (f?.priceRange) {
    result = result.filter((p) => {
      const price = p.salePrice ?? p.price
      return price >= f.priceRange!.min && price <= f.priceRange!.max
    })
  }
  if (f?.minRating) {
    result = result.filter((p) => p.rating >= f.minRating!)
  }
  if (f?.inStockOnly) {
    result = result.filter((p) => p.inStock)
  }

  return result
}

function applySort(list: Product[], sort?: SortOption): Product[] {
  const arr = [...list]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
    case 'price-desc':
      return arr.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
    case 'rating-desc':
      return arr.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return arr.sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)))
    default:
      return arr
  }
}

export async function fetchProducts(params: FetchProductsParams): Promise<FetchProductsResult> {
  await simulateLatency()
  const filtered = applySort(applyFilters(CATALOG, params), params.sort)
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const items = filtered.slice(start, end).map((p) => ({ ...p }))
  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total: filtered.length,
    hasMore: end < filtered.length
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await simulateLatency(150, 450)
  const found = CATALOG.find((p) => p.id === id)
  return found ? { ...found } : null
}

export async function fetchRelatedProducts(id: string, limit = 10): Promise<Product[]> {
  await simulateLatency(150, 400)
  const source = CATALOG.find((p) => p.id === id)
  if (!source) return []
  return CATALOG.filter((p) => p.id !== id && p.category === source.category)
    .slice(0, limit)
    .map((p) => ({ ...p }))
}

export async function searchRemote(query: string, limit = 8): Promise<Product[]> {
  await simulateLatency(200, 500)
  const q = query.trim().toLowerCase()
  if (!q) return []
  return CATALOG.filter(
    (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  )
    .slice(0, limit)
    .map((p) => ({ ...p }))
}

export const POPULAR_SEARCH_TERMS = [
  'Sneakers',
  'Backpack',
  'Headphones',
  'Jacket',
  'Watch',
  'Lamp'
]
