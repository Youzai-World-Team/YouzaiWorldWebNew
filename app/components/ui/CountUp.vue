<script setup lang="ts">
import {onBeforeUnmount, ref, watch} from 'vue'

const props = withDefaults(
    defineProps<{
      value: number
      duration?: number
    }>(),
    {duration: 1500},
)

const display = ref(0)
let raf: number | null = null

function animateTo(target: number) {
  if (!import.meta.client) return
  if (raf) cancelAnimationFrame(raf)
  const from = display.value
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / props.duration, 1)
    display.value = Math.round(from + (target - from) * t)
    if (t < 1) {
      raf = requestAnimationFrame(step)
    } else {
      display.value = target
      raf = null
    }
  }
  raf = requestAnimationFrame(step)
}

watch(
    () => props.value,
    (v) => {
      if (import.meta.client) {
        animateTo(v)
      } else {
        display.value = v
      }
    },
    {immediate: true},
)

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <span>{{ display }}</span>
</template>
