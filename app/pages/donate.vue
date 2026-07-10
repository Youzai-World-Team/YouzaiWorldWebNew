<script setup lang="ts">
import {computed, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import type {Donator} from '~/types'

useHead({title: '捐赠 - Youzai World'})

const donators: Donator[] = [
  {player: 'zxabinbina', amount: 50, date: '2025-06-20', note: '服务器启动资金'},
]

const search = ref('')
const amountFilter = ref('all')

function inRange(amount: number, filter: string) {
  switch (filter) {
    case '0-50':
      return amount >= 10 && amount <= 50
    case '51-100':
      return amount >= 51 && amount <= 100
    case '101-250':
      return amount >= 101 && amount <= 250
    case '251-500':
      return amount >= 251 && amount <= 500
    case '501+':
      return amount >= 501
    default:
      return true
  }
}

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return donators
      .filter((d) => {
        const matchesSearch =
            term === '' ||
            d.player.toLowerCase().includes(term) ||
            d.note.toLowerCase().includes(term)
        return matchesSearch && inRange(d.amount, amountFilter.value)
      })
      .sort((a, b) => b.amount - a.amount)
})

const isEmpty = computed(() => filtered.value.length === 0)

const totalDonators = donators.length
const totalAmount = donators.reduce((sum, d) => sum + d.amount, 0)
const avgDonation = (totalAmount / donators.length).toFixed(2)

const amountFilterOptions = [
  {value: 'all', label: '全部捐赠金额'},
  {value: '0-50', label: '10-50 元'},
  {value: '51-100', label: '51-100 元'},
  {value: '101-250', label: '101-250 元'},
  {value: '251-500', label: '251-500 元'},
  {value: '501+', label: '501 元以上'},
]
</script>

<template>
  <div>
    <PageHero title="捐赠 Youzai World" subtitle="Donate"/>
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '捐赠 Youzai World' }]"/>

    <section class="donate-container">
      <div class="donate-info-section">
        <div class="donate-card">
          <h2>微信捐赠</h2>
          <p>使用微信扫描下方二维码进行捐赠</p>
          <div class="qr-container">
            <div class="qr-code">
              <img src="/images/donate_qr.webp" alt="微信捐赠二维码">
            </div>
          </div>
          <div class="donate-instructions">
            <h3>捐赠说明：</h3>
            <ol>
              <li>打开微信，点击“扫一扫”</li>
              <li>扫描上方二维码</li>
              <li>输入捐赠金额并完成支付</li>
              <li>
                支付完成后，请将您的<strong>玩家代号</strong>和<strong>支付完成截图</strong>发给管理员
              </li>
            </ol>
          </div>
          <div class="donate-note">
            <strong>重要提示：</strong> 捐赠后请务必联系管理员登记，以便我们准确记录并更新您的捐赠信息。
          </div>
        </div>
      </div>

      <div class="donate-info-section">
        <div class="donate-stat-item">
          <div class="donate-stat-value">{{ totalDonators }}</div>
          <div class="donate-stat-label">总捐赠人数</div>
        </div>
        <div class="donate-stat-item">
          <div class="donate-stat-value">¥{{ totalAmount }}</div>
          <div class="donate-stat-label">捐赠总额</div>
        </div>
        <div class="donate-stat-item">
          <div class="donate-stat-value">¥{{ avgDonation }}</div>
          <div class="donate-stat-label">平均捐赠额</div>
        </div>
      </div>

      <div class="donators-section">
        <div class="section-header">
          <h2>感谢这些支持者</h2>
          <p>感谢所有捐赠者的支持，是你们让悠哉世界变得更好！</p>
        </div>

        <div class="donate-filter-section">
          <div class="donate-search-container">
            <input
                v-model="search"
                type="text"
                class="donate-search-input"
                placeholder="搜索捐赠者名称或留言..."
            >
            <svg class="donate-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <select v-model="amountFilter" class="donate-filter-select">
            <option v-for="opt in amountFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-show="!isEmpty" class="donators-table-container">
          <table class="donators-table">
            <thead>
            <tr>
              <th style="width: 25%;">玩家代号</th>
              <th style="width: 15%;">捐赠金额</th>
              <th style="width: 20%;">捐赠时间</th>
              <th style="width: 40%;">留言</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="d in filtered" :key="d.player + d.date">
              <td class="player-name">{{ d.player }}</td>
              <td class="donate-amount">¥{{ d.amount }}</td>
              <td class="donate-date">{{ d.date }}</td>
              <td class="donate-note-cell">{{ d.note }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-show="isEmpty" class="donate-empty-state" style="display: block;">
          <h3>暂无捐赠记录</h3>
          <p>当前没有找到符合条件的捐赠记录。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.donate-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.donate-info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.donate-card {
  background-color: var(--light-text);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(52, 94, 84, 0.08),
  0 4px 12px rgba(52, 94, 84, 0.05),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(168, 230, 207, 0.3);
  text-align: center;
  transition: all 0.3s ease;
}

.donate-card h2 {
  color: var(--dark-color);
  margin-bottom: 20px;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.donate-card h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 2px;
}

.qr-container {
  margin: 25px 0;
  display: flex;
  justify-content: center;
}

.qr-code {
  width: 220px;
  height: 220px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  border: 3px solid var(--primary-color);
  padding: 10px;
  background-color: white;
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.donate-instructions {
  text-align: left;
  margin-top: 25px;
  padding: 20px;
  background-color: rgba(168, 230, 207, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(168, 230, 207, 0.2);
}

.donate-instructions h3 {
  color: var(--dark-color);
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.donate-instructions ol {
  padding-left: 20px;
  margin-bottom: 0;
}

.donate-instructions li {
  margin-bottom: 10px;
  color: var(--text-color);
}

.donate-instructions li:last-child {
  margin-bottom: 0;
}

.donate-note {
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(243, 156, 18, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(243, 156, 18, 0.2);
  color: #d35400;
  font-size: 0.95rem;
}

.donators-section {
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--dark-color);
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 15px;
}

.section-header p {
  color: var(--text-color);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.donate-filter-section {
  max-width: 800px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
}

.donate-search-container {
  position: relative;
}

.donate-search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid var(--accent-color);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--light-text);
}

.donate-search-input:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.donate-search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.donate-filter-select {
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

.donate-filter-select:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.donators-table-container {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(168, 230, 207, 0.3);
}

.donators-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--light-text);
  min-width: 800px;
}

.donators-table thead {
  background-color: var(--accent-color);
  color: var(--light-text);
}

.donators-table th {
  padding: 18px 15px;
  text-align: left;
  font-weight: 600;
  font-size: 1.1rem;
  border-bottom: 2px solid var(--accent-color);
}

.donators-table td {
  padding: 16px 15px;
  border-bottom: 1px solid rgba(52, 94, 84, 0.1);
  line-height: 1.5;
  color: var(--text-color);
}

.donators-table tbody tr {
  transition: all 0.3s ease;
}

.donators-table tbody tr:hover {
  background-color: rgba(168, 230, 207, 0.1);
}

.donators-table tbody tr:last-child td {
  border-bottom: none;
}

.donators-table tbody tr:nth-child(even) {
  background-color: rgba(168, 230, 207, 0.05);
}

.donators-table tbody tr:nth-child(even):hover {
  background-color: rgba(168, 230, 207, 0.15);
}

.player-name {
  font-weight: 600;
  color: var(--dark-color);
}

.donate-amount {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 1.1rem;
}

.donate-date {
  color: var(--text-color);
  font-size: 0.95rem;
}

.donate-note-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.donate-empty-state {
  text-align: center;
  padding: 60px 20px;
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
}

.donate-empty-state h3 {
  color: var(--dark-color);
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.donate-empty-state p {
  color: var(--text-color);
  opacity: 0.8;
}

.donate-stats {
  display: flex;
  justify-content: space-around;
  margin: 40px auto;
  max-width: 800px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(168, 230, 207, 0.3);
}

.donate-stat-item {
  text-align: center;
}

.donate-stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 8px;
}

.donate-stat-label {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .donate-hero {
    padding: 120px 0 60px;
  }

  .donate-hero h1 {
    font-size: 2.2rem;
  }

  .donate-hero p {
    font-size: 1.1rem;
    padding: 0 15px;
  }

  .donate-info-section {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 15px;
  }

  .donate-card {
    padding: 25px 20px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .section-header p {
    padding: 0 15px;
  }

  .donate-filter-section {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 15px;
  }

  .donate-filter-select {
    min-width: 100%;
  }

  .donators-table-container {
    margin: 0 15px;
  }

  .donate-stats {
    flex-direction: column;
    gap: 25px;
    margin: 30px 15px;
    padding: 20px;
  }

  .donate-stat-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .donate-hero h1 {
    font-size: 1.8rem;
  }

  .qr-code {
    width: 180px;
    height: 180px;
  }

  .donators-table th,
  .donators-table td {
    padding: 12px 10px;
    font-size: 0.9rem;
  }

  .donate-amount {
    font-size: 1rem;
  }
}
</style>
