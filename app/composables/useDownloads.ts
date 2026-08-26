import type { DownloadProject } from '~/types'

const DOWNLOADS_API = 'https://api.mcyzw.top/api/downloads'
const LOG_PREFIX = '[youzai-web/downloads]'

export async function fetchDownloadProjects(): Promise<DownloadProject[]> {
  try {
    const response = await fetch(DOWNLOADS_API, { cache: 'no-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data)) throw new Error('响应不是数组')
    return data.filter((item): item is DownloadProject => Boolean(
      item && (item.type === '整合包' || item.type === '模组') &&
      typeof item.name === 'string' && typeof item.url === 'string' &&
      typeof item.version === 'string' && typeof item.description === 'string',
    ))
  } catch (error) {
    console.error(`${LOG_PREFIX} 拉取失败:`, error)
    return []
  }
}
