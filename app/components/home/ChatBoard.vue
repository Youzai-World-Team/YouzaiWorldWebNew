<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {fetchChatMessages, sendChatMessage} from '~/composables/useChat'
import {useTurnstile} from '~/composables/useTurnstile'
import {chatAvatar} from '~/utils/chat-avatar'
import type {ChatMessage} from '~/types'

const NAME_MAX = 16
const CONTENT_MAX = 200
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX_MESSAGES = 5
const REFRESH_INTERVAL_MS = 60 * 1000
const NAME_RE = /^[一-龥A-Za-z0-9_-]{2,16}$/

// 昵称记忆到 cookie，下次打开首页直接带出（需求 4）
const savedName = useCookie<string>('yzw_chat_name', {
  maxAge: 60 * 60 * 24 * 180,
  sameSite: 'lax',
  path: '/',
  default: () => '',
})

const name = ref('')
const content = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(true)
const loadError = ref(false)
const sending = ref(false)
const errorText = ref('')
const noticeText = ref('')

const listRef = ref<HTMLElement | null>(null)
const turnstileContainer = ref<HTMLElement | null>(null)
const verifyStarted = ref(false)

const {token: turnstileToken, failed: turnstileFailed, render: renderTurnstile, reset: resetTurnstile} =
    useTurnstile('chat')

// 本地也记一份发送时间与上一条内容，用于即时反馈；服务端仍是唯一权威。
const sentAt = ref<number[]>([])
const lastSentContent = ref('')

let timer: ReturnType<typeof setInterval> | null = null

const nameValid = computed(() => NAME_RE.test(name.value.trim()))
const contentValid = computed(() => {
  const value = content.value.trim()
  return value.length > 0 && value.length <= CONTENT_MAX
})
const canSend = computed(() =>
    !sending.value && nameValid.value && contentValid.value && !!turnstileToken.value,
)

function recentCount() {
  const now = Date.now()
  sentAt.value = sentAt.value.filter((time) => now - time < RATE_WINDOW_MS)
  return sentAt.value.length
}

// 后台代发的消息带管理员头像，普通发言回退到按昵称生成的像素头像。
function avatarOf(message: ChatMessage) {
  return message.avatar || chatAvatar(message.name)
}

function formatTime(value: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date()
  const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate()
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  return sameDay ? clock : `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${clock}`
}

function fullTime(value: number) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
      + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

async function scrollToBottom() {
  await nextTick()
  const list = listRef.value
  if (list) list.scrollTop = list.scrollHeight
}

async function load(scroll = false) {
  try {
    messages.value = await fetchChatMessages()
    loadError.value = false
    if (scroll) await scrollToBottom()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

// 首页访客很多，等用户真的要发言时才加载 Cloudflare 脚本。
async function startVerification() {
  if (verifyStarted.value) return
  verifyStarted.value = true
  await nextTick()
  if (turnstileContainer.value) await renderTurnstile(turnstileContainer.value)
}

async function submit() {
  errorText.value = ''
  noticeText.value = ''

  const trimmedName = name.value.trim()
  const trimmedContent = content.value.trim()

  if (!nameValid.value) {
    errorText.value = `昵称需为 2-${NAME_MAX} 位中英文、数字、下划线或连字符`
    return
  }
  if (!trimmedContent) {
    errorText.value = '消息内容不能为空'
    return
  }
  if (trimmedContent.length > CONTENT_MAX) {
    errorText.value = `消息内容不能超过 ${CONTENT_MAX} 个字符`
    return
  }
  if (trimmedContent === lastSentContent.value) {
    errorText.value = '不能连续发送相同的消息'
    return
  }
  if (recentCount() >= RATE_MAX_MESSAGES) {
    errorText.value = `发言过于频繁，每分钟最多 ${RATE_MAX_MESSAGES} 条，请稍后再试`
    return
  }
  if (!turnstileToken.value) {
    errorText.value = '请先完成人机验证'
    return
  }

  sending.value = true
  try {
    const message = await sendChatMessage({
      name: trimmedName,
      content: trimmedContent,
      turnstileToken: turnstileToken.value,
    })
    messages.value = [...messages.value, message]
    sentAt.value = [...sentAt.value, Date.now()]
    lastSentContent.value = trimmedContent
    savedName.value = trimmedName
    content.value = ''
    noticeText.value = '发送成功'
    await scrollToBottom()
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : '发送失败，请稍后重试'
  } finally {
    // 令牌一次性，无论成败都要换一个新的。
    resetTurnstile()
    sending.value = false
  }
}

onMounted(async () => {
  // 首页是预渲染产物，cookie 只在客户端可读，挂载后再回填避免 hydration 不一致。
  name.value = savedName.value
  await load(true)
  timer = setInterval(() => load(), REFRESH_INTERVAL_MS)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<template>
  <section id="chat" class="chat-board">
    <div class="container">
      <h2>聊天区</h2>
      <p class="chat-intro">
        在这里和其他玩家打个招呼吧~ 留下昵称、完成人机验证即可发言，消息对所有访客可见。
      </p>

      <div class="chat-panel">
        <div ref="listRef" class="chat-list">
          <p v-if="loading" class="chat-state">正在加载聊天记录…</p>
          <p v-else-if="loadError" class="chat-state">
            聊天记录加载失败，请稍后刷新页面重试~
          </p>
          <p v-else-if="messages.length === 0" class="chat-state">
            Oops！还没有人发言，来当第一个吧~
          </p>
          <template v-else>
            <div v-for="m in messages" :key="m.id" class="chat-item">
              <img
                  :src="avatarOf(m)"
                  :alt="m.name"
                  class="chat-avatar"
                  :class="{ 'chat-avatar--photo': !!m.avatar }"
                  loading="lazy"
              >
              <div class="chat-body">
                <div class="chat-meta">
                  <span class="chat-name">{{ m.name }}</span>
                  <span class="chat-location">{{ m.location }}</span>
                  <span class="chat-time" :title="fullTime(m.time)">{{ formatTime(m.time) }}</span>
                </div>
                <p class="chat-text">{{ m.content }}</p>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-composer">
          <div class="chat-fields">
            <label class="chat-field">
              <span class="chat-label">昵称</span>
              <input
                  v-model="name"
                  type="text"
                  class="chat-input"
                  :maxlength="NAME_MAX"
                  placeholder="2-16 位，会记住下次自动带出"
                  autocomplete="nickname"
                  @focus="startVerification"
              >
            </label>
            <label class="chat-field">
              <span class="chat-label">
                消息内容
                <span class="chat-counter">{{ content.trim().length }}/{{ CONTENT_MAX }}</span>
              </span>
              <textarea
                  v-model="content"
                  class="chat-input chat-textarea"
                  :maxlength="CONTENT_MAX"
                  rows="3"
                  placeholder="说点什么吧……（每分钟最多 5 条，不能连发相同内容）"
                  @focus="startVerification"
              />
            </label>
          </div>

          <div class="chat-verify">
            <div v-if="verifyStarted" ref="turnstileContainer" class="chat-turnstile" aria-label="人机验证"/>
            <p v-else class="chat-hint">点击上方输入框即会加载人机验证</p>
            <p v-if="turnstileFailed" class="chat-error">
              人机验证加载失败，请检查网络或稍后重试
            </p>
          </div>

          <div class="chat-actions">
            <p v-if="errorText" class="chat-error">{{ errorText }}</p>
            <p v-else-if="noticeText" class="chat-notice">{{ noticeText }}</p>
            <span v-else class="chat-spacer"/>
            <button type="button" class="btn-primary chat-send" :disabled="!canSend" @click="submit">
              {{ sending ? '发送中…' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
