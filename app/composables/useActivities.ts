import type { Trend, TrendType } from '~/types'
import { trendTypeIcons } from '~/utils/trends'

// 服务器动态 API（替代原先硬编码在 utils/trends.ts 的数据）
const ACTIVITIES_API = 'https://api.mcyzw.top/api/activities'

const LOG_PREFIX = '[youzai-web/activities]'

export interface ActivityItem {
  id: string
  type: string
  date: string
  content: string
}

function toTrendType(type: string): TrendType {
  if (type === 'success' || type === 'warning' || type === 'info' || type === 'error') {
    return type
  }
  console.warn(`${LOG_PREFIX} 未知动态类型 "${type}"，回退为 info`)
  return 'info'
}

export function mapActivity(item: ActivityItem): Trend {
  const type = toTrendType(item.type)
  return {
    id: item.id,
    date: item.date,
    text: item.content,
    type,
    icon: trendTypeIcons[type],
  }
}

export async function fetchActivities(): Promise<Trend[]> {
  try {
    console.log(`${LOG_PREFIX} 开始拉取服务器动态: ${ACTIVITIES_API}`)
    const res = await fetch(ACTIVITIES_API, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = (await res.json()) as ActivityItem[]
    if (!Array.isArray(raw)) throw new Error('响应不是数组')
    const mapped = raw.map(mapActivity)
    console.log(`${LOG_PREFIX} 拉取成功，共 ${mapped.length} 条`)
    return mapped
  } catch (err) {
    console.error(`${LOG_PREFIX} 拉取失败:`, err)
    return []
  }
}
