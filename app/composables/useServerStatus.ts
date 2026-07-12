export interface McPlayers {
    online: number
    max: number
    list: {
        uuid: string
        name: string
    }[]
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

const MCSM_SERVICES = 'https://api.eqad.fun/mcsm/api/services/'
const AVAILABILITY_API = 'https://api.eqad.fun/monitor'

export interface result {
    status: number;
    online: boolean;
    host: string;
    port: number;
    version: string;
    protocol: number;
    players: { online: number; max: number, list: { uuid: string, name: string }[] };
    motd: string;
    favicon: string;
    round_trip_latency: number;
}

export async function fetchMinecraftStatus(
    host: string,
    port: number = 25565,
): Promise<McStatus> {
    try {
        const res: Response = await fetch('/api/craftping/get_status', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({host, port})
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: result = await res.json()
        let isOnline = data.online;
        return {
            online: data.online,
            host,
            port,
            players: isOnline
                ? {online: data.players.online ?? 0, max: data.players?.max ?? 0, list: data.players.list ?? []}
                : undefined,
            version: isOnline ? data.version : undefined,
            protocol: isOnline ? data.protocol : undefined,
            delay: isOnline ? data.round_trip_latency : undefined,
            error: isOnline ? undefined : '服务器离线',
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

export async function fetchAvailability(): Promise<AvailabilityData> {
    const res = await fetch(AVAILABILITY_API, {cache: 'no-cache'})
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as AvailabilityData
}
