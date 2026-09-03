<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductDetail } from '@/composables/useProductDetail'
import { useCartStore } from '@/stores/useCartStore'
import { useWishlistStore } from '@/stores/useWishlistStore'
import { useRecentlyViewedStore } from '@/stores/useRecentlyViewedStore'
import { useBroadcastHandoff } from '@/composables/useBroadcastHandoff'
import { useOnline } from '@vueuse/core'
import ImageCarousel from '@/components/detail/ImageCarousel.vue'
import FullScreenImageViewer from '@/components/detail/FullScreenImageViewer.vue'
import VariantPicker from '@/components/detail/VariantPicker.vue'
import RelatedProducts from '@/components/detail/RelatedProducts.vue'
import type { ProductVariant } from '@/types/Product'

const route = useRoute()
const productId = computed(() => route.params.id as string)

const { product, isLoading, related } = useProductDetail(productId)
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const recentlyViewedStore = useRecentlyViewedStore()
const { announceViewing } = useBroadcastHandoff()
const isOnline = useOnline()

const selectedVariant = ref<ProductVariant | null>(null)
const quantity = ref(1)
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const addedMessage = ref(false)
const shareMessage = ref('')

watch(
  product,
  (p) => {
    if (!p) return
    selectedVariant.value = p.variants[0] ?? null
    void recentlyViewedStore.recordView(p)
    announceViewing(p.id, p.name)
  },
  { immediate: true }
)

function incrementQty() {
  quantity.value += 1
}
function decrementQty() {
  if (quantity.value > 1) quantity.value -= 1
}

async function addToCart() {
  if (!product.value) return
  await cartStore.addToCart(product.value, selectedVariant.value, quantity.value, !isOnline.value)
  addedMessage.value = true
  setTimeout(() => (addedMessage.value = false), 2000)
}

function toggleWishlist() {
  if (!product.value) return
  void wishlistStore.toggleWishlist(product.value)
}

function openViewer(index: number) {
  viewerIndex.value = index
  viewerOpen.value = true
}

async function share() {
  if (!product.value) return
  const url = window.location.href
  const shareData = {
    title: product.value.name,
    text: `Check out ${product.value.name}`,
    url
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    shareMessage.value = 'Link copied to clipboard'
  } catch {
    shareMessage.value = url
  }
  setTimeout(() => (shareMessage.value = ''), 2500)
}
</script>

<template>
  <div v-if="isLoading && !product" class="animate-pulse space-y-4 p-4">
    <div class="aspect-square w-full rounded-xl bg-gray-200" />
    <div class="h-4 w-2/3 rounded bg-gray-200" />
    <div class="h-4 w-1/3 rounded bg-gray-200" />
  </div>

  <div v-else-if="product" class="pb-24 lg:flex lg:gap-8 lg:p-8 lg:pb-8">
    <div class="p-4 lg:w-1/2 lg:p-0">
      <ImageCarousel :images="product.imageUrls" @open-fullscreen="openViewer" />
    </div>

    <div class="px-4 lg:w-1/2 lg:px-0">
      <p class="text-xs uppercase tracking-wide text-gray-400">{{ product.brand }}</p>
      <h1 class="mt-1 text-xl font-bold text-gray-900">{{ product.name }}</h1>

      <div class="mt-1 flex items-center gap-1 text-sm text-amber-500">
        <span v-for="n in 5" :key="n">{{ n <= Math.round(product.rating) ? '★' : '☆' }}</span>
        <span class="text-gray-400">({{ product.ratingCount }} reviews)</span>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <span v-if="product.salePrice" class="text-2xl font-bold text-red-600">
          ${{ product.salePrice.toFixed(2) }}
        </span>
        <span
          class="text-xl"
          :class="product.salePrice ? 'text-gray-400 line-through' : 'font-bold text-gray-900'"
        >
          ${{ product.price.toFixed(2) }}
        </span>
      </div>

      <p class="mt-4 text-sm leading-relaxed text-gray-600">{{ product.description }}</p>

      <div class="mt-5">
        <VariantPicker v-model="selectedVariant" :variants="product.variants" />
      </div>

      <div class="mt-5 flex items-center gap-3">
        <p class="text-xs font-semibold uppercase text-gray-500">Quantity</p>
        <div class="flex items-center rounded-lg border border-gray-200">
          <button class="px-3 py-1.5 text-lg text-gray-500" @click="decrementQty">−</button>
          <span class="w-8 text-center text-sm">{{ quantity }}</span>
          <button class="px-3 py-1.5 text-lg text-gray-500" @click="incrementQty">+</button>
        </div>
      </div>

      <div class="mt-6 flex gap-2">
        <button
          class="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
          :disabled="!product.inStock"
          @click="addToCart"
        >
          {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200"
          :aria-label="wishlistStore.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
          @click="toggleWishlist"
        >
          <span :class="wishlistStore.isWishlisted(product.id) ? 'text-red-500' : 'text-gray-400'">♥</span>
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
          aria-label="Share product"
          @click="share"
        >
          ⇪
        </button>
      </div>

      <p v-if="addedMessage" class="mt-2 text-sm font-medium text-green-600">Added to cart!</p>
      <p v-if="shareMessage" class="mt-2 text-sm text-gray-500">{{ shareMessage }}</p>
      <p v-if="!isOnline" class="mt-2 text-xs text-amber-600">
        You're offline — this action will sync once you're back online.
      </p>
    </div>

    <RelatedProducts class="lg:hidden" :products="related" />
  </div>

  <div v-else class="p-8 text-center text-gray-400">Product not found.</div>

  <RelatedProducts v-if="product" class="hidden lg:block" :products="related" />

  <FullScreenImageViewer
    v-if="product"
    :images="product.imageUrls"
    :start-index="viewerIndex"
    :open="viewerOpen"
    @close="viewerOpen = false"
  />
</template>
