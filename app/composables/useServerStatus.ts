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

const MC_PING = 'https://api.eqad.fun/mc-status/ping-mc'
const MCSM_SERVICES = 'https://api.eqad.fun/mcsm/api/services/'

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

export interface NodeServicesResponse {
  status: number
  data: NodeData[]
}

export async function fetchNodeServices(): Promise<NodeServicesResponse> {
  const res = await fetch(MCSM_SERVICES)
  return (await res.json()) as NodeServicesResponse
}
