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

const STATUS_WORKER = 'https://status.mcyzw.top/api/status'
const STATUS_HISTORY = 'https://status.mcyzw.top/api/status/history?hours=72'
const NODE_NAME = 'EQAD-003'

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
        const res: Response = await fetch(STATUS_WORKER, {cache: 'no-cache'})
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const payload = await res.json() as any
        const data = payload.minecraft as any
        let isOnline = data?.online === true;
        return {
            online: isOnline,
            host,
            port,
            players: isOnline
                ? {online: data.playersOnline ?? 0, max: data.playersMax ?? 0, list: []}
                : undefined,
            version: isOnline ? data.version : undefined,
            protocol: isOnline ? data.protocol : undefined,
            delay: isOnline ? data.latencyMs : undefined,
            error: isOnline ? undefined : data?.message || '服务器离线',
        }
    } catch (err) {
        return {
            online: false,
            host,
            port,
            error: err instanceof Error ? err.message : 'unknown',
        }
    }
}

export async function fetchNodeServices(): Promise<NodeServicesResponse> {
    const res = await fetch(STATUS_WORKER, {cache: 'no-cache'})
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const payload = await res.json() as any
    const node = payload.node
    return {
        status: node && node.status !== 'outage' && node.status !== 'unknown' ? 200 : 503,
        data: node ? [{
            nickname: node.name,
            timestamp: node.timestamp || 0,
            // Preserve the legacy composable contract: callers expect 0..1
            // ratios even though the Worker API publishes 0..100 percentages.
            system: {
                type: node.systemType || '未知',
                cpuUsage: Number(node.cpuUsage || 0) / 100,
                memUsage: Number(node.memoryUsage || 0) / 100,
            },
        }] : [],
    }
}

export async function fetchAvailability(): Promise<AvailabilityData> {
    const res = await fetch(STATUS_HISTORY, {cache: 'no-cache'})
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const payload = await res.json() as any
    const samples = Array.isArray(payload.samples) ? payload.samples : []
    return {
        [NODE_NAME]: samples.map((sample: any) => ({
            time: Number(sample.capturedAt),
            status: sample?.node?.status === 'operational' || sample?.node?.status === 'degraded' ? 'online' : 'offline',
        })).filter((point: AvailabilityPoint) => Number.isFinite(point.time) && point.time > 0),
    }
}
