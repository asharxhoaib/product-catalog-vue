import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { persistQueryClientRestore, persistQueryClientSubscribe } from '@tanstack/query-persist-client-core'
import App from './App.vue'
import router from './router'
import { createIDBPersister } from './db/queryPersister'
import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24
    }
  }
})

const persister = createIDBPersister()

// Restore the Vue Query cache from IndexedDB before mounting so cached
// product pages/detail queries are available instantly, even offline —
// then keep persisting the cache to IndexedDB on every change.
const persistedApp = restoreAndMount()

async function restoreAndMount() {
  await persistQueryClientRestore({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 })
  persistQueryClientSubscribe({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 })

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(VueQueryPlugin, { queryClient })
  app.mount('#app')
  return app
}

export default persistedApp
