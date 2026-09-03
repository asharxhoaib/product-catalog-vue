import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Product, RecentlyViewedEntry } from '@/types/Product'
import type { OfflineQueueAction } from '@/types/Cart'

const DB_NAME = 'product-catalog-db'
const DB_VERSION = 1

interface CatalogDB extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: {
      'by-category': string
      'by-lastFetched': number
      'by-name': string
    }
  }
  recentlyViewed: {
    key: string
    value: RecentlyViewedEntry
    indexes: { 'by-viewedAt': number }
  }
  offlineQueue: {
    key: string
    value: OfflineQueueAction
    indexes: { 'by-createdAt': number }
  }
  meta: {
    key: string
    value: { key: string; value: unknown }
  }
}

let dbPromise: Promise<IDBPDatabase<CatalogDB>> | null = null

export function getDb(): Promise<IDBPDatabase<CatalogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CatalogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' })
          store.createIndex('by-category', 'category')
          store.createIndex('by-lastFetched', 'lastFetched')
          store.createIndex('by-name', 'name')
        }
        if (!db.objectStoreNames.contains('recentlyViewed')) {
          const store = db.createObjectStore('recentlyViewed', { keyPath: 'id' })
          store.createIndex('by-viewedAt', 'viewedAt')
        }
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const store = db.createObjectStore('offlineQueue', { keyPath: 'id' })
          store.createIndex('by-createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      }
    })
  }
  return dbPromise
}

// ---------- Products ----------

export async function upsertProduct(product: Product): Promise<void> {
  const db = await getDb()
  await db.put('products', { ...product, lastFetched: Date.now() })
}

export async function upsertProducts(products: Product[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('products', 'readwrite')
  await Promise.all([
    ...products.map((p) => tx.store.put({ ...p, lastFetched: Date.now() })),
    tx.done
  ])
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDb()
  return db.get('products', id)
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb()
  return db.getAll('products')
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const db = await getDb()
  return db.getAllFromIndex('products', 'by-category', category)
}

export async function searchProductsLocal(query: string, limit = 10): Promise<Product[]> {
  const db = await getDb()
  const all = await db.getAll('products')
  const q = query.trim().toLowerCase()
  if (!q) return []
  return all
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, limit)
}

// ---------- Recently viewed ----------

const MAX_RECENTLY_VIEWED = 20

export async function addRecentlyViewed(product: Product): Promise<RecentlyViewedEntry[]> {
  const db = await getDb()
  await db.put('recentlyViewed', { id: product.id, product, viewedAt: Date.now() })
  const all = await db.getAllFromIndex('recentlyViewed', 'by-viewedAt')
  const sorted = all.sort((a, b) => b.viewedAt - a.viewedAt)
  if (sorted.length > MAX_RECENTLY_VIEWED) {
    const excess = sorted.slice(MAX_RECENTLY_VIEWED)
    const tx = db.transaction('recentlyViewed', 'readwrite')
    await Promise.all([...excess.map((e) => tx.store.delete(e.id)), tx.done])
  }
  return sorted.slice(0, MAX_RECENTLY_VIEWED)
}

export async function getRecentlyViewed(): Promise<RecentlyViewedEntry[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('recentlyViewed', 'by-viewedAt')
  return all.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, MAX_RECENTLY_VIEWED)
}

export async function clearRecentlyViewed(): Promise<void> {
  const db = await getDb()
  await db.clear('recentlyViewed')
}

// ---------- Offline queue ----------

export async function enqueueOfflineAction(action: OfflineQueueAction): Promise<void> {
  const db = await getDb()
  await db.put('offlineQueue', action)
}

export async function getOfflineQueue(): Promise<OfflineQueueAction[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('offlineQueue', 'by-createdAt')
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeOfflineAction(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('offlineQueue', id)
}

export async function clearOfflineQueue(): Promise<void> {
  const db = await getDb()
  await db.clear('offlineQueue')
}

// ---------- Meta (last handoff id, etc.) ----------

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  await db.put('meta', { key, value })
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  const row = await db.get('meta', key)
  return row?.value as T | undefined
}
