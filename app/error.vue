<script setup lang="ts">
import {computed} from 'vue'
import type {NuxtError} from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => Number(props.error?.statusCode) || 404)
const code = computed(() => String(statusCode.value))
const errorContent = computed(() => {
  switch (statusCode.value) {
    case 400:
      return {
        title: '请求无效',
        description: '服务器无法理解当前请求。',
        hint: '请检查请求内容后重试。',
      }
    case 401:
      return {
        title: '需要登录',
        description: '您需要登录后才能访问此页面。',
        hint: '请登录后重试。',
      }
    case 403:
      return {
        title: '拒绝访问',
        description: '哎呀！看起来您没有权限访问此页面。',
        hint: '如果您认为这是错误，请联系网站管理员。',
      }
    case 404:
      return {
        title: '页面未找到',
        description: '哎呀！看起来您访问的页面不存在或已被移动。',
        hint: '请检查 URL 是否正确。',
      }
    case 408:
      return {
        title: '请求超时',
        description: '服务器等待请求的时间过长。',
        hint: '请稍后重试。',
      }
    case 429:
      return {
        title: '请求过于频繁',
        description: '您的请求次数已达到限制。',
        hint: '请稍等片刻后重试。',
      }
    case 500:
      return {
        title: '服务器内部错误',
        description: '服务器遇到了意外错误，暂时无法完成请求。',
        hint: '请稍后重试。',
      }
    case 502:
      return {
        title: '网关暂时不可用',
        description: '上游服务器暂时无法响应当前请求。',
        hint: '请稍后刷新重试。',
      }
    case 503:
      return {
        title: '服务暂时不可用',
        description: '服务器当前无法处理请求。',
        hint: '请稍后重试。',
      }
    case 504:
      return {
        title: '网关响应超时',
        description: '上游服务器响应时间过长。',
        hint: '请稍后刷新重试。',
      }
    default:
      return statusCode.value >= 500
        ? {
            title: '服务暂时不可用',
            description: '服务器暂时无法完成请求。',
            hint: '请稍后重试。',
          }
        : {
            title: '请求无法完成',
            description: '服务器无法完成当前请求。',
            hint: '请稍后重试或返回主页。',
          }
  }
})

const suggestions = [
  {label: '网站首页', to: '/'},
  {label: '玩家处罚记录', to: '/banlist'},
  {label: '教程中心', to: '/tutorial'},
  {label: '服务器状态监控', to: '/status'},
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
        <h2 class="error-title">{{ errorContent.title }}</h2>
        <p class="error-description">
          {{ errorContent.description }}<br>
          {{ errorContent.hint }}
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
