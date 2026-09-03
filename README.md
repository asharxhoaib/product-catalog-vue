# Product Catalog (Vue 3)

An offline-first, mobile-and-desktop product catalog built with Vue 3, TypeScript,
and the Composition API. It simulates a real e-commerce browsing experience —
catalog grid, product detail, search, filters, wishlist, and cart — backed by a
deterministic in-memory mock API and an IndexedDB cache that makes the app usable
without a network connection.

> Screenshots can be added here later.

This is a standard Vite + Vue 3 + TypeScript project; no setup/installation
walkthrough is included here — the sections below focus on architecture and
the reasoning behind the key decisions.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Views                                  │
│   CatalogView · ProductDetailView · SearchView · WishlistView ·     │
│   CartView                                                           │
└───────────────┬───────────────────────────────┬─────────────────────┘
                │ uses                          │ uses
┌───────────────▼───────────────┐   ┌───────────▼────────────────────┐
│         Composables            │   │        Pinia Stores            │
│  useProducts · useProductDetail│   │ useCatalogStore · useCartStore │
│  useInfiniteScroll             │   │ useWishlistStore                │
│  useOfflineSync                │   │ useRecentlyViewedStore          │
│  useBroadcastHandoff           │   │                                  │
│  usePullToRefresh              │   │                                  │
└───────────────┬────────────────┘   └───────────┬─────────────────────┘
                │                                 │
        ┌───────▼────────┐                ┌───────▼────────┐
        │  TanStack Query │                │   IndexedDB     │
        │  (vue-query)    │◄──────────────►│   (idb)         │
        │  cache/refetch  │  read/write on  │ products,       │
        └───────┬─────────┘  every fetch    │ recentlyViewed, │
                │                            │ offlineQueue,   │
        ┌───────▼─────────┐                  │ meta            │
        │   mockApi.ts     │                  └─────────────────┘
        │ deterministic    │
        │ in-memory catalog│
        └──────────────────┘
```

Folders follow a **feature-based** layout under `src/`:

- `api/` — the simulated backend (`mockApi.ts`) with deterministic data, pagination,
  search, filtering, sorting, and artificial latency.
- `db/` — the IndexedDB wrapper (`indexedDb.ts`, built on `idb`) with typed object
  stores for products, recently-viewed entries, the offline action queue, and
  misc. key/value metadata (wishlist snapshot, handoff state).
- `stores/` — Pinia stores (Composition API style) for catalog UI state, cart,
  wishlist, and recently-viewed history.
- `composables/` — reusable logic: data fetching (`useProducts`,
  `useProductDetail`), infinite scroll, offline sync, cross-tab handoff, pull to
  refresh, and the filter predicate.
- `components/` — grouped by feature (`catalog/`, `detail/`, `search/`, `shared/`).
- `views/` — route-level screens wired up in `router/index.ts`.

## IndexedDB caching & stale-while-revalidate

Every product fetched from `mockApi` is immediately upserted into the `products`
IndexedDB store (see `upsertProducts` / `upsertProduct` in `src/db/indexedDb.ts`).
TanStack Query owns the actual stale-while-revalidate mechanics:

1. A query (`useProducts`, `useProductDetail`) runs and, on success, writes the
   result to IndexedDB in the background.
2. If the same query key is requested again within its `staleTime`, the cached
   in-memory Query result is shown instantly while Vue Query silently refetches
   in the background once it goes stale.
3. If the network call throws (offline, or the mock API is unreachable), the
   `queryFn` catches the error and falls back to reading straight from
   IndexedDB, so the grid and detail page still render from the last known
   snapshot instead of an error state.

This gives the app "instant paint from cache, refresh from network" behavior
without any custom cache invalidation code — Vue Query handles the in-memory
layer, IndexedDB handles the persistent layer.

### Persisting the Vue Query cache itself

On top of the product-level cache above, the entire TanStack Query client
cache is persisted to IndexedDB via a hand-written `Persister`
(`src/db/queryPersister.ts`) that implements the
`@tanstack/query-persist-client-core` contract — `persistClient`,
`restoreClient`, and `removeClient` — backed by the `meta` object store in
`indexedDb.ts` instead of `localStorage`. `src/main.ts` calls
`persistQueryClientRestore` before mounting the app (so any query results
from a previous session are available immediately, even offline) and
`persistQueryClientSubscribe` to keep writing the cache back to IndexedDB
as it changes, with a 24h `maxAge`.

## Cross-tab handoff

`useBroadcastHandoff` (`src/composables/useBroadcastHandoff.ts`) is built on
VueUse's `useBroadcastChannel`. When a product detail page mounts, it
broadcasts `{ productId, productName, tabId, timestamp }` on a shared
channel; tabs tag their own messages with a random `tabId` so a tab never
reacts to its own broadcast. "Newly focused" handling is done via the
`visibilitychange` event: if the receiving tab is already visible when the
message arrives, the toast (mounted globally via `Toast.vue`) shows
immediately; if the tab is hidden, the message is held and only surfaced
once that tab's `visibilityState` transitions back to `visible`.

## PWA & offline strategy

`vite-plugin-pwa` (see `vite.config.ts`) precaches the app shell and static
assets, and registers runtime caching rules: product images use
`CacheFirst`, and `/api` calls use `StaleWhileRevalidate`. A dedicated
`offline.html` is served as the navigation fallback when a route can't be
reached at all.

Cart actions performed while offline (`useCartStore.addToCart` with
`isOffline: true`) are also written to an `offlineQueue` object store in
IndexedDB. `useOfflineSync` watches `navigator.onLine` (via VueUse's
`useOnline`) and, the moment connectivity returns, replays and clears each
queued action — visible in the Cart view as a "N action(s) waiting to sync"
banner with a manual "Sync now" button.

`public/manifest.webmanifest` declares installable-app metadata plus:

- **`shortcuts`** — long-press/right-click launcher shortcuts for Wishlist,
  Search, and Cart.
- **`share_target`** — lets the OS share sheet send a URL/title/text straight
  into the in-app Search view.

## Responsive layout

`App.vue` reads `useMediaQuery('(min-width: 1024px)')` from VueUse once and
branches the shell:

- **Mobile (< 1024px)**: single-column content with a fixed bottom tab bar
  (Catalog, Search, Wishlist, Cart), pull-to-refresh on the catalog grid, and
  a slide-over filter panel.
- **Desktop (≥ 1024px)**: a persistent left sidebar with category navigation,
  cart/wishlist counts, and offline status; the catalog grid gets more
  breathing room and the product detail view lays the gallery and info panel
  side-by-side.

The product grid itself uses `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`,
so column count adapts continuously to viewport width rather than jumping at
fixed breakpoints.

## Notes

- All product imagery is generated from deterministic `picsum.photos` seed
  URLs so the catalog looks the same on every load without a real backend.
- No test files are included per the scope of this build; the codebase is
  structured (small composables/components, pure predicate functions) to make
  adding unit and component tests straightforward later.
