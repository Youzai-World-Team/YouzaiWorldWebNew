<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

interface Ripple {
  id: number
  x: number
  y: number
}

const ripples = ref<Ripple[]>([])
let seed = 0

function onClick(e: MouseEvent) {
  const id = seed++
  ripples.value.push({id, x: e.clientX, y: e.clientY})
  window.setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }, 600)
}

onMounted(() => document.addEventListener('click', onClick))
onBeforeUnmount(() => document.removeEventListener('click', onClick))
</script>

<template>
  <ClientOnly>
    <div
        v-for="r in ripples"
        :key="r.id"
        class="click-effect"
        :style="{ left: r.x + 'px', top: r.y + 'px' }"
    />
  </ClientOnly>
</template>
