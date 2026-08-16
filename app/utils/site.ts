import type { NavItem } from '~/types'

export const navItems: NavItem[] = [
  { label: '主页', to: '/' },
  {
    label: '服务器信息',
    children: [
      { label: '动态查看', to: '/#trend' },
      { label: '活动列表', to: '/#events' },
      { label: '玩法特性一览', to: '/#features' },
      { label: '服务器状态监控', to: '/status' },
      { label: '玩家处罚记录', to: '/banlist' },
    ],
  },
  {
    label: '加入服务器',
    children: [
      { label: '服务器地址', to: '/#join-server' },
      { label: '加入 QQ 群', to: '/#join-qqqun' },
      { label: '下载中心', to: '/download' },
    ],
  },
  {
    label: '教程中心',
    children: [
      { label: '教程中心主页', to: '/tutorial' },
      { label: '快速游玩指南', to: '/tutorials/quick_play_guide' },
    ],
  },
]

export const footerLinks = [
  { label: '首页', to: '/' },
  { label: '服务器动态', to: '/#trend' },
  { label: '活动列表', to: '/#events' },
  { label: '玩法特性一览', to: '/#features' },
  { label: '加入服务器与服务器 QQ 群', to: '/#join' },
  { label: '教程中心', to: '/tutorial' },
  { label: '下载中心', to: '/download' },
  { label: '服务器状态监控', to: '/status' },
  { label: '玩家处罚记录', to: '/banlist' },
]

export const friendLinks = [
  {
    href: 'https://eqad.fun',
    icon: 'https://assets.mcyzw.top/images/eqad.webp',
    title: 'EQAD',
    desc: '一个由马迷们合作开设的 Minecraft 服务器',
  },
  {
    href: 'https://dev.mscpo.org',
    icon: 'https://assets.mcyzw.top/images/mscpo.webp',
    title: 'MSCPO',
    desc: 'Minecraft 服务器集体宣传组织',
  },
]

export const SITE_START = '2025-10-31T20:00:00'
