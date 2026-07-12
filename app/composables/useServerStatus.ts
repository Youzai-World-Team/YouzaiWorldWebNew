export interface McPlayers {
  online: number
  max: number
}

export interface McStatus {
  online: boolean
  host: string
  port: number | string
  players?: McPlayers
  version?: string
  protocol?: number | string
  delay?: number
  error?: string
}

export interface NodeSystem {
  type: string
  cpuUsage: number
  memUsage: number
}

export interface NodeData {
  nickname: string
  timestamp: number
  system: NodeSystem
}

export interface AvailabilityPoint {
  time: number
  status: 'online' | 'offline'
}

export interface AvailabilityData {
  [nodeName: string]: AvailabilityPoint[]
}

export interface NodeServicesResponse {
  status: number
  data: NodeData[]
}

const MC_PING = 'https://api.eqad.fun/mc-status/ping-mc'
const MCSM_SERVICES = 'https://api.eqad.fun/mcsm/api/services/'
const MC_MOTD_API = 'https://motd.minebbs.com/api/status'
const AVAILABILITY_API = 'https://api.eqad.fun/monitor'

export async function fetchMinecraftStatus(
  host: string,
  port: number | string = 25565,
): Promise<McStatus> {
  try {
    const res = await fetch(`${MC_PING}?host=${host}&port=${port}`)
    if (!res.ok) throw new Error('Network Error')
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data as McStatus
  } catch (err) {
    return {
      online: false,
      host,
      port,
      error: err instanceof Error ? err.message : 'unknown',
    }
  }
}

/** 使用 minebbs MOTD API 获取更详细的 Minecraft 状态（含延迟和协议版本） */
export async function fetchMinecraftStatusDetail(
  host: string,
): Promise<McStatus> {
  try {
    const params = new URLSearchParams({ ip: host, _t: String(Date.now()) })
    const res = await fetch(`${MC_MOTD_API}?${params.toString()}`, {
      cache: 'no-cache',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const isOnline = data.status === 'online'
    return {
      online: isOnline,
      host,
      port: 25565,
      players: isOnline
        ? { online: data.players?.online ?? 0, max: data.players?.max ?? 0 }
        : undefined,
      version: isOnline ? data.version : undefined,
      protocol: isOnline ? data.protocol : undefined,
      delay: isOnline ? data.delay : undefined,
      error: isOnline ? undefined : data.error || '服务器离线',
    }
  } catch (err) {
    return {
      online: false,
      host,
      port: 25565,
      error: err instanceof Error ? err.message : 'unknown',
    }
  }
}

export async function fetchNodeServices(): Promise<NodeServicesResponse> {
  const res = await fetch(MCSM_SERVICES)
  return (await res.json()) as NodeServicesResponse
}

/** 获取历史可用性数据 */
export async function fetchAvailability(): Promise<AvailabilityData> {
  const res = await fetch(AVAILABILITY_API, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as AvailabilityData
}
