<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DownloadCard } from '~/types'
import { ZIP } from '~/utils/downloads'

const props = defineProps<{ card: DownloadCard }>()

const selected = ref<'default' | 'none'>('default')
const href = computed(() =>
  props.card.option
    ? selected.value === 'default'
      ? props.card.option.urlDefault
      : props.card.option.urlNone
    : '#',
)
const radioName = computed(() => props.card.option?.radioName ?? props.card.id ?? props.card.title)
</script>

<template>
  <div class="download-card">
    <div class="download-card-header">
      <h4>
        <img :src="card.icon || ZIP" class="card-icon" alt="zip">
        {{ card.title }}
      </h4>
      <span class="download-version" v-html="card.version" />
    </div>
    <div class="download-card-body">
      <p class="download-desc">{{ card.desc }}</p>
      <div v-if="card.size || card.date" class="download-meta">
        <span v-if="card.size" class="download-size">{{ card.size }}</span>
        <span v-if="card.date" class="download-date">{{ card.date }}</span>
      </div>
      <div v-if="card.note" class="download-note">{{ card.note }}</div>
    </div>
    <div class="download-options">
      <span class="options-label">是否带配置</span>
      <label>
        <input v-model="selected" type="radio" :name="radioName" value="default"> 带配置
      </label>
      <label>
        <input v-model="selected" type="radio" :name="radioName" value="none"> 无配置
      </label>
    </div>
    <div class="download-card-footer">
      <a :href="href" class="btn-primary download-btn" target="_blank">⬇ 下载</a>
    </div>
  </div>
</template>
