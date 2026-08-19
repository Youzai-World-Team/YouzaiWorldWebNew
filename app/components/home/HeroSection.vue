<script setup lang="ts">
import PixelLogoScene from '~/components/home/PixelLogoScene.vue'
</script>

<template>
  <section id="home" class="hero">
    <div class="hero-content">
      <h1>欢迎来到悠哉世界</h1>
      <p>一个充满创意与冒险的 Minecraft Java 版服务器</p>
      <div class="hero-buttons">
        <NuxtLink to="/#join" class="btn-primary">立即加入</NuxtLink>
        <NuxtLink to="/#hero" class="btn-secondary">查看玩法</NuxtLink>
      </div>
    </div>

    <PixelLogoScene />

    <div class="hero-scroll">
      <span>向下滚动</span>
      <div class="scroll-arrow" />
    </div>

  </section>
</template>
