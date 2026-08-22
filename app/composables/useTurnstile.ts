import { onBeforeUnmount, ref } from 'vue'

// 站点密钥由 API 服务端下发（官网是静态站，不内嵌密钥）。
const TURNSTILE_CONFIG_API = 'https://api.mcyzw.top/api/auth/turnstile'
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
        callback: (value) => {
          token.value = value
          failed.value = false
        },
        'error-callback': () => {
          token.value = ''
          failed.value = true
        },
        'expired-callback': () => {
          token.value = ''
        },
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
