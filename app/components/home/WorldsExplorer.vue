<script setup lang="ts">
import { ref, computed } from 'vue'
import { worlds } from '~/utils/home'
import type { WorldInfo } from '~/types'

const activeId = ref<WorldInfo['id']>('survival')
const fadeOut = ref(false)
let isAnimating = false

const active = computed(() => worlds.find((w) => w.id === activeId.value)!)

function isDisabled(w: WorldInfo) {
  return w.id === 'more' || w.id === activeId.value
}

function switchWorld(w: WorldInfo) {
  if (w.id === 'more' || isDisabled(w) || isAnimating) return
  isAnimating = true
  fadeOut.value = true
  window.setTimeout(() => {
    activeId.value = w.id
    fadeOut.value = false
    window.setTimeout(() => {
      isAnimating = false
    }, 300)
  }, 200)
}
</script>

<template>
  <section id="worlds" class="worlds-section">
    <div class="container">
      <h2>可游玩的世界</h2>
      <br><br>
      <div class="worlds-wrapper">
        <div class="world-main-card" :class="{ 'fade-out': fadeOut }">
          <div
            class="world-main-image"
            :style="active.mainImage ? { backgroundImage: `url('${active.mainImage}')` } : {}"
          />
          <div class="world-main-content">
            <h3>{{ active.title }}</h3>
            <div class="world-main-desc">
              <p>{{ active.desc }}</p>
            </div>
            <ul class="world-main-features">
              <li v-for="(f, i) in active.features" :key="i">{{ f }}</li>
            </ul>
            <div style="margin-top: 28px; text-align: right;">
              <div
                v-if="active.link || active.applyLink"
                style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;"
              >
                <NuxtLink v-if="active.link" :to="active.link" class="btn-secondary">
                  查看世界规则及游玩协议
                </NuxtLink>
                <NuxtLink v-if="active.applyLink" :to="active.applyLink" class="btn-primary">
                  申请权限
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="world-side-list">
          <div
            v-for="w in worlds"
            :key="w.id"
            class="world-side-item"
            :class="{ active: w.id === activeId, disabled: isDisabled(w) }"
            :data-world="w.id"
            @click="switchWorld(w)"
          >
            <div class="world-side-bg" :style="{ backgroundImage: `url('${w.sideImage}')` }" />
            <div class="world-side-text">
              <h4>{{ w.title }}</h4>
              <p v-if="w.subtitle">{{ w.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
      <br><br>
      <p class="ranking-note">我们会定期备份世界数据，确保您的游戏体验安全无忧~</p>
    </div>
  </section>
</template>
