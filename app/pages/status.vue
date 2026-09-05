<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'

useHead({ title: '服务器状态监控 - Youzai World' })

const STATUS_URL = 'https://status.mcyzw.top/api/status'
const MAX_HISTORY_POINTS = 96

type Tone = 'operational' | 'degraded' | 'outage' | 'unknown'
interface ServiceStatus {
  id: string
  name: string
  description: string
  status: Exclude<Tone, 'unknown'>
  latencyMs: number | null
  message: string
}
interface StatusSnapshot {
  generatedAt: number
  refreshAfterMs?: number
  overall: Tone
  services: ServiceStatus[]
  node: { name: string; status: Tone; timestamp: number | null; systemType: string | null; cpuUsage: number | null; memoryUsage: number | null; message: string }
  minecraft: { address: string; status: Tone; online: boolean; playersOnline: number | null; playersMax: number | null; version: string | null; protocol: string | null; latencyMs: number | null; message: string }
  history: { time: number; status: 'online' | 'offline' }[]
  errors?: Record<string, string>
  stale?: boolean
}

const snapshot = ref<StatusSnapshot | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const refreshing = ref(false)
let timer: number | undefined

const overallLabel = computed(() => ({ operational: '运行正常', degraded: '部分异常', outage: '服务中断', unknown: '状态未知' }[snapshot.value?.overall || 'unknown']))
const history = computed(() => snapshot.value?.history?.slice(-MAX_HISTORY_POINTS) || [])
const uptime = computed(() => history.value.length ? (history.value.filter((point) => point.status === 'online').length / history.value.length) * 100 : null)
const nodeOnline = computed(() => snapshot.value?.node.status === 'operational' || snapshot.value?.node.status === 'degraded')
const cpu = computed(() => formatPercent(snapshot.value?.node.cpuUsage))
const memory = computed(() => formatPercent(snapshot.value?.node.memoryUsage))

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '-'
  return `${Math.max(0, Math.min(100, Number(value))).toFixed(1)}%`
}
function formatTime(value: number | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN')
}
function statusLabel(status: Tone): string {
  return ({ operational: '正常', degraded: '降级', outage: '中断', unknown: '未知' }[status])
}
function scheduleRefresh() {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => void loadStatus(), Math.max(30_000, snapshot.value?.refreshAfterMs || 300_000))
}
async function loadStatus() {
  if (refreshing.value) return
  refreshing.value = true
  errorMessage.value = ''
  try {
    snapshot.value = await $fetch<StatusSnapshot>(STATUS_URL, { cache: 'no-store' })
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || '状态数据暂时无法获取'
  } finally {
    loading.value = false
    refreshing.value = false
    scheduleRefresh()
  }
}
onMounted(() => void loadStatus())
onBeforeUnmount(() => { if (timer) window.clearTimeout(timer) })
</script>

<template>
  <div>
    <PageHero title="服务器状态监控" subtitle="Server Status" />
    <br><br>
    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '服务器状态监控' }]" />

    <section class="status-page-section">
      <div class="status-page-container">
        <div class="status-page-heading">
          <div>
            <p class="status-eyebrow">实时监控</p>
            <h2>服务运行状态</h2>
            <p class="status-updated">最后更新：{{ formatTime(snapshot?.generatedAt) }}</p>
          </div>
          <div class="status-heading-actions">
            <span v-if="snapshot" class="status-overall" :class="`status-overall--${snapshot.overall}`"><i></i>{{ overallLabel }}</span>
            <button class="status-refresh" :disabled="refreshing" title="刷新状态" @click="loadStatus">{{ refreshing ? '刷新中…' : '刷新' }}</button>
          </div>
        </div>

        <div v-if="loading" class="status-message">正在获取最新状态…</div>
        <div v-else-if="errorMessage && !snapshot" class="status-message status-message--error">
          <strong>状态获取失败</strong><span>{{ errorMessage }}</span><button class="btn-primary" @click="loadStatus">重新加载</button>
        </div>
        <template v-else-if="snapshot">
          <p v-if="snapshot.stale" class="status-message status-message--warning">{{ snapshot.errors?.worker || '实时检测暂不可用，当前显示最近一次历史数据。' }}</p>
          <p v-if="errorMessage" class="status-message status-message--warning">{{ errorMessage }}，当前显示最近一次成功获取的数据。</p>

          <div class="status-service-grid">
            <article v-for="service in snapshot.services" :key="service.id" class="status-service-card">
              <div class="status-card-title"><span>{{ service.name }}</span><strong :class="`tone-${service.status}`"><i></i>{{ statusLabel(service.status) }}</strong></div>
              <p>{{ service.description }}</p>
              <small>{{ service.latencyMs == null ? service.message : `${service.latencyMs} ms` }}</small>
            </article>
          </div>

          <div class="status-detail-grid">
            <article class="status-detail-card">
              <div class="status-card-title"><h3>{{ snapshot.node.name }}</h3><strong :class="`tone-${snapshot.node.status}`"><i></i>{{ nodeOnline ? '在线' : statusLabel(snapshot.node.status) }}</strong></div>
              <div class="status-metrics">
                <div><span>系统类型</span><strong>{{ snapshot.node.systemType || '-' }}</strong></div>
                <div><span>CPU 使用率</span><strong>{{ cpu }}</strong></div>
                <div><span>内存使用率</span><strong>{{ memory }}</strong></div>
                <div><span>节点更新时间</span><strong>{{ formatTime(snapshot.node.timestamp) }}</strong></div>
              </div>
              <p v-if="!nodeOnline" class="status-card-note">{{ snapshot.errors?.node || snapshot.node.message }}</p>
            </article>

            <article class="status-detail-card">
              <div class="status-card-title"><h3>Minecraft 游戏服务</h3><strong :class="`tone-${snapshot.minecraft.status}`"><i></i>{{ snapshot.minecraft.online ? '在线' : statusLabel(snapshot.minecraft.status) }}</strong></div>
              <div v-if="snapshot.minecraft.online" class="status-metrics">
                <div><span>服务器地址</span><strong>{{ snapshot.minecraft.address }}</strong></div>
                <div><span>在线玩家</span><strong>{{ snapshot.minecraft.playersOnline ?? 0 }} / {{ snapshot.minecraft.playersMax ?? 0 }}</strong></div>
                <div><span>游戏版本</span><strong>{{ snapshot.minecraft.version || '-' }}</strong></div>
                <div><span>连接延迟</span><strong>{{ snapshot.minecraft.latencyMs == null ? '-' : `${snapshot.minecraft.latencyMs} ms` }}</strong></div>
              </div>
              <p v-else class="status-card-note">{{ snapshot.errors?.minecraft || snapshot.minecraft.message }}</p>
            </article>
          </div>

          <article class="status-history-card">
            <div class="status-card-title"><h3>最近 24 小时可用性</h3><strong>{{ uptime == null ? '-' : `${uptime.toFixed(1)}%` }}</strong></div>
            <div v-if="history.length" class="status-history-chart" role="img" :aria-label="`最近 24 小时可用性 ${uptime?.toFixed(1)}%`">
              <span v-for="point in history" :key="`${point.time}-${point.status}`" :class="`history-${point.status}`" :title="`${formatTime(point.time)} ${point.status === 'online' ? '在线' : '离线'}`"></span>
            </div>
            <p v-else class="status-card-note">暂无历史监控数据。</p>
            <div v-if="history.length" class="status-history-axis"><span>24 小时前</span><span>现在</span></div>
          </article>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.status-page-section { padding: 48px 0 80px; }
.status-page-container { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
.status-page-heading, .status-card-title, .status-heading-actions, .status-history-axis { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.status-page-heading { margin-bottom: 24px; }
.status-eyebrow { margin: 0 0 6px; color: var(--accent-color); font-size: 13px; letter-spacing: .08em; }
.status-page-heading h2, .status-card-title h3 { margin: 0; color: var(--text-color); }
.status-updated, .status-service-card p, .status-service-card small, .status-card-note { color: rgba(52, 94, 84, .72); }
.status-updated { margin: 8px 0 0; font-size: 13px; }
.status-overall, .status-card-title strong { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; font-weight: 600; }
.status-overall i, .status-card-title strong i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-overall--operational, .tone-operational { color: #2e9c68; }
.status-overall--degraded, .tone-degraded { color: #c78b16; }
.status-overall--outage, .tone-outage { color: #d5524b; }
.status-overall--unknown, .tone-unknown { color: #76808a; }
.status-refresh { padding: 9px 16px; border: 1px solid var(--accent-color); border-radius: 4px; color: var(--accent-color); background: transparent; cursor: pointer; }
.status-refresh:disabled { opacity: .55; cursor: wait; }
.status-message { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; min-height: 120px; padding: 24px; border: 1px solid rgba(52, 94, 84, .18); border-radius: 8px; color: rgba(52, 94, 84, .72); }
.status-message--error { flex-direction: column; color: #d5524b; }
.status-message--warning { min-height: auto; justify-content: flex-start; margin-bottom: 18px; color: #9b6d0f; background: #fff8e6; }
.status-service-grid, .status-detail-grid { display: grid; gap: 16px; }
.status-service-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 16px; }
.status-detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 16px; }
.status-service-card, .status-detail-card, .status-history-card { padding: 20px; border: 1px solid rgba(52, 94, 84, .18); border-radius: 8px; background: var(--light-text); box-shadow: 0 8px 24px rgb(40 55 45 / 5%); }
.status-service-card p { margin: 12px 0 6px; font-size: 14px; }
.status-service-card small { font-size: 12px; }
.status-card-title h3 { font-size: 18px; }
.status-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 20px; }
.status-metrics div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.status-metrics span { color: rgba(52, 94, 84, .72); font-size: 13px; }
.status-metrics strong { overflow-wrap: anywhere; }
.status-card-note { margin: 18px 0 0; font-size: 14px; }
.status-history-card > .status-card-title strong { font-size: 24px; color: var(--accent-color); }
.status-history-chart { display: grid; grid-template-columns: repeat(96, minmax(3px, 1fr)); gap: 3px; height: 72px; margin-top: 24px; }
.status-history-chart span { border-radius: 2px; background: #2e9c68; }
.status-history-chart .history-offline { background: #d5524b; }
.status-history-axis { margin-top: 8px; color: rgba(52, 94, 84, .72); font-size: 12px; }
@media (max-width: 900px) { .status-service-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .status-page-heading, .status-card-title { align-items: flex-start; flex-direction: column; } .status-heading-actions { width: 100%; justify-content: space-between; } .status-service-grid, .status-detail-grid, .status-metrics { grid-template-columns: 1fr; } .status-history-chart { grid-template-columns: repeat(48, minmax(3px, 1fr)); gap: 2px; } }
</style>
