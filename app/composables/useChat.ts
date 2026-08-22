import type { ChatMessage } from '~/types'

// 首页聊天区 API（读写都在 API 服务端，官网只做展示与提交）
const CHAT_API = 'https://api.mcyzw.top/api/chat'
const API_ORIGIN = 'https://api.mcyzw.top'

const LOG_PREFIX = '[youzai-web/chat]'

export interface SendChatInput {
  name: string
  content: string
  turnstileToken: string
}

// 后台代发消息的头像是 API 相对路径（如 /api/uploads/xxx.gif），需拼上 API 域名；
// 已是绝对 URL 时直接使用，空串表示由前端按昵称生成像素头像。
function resolveChatAvatar(path: string): string {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`
}

function toChatMessage(item: Record<string, unknown>): ChatMessage {
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? '未知'),
    content: String(item.content ?? ''),
    avatar: resolveChatAvatar(String(item.avatar ?? '')),
    location: String(item.location ?? '未知'),
    time: Number(item.time) || 0,
  }
}

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  try {
    const res = await fetch(CHAT_API, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = (await res.json()) as Record<string, unknown>[]
    if (!Array.isArray(raw)) throw new Error('响应不是数组')
    return raw.map(toChatMessage)
  } catch (err) {
    console.error(`${LOG_PREFIX} 拉取聊天记录失败:`, err)
    throw err
  }
}

/**
 * 发送一条消息。失败时抛出带有服务端文案的 Error，
 * 便于界面直接展示「发言过于频繁」「不能连续发送相同的消息」等提示。
 */
export async function sendChatMessage(input: SendChatInput): Promise<ChatMessage> {
  let res: Response
  try {
    res = await fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch (err) {
    console.error(`${LOG_PREFIX} 发送失败（网络错误）:`, err)
    throw new Error('网络异常，请稍后重试')
  }

  const payload = await res.json().catch(() => null) as Record<string, unknown> | null

  if (!res.ok) {
    const message = String(payload?.statusMessage || payload?.message || `发送失败（HTTP ${res.status}）`)
    console.error(`${LOG_PREFIX} 发送被拒绝: ${message}`)
    throw new Error(message)
  }
  if (!payload) throw new Error('服务端返回内容无法解析')

  return toChatMessage(payload)
}
