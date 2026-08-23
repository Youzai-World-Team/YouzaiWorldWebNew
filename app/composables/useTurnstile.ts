import { onBeforeUnmount, ref } from 'vue'

// 站点密钥由 API 服务端下发（官网是静态站，不内嵌密钥）。
// 聊天区用的是独立于后台登录的一套 widget，密钥从聊天区专用接口取。
const TURNSTILE_CONFIG_API = 'https://api.mcyzw.top/api/chat/turnstile'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const LOG_PREFIX = '[youzai-web/turnstile]'

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]')
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Turnstile 脚本加载失败')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile 脚本加载失败'))
    document.head.appendChild(script)
  })
}

/**
 * 人机验证组合式函数。widget 采用显式渲染，可在用户真正需要时才加载
 * Cloudflare 脚本，避免每个首页访客都付一次外部请求。
 *
 * @param action 必须与服务端校验时使用的 action 一致
 */
export function useTurnstile(action: string) {
  const token = ref('')
  const ready = ref(false)
  const failed = ref(false)
  const widgetId = ref<string | number | null>(null)

  // Turnstile 令牌约 5 分钟后过期。过期时 widget 往往仍显示“成功”，
  // 但令牌已失效——如果只是清空令牌，用户会看到“验证通过了却发不出去”。
  // 这里主动 reset 换一个新令牌，让界面状态和实际可用状态保持一致。
  function refresh() {
    if (widgetId.value === null) return
    token.value = ''
    try {
      window.turnstile?.reset(widgetId.value)
    } catch (err) {
      console.error(`${LOG_PREFIX} 刷新验证失败:`, err)
    }
  }

  async function render(container: HTMLElement) {
    if (widgetId.value !== null) return
    try {
      const config = await $fetch<{ siteKey?: string }>(TURNSTILE_CONFIG_API)
      const sitekey = String(config?.siteKey || '')
      if (!sitekey) throw new Error('服务端未配置 Turnstile 站点密钥')

      await loadTurnstileScript()
      if (!window.turnstile || widgetId.value !== null) return

      widgetId.value = window.turnstile.render(container, {
        sitekey,
        action,
        size: window.innerWidth <= 360 ? 'compact' : 'flexible',
        'refresh-expired': 'auto',
        callback: (value) => {
          token.value = value
          failed.value = false
        },
        'error-callback': () => {
          token.value = ''
          failed.value = true
        },
        'expired-callback': () => refresh(),
        'timeout-callback': () => refresh(),
      })
      ready.value = true
      failed.value = false
    } catch (err) {
      console.error(`${LOG_PREFIX} 加载失败:`, err)
      failed.value = true
    }
  }

  function reset() {
    token.value = ''
    if (widgetId.value !== null) window.turnstile?.reset(widgetId.value)
  }

  onBeforeUnmount(() => {
    if (widgetId.value !== null) window.turnstile?.remove?.(widgetId.value)
    widgetId.value = null
  })

  return { token, ready, failed, render, reset }
}
