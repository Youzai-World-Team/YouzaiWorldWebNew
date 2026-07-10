<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const NEWS_IMG = '/images/26.1.webp'

const cardRef = ref<HTMLElement | null>(null)
const spotlightRef = ref<HTMLElement | null>(null)

let rafId: number | null = null
let animating = false
let targetX = 50
let targetY = 50
let currentX = 50
let currentY = 50

function setSpotlight(x: number, y: number) {
  if (!spotlightRef.value) return
  spotlightRef.value.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.6) 0%, transparent 30%)`
}

function stopAnimation() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  animating = false
}

function updateSpotlight() {
  currentX += (targetX - currentX) * 0.2
  currentY += (targetY - currentY) * 0.2
  setSpotlight(currentX, currentY)

  if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
    stopAnimation()
  } else {
    rafId = requestAnimationFrame(updateSpotlight)
  }
}

function startAnimation() {
  if (animating) return
  animating = true
  rafId = requestAnimationFrame(updateSpotlight)
}

function onMouseMove(e: MouseEvent) {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  targetX = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
  targetY = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
  if (!animating) startAnimation()
}

function onMouseLeave() {
  stopAnimation()
  setSpotlight(50, 50)
  if (spotlightRef.value) spotlightRef.value.style.opacity = '0'
}

function onMouseEnter() {
  if (spotlightRef.value) spotlightRef.value.style.opacity = '1'
}

onMounted(() => {
  const el = cardRef.value
  if (!el) return
  el.addEventListener('mousemove', onMouseMove)
  el.addEventListener('mouseleave', onMouseLeave)
  el.addEventListener('mouseenter', onMouseEnter)
})

onBeforeUnmount(() => {
  stopAnimation()
  const el = cardRef.value
  if (!el) return
  el.removeEventListener('mousemove', onMouseMove)
  el.removeEventListener('mouseleave', onMouseLeave)
  el.removeEventListener('mouseenter', onMouseEnter)
})
</script>

<template>
  <section class="latest-news liquid-glass">
    <img src="/images/MC_Line.webp" alt="分割线" style="width: 100%;">

    <div ref="cardRef" class="latest-news-wrapper glass-card">
      <img class="glass-bg-img" :src="NEWS_IMG" alt="最新消息背景">
      <div class="glass-blur" :style="{ backgroundImage: `url('${NEWS_IMG}')` }"/>
      <div class="glass-highlight"/>
      <div ref="spotlightRef" class="glass-spotlight"/>

      <div class="latest-news-overlay">
        <div class="latest-news-badge">
          <span class="badge-dot"/>
          最新动态
        </div>
        <h2 class="latest-news-title">🎉 我们已支持<br>Minecraft JAVA 26.1</h2>
        <p class="latest-news-content">全新版本带来更流畅的游戏体验，同步最新特性，立即加入探索！</p>
        <div class="latest-news-more"/>
      </div>
    </div>
  </section>
</template>
