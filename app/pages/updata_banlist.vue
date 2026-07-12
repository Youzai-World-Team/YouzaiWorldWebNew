<script setup lang="ts">
import {onMounted, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'

useHead({title: '提交处罚记录 - 悠哉世界管理后台'})

const API_URL = 'https://quickform.cn/api/1kwd7qm2hy'

// 表单数据
const playerName = ref('')
const penaltyType = ref('ban')
const reason = ref('')
const penaltyTime = ref('')
const unbanTime = ref('')
const permanentCheck = ref(false)
const operator = ref('zxaBinbin')

// UI 状态
const alertType = ref<'success' | 'error' | 'loading' | ''>('')
const alertMessage = ref('')
const submitting = ref(false)

// 格式化时间
function formatDateTime(dateTimeValue: string) {
  if (!dateTimeValue) return ''
  const dt = new Date(dateTimeValue)
  if (isNaN(dt.getTime())) return dateTimeValue
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  const hours = String(dt.getHours()).padStart(2, '0')
  const minutes = String(dt.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 设置默认处罚时间为当前时间
function setDefaultPenaltyTime() {
  if (!penaltyTime.value) {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    penaltyTime.value = now.toISOString().slice(0, 16)
  }
}

// 永久处罚联动
function handlePermanentToggle() {
  // 逻辑在模板中通过 disabled 处理
}

// 设置默认解禁时间（7天后）
function setDefaultUnbanTime() {
  if (!unbanTime.value && !permanentCheck.value) {
    const future = new Date()
    future.setDate(future.getDate() + 7)
    future.setMinutes(future.getMinutes() - future.getTimezoneOffset())
    unbanTime.value = future.toISOString().slice(0, 16)
  }
}

// 重置表单
function resetForm() {
  playerName.value = ''
  penaltyType.value = 'ban'
  reason.value = ''
  permanentCheck.value = false
  unbanTime.value = ''
  operator.value = 'zxaBinbin'
  setDefaultPenaltyTime()
  alertType.value = ''
  alertMessage.value = ''
}

// 表单提交
async function handleSubmit() {
  const player = playerName.value.trim()
  const type = penaltyType.value
  const reasonText = reason.value.trim()
  const op = operator.value
  const penaltyTimeRaw = penaltyTime.value

  if (!player) {
    alertType.value = 'error'
    alertMessage.value = '请填写玩家名称'
    return
  }
  if (!reasonText) {
    alertType.value = 'error'
    alertMessage.value = '请填写处罚原因'
    return
  }
  if (!penaltyTimeRaw) {
    alertType.value = 'error'
    alertMessage.value = '请选择处罚时间'
    return
  }

  const formattedPenaltyTime = formatDateTime(penaltyTimeRaw)
  let finalUnban = ''
  if (permanentCheck.value) {
    finalUnban = '永久'
  } else {
    finalUnban = unbanTime.value ? formatDateTime(unbanTime.value) : '-'
  }

  const formData = new URLSearchParams()
  formData.append('player', player)
  formData.append('type', type)
  formData.append('reason', reasonText)
  formData.append('penaltyTime', formattedPenaltyTime)
  formData.append('unbanTime', finalUnban)
  formData.append('operator', op)
  formData.append('status', 'active')

  submitting.value = true
  alertType.value = 'loading'
  alertMessage.value = '正在提交处罚记录，请稍候...'

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (response.ok) {
      alertType.value = 'success'
      alertMessage.value = `✅ 玩家 ${player} 的处罚记录已成功提交！`
      playerName.value = ''
      reason.value = ''
      permanentCheck.value = false
      unbanTime.value = ''
      penaltyType.value = 'ban'
      operator.value = 'zxaBinbin'
      setDefaultPenaltyTime()
    } else {
      const errorText = await response.text().catch(() => '')
      alertType.value = 'error'
      alertMessage.value = `提交失败 (HTTP ${response.status})${errorText ? `: ${errorText}` : ''}`
    }
  } catch (error) {
    alertType.value = 'error'
    alertMessage.value = `网络错误: ${error instanceof Error ? error.message : '未知错误'}，请检查 API 地址或网络连接`
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  setDefaultPenaltyTime()
})
</script>

<template>
  <div>
    <PageHero title="提交处罚记录" subtitle="添加新的玩家处罚信息至数据库"/>
    <br><br>

    <Breadcrumbs :items="[
      { label: '主页', to: '/' },
      { label: '玩家处罚记录', to: '/banlist' },
      { label: '提交处罚' },
    ]"/>

    <div class="container">
      <div class="form-container">
        <div class="form-title">📋 添加处罚记录</div>
        <div class="form-subtitle">所有处罚信息将实时同步至玩家处罚记录表，请确保信息准确。</div>

        <!-- 提示消息 -->
        <div
            v-if="alertType"
            class="alert-message"
            :class="`alert-${alertType}`"
        >
          <span style="font-size:1.3rem;">
            {{ alertType === 'success' ? '✅' : alertType === 'error' ? '❌' : '⏳' }}
          </span>
          <span>{{ alertMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>玩家名称 <span class="required">*</span></label>
              <input
                  v-model="playerName"
                  type="text"
                  placeholder="例如: AlmondBark7820"
                  required
              >
            </div>
            <div class="form-group">
              <label>处罚类型 <span class="required">*</span></label>
              <select v-model="penaltyType" required>
                <option value="ban">封禁 (Ban)</option>
                <option value="mute">禁言 (Mute)</option>
                <option value="kick">踢出群聊 (Kick)</option>
                <option value="warning">警告 (Warning)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>处罚原因 <span class="required">*</span></label>
            <textarea
                v-model="reason"
                rows="3"
                placeholder="详细描述违规行为..."
                required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>处罚时间 <span class="required">*</span></label>
              <input
                  v-model="penaltyTime"
                  type="datetime-local"
                  required
              >
            </div>
            <div class="form-group">
              <label>解封/解禁时间</label>
              <input
                  v-model="unbanTime"
                  type="datetime-local"
                  :disabled="permanentCheck"
              >
              <div class="permanent-hint">
                <label style="display: inline-flex; align-items: center; gap: 6px; font-weight: normal;">
                  <input v-model="permanentCheck" type="checkbox" @change="handlePermanentToggle">
                  永久处罚（解封时间设为"永久"）
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>操作员 <span class="required">*</span></label>
            <select v-model="operator" required>
              <option value="zxaBinbin">zxaBinbin</option>
              <option value="ress2338396">ress2338396</option>
              <option value="GrantedCar81239">GrantedCar81239</option>
              <option value="系统管理员">系统管理员</option>
            </select>
          </div>

          <div class="action-buttons">
            <button type="button" class="btn-reset" @click="resetForm">重置表单</button>
            <button
                type="submit"
                class="btn-submit"
                :disabled="submitting"
            >
              <span>{{ submitting ? '⏳' : '✈️' }}</span>
              {{ submitting ? '提交中...' : '提交至处罚记录库' }}
            </button>
          </div>
        </form>

        <div class="info-note">
          💡 注意：提交后数据会通过 QuickForm API 存储，并立即显示在
          <NuxtLink to="/banlist" class="internal-link" style="color: var(--accent-color);">
            玩家处罚记录页
          </NuxtLink>
          。请确认信息无误后再提交。
        </div>
      </div>
    </div>
    <br><br>
  </div>
</template>

<style scoped lang="scss">
.form-container {
  max-width: 900px;
  margin: 0 auto;
  background: var(--light-text);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(52, 94, 84, 0.1);
  transition: all 0.3s ease;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  border-left: 5px solid var(--accent-color);
  padding-left: 20px;
}

.form-subtitle {
  color: #6c757d;
  margin-bottom: 30px;
  padding-left: 25px;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 8px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label .required {
  color: #e74c3c;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.permanent-hint {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 5px;
}

.btn-submit {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.btn-submit:hover:not(:disabled) {
  background: var(--dark-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(52, 94, 84, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-reset {
  background: transparent;
  border: 2px solid var(--dark-color);
  color: var(--dark-color);
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-right: 15px;
}

.btn-reset:hover {
  background: rgba(107, 179, 155, 0.1);
  border-color: var(--accent-color);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.alert-message {
  padding: 14px 20px;
  border-radius: 16px;
  margin-bottom: 25px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border-left: 5px solid #28a745;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 5px solid #dc3545;
}

.alert-loading {
  background: #e9ecef;
  color: #495057;
  border-left: 5px solid #6c757d;
}

.info-note {
  background: #f0f7f4;
  border-radius: 14px;
  padding: 12px 18px;
  margin-top: 20px;
  font-size: 0.85rem;
  color: #2c5a4e;
  text-align: center;
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px;
    margin: 0 15px;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .action-buttons {
    flex-direction: column;
  }
  .btn-reset,
  .btn-submit {
    width: 100%;
    margin: 5px 0;
  }
  .btn-reset {
    margin-right: 0;
  }
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
