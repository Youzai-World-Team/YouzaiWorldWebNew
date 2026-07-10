<script setup lang="ts">
import { ref, onMounted } from 'vue'

const slideCount = 10

interface Bee {
  src: string
  left: string
  top: string
  animationDelay: string
  transform: string
}

const bees = ref<Bee[]>([])

onMounted(() => {
  const beeImages = ['/images/bee_img1.webp', '/images/bee_img2.webp']
  const positions = [
    { left: '12%', top: '28%' },
    { left: '80%', top: '22%' },
    { left: '20%', top: '42%' },
    { left: '68%', top: '48%' },
    { left: '35%', top: '70%' },
    { left: '62%', top: '68%' },
    { left: '8%', top: '75%' },
    { left: '88%', top: '60%' },
    { left: '45%', top: '15%' },
    { left: '28%', top: '55%' },
  ]

  const count = Math.floor(Math.random() * 3) + 6 // 6–8
  const shuffled = [...positions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }

  bees.value = shuffled.slice(0, count).map((pos) => {
    const src = beeImages[Math.floor(Math.random() * beeImages.length)]!
    const xOffset = (Math.random() - 0.5) * 2
    const yOffset = (Math.random() - 0.5) * 2
    const scale = 0.9 + Math.random() * 0.7
    return {
      src,
      left: xOffset ? `calc(${pos.left} + ${xOffset}%)` : pos.left,
      top: yOffset ? `calc(${pos.top} + ${yOffset}%)` : pos.top,
      animationDelay: (Math.random() * 2).toFixed(2) + 's',
      transform: `scale(${scale})`,
    }
  })
})
</script>

<template>
  <section id="home" class="hero">
    <div class="hero-slider">
      <div
        v-for="i in slideCount"
        :key="i"
        class="slide"
        :class="{ active: i === 1 }"
      />
    </div>
    <div class="hero-overlay" />

    <div class="hero-content">
      <br><br><br><br>
      <h1>欢迎来到悠哉世界</h1>
      <p>一个充满创意与冒险的 Minecraft Java 版服务器</p>
      <div class="hero-buttons">
        <NuxtLink to="/#join" class="btn-primary">立即加入</NuxtLink>
        <NuxtLink to="/#hero" class="btn-secondary">查看玩法</NuxtLink>
      </div>
    </div>
    <br><br>

    <div class="hero-scroll">
      <span>向下滚动</span>
      <div class="scroll-arrow" />
    </div>

    <div class="bees-container" aria-hidden="true">
      <img
        v-for="(bee, i) in bees"
        :key="i"
        class="bee"
        :src="bee.src"
        alt="飞舞的蜜蜂"
        :style="{
          left: bee.left,
          top: bee.top,
          animationDelay: bee.animationDelay,
          transform: bee.transform,
        }"
      >
    </div>
  </section>
</template>
