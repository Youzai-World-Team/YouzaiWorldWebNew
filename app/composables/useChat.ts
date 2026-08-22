import type { ChatMessage, ChatRole } from '~/types'

// 首页聊天区 API（读写都在 API 服务端，官网只做展示与提交）
const CHAT_API = 'https://api.mcyzw.top/api/chat'
const API_ORIGIN = 'https://api.mcyzw.top'

const LOG_PREFIX = '[youzai-web/chat]'

export interface SendChatInput {
  /** 访客必填；以玩家身份发言时由服务端取账户里的玩家代号，此项忽略。 */
  name?: string
  content: string
  turnstileToken: string
  /** 玩家会话令牌，带上即以玩家身份发言。 */
  playerToken?: string
}

export interface PlayerLoginInput {
  username: string
  password: string
  turnstileToken: string
}

export interface PlayerSession {
  username: string
  token: string
  expiresAt: number
}

// 后台代发消息的头像是 API 相对路径（如 /api/uploads/xxx.gif），需拼上 API 域名；
// 已是绝对 URL 时直接使用，空串表示由前端按昵称生成像素头像。
function resolveChatAvatar(path: string): string {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`
}

function toChatRole(value: unknown): ChatRole {
  return value === 'admin' || value === 'player' ? value : 'guest'
}

function toChatMessage(item: Record<string, unknown>): ChatMessage {
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? '未知'),
    content: String(item.content ?? ''),
    avatar: resolveChatAvatar(String(item.avatar ?? '')),
    role: toChatRole(item.role),
    location: String(item.location ?? '未知'),
    time: Number(item.time) || 0,
  }
}

/** 统一把服务端的 statusMessage 抛成 Error，便于界面直接展示。 */
async function readError(res: Response, fallback: string): Promise<Error> {
  const payload = await res.json().catch(() => null) as Record<string, unknown> | null
  const message = String(payload?.statusMessage || payload?.message || fallback)
  return new Error(message)
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

export async function sendChatMessage(input: SendChatInput): Promise<ChatMessage> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (input.playerToken) headers.Authorization = `Bearer ${input.playerToken}`

  let res: Response
  try {
    res = await fetch(CHAT_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: input.name,
        content: input.content,
        turnstileToken: input.turnstileToken,
      }),
    })
  } catch (err) {
    console.error(`${LOG_PREFIX} 发送失败（网络错误）:`, err)
    throw new Error('网络异常，请稍后重试')
  }

  if (!res.ok) {
    const error = await readError(res, `发送失败（HTTP ${res.status}）`)
    console.error(`${LOG_PREFIX} 发送被拒绝: ${error.message}`)
    throw error
  }

  const payload = await res.json().catch(() => null) as Record<string, unknown> | null
  if (!payload) throw new Error('服务端返回内容无法解析')
  return toChatMessage(payload)
}

/** 用游戏账户登录聊天区。失败时抛出带服务端文案的 Error。 */
export async function loginChatPlayer(input: PlayerLoginInput): Promise<PlayerSession> {
  let res: Response
  try {
    res = await fetch(`${CHAT_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch (err) {
    console.error(`${LOG_PREFIX} 登录失败（网络错误）:`, err)
    throw new Error('网络异常，请稍后重试')
  }

  if (!res.ok) {
    const error = await readError(res, `登录失败（HTTP ${res.status}）`)
    console.error(`${LOG_PREFIX} 登录被拒绝: ${error.message}`)
    throw error
  }

  const payload = await res.json() as Partial<PlayerSession>
  if (!payload?.token || !payload?.username) throw new Error('服务端返回内容无法解析')
  return {
    username: payload.username,
    token: payload.token,
    expiresAt: Number(payload.expiresAt) || 0,
  }
}

/** 校验本地保存的令牌是否仍然有效，无效返回 null（不抛错）。 */
export async function fetchChatPlayer(token: string): Promise<string | null> {
  if (!token) return null
  try {
    const res = await fetch(`${CHAT_API}/session`, {
      cache: 'no-cache',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const payload = await res.json() as { username?: string }
    return payload?.username || null
  } catch (err) {
    console.error(`${LOG_PREFIX} 校验登录状态失败:`, err)
    return null
  }
}

/** 退出登录。服务端幂等，失败也不阻塞前端清理本地状态。 */
export async function logoutChatPlayer(token: string): Promise<void> {
  if (!token) return
  try {
    await fetch(`${CHAT_API}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err) {
    console.error(`${LOG_PREFIX} 退出登录请求失败:`, err)
  }
}
