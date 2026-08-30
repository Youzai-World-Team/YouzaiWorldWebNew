<script setup lang="ts">
import {computed} from 'vue'
import type {NuxtError} from '#app'

const props = defineProps<{ error: NuxtError }>()

const is403 = computed(() => props.error?.statusCode === 403)
const code = computed(() => String(props.error?.statusCode || 404))
const title = computed(() => (is403.value ? '拒绝访问' : '页面未找到'))

const suggestions = [
  {label: '网站首页', to: '/'},
  {label: '玩家处罚记录', to: '/banlist'},
  {label: '教程中心', to: '/tutorial'},
  {label: '服务器状态监控', to: 'https://status.mcyzw.top'},
]

function goHome() {
  clearError({redirect: '/'})
}

function goTo(to: string) {
  if (/^https?:\/\//.test(to)) {
    window.location.href = to
    return
  }
  clearError({redirect: to})
}

function goBack() {
  if (import.meta.client && window.history.length > 1) window.history.back()
  else clearError({redirect: '/'})
}
</script>

<template>
  <NuxtLayout>
    <main class="error-hero">
      <div class="error-container">
        <div class="error-illustration">
          <img src="https://assets.mcyzw.top/images/error.webp" :alt="`${code} Error Illustration`">
        </div>
        <h1 class="error-code">{{ code }}</h1>
        <h2 class="error-title">{{ title }}</h2>
        <p v-if="is403" class="error-description">
          哎呀！看起来您没有权限访问此页面。<br>
          如果您认为这是错误，请联系网站管理员。
        </p>
        <p v-else class="error-description">
          哎呀！看起来您访问的页面不存在或已被移动。<br>
          请检查 URL 是否正确。
        </p>

        <div class="error-actions">
          <a class="error-link error-link-primary" href="/" @click.prevent="goHome">
            <svg class="error-link-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"/>
            </svg>
            返回主页
          </a>
          <button type="button" class="error-link error-link-secondary" @click="goBack">
            <svg class="error-link-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"/>
            </svg>
            返回上一页
          </button>
        </div>

        <div class="error-suggestions">
          <h3>您可能想访问：</h3>
          <ul class="error-suggestions-list">
            <li v-for="s in suggestions" :key="s.to">
              <a :href="s.to" @click.prevent="goTo(s.to)">{{ s.label }}</a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>
