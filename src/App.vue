<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { useOfflineSync } from '@/composables/useOfflineSync'
import Toast from '@/components/shared/Toast.vue'

const route = useRoute()
const isDesktop = useMediaQuery('(min-width: 1024px)')

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const recentlyViewedStore = useRecentlyViewedStore()
const { isOnline, pendingCount } = useOfflineSync()

const navItems = [
  { name: 'catalog', label: 'Catalog', to: '/', icon: 'grid' },
  { name: 'search', label: 'Search', to: '/search', icon: 'search' },
  { name: 'wishlist', label: 'Wishlist', to: '/wishlist', icon: 'heart' },
  { name: 'cart', label: 'Cart', to: '/cart', icon: 'bag' }
]

const isActive = (name: string) => route.name === name

onMounted(async () => {
  await Promise.all([wishlistStore.init(), recentlyViewedStore.load()])
})

const offlineBannerVisible = computed(() => !isOnline.value)
const bannerDismissed = ref(false)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
    <!-- Desktop sidebar -->
    <aside
      v-if="isDesktop"
      class="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-6"
    >
      <RouterLink to="/" class="mb-8 px-2 text-lg font-bold text-brand-700">
        Catalog
      </RouterLink>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="isActive(item.name) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>{{ item.label }}</span>
          <span
            v-if="item.name === 'cart' && cartStore.itemCount > 0"
            class="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white"
          >
            {{ cartStore.itemCount }}
          </span>
          <span
            v-else-if="item.name === 'wishlist' && wishlistStore.count > 0"
            class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
          >
            {{ wishlistStore.count }}
          </span>
        </RouterLink>
      </nav>
      <div class="mt-auto px-2 text-xs text-gray-400">
        <p v-if="!isOnline" class="text-amber-600">Offline mode</p>
        <p v-if="pendingCount > 0">{{ pendingCount }} action(s) queued</p>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex min-h-screen flex-1 flex-col">
      <div
        v-if="offlineBannerVisible && !bannerDismissed"
        class="flex items-center justify-between bg-amber-500 px-4 py-2 text-sm text-white"
      >
        <span>You're offline — showing cached products.</span>
        <button class="font-semibold" @click="bannerDismissed = true">Dismiss</button>
      </div>

      <main class="flex-1 pb-20 lg:pb-0">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <!-- Mobile bottom nav -->
      <nav
        v-if="!isDesktop"
        class="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-gray-200 bg-white/95 backdrop-blur"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium"
          :class="isActive(item.name) ? 'text-brand-700' : 'text-gray-500'"
        >
          <span
            v-if="item.name === 'cart' && cartStore.itemCount > 0"
            class="absolute right-5 top-1 rounded-full bg-brand-600 px-1.5 text-[10px] text-white"
          >
            {{ cartStore.itemCount }}
          </span>
          <span
            v-else-if="item.name === 'wishlist' && wishlistStore.count > 0"
            class="absolute right-5 top-1 rounded-full bg-gray-300 px-1.5 text-[10px] text-gray-800"
          >
            {{ wishlistStore.count }}
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <Toast />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
