import type { Trend, TrendType } from '~/types'

export const trends: Trend[] = [
  { date: '2026-2-6 3:12', text: '服务器迁移到 Java 版了，现在可以正常游玩！', type: 'success', icon: 'succeed.svg' },
  { date: '2026-1-28 19:17', text: '我们正在准备迁移版本到 JAVA 版本，迁移期间无法进入！', type: 'info', icon: 'info.svg' },
  { date: '2025-11-30 12:57', text: '服务器已经更新到 1.21.124 版本了，功能已经修复完毕，可以正常游玩！', type: 'success', icon: 'succeed.svg' },
  { date: '2025-11-29 18:57', text: '服务器已经更新到 1.21.124 版本了，但缺失部分功能，正在修复中。当前仍可进入游玩！', type: 'update', icon: 'updata.svg' },
  { date: '2025-11-29 16:59', text: '服务器升级过程中遇到问题，正在修复，当前无法进入！', type: 'warning', icon: 'warning-red.svg' },
  { date: '2025-11-28 18:40', text: '关服维护和更新', type: 'info', icon: 'info.svg' },
  { date: '2025-11-21 21:20', text: '修复了等级系统的问题，重新设计升级所需的经验值公式', type: 'fix', icon: 'fix.svg' },
  { date: '2025-11-19 14:25', text: '安装了新的等级系统，配置了新的设置', type: 'install', icon: 'install.svg' },
  { date: '2025-11-16 01:40', text: '更新并修复了大量版本不对的插件，提升稳定性', type: 'success', icon: 'succeed.svg' },
  { date: '2025-11-15 20:35', text: '成功将服务端版本更新到 1.21.111 ，同步新特性', type: 'update', icon: 'updata.svg' },
  { date: '2025-11-10 09:40', text: '卸载了老旧的等级系统', type: 'uninstall', icon: 'uninstall.svg' },
  { date: '2025-8-16 14:45', text: '成功将服务端版本更新到 1.21.94 ，同步新特性', type: 'update', icon: 'updata.svg' },
  { date: '2025-7-20 08:45', text: '服务器由只有部分人游玩转向全面公开', type: 'info', icon: 'info.svg' },
  { date: '2025-6-20 18:50', text: '我们开服啦', type: 'info', icon: 'info.svg' },
]

export const trendTypeLabels: Record<TrendType, string> = {
  success: '成功',
  update: '更新',
  warning: '警告',
  info: '信息',
  fix: '修复',
  install: '安装',
  uninstall: '卸载',
}

export const trendTypeClasses: Record<TrendType, string> = {
  success: 'trend-type-success',
  update: 'trend-type-update',
  warning: 'trend-type-warning',
  info: 'trend-type-info',
  fix: 'trend-type-fix',
  install: 'trend-type-install',
  uninstall: 'trend-type-uninstall',
}

export const trendFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'success', label: '成功事件' },
  { value: 'update', label: '版本更新' },
  { value: 'warning', label: '警告通知' },
  { value: 'info', label: '信息公告' },
  { value: 'fix', label: '问题修复' },
  { value: 'install', label: '插件安装' },
  { value: 'uninstall', label: '插件卸载' },
]
