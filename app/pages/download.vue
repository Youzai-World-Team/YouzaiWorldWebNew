<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import type { DownloadProject } from '~/types'
import { fetchDownloadProjects } from '~/composables/useDownloads'

useHead({ title: '下载中心 - Youzai World' })

const projects = ref<DownloadProject[]>([])
const loading = ref(true)
const packs = computed(() => projects.value.filter((item) => item.type === '整合包'))
const mods = computed(() => projects.value.filter((item) => item.type === '模组'))

onMounted(async () => {
  projects.value = await fetchDownloadProjects()
  loading.value = false
})
</script>

<template>
  <div>
    <PageHero title="下载中心" subtitle="Download Center" />
    <br><br>
    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '下载中心' }]" />
    <section class="download-main container">
      <p class="download-intro">以下下载项目由后台动态维护，点击卡片按钮即可获取最新版本。</p>
      <div v-if="loading" class="download-state">正在加载下载项目…</div>
      <div v-else-if="projects.length === 0" class="download-state">暂未配置下载项目，请稍后再来查看。</div>
      <template v-else>
        <section v-if="packs.length" class="download-section-block">
          <h2 class="download-section-title">📦 整合包</h2>
          <div class="download-cards"><article v-for="item in packs" :key="item.id" class="download-card"><div class="download-card-header"><h3>{{ item.name }}</h3><span class="download-version">{{ item.version }}</span></div><p class="download-desc">{{ item.description }}</p><a class="btn-primary download-btn" :href="item.url" target="_blank" rel="noopener">立即下载</a></article></div>
        </section>
        <section v-if="mods.length" class="download-section-block">
          <h2 class="download-section-title">🧩 模组</h2>
          <div class="download-cards"><article v-for="item in mods" :key="item.id" class="download-card"><div class="download-card-header"><h3>{{ item.name }}</h3><span class="download-version">{{ item.version }}</span></div><p class="download-desc">{{ item.description }}</p><a class="btn-primary download-btn" :href="item.url" target="_blank" rel="noopener">立即下载</a></article></div>
        </section>
      </template>
    </section>
  </div>
</template>

<style scoped lang="scss">
.download-main { padding: 40px 0 60px; }
.download-intro { margin-bottom: 30px; }
.download-state { padding: 40px 20px; text-align: center; color: var(--text-color); background: rgba(168, 230, 207, 0.16); border-radius: 16px; }
.download-section-block { margin-bottom: 50px; }
.download-section-title { font-size: 2.2rem; color: var(--dark-color); margin-bottom: 30px; padding-bottom: 12px; border-bottom: 2px solid var(--primary-color); }
.download-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
.download-card { display: flex; flex-direction: column; padding: 24px 22px; border: 1px solid rgba(168, 230, 207, .4); border-radius: 18px; background: linear-gradient(145deg, #fff, #f8fdfa); box-shadow: 0 12px 28px rgba(52,94,84,.08); }
.download-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.download-card-header h3 { margin: 0; color: var(--dark-color); font-size: 1.35rem; }
.download-version { padding: 4px 12px; border-radius: 40px; background: var(--primary-color); color: var(--dark-color); font-size: .85rem; white-space: nowrap; }
.download-desc { flex: 1; margin-bottom: 22px; color: var(--text-color); line-height: 1.6; }
.download-btn { width: 100%; text-align: center; }
@media(max-width:640px){.download-section-title{font-size:1.8rem}.download-cards{grid-template-columns:1fr}}
</style>
