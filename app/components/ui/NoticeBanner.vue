<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    icon?: string
    contained?: boolean
  }>(),
  { icon: '🌱', contained: false },
)

const visible = ref(true)
</script>

<template>
  <component :is="contained ? 'div' : 'div'" :class="contained ? 'container' : undefined">
    <div v-if="visible" class="banner" role="alert">
      <span class="banner-icon" aria-hidden="true">{{ icon }}</span>
      <div class="banner-content">
        <slot />
      </div>
      <button class="banner-close" aria-label="关闭此提示" @click="visible = false">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </component>
</template>
