import type { TrendType } from '~/types'

// 动态类型 -> 展示文案
export const trendTypeLabels: Record<TrendType, string> = {
  success: '成功',
  warning: '警告',
  info: '信息',
  error: '错误',
}

// 动态类型 -> CSS 类名
export const trendTypeClasses: Record<TrendType, string> = {
  success: 'trend-type-success',
  warning: 'trend-type-warning',
  info: 'trend-type-info',
  error: 'trend-type-error',
}

// 动态类型 -> 图标文件（public/images 下）
export const trendTypeIcons: Record<TrendType, string> = {
  success: 'succeed.svg',
  warning: 'warning-red.svg',
  info: 'info.svg',
  error: 'warning-red.svg',
}

export const trendFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'success', label: '成功事件' },
  { value: 'warning', label: '警告通知' },
  { value: 'info', label: '信息公告' },
  { value: 'error', label: '错误事件' },
]
