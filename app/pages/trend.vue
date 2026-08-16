<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import {fetchActivities} from '~/composables/useActivities'
import {trendFilterOptions, trendTypeClasses, trendTypeLabels} from '~/utils/trends'
import type {Trend} from '~/types'

useHead({title: '服务器动态 - Youzai World'})

const INITIAL = 5
const STEP = 5

const search = ref('')
const typeFilter = ref('all')
const displayCount = ref(INITIAL)
const trends = ref<Trend[]>([])
const loadError = ref(false)

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return trends.value.filter((t) => {
    const matchesSearch =
        term === '' || t.text.toLowerCase().includes(term) || t.date.toLowerCase().includes(term)
    const matchesType = typeFilter.value === 'all' || t.type === typeFilter.value
    return matchesSearch && matchesType
  })
})

const visible = computed(() => filtered.value.slice(0, displayCount.value))
const isEmpty = computed(() => filtered.value.length === 0)
const allShown = computed(() => displayCount.value >= filtered.value.length)

function onFilterChange() {
  displayCount.value = INITIAL
}

function loadMore() {
  displayCount.value += STEP
}

function reset() {
  search.value = ''
  typeFilter.value = 'all'
  displayCount.value = INITIAL
}

const totalTrends = computed(() => trends.value.length)
const latestUpdate = ref('-')

onMounted(async () => {
  trends.value = await fetchActivities()
  loadError.value = trends.value.length === 0
  if (trends.value.length > 0) {
    const latestDate = trends.value[0]!.date.split(' ')[0]
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (latestDate === today) latestUpdate.value = '今天'
    else if (latestDate === yesterday) latestUpdate.value = '昨天'
    else latestUpdate.value = latestDate
  }
})
</script>

<template>
  <div>
    <PageHero title="服务器动态" subtitle="Server Trend"/>
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '服务器动态' }]"/>

    <section class="trends-section">
      <div class="trends-container">
        <p style="text-align: center;">记录 Youzai World 服务器的每一次更新、维护和重要事件</p>

        <div class="trends-stats">
          <div class="trends-stat-item">
            <div class="trends-stat-value">{{ totalTrends }}</div>
            <div class="trends-stat-label">总动态数</div>
          </div>
          <div class="trends-stat-item">
            <div class="trends-stat-value">{{ latestUpdate }}</div>
            <div class="trends-stat-label">最近更新</div>
          </div>
          <div class="trends-stat-item">
            <div class="trends-stat-value">正常</div>
            <div class="trends-stat-label">服务器可用性</div>
          </div>
        </div>

        <div class="trends-filter-section">
          <div class="trends-search-container">
            <input
                v-model="search"
                type="text"
                class="trends-search-input"
                placeholder="搜索动态内容..."
                @input="onFilterChange"
            >
            <svg class="trends-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <select v-model="typeFilter" class="trends-filter-select" @change="onFilterChange">
            <option v-for="opt in trendFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="loadError" class="trend-load-error">
          <p>动态加载失败，请稍后刷新页面重试。</p>
        </div>

        <div v-show="!isEmpty" class="trend-list">
          <div v-for="t in visible" :key="t.id ?? t.date" class="trend-item" :data-type="t.type">
            <img :src="`https://assets.mcyzw.top/images/${t.icon}`" :alt="trendTypeLabels[t.type]" class="trend-icon">
            <div class="trend-content">
              <span class="trend-date">{{ t.date }}</span>
              <span class="trend-type-badge" :class="trendTypeClasses[t.type]">
                {{ trendTypeLabels[t.type] }}
              </span>
              <span class="trend-text">{{ t.text }}</span>
            </div>
          </div>
        </div>

        <div class="trend-empty-state" :class="{ active: isEmpty }">
          <h3>暂无相关动态</h3>
          <p>当前没有找到符合条件的服务器动态记录。</p>
          <button class="btn-primary" @click="reset">重置筛选条件</button>
        </div>

        <div v-show="!isEmpty" class="trends-load-more">
          <button class="load-more-btn" :disabled="allShown" @click="loadMore">
            <template v-if="allShown">已显示所有动态</template>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              加载更多动态
            </template>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.trends-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.trends-section {
  padding: 60px 0 80px;
}

.trends-filter-section {
  max-width: 800px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
}

.trends-search-container {
  position: relative;
}

.trends-search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid var(--accent-color);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--light-text);
}

.trends-search-input:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.trends-search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.trends-filter-select {
  padding: 12px 20px;
  border: 2px solid var(--accent-color);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--light-text);
  color: var(--text-color);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23345e54' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  min-width: 180px;
}

.trends-filter-select:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.trend-list {
  max-width: 800px;
  margin: 0 auto;
}

.trend-item {
  display: flex;
  align-items: flex-start;
  background-color: var(--light-text);
  border-radius: 10px;
  margin-bottom: 15px;
  padding: 18px 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid var(--accent-color);
  position: relative;
  opacity: 1;
  transform: scale(1);
  filter: none;
}

.trend-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.trend-icon {
  width: 24px;
  height: 24px;
  margin-right: 15px;
  flex-shrink: 0;
  margin-top: 3px;
}

.trend-content {
  flex: 1;
}

.trend-date {
  font-weight: 600;
  color: var(--dark-color);
  margin-right: 10px;
  font-size: 0.95rem;
  display: inline-block;
  margin-bottom: 5px;
  background-color: rgba(168, 230, 207, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.trend-text {
  color: var(--text-color);
  line-height: 1.6;
  font-size: 1.05rem;
  display: block;
}

.trend-item[data-type="success"] {
  border-left-color: #2ecc71;
}

.trend-item[data-type="update"] {
  border-left-color: #3498db;
}

.trend-item[data-type="warning"] {
  border-left-color: #f39c12;
}

.trend-item[data-type="info"] {
  border-left-color: #9b59b6;
}

.trend-item[data-type="fix"] {
  border-left-color: #1abc9c;
}

.trend-item[data-type="error"] {
  border-left-color: #e74c3c;
}

.trend-item[data-type="install"] {
  border-left-color: #e74c3c;
}

.trend-item[data-type="uninstall"] {
  border-left-color: #95a5a6;
}

.trend-type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 10px;
  vertical-align: middle;
}

.trend-type-success {
  background-color: rgba(46, 204, 113, 0.1);
  color: #27ae60;
}

.trend-type-update {
  background-color: rgba(52, 152, 219, 0.1);
  color: #2980b9;
}

.trend-type-warning {
  background-color: rgba(243, 156, 18, 0.1);
  color: #d35400;
}

.trend-type-info {
  background-color: rgba(155, 89, 182, 0.1);
  color: #8e44ad;
}

.trend-type-fix {
  background-color: rgba(26, 188, 156, 0.1);
  color: #16a085;
}

.trend-type-error {
  background-color: rgba(231, 76, 60, 0.1);
  color: #c0392b;
}

.trend-type-install {
  background-color: rgba(231, 76, 60, 0.1);
  color: #c0392b;
}

.trend-type-uninstall {
  background-color: rgba(149, 165, 166, 0.1);
  color: #7f8c8d;
}

.trend-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  margin-top: 20px;
  display: none;
}

.trend-empty-state.active {
  display: block;
}

.trend-load-error {
  max-width: 800px;
  margin: 0 auto 20px;
  padding: 12px 18px;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 10px;
  color: #c0392b;
  text-align: center;
}

.trend-empty-state h3 {
  color: var(--dark-color);
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.trend-empty-state p {
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 20px;
}

.trends-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 40px auto;
  max-width: 800px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(168, 230, 207, 0.3);
  flex-wrap: wrap;
}

.trends-stat-item {
  text-align: center;
  min-width: 120px;
}

.trends-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 5px;
}

.trends-stat-label {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}

.trends-load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background-color: transparent;
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover {
  background-color: var(--accent-color);
  color: var(--light-text);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(107, 179, 155, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-more-btn:disabled:hover {
  background-color: transparent;
  color: var(--accent-color);
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .trends-container {
    padding: 0 15px;
  }

  .trends-filter-section {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 15px;
  }

  .trends-filter-select {
    min-width: 100%;
  }

  .trends-section {
    padding: 40px 0 60px;
  }

  .trend-item {
    padding: 15px;
    margin-bottom: 12px;
  }

  .trend-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
  }

  .trend-date {
    font-size: 0.85rem;
    margin-bottom: 8px;
    display: block;
  }

  .trend-text {
    font-size: 1rem;
  }

  .trend-type-badge {
    margin-left: 0;
    margin-top: 5px;
    display: block;
    width: fit-content;
  }

  .trends-stats {
    flex-direction: column;
    gap: 20px;
    margin: 30px 15px;
    padding: 15px;
  }

  .trends-stat-item {
    min-width: auto;
  }
}
</style>
