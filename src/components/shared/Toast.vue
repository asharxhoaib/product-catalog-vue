<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useBroadcastHandoff } from '@/composables/useBroadcastHandoff'

const { incoming, dismiss } = useBroadcastHandoff()
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="incoming"
      class="fixed inset-x-4 bottom-20 z-50 flex items-center justify-between gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-lg lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-96"
    >
      <div class="text-sm">
        <p class="font-semibold">Continue where you left off?</p>
        <p class="text-gray-300">
          Viewing <span class="text-white">{{ incoming.productName }}</span> in another tab.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <RouterLink
          :to="`/product/${incoming.productId}`"
          class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold hover:bg-brand-700"
          @click="dismiss"
        >
          Go
        </RouterLink>
        <button class="text-xs text-gray-400 hover:text-white" @click="dismiss">Dismiss</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
