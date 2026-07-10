<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import CountUp from '~/components/ui/CountUp.vue'
import type {PenaltyRecord} from '~/types'

useHead({title: '玩家处罚记录 - Youzai World'})

const API = 'https://quickform.cn/api/1kwd7qm2hy/all'

const penaltyData = ref<PenaltyRecord[]>([])
const loading = ref(true)
const loadError = ref(false)

const search = ref('')
const filterType = ref('all')
const filterStatus = ref('all')
const filterOperator = ref('all')

function statusOf(item: PenaltyRecord): 'active' | 'expired' | string {
  if (item.type === 'warning') return item.status || 'active'
  if (item.unbanTime === '永久') return 'active'
  if (item.unbanTime === '-' || !item.unbanTime) return 'active'
  const unbanDate = new Date(item.unbanTime.replace(' ', 'T') + ':00')
  return new Date() > unbanDate ? 'expired' : 'active'
}

const typeLabels: Record<string, string> = {
  ban: '封禁',
  mute: '禁言',
  kick: '踢出群聊',
  warning: '警告',
}

async function fetchPenaltyData() {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = await res.json()
    if (result.submissions && Array.isArray(result.submissions)) {
      penaltyData.value = result.submissions.map(
          (item: Record<string, unknown>): PenaltyRecord => ({
            player: item.player as string,
            type: item.type as string,
            reason: item.reason as string,
            penaltyTime: item.penaltyTime as string,
            unbanTime: item.unbanTime as string,
            operator: item.operator as string,
            status: (item.status as string) || 'active',
          }),
      )
    } else {
      penaltyData.value = []
    }
    loadError.value = false
  } catch {
    penaltyData.value = []
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return penaltyData.value.filter((item) => {
    const matchesSearch =
        term === '' ||
        item.player.toLowerCase().includes(term) ||
        (item.reason && item.reason.toLowerCase().includes(term))
    const matchesType = filterType.value === 'all' || item.type === filterType.value
    const matchesStatus = filterStatus.value === 'all' || statusOf(item) === filterStatus.value
    const matchesOperator =
        filterOperator.value === 'all' || item.operator === filterOperator.value
    return matchesSearch && matchesType && matchesStatus && matchesOperator
  })
})

const activeCount = computed(() => penaltyData.value.filter((i) => statusOf(i) === 'active').length)
const todayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return penaltyData.value.filter((i) => i.penaltyTime && i.penaltyTime.split(' ')[0] === today)
      .length
})
const banCount = computed(
    () => penaltyData.value.filter((i) => i.type === 'ban' && statusOf(i) === 'active').length,
)
const muteCount = computed(
    () => penaltyData.value.filter((i) => i.type === 'mute' && statusOf(i) === 'active').length,
)

const resultsInfo = computed(() => {
  if (loadError.value) return '加载数据失败，请稍后重试'
  if (loading.value) return '正在加载数据...'
  if (filtered.value.length === 0) return '找到 0 条匹配的处罚记录'
  return `找到 ${filtered.value.length} 条处罚记录`
})

const showNoResults = computed(() => !loading.value && filtered.value.length === 0)

function reset() {
  search.value = ''
  filterType.value = 'all'
  filterStatus.value = 'all'
  filterOperator.value = 'all'
}

let timer: number | undefined
onMounted(() => {
  fetchPenaltyData()
  timer = window.setInterval(fetchPenaltyData, 60000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div>
    <PageHero title="玩家处罚记录" subtitle="Ban List"/>
    <br><br>

    <Breadcrumbs :items="[{ label: '主页', to: '/' }, { label: '玩家处罚记录' }]"/>

    <div class="penalty-container">
      <div class="penalty-stats">
        <div class="stat-card">
          <h3>当前有效处罚</h3>
          <div class="count">
            <CountUp :value="activeCount"/>
          </div>
        </div>
        <div class="stat-card">
          <h3>今日新增处罚</h3>
          <div class="count">
            <CountUp :value="todayCount"/>
          </div>
        </div>
        <div class="stat-card">
          <h3>封禁玩家</h3>
          <div class="count">
            <CountUp :value="banCount"/>
          </div>
        </div>
        <div class="stat-card">
          <h3>禁言玩家</h3>
          <div class="count">
            <CountUp :value="muteCount"/>
          </div>
        </div>
      </div>

      <div class="penalty-filters">
        <div class="filter-row">
          <div class="filter-group">
            <label for="search-player">搜索玩家或原因</label>
            <input
                id="search-player"
                v-model="search"
                type="text"
                placeholder="输入玩家名称或处罚原因..."
            >
          </div>
          <div class="filter-group">
            <label for="filter-type">处罚类型</label>
            <select id="filter-type" v-model="filterType">
              <option value="all">全部类型</option>
              <option value="ban">封禁</option>
              <option value="mute">禁言</option>
              <option value="kick">踢出群聊</option>
              <option value="warning">警告</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-status">处罚状态</label>
            <select id="filter-status" v-model="filterStatus">
              <option value="all">全部状态</option>
              <option value="active">生效中</option>
              <option value="expired">已过期</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-operator">操作员</label>
            <select id="filter-operator" v-model="filterOperator">
              <option value="all">全部操作员</option>
              <option value="zxaBinbin">zxaBinbin</option>
              <option value="ress2338396">ress2338396</option>
              <option value="GrantedCar81239">GrantedCar81239</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn-secondary" @click="reset">重置筛选</button>
        </div>
      </div>

      <div class="penalty-table-container">
        <div class="results-info">{{ resultsInfo }}</div>
        <table class="penalty-table">
          <thead>
          <tr>
            <th>玩家</th>
            <th>处罚类型</th>
            <th>处罚原因</th>
            <th>处罚时间</th>
            <th>解封时间</th>
            <th>操作员</th>
            <th>状态</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, i) in filtered" :key="i">
            <td>
              <div class="player-name"><span>{{ item.player }}</span></div>
            </td>
            <td>
                <span class="penalty-type" :class="`penalty-${item.type}`">
                  {{ typeLabels[item.type] || item.type }}
                </span>
            </td>
            <td>{{ item.reason }}</td>
            <td>{{ item.penaltyTime }}</td>
            <td>{{ item.unbanTime }}</td>
            <td>{{ item.operator }}</td>
            <td :class="statusOf(item) === 'active' ? 'status-active' : 'status-expired'">
              {{ statusOf(item) === 'active' ? '生效中' : '已过期' }}
            </td>
          </tr>
          </tbody>
        </table>
        <div v-show="showNoResults" class="no-results" style="display: block;">
          没有找到匹配的处罚记录
        </div>
      </div>
    </div>
    <br><br>
  </div>
</template>

<style scoped lang="scss">
.penalty-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  background: var(--background);
}

.penalty-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--light-text);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 4px solid var(--accent-color);
}

.stat-card h3 {
  color: var(--dark-color);
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.stat-card .count {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
}

.penalty-filters {
  background: var(--light-text);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--dark-color);
}

.filter-group input,
.filter-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.penalty-table-container {
  background: var(--light-text);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.penalty-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 800px;
}

.penalty-table th {
  background-color: var(--accent-color);
  color: var(--light-text);
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
}

.penalty-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.penalty-table tr:hover {
  background-color: rgba(168, 230, 207, 0.1);
}

.player-name {
  display: flex;
  align-items: center;
}

.player-avatar {
  display: none;
}

.penalty-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.penalty-ban {
  background-color: #ffebee;
  color: #c62828;
}

.penalty-mute {
  background-color: #fff3e0;
  color: #ef6c00;
}

.penalty-kick {
  background-color: #e3f2fd;
  color: #1565c0;
}

.penalty-warning {
  background-color: #f9fbe7;
  color: #9e9d24;
}

.status-active {
  color: #c62828;
  font-weight: 500;
  white-space: nowrap;
}

.status-expired {
  color: #4caf50;
  font-weight: 500;
  white-space: nowrap;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--text-color);
}

.results-info {
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 0.95rem;
}

.penalty-table th:nth-child(1),
.penalty-table td:nth-child(1) {
  width: 12%;
}

.penalty-table th:nth-child(2),
.penalty-table td:nth-child(2) {
  width: 8%;
}

.penalty-table th:nth-child(3),
.penalty-table td:nth-child(3) {
  width: 28%;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
}

.penalty-table th:nth-child(4),
.penalty-table td:nth-child(4) {
  width: 14%;
}

.penalty-table th:nth-child(5),
.penalty-table td:nth-child(5) {
  width: 14%;
}

.penalty-table th:nth-child(6),
.penalty-table td:nth-child(6) {
  width: 8%;
}

.penalty-table th:nth-child(7),
.penalty-table td:nth-child(7) {
  width: 6%;
}

@media (max-width: 768px) {
  .penalty-stats {
    grid-template-columns: 1fr;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .penalty-table-container {
    padding: 15px;
    border-radius: 8px;
  }

  .penalty-table {
    min-width: 700px;
    table-layout: auto;
  }

  .penalty-table th,
  .penalty-table td {
    padding: 10px 8px;
    font-size: 0.85rem;
  }

  .player-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .penalty-table th:nth-child(1),
  .penalty-table td:nth-child(1) {
    min-width: 80px;
  }

  .penalty-table th:nth-child(3),
  .penalty-table td:nth-child(3) {
    min-width: 150px;
    line-height: 1.3;
    word-break: break-word;
  }

  .penalty-table th:nth-child(4),
  .penalty-table td:nth-child(4),
  .penalty-table th:nth-child(5),
  .penalty-table td:nth-child(5) {
    min-width: 100px;
  }

  .penalty-table th:nth-child(6),
  .penalty-table td:nth-child(6) {
    min-width: 70px;
  }

  .penalty-table th:nth-child(7),
  .penalty-table td:nth-child(7) {
    min-width: 50px;
  }

  .penalty-type {
    font-size: 0.8rem;
    padding: 3px 8px;
  }

  .penalty-filters {
    padding: 15px;
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group input,
  .filter-group select {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .filter-actions {
    justify-content: center;
    margin-top: 20px;
  }

  .filter-actions .btn-secondary {
    width: 100%;
    max-width: 200px;
  }
}
</style>
