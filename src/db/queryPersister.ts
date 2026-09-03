import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core'
import { getMeta, setMeta } from '@/db/indexedDb'

const PERSIST_KEY = 'vue-query-cache'

/**
 * A real Persister implementation for @tanstack/query-persist-client-core,
 * backed by IndexedDB (via the `meta` object store in `indexedDb.ts`)
 * rather than localStorage. This lets the entire Vue Query cache — not
 * just the product catalog data — survive reloads and be restored while
 * offline, matching the `persistClient` / `restoreClient` / `removeClient`
 * interface the persist-client-core package expects.
 */
export function createIDBPersister(idbValidKey = PERSIST_KEY): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await setMeta(idbValidKey, client)
    },
    restoreClient: async () => {
      return getMeta<PersistedClient>(idbValidKey)
    },
    removeClient: async () => {
      await setMeta(idbValidKey, undefined)
    },
  }
}
