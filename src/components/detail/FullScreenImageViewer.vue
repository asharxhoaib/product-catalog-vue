<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  images: string[]
  startIndex: number
  open: boolean
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const activeIndex = ref(props.startIndex)
let startX = 0
let deltaX = 0

watch(
  () => props.startIndex,
  (v) => (activeIndex.value = v)
)

function go(index: number) {
  if (index < 0) index = props.images.length - 1
  if (index >= props.images.length) index = 0
  activeIndex.value = index
}

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
  deltaX = 0
}
function onTouchMove(e: TouchEvent) {
  deltaX = e.touches[0].clientX - startX
}
function onTouchEnd() {
  if (deltaX > 50) go(activeIndex.value - 1)
  else if (deltaX < -50) go(activeIndex.value + 1)
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'ArrowLeft') go(activeIndex.value - 1)
  else if (e.key === 'ArrowRight') go(activeIndex.value + 1)
  else if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="zoom-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex flex-col bg-black/95"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <button
        class="absolute right-4 top-4 z-10 text-2xl text-white/80"
        aria-label="Close viewer"
        @click="emit('close')"
      >
        ×
      </button>

      <div class="flex flex-1 items-center justify-center overflow-hidden px-4">
        <Transition name="slide-fade" mode="out-in">
          <img
            :key="activeIndex"
            :src="images[activeIndex]"
            alt="Full screen product image"
            class="max-h-full max-w-full object-contain"
          />
        </Transition>
      </div>

      <button
        v-if="images.length > 1"
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-2xl text-white"
        aria-label="Previous"
        @click="go(activeIndex - 1)"
      >
        ‹
      </button>
      <button
        v-if="images.length > 1"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-2xl text-white"
        aria-label="Next"
        @click="go(activeIndex + 1)"
      >
        ›
      </button>

      <div class="flex justify-center gap-1.5 pb-6">
        <button
          v-for="(img, idx) in images"
          :key="img"
          class="h-1.5 rounded-full transition-all"
          :class="idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'"
          @click="go(idx)"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity 0.25s ease;
}
.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
