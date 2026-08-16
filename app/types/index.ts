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

export interface Donator {
  player: string
  amount: number
  date: string
  note: string
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
