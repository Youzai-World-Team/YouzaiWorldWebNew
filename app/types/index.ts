export interface NavChild {
  label: string
  to: string
}

export interface NavItem {
  label: string
  to?: string
  children?: NavChild[]
}

export type TrendType = 'success' | 'warning' | 'info' | 'error'

export interface Trend {
  id?: string
  date: string
  text: string
  type: TrendType
  icon: string
}

export interface WorldInfo {
  id: 'survival' | 'creative' | 'building' | 'more'
  title: string
  subtitle?: string
  mainImage?: string
  sideImage: string
  desc?: string
  features?: string[]
  applyLink?: string
}

export interface FeatureSlide {
  image: string
  title: string
  description: string
}

export interface TeamMember {
  name: string
  avatar: string
  roles: { label: string; danger?: boolean }[]
  duty: string
  bio?: string
  links: { title: string; icon: string; url: string }[]
}

export interface AvailabilityPoint {
  time: number
  status: 'online' | 'offline'
}

export interface AvailabilityData {
  [nodeName: string]: AvailabilityPoint[]
}

// 对应 https://api.mcyzw.top/api/donors 返回结构
export interface Donator {
  id: string
  name: string
  avatar: string
  intro: string
  amount: number
}

// 聊天区身份：访客只填昵称，玩家用游戏账户登录，管理员由后台代发
export type ChatRole = 'guest' | 'player' | 'admin'

// 对应 https://api.mcyzw.top/api/chat 返回结构（time 为毫秒时间戳）
export interface ChatMessage {
  id: string
  name: string
  content: string
  /** 后台代发的管理员头像路径；其余为空串，前端按昵称生成像素头像。 */
  avatar: string
  /** 由服务端按凭据判定，公开发言无法伪造，用于渲染身份标记。 */
  role: ChatRole
  location: string
  time: number
}

export interface PenaltyRecord {
  player: string
  type: 'ban' | 'mute' | 'kick' | 'warning' | string
  reason: string
  penaltyTime: string
  unbanTime: string
  operator: string
  status?: string
  calculatedStatus?: 'active' | 'expired'
}

export interface DownloadOption {
  radioName: string
  urlDefault: string
  urlNone: string
}

export interface DownloadCard {
  id?: string
  icon?: string
  title: string
  version: string
  desc: string
  size?: string
  date?: string
  note?: string
  option?: DownloadOption
  href?: string
  buttonText?: string
}

export interface DownloadGroup {
  rendererIcon?: string
  rendererTitle?: string
  cards: DownloadCard[]
}

export interface DownloadPlatform {
  platformIcon: string
  platformTitle: string
  cards?: DownloadCard[]
  groups?: DownloadGroup[]
  tip?: string
}
