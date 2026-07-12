<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import {
  type AvailabilityData,
  fetchAvailability,
  fetchMinecraftStatus,
  fetchNodeServices,
  type McStatus,
  type NodeData,
} from '~/composables/useServerStatus'

useHead({title: '服务器状态监控 - Youzai World'})

const NODE_NAME = 'EQAD-003'
const MC_SERVER = 'play.mcyzw.top'
const MIN_LOAD_MS = 2000
const MAX_HISTORY_POINTS = 96

// 分页
const currentPage = ref(1)

// 页面1：详细状态
type Phase = 'loading' | 'loaded' | 'error'
const phase = ref<Phase>('loading')
const errorMsg = ref('')
const node = ref<NodeData | null>(null)
const mc = ref<McStatus | null>(null)

const cpuUsage = computed(() =>
    node.value ? (node.value.system.cpuUsage * 100).toFixed(1) : '0',
)
const memUsage = computed(() =>
    node.value ? (node.value.system.memUsage * 100).toFixed(1) : '0',
)

// 页面2：历史状态
type AvailabilityPhase = 'loading' | 'loaded' | 'error'
const availPhase = ref<AvailabilityPhase>('loading')
const availError = ref('')
const availData = ref<AvailabilityPoint[]>([])

interface AvailabilityPoint {
  time: number
  status: 'online' | 'offline'
}

const uptimePct = computed(() => {
  if (availData.value.length === 0) return '0.0'
  const online = availData.value.filter((p) => p.status === 'online').length
  return ((online / availData.value.length) * 100).toFixed(1)
})

const pctColor = computed(() => {
  const pct = parseFloat(uptimePct.value)
  if (pct <= 20) return '#e74c3c'
  if (pct < 90) return '#dfb50d'
  return '#2ecc71'
})

const emptyPoints = computed(() =>
    Math.max(MAX_HISTORY_POINTS - availData.value.length, 0),
)

function formatTime(timestamp?: number) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`
  const hours = minutes / 60
  if (hours < 24)
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)} 小时`
  const days = hours / 24
  return `${days % 1 === 0 ? days : days.toFixed(1)} 天`
}

let pageTimer: number | undefined

// 页面1：加载节点和MC状态
async function loadStatus() {
  phase.value = 'loading'
  const start = Date.now()
  try {
    const [nodeRes, mcStatus] = await Promise.all([
      fetchNodeServices(),
      fetchMinecraftStatus(MC_SERVER),
    ])
    const remaining = Math.max(MIN_LOAD_MS - (Date.now() - start), 0)
    window.setTimeout(() => {
      if (nodeRes.status === 200 && nodeRes.data) {
        const found = nodeRes.data.find((n) => n.nickname === NODE_NAME) ?? null
        node.value = found
        mc.value = mcStatus ?? {
          online: false,
          host: undefined,
          port: NaN,
          players: {online: NaN, max: NaN},
          version: NaN,
          delay: NaN,
          error: undefined
        } as unknown as McStatus
        phase.value = 'loaded'
      } else {
        errorMsg.value = '无法获取服务器状态数据'
        phase.value = 'error'
      }
    }, remaining)
  } catch {
    const remaining = Math.max(MIN_LOAD_MS - (Date.now() - start), 0)
    window.setTimeout(() => {
      errorMsg.value = '连接服务器失败，请稍后重试'
      phase.value = 'error'
    }, remaining)
  }
}

// 页面2：加载历史状态
async function loadAvailability() {
  availPhase.value = 'loading'
  const start = Date.now()
  try {
    const data: AvailabilityData = await fetchAvailability()
    const history = data[NODE_NAME]
    const remaining = Math.max(MIN_LOAD_MS - (Date.now() - start), 0)
    window.setTimeout(() => {
      if (history && history.length > 0) {
        availData.value = history
        availPhase.value = 'loaded'
      } else {
        availData.value = []
        availPhase.value = 'error'
        availError.value = '暂无历史数据'
      }
    }, remaining)
  } catch (err) {
    const remaining = Math.max(MIN_LOAD_MS - (Date.now() - start), 0)
    window.setTimeout(() => {
      availPhase.value = 'error'
      availError.value =
          err instanceof Error ? err.message : '获取历史数据失败'
    }, remaining)
  }
}

function switchPage(page: number) {
  if (page === currentPage.value) return
  currentPage.value = page
  if (page === 1) loadStatus()
  else if (page === 2) loadAvailability()
  resetAutoRefresh()
}

function startAutoRefresh() {
  pageTimer = window.setInterval(() => {
    if (currentPage.value === 1) loadStatus()
    else loadAvailability()
  }, 5 * 60 * 1000)
}

function resetAutoRefresh() {
  if (pageTimer) window.clearInterval(pageTimer)
  startAutoRefresh()
}

function getDelayColor(delay: number | undefined): string {
  if (delay === undefined) return ''
  if (delay > 200) return '#e74c3c'
  if (delay > 100) return '#f39c12'
  return '#2ecc71'
}

onMounted(() => {
  loadStatus()
  startAutoRefresh()
})
onBeforeUnmount(() => {
  if (pageTimer) window.clearInterval(pageTimer)
})
</script>

<template>
  <div>
    <PageHero title="服务器状态监控" subtitle="Server Status"/>
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '服务器状态监控' }]"/>

    <section id="server-status" class="server-status-page">
      <div class="container">
        <!-- 分页控制 -->
        <div class="status-pagination-ctrl">
          <button
              class="page-btn"
              :class="{ active: currentPage === 1 }"
              @click="switchPage(1)"
          >详细状态
          </button>
          <button
              class="page-btn"
              :class="{ active: currentPage === 2 }"
              @click="switchPage(2)"
          >历史状态
          </button>
        </div>

        <!-- 页面1：详细状态 -->
        <template v-if="currentPage === 1">
          <div class="status-node-container">
            <div v-if="phase === 'loading'" class="status-node-card loading">
              <div class="status-node-header">
                <h3 class="status-node-title">
                  Youzai World Server
                  <button class="node-refresh-btn" title="刷新状态" disabled>
                    <img src="/images/refresh.svg" alt="刷新">
                  </button>
                </h3>
                <div class="status-node-status status-loading">
                  <span class="status-indicator loading"/>
                  获取中...
                </div>
              </div>
              <div class="status-info-grid">
                <div class="status-info-section">
                  <div class="status-info-title">系统信息</div>
                  <div class="status-info-items">
                    <div v-for="i in 2" :key="i" class="status-info-item">
                      <span class="status-info-label status-loading-text"/>
                      <span class="status-info-value status-loading-text"/>
                    </div>
                  </div>
                </div>
                <div class="status-info-section">
                  <div class="status-info-title">系统资源</div>
                  <div class="status-info-items">
                    <div v-for="i in 2" :key="i" class="status-info-item">
                      <span class="status-info-label status-loading-text"/>
                      <span class="status-info-value status-loading-text"/>
                    </div>
                  </div>
                </div>
                <div class="status-minecraft-section">
                  <div class="status-minecraft-title">游戏状态</div>
                  <div class="minecraft-info-grid">
                    <div v-for="i in 2" :key="i" class="status-info-item">
                      <span class="status-info-label status-loading-text"/>
                      <span class="status-info-value status-loading-text"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="phase === 'error'" class="status-empty">
              <h3>状态获取失败</h3>
              <p>{{ errorMsg }}</p>
              <button class="btn-primary" @click="loadStatus">重新加载</button>
            </div>

            <div v-else class="status-node-card" style="animation: fadeInCard 0.3s ease forwards;">
              <div class="status-node-header">
                <h3 class="status-node-title">
                  Youzai World Server
                  <button class="node-refresh-btn" title="刷新状态" @click="loadStatus">
                    <img src="/images/refresh.svg" alt="刷新">
                  </button>
                </h3>
                <div v-if="node" class="status-node-status status-online">
                  <span class="status-indicator online"/>在线
                </div>
                <div v-else class="status-node-status status-offline">
                  <span class="status-indicator offline"/>离线
                </div>
              </div>

              <div class="status-info-grid">
                <div class="status-info-section">
                  <div class="status-info-title">系统信息</div>
                  <div class="status-info-items">
                    <div class="status-info-item">
                      <span class="status-info-label">系统类型</span>
                      <span class="status-info-value">{{ node ? node.system.type : '-' }}</span>
                    </div>
                    <div class="status-info-item">
                      <span class="status-info-label">更新时间</span>
                      <span class="status-info-value">{{ node ? formatTime(node.timestamp) : '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="status-info-section">
                  <div class="status-info-title">系统资源</div>
                  <div class="status-info-items">
                    <div class="status-info-item">
                      <span class="status-info-label">CPU 使用率</span>
                      <span class="status-info-value">{{ node ? cpuUsage + '%' : '-' }}</span>
                      <div class="status-progress-container">
                        <div class="status-progress-bar" :style="{ width: (node ? cpuUsage : 0) + '%' }"/>
                      </div>
                    </div>
                    <div class="status-info-item">
                      <span class="status-info-label">内存使用率</span>
                      <span class="status-info-value">{{ node ? memUsage + '%' : '-' }}</span>
                      <div class="status-progress-container">
                        <div class="status-progress-bar" :style="{ width: (node ? memUsage : 0) + '%' }"/>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="status-minecraft-section">
                  <div class="status-minecraft-title">🎮 游戏状态</div>
                  <template v-if="mc && mc.online">
                    <div class="minecraft-info-grid">
                      <div class="minecraft-info-item">
                        <span class="minecraft-info-label">👥 在线玩家</span>
                        <span class="minecraft-info-value minecraft-player-count">
                          {{ mc.players?.online ?? 0 }}/{{ mc.players?.max ?? 0 }}
                        </span>
                      </div>
                      <div class="minecraft-info-item">
                        <span class="minecraft-info-label">📌 游戏版本</span>
                        <span class="minecraft-info-value minecraft-version">{{ mc.version || '未知版本' }}</span>
                      </div>
                      <div class="minecraft-info-item">
                        <span class="minecraft-info-label">⚡ 延迟</span>
                        <span
                            class="minecraft-info-value"
                            :style="{ color: getDelayColor(mc.delay), fontWeight: 600 }"
                        >{{ mc.delay ?? '?' }} ms</span>
                      </div>
                      <div class="minecraft-info-item">
                        <span class="minecraft-info-label">🔢 协议版本</span>
                        <span class="minecraft-info-value">{{ mc.protocol ?? '?' }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="minecraft-info-grid">
                      <div class="minecraft-info-item">
                        <span class="minecraft-info-label">服务器状态</span>
                        <span class="minecraft-info-value" style="color: #e74c3c;">
                          ❌ {{ mc?.error || '获取失败' }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 页面2：历史状态 -->
        <template v-else>
          <div class="availability-container" style="animation: fadeInCard 0.3s ease forwards;">
            <template v-if="availPhase === 'loading'">
              <div class="uptime-card">
                <div class="uptime-header">
                  <div class="uptime-title">Youzai World Server</div>
                  <div class="uptime-pct loading-text" style="width: 60px;"/>
                </div>
                <div class="uptime-bar">
                  <div
                      v-for="i in MAX_HISTORY_POINTS"
                      :key="i"
                      class="uptime-segment none"
                      style="background:#f0f0f0;"
                  />
                </div>
                <div class="uptime-footer">
                  <span>加载中...</span>
                  <span>最近</span>
                  <span>现在</span>
                </div>
              </div>
            </template>

            <template v-else-if="availPhase === 'error'">
              <div class="status-empty">
                <h3>历史数据加载失败</h3>
                <p>{{ availError }}</p>
                <button class="btn-primary" @click="loadAvailability">重新加载</button>
              </div>
            </template>

            <template v-else>
              <div class="uptime-card">
                <div class="uptime-header">
                  <div class="uptime-title">Youzai World Server</div>
                  <div class="uptime-pct" :style="{ color: pctColor }">{{ uptimePct }}%</div>
                </div>
                <div class="uptime-bar">
                  <div
                      v-for="i in emptyPoints"
                      :key="'empty-' + i"
                      class="uptime-segment none"
                  >
                    <span class="tooltip-text">无数据</span>
                  </div>
                  <div
                      v-for="(point, i) in availData"
                      :key="'point-' + i"
                      class="uptime-segment"
                      :class="{ down: point.status === 'offline' }"
                  >
                    <span class="tooltip-text">
                      {{ formatTime(point.time) }}<br>
                      状态: {{ point.status === 'online' ? '正常' : '离线' }}
                    </span>
                  </div>
                </div>
                <div class="uptime-footer">
                  <span>{{ formatDuration(MAX_HISTORY_POINTS * 15) }}前</span>
                  <span>最近</span>
                  <span>现在</span>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.server-status-page {
  padding: 100px 0;
  background: var(--background);
  min-height: 100vh;
}

.server-status-page h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2.8rem;
  color: var(--dark-color);
  position: relative;
  padding-bottom: 20px;
}

.status-node-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

.status-node-card {
  background: var(--light-text);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(52, 94, 84, 0.1),
  0 5px 15px rgba(52, 94, 84, 0.05),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(168, 230, 207, 0.3);
}

.status-node-card:hover::before {
  opacity: 1;
}

.status-node-card .status-node-status.status-online + * {
  position: relative;
}

.status-node-card .status-node-status.status-online ~ *::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--accent-color), var(--primary-color));
  border-radius: 4px 0 0 4px;
}

.status-node-card.loading {
  opacity: 0.8;
  animation: cardLoading 5s infinite;
}

.status-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(168, 230, 207, 0.3);
  position: relative;
}

.status-node-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  position: relative;
}

.status-node-title > * {
  box-sizing: border-box;
}

.status-node-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.status-online {
  background: linear-gradient(135deg, rgba(107, 179, 155, 0.15), rgba(107, 179, 155, 0.05));
  color: var(--dark-color);
  border: 1px solid rgba(107, 179, 155, 0.3);
}

.status-offline {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(231, 76, 60, 0.05));
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.status-loading {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(243, 156, 18, 0.05));
  color: #d35400;
  border: 1px solid rgba(243, 156, 18, 0.3);
  animation: pulse 2s infinite;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.status-indicator.online {
  background-color: var(--accent-color);
  box-shadow: 0 0 10px rgba(107, 179, 155, 0.5);
}

.status-indicator.offline {
  background-color: #e74c3c;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.status-indicator.loading {
  background-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
}

.status-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
}

.status-info-section {
  background: rgba(168, 230, 207, 0.1);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(168, 230, 207, 0.2);
  position: relative;
}

.status-info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-info-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 2px;
}

.status-info-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(168, 230, 207, 0.2);
}

.status-info-label {
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-info-value {
  color: var(--dark-color);
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
}

.status-progress-container {
  background-color: rgba(168, 230, 207, 0.3);
  border-radius: 10px;
  height: 6px;
  overflow: hidden;
  margin-top: 5px;
  position: relative;
}

.status-progress-bar {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
  overflow: hidden;
}

.status-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2s infinite;
}

.node-refresh-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 0;
  margin: 0;
  position: relative;
  box-shadow: 0 4px 12px rgba(107, 179, 155, 0.25),
  0 2px 6px rgba(107, 179, 155, 0.2);
  flex-shrink: 0;
}

.node-refresh-btn:active {
  transform: translateY(0) rotate(180deg);
  box-shadow: 0 2px 6px rgba(107, 179, 155, 0.2),
  0 1px 3px rgba(107, 179, 155, 0.15);
}

.node-refresh-btn img {
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
  transition: all 0.3s ease;
  object-fit: contain;
}

.node-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  transform: none;
}

.node-refresh-btn:disabled:hover {
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  transform: none;
  box-shadow: 0 4px 12px rgba(107, 179, 155, 0.25),
  0 2px 6px rgba(107, 179, 155, 0.2);
}

.node-refresh-btn:disabled img {
  opacity: 0.5;
}

.node-refresh-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  z-index: 1;
}

.status-node-card.loading .node-refresh-btn {
  animation: pulse 1.5s infinite;
}

.status-node-card.loading .node-refresh-btn img {
  animation: spin 1.5s linear infinite;
}

.status-stats {
  display: flex;
  justify-content: space-around;
  margin: 30px auto;
  max-width: 800px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(168, 230, 207, 0.3);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}

.status-minecraft-section {
  background: rgba(168, 230, 207, 0.1);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(168, 230, 207, 0.2);
  position: relative;
}

.status-minecraft-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-minecraft-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 2px;
}

.minecraft-server-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 15px;
  width: fit-content;
}

.minecraft-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.minecraft-indicator.online {
  background-color: var(--accent-color);
  box-shadow: 0 0 10px rgba(107, 179, 155, 0.5);
}

.minecraft-indicator.offline {
  background-color: #e74c3c;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.minecraft-indicator.loading {
  background-color: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
}

.minecraft-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.minecraft-info-item {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(168, 230, 207, 0.2);
  transition: all 0.3s ease;
}

.minecraft-info-label {
  color: var(--text-color);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
}

.minecraft-info-value {
  color: var(--dark-color);
  font-weight: 600;
  font-size: 1.1rem;
  text-align: left;
}

.minecraft-player-count {
  color: var(--accent-color);
  font-size: 1.2rem;
  display: inline-block;
  animation: playerCountPulse 2s infinite;
}

.minecraft-version {
  color: var(--dark-color);
  font-weight: 600;
}

.minecraft-address {
  font-family: 'Courier New', monospace;
  background: rgba(168, 230, 207, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--dark-color);
}

.minecraft-info-item .status-loading-text {
  background: linear-gradient(90deg, var(--secondary-color) 25%, var(--accent-color) 50%, var(--secondary-color) 75%);
  background-size: 200% 100%;
  animation: loadingShimmer 1.5s infinite;
  border-radius: 4px;
  height: 16px;
  width: 100%;
  display: inline-block;
  vertical-align: middle;
}

.minecraft-info-item .minecraft-info-value.status-loading-text {
  width: 100%;
  height: 1.5rem;
  margin-top: 4px;
  display: block;
}

.status-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-color);
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.status-empty h3 {
  color: var(--dark-color);
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.status-empty p {
  opacity: 0.8;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.status-loading-text {
  background: linear-gradient(90deg, var(--secondary-color) 25%, var(--primary-color) 50%, var(--secondary-color) 75%);
  background-size: 200% 100%;
  animation: loadingShimmer 1.5s infinite;
  border-radius: 4px;
  height: 16px;
}

.status-loading-bar {
  background: linear-gradient(90deg, var(--secondary-color) 25%, var(--primary-color) 50%, var(--secondary-color) 75%);
  background-size: 200% 100%;
  animation: loadingShimmer 1.5s infinite;
  border-radius: 10px;
  height: 8px;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

@keyframes cardLoading {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes loadingShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes playerCountPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .server-status-page {
    padding: 80px 0;
  }

  .server-status-page h2 {
    font-size: 2.2rem;
  }

  .status-node-container {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 15px;
  }

  .status-node-card {
    padding: 25px 20px;
    border-radius: 15px;
  }

  .status-node-header {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .status-node-title {
    font-size: 1.5rem;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .node-refresh-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .node-refresh-btn img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .status-node-status {
    font-size: 0.85rem;
    padding: 6px 12px;
    flex-shrink: 0;
  }

  .status-info-items {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .status-info-section {
    padding: 15px;
  }

  .status-info-item {
    padding: 10px;
  }

  .status-refresh-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }

  .status-refresh-btn svg {
    width: 20px;
    height: 20px;
  }

  .status-minecraft-section {
    padding: 15px;
    margin-top: 10px;
  }

  .minecraft-info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .minecraft-info-item {
    padding: 10px;
  }

  .minecraft-info-label {
    font-size: 0.8rem;
  }

  .minecraft-info-value {
    font-size: 1rem;
  }

  .minecraft-server-status {
    font-size: 0.85rem;
    padding: 6px 10px;
  }
}

/* ========== 分页控制 ========== */
.status-pagination-ctrl {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.page-btn {
  padding: 8px 24px;
  border-radius: 10px;
  background: #e6e6e6;
  color: #3d3d3d;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn.active {
  background: var(--accent-color);
  color: white;
}

.page-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 179, 155, 0.3);
}

/* ========== 页面切换动画 ========== */
@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 历史状态卡片 ========== */
.availability-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  width: 100%;
}

.uptime-card {
  background: var(--light-text);
  border-radius: 20px;
  padding: 25px 30px;
  width: 100%;
  max-width: 1000px;
  border: 1px solid rgba(168, 230, 207, 0.3);
  box-shadow: 0 10px 30px rgba(52, 94, 84, 0.08);
  transition: all 0.3s ease;
}

.uptime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.uptime-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--dark-color);
}

.uptime-pct {
  font-weight: 700;
  font-size: 1.2rem;
}

.uptime-bar {
  display: flex;
  gap: 3px;
  height: 35px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: visible !important;
  position: relative;
}

.uptime-segment {
  flex: 1;
  background-color: #2ecc71;
  border-radius: 2px;
  transition: transform 0.2s;
  cursor: pointer;
  position: relative;
  min-width: 2px;
  min-height: 35px;
}

.uptime-segment:hover {
  transform: translateY(-5px);
  z-index: 2;
}

.uptime-segment.down {
  background-color: #e74c3c;
}

.uptime-segment.none {
  background-color: #ecf0f1;
}

.uptime-segment .tooltip-text {
  visibility: hidden;
  width: 160px;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 6px 10px;
  position: absolute;
  bottom: 150%;
  left: 50%;
  margin-left: -80px;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 13px;
  pointer-events: none;
  z-index: 9999;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.uptime-segment:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.uptime-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #95a5a6;
  border-top: 1px solid rgba(168, 230, 207, 0.3);
  padding-top: 10px;
}

.uptime-pct.loading-text {
  height: 24px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .status-pagination-ctrl {
    gap: 10px;
  }
  .page-btn {
    padding: 6px 16px;
    font-size: 0.9rem;
  }
  .uptime-card {
    padding: 20px;
  }
  .uptime-bar {
    height: 28px;
    gap: 2px;
  }
  .uptime-segment .tooltip-text {
    width: 100px;
    margin-left: -50px;
    font-size: 12px;
  }
}
</style>
