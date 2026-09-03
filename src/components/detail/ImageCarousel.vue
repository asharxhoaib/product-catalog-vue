<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ images: string[] }>()
const emit = defineEmits<{ (e: 'open-fullscreen', index: number): void }>()

const activeIndex = ref(0)
let startX = 0
let deltaX = 0
const dragging = ref(false)

function go(index: number) {
  if (index < 0) index = props.images.length - 1
  if (index >= props.images.length) index = 0
  activeIndex.value = index
}

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
  dragging.value = true
  deltaX = 0
}
function onTouchMove(e: TouchEvent) {
  if (!dragging.value) return
  deltaX = e.touches[0].clientX - startX
}
function onTouchEnd() {
  if (!dragging.value) return
  dragging.value = false
  if (deltaX > 50) go(activeIndex.value - 1)
  else if (deltaX < -50) go(activeIndex.value + 1)
  deltaX = 0
}
</script>

<template>
  <div class="relative select-none">
    <div
      class="aspect-square w-full overflow-hidden rounded-xl bg-gray-100"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="emit('open-fullscreen', activeIndex)"
    >
      <img
        :src="images[activeIndex]"
        alt="Product image"
        class="h-full w-full object-cover"
      />
    </div>

    <button
      v-if="images.length > 1"
      class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-lg shadow"
      aria-label="Previous image"
      @click.stop="go(activeIndex - 1)"
    >
      ‹
    </button>
    <button
      v-if="images.length > 1"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-lg shadow"
      aria-label="Next image"
      @click.stop="go(activeIndex + 1)"
    >
      ›
    </button>

    <div v-if="images.length > 1" class="mt-2 flex justify-center gap-1.5">
      <button
        v-for="(img, idx) in images"
        :key="img"
        class="h-1.5 rounded-full transition-all"
        :class="idx === activeIndex ? 'w-5 bg-brand-600' : 'w-1.5 bg-gray-300'"
        @click="go(idx)"
      />
    </div>
  </div>
</template>
