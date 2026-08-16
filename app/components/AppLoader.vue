<script setup lang="ts">
import {onMounted, ref} from 'vue'

const loaderDone = useState<boolean>('app.loaderDone', () => false)
const loaderHidden = useState<boolean>('app.loaderHidden', () => false)

const removed = ref(false)
const hiding = ref(false)

const MIN_LOAD_MS = 500

const hide = () => {
  hiding.value = true
  loaderHidden.value = true
  loaderDone.value = true
  window.setTimeout(() => {
    removed.value = true
  }, 500)
}

onMounted(() => {
  if (loaderDone.value) {
    removed.value = true
    loaderHidden.value = true
    return
  }
  window.setTimeout(hide, MIN_LOAD_MS)
})
</script>

<template>
  <div v-if="!removed" class="loader" :class="{ hidden: hiding }">
    <div class="loader-container">
      <img class="loader-image" src="https://assets.mcyzw.top/images/loading.webp" alt="Loading...">
      <hr
          class="loader-image"
          style="color: var(--dark-color); background-color: var(--dark-color); height: 2px;"
      >
      <p class="loader-image" style="color: var(--dark-color);">正在加载中...</p>
    </div>
  </div>
</template>
