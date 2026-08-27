<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import type { DownloadProject } from '~/types'
import { fetchDownloadProjects } from '~/composables/useDownloads'
import { launcherDownloads } from '~/utils/downloads'

useHead({ title: '下载中心 - Youzai World' })

const projects = ref<DownloadProject[]>([])
const loading = ref(true)
const packs = computed(() => projects.value.filter((item) => item.type === '整合包'))
const mods = computed(() => projects.value.filter((item) => item.type === '模组'))
type TutorialLauncher = 'pcl2' | 'hmcl'

const tutorialPickerOpen = ref(false)
const selectedTutorialLauncher = ref<TutorialLauncher>('pcl2')
const tutorialLaunchers = [
  { id: 'pcl2' as const, name: 'PCL 2', imagePrefix: 'pcl', icon: 'https://assets.mcyzw.top/images/PCL2.webp' },
  { id: 'hmcl' as const, name: 'HMCL', imagePrefix: 'hmcl', icon: 'https://assets.mcyzw.top/images/HMCL.webp' },
]
const selectedTutorial = computed(() => tutorialLaunchers.find((item) => item.id === selectedTutorialLauncher.value)!)
const installSteps = computed(() => {
  const launcher = selectedTutorial.value.name
  const imagePrefix = selectedTutorial.value.imagePrefix
  return [
    {
      text: `下载整合包和 Core；如果还没有 ${launcher}，请先在上方下载启动器。`,
      image: `https://assets.mcyzw.top/images/download_page/${imagePrefix}_setp1.webp`,
      alt: `步骤 1：下载整合包、Core 和 ${launcher}`,
    },
    {
      text: `将下载的 ${launcher} 启动器文件存放在一个单独的文件夹内，然后运行启动器。`,
      image: `https://assets.mcyzw.top/images/download_page/${imagePrefix}_setp2.webp`,
      alt: `步骤 2：存放并运行 ${launcher}`,
    },
    {
      text: `将下载的整合包拖动到 ${launcher} 页面中，触发自动安装弹窗后选择“是”继续。`,
      image: `https://assets.mcyzw.top/images/download_page/${imagePrefix}_setp3.webp`,
      alt: `步骤 3：将整合包拖入 ${launcher} 安装`,
    },
    {
      text: `整合包安装完成后，将下载的 Core 拖动到 ${launcher} 页面中，触发自动安装弹窗后选择“是”继续。`,
      image: `https://assets.mcyzw.top/images/download_page/${imagePrefix}_setp4.webp`,
      alt: `步骤 4：将 Core 拖入 ${launcher} 安装`,
    },
    {
      text: `在 ${launcher} 中选择已安装的整合包并启动游戏。`,
      image: `https://assets.mcyzw.top/images/download_page/${imagePrefix}_setp5.webp`,
      alt: `步骤 5：通过 ${launcher} 启动游戏`,
    },
  ]
})

function selectTutorialLauncher(launcher: TutorialLauncher) {
  selectedTutorialLauncher.value = launcher
  tutorialPickerOpen.value = false
}

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
      <div v-if="loading" class="download-state download-state--loading">正在加载整合包和 Core 下载信息…</div>

      <section id="download-packs" class="download-section-block">
        <div class="download-section-heading">
          <div>
            <p class="download-section-eyebrow">SERVER PACKS</p>
            <h2 class="download-section-title">📦 整合包</h2>
          </div>
          <span v-if="!loading && packs.length" class="download-section-count">{{ packs.length }} 项</span>
        </div>
        <div v-if="!loading && !packs.length" class="download-empty">暂未配置整合包。</div>
        <div v-else-if="packs.length" class="download-cards">
          <article v-for="item in packs" :key="item.id" class="download-card">
            <div class="download-card-header">
              <h3>{{ item.name }}</h3>
              <span class="download-version">{{ item.version }}</span>
            </div>
            <p class="download-desc">{{ item.description }}</p>
            <a class="btn-primary download-btn" :href="item.url" target="_blank" rel="noopener">立即下载</a>
          </article>
        </div>
      </section>

      <section id="download-mods" class="download-section-block">
        <div class="download-section-heading">
          <div>
            <p class="download-section-eyebrow">CORE</p>
            <h2 class="download-section-title">🧩 Core</h2>
          </div>
          <span v-if="!loading && mods.length" class="download-section-count">{{ mods.length }} 项</span>
        </div>
        <div v-if="!loading && !mods.length" class="download-empty">暂未配置 Core。</div>
        <div v-else-if="mods.length" class="download-cards">
          <article v-for="item in mods" :key="item.id" class="download-card">
            <div class="download-card-header">
              <h3>{{ item.name }}</h3>
              <span class="download-version">{{ item.version }}</span>
            </div>
            <p class="download-desc">{{ item.description }}</p>
            <a class="btn-primary download-btn" :href="item.url" target="_blank" rel="noopener">立即下载</a>
          </article>
        </div>
      </section>

      <section id="download-launchers" class="download-section-block">
        <div class="download-section-heading">
          <div>
            <p class="download-section-eyebrow">LAUNCHERS</p>
            <h2 class="download-section-title">🚀 启动器下载</h2>
          </div>
          <span class="download-section-count">{{ launcherDownloads.length }} 项</span>
        </div>
        <div class="download-cards">
          <article v-for="item in launcherDownloads" :key="item.id" class="download-card launcher-card">
            <div class="launcher-card-heading">
              <img :src="item.icon" :alt="item.name" class="launcher-icon" width="40" height="40" loading="lazy">
              <div>
                <h3>{{ item.name }}</h3>
                <span class="download-version">{{ item.developer }}</span>
              </div>
            </div>
            <p class="download-desc">{{ item.description }}</p>
            <a class="btn-primary download-btn" :href="item.url" target="_blank" rel="noopener">前往官方网站下载</a>
          </article>
        </div>
      </section>

      <section id="download-guide" class="download-section-block download-guide-section">
        <div class="download-section-heading">
          <div>
            <p class="download-section-eyebrow">INSTALLATION</p>
            <h2 class="download-section-title">🛠️ 快速安装指南</h2>
          </div>
          <button
            type="button"
            class="tutorial-customize-btn"
            :aria-expanded="tutorialPickerOpen"
            aria-controls="tutorial-launcher-picker"
            @click="tutorialPickerOpen = !tutorialPickerOpen"
          >
            <img :src="selectedTutorial.icon" alt="" width="24" height="24">
            <span>定制此教程</span>
          </button>
        </div>
        <div v-if="tutorialPickerOpen" id="tutorial-launcher-picker" class="tutorial-picker">
          <div>
            <strong>选择使用的启动器</strong>
            <p>教程步骤将根据所选启动器调整。</p>
          </div>
          <div class="tutorial-picker-options">
            <button
              v-for="launcher in tutorialLaunchers"
              :key="launcher.id"
              type="button"
              class="tutorial-picker-option"
              :class="{ 'tutorial-picker-option--active': selectedTutorialLauncher === launcher.id }"
              :aria-pressed="selectedTutorialLauncher === launcher.id"
              @click="selectTutorialLauncher(launcher.id)"
            >
              <img :src="launcher.icon" alt="" width="36" height="36">
              <span>{{ launcher.name }}</span>
              <span class="tutorial-picker-check" aria-hidden="true">{{ selectedTutorialLauncher === launcher.id ? '✓' : '' }}</span>
            </button>
          </div>
        </div>
        <div class="tutorial-current">
          当前显示：<strong>{{ selectedTutorial.name }} 教程</strong>
        </div>
        <ol class="install-guide">
          <li v-for="(step, index) in installSteps" :key="step.text" class="install-step">
            <div class="install-step-number">{{ index + 1 }}</div>
            <div class="install-step-content">
              <p>{{ step.text }}</p>
              <div class="install-guide-image">
                <img :src="step.image" :alt="step.alt" width="1920" height="1080" loading="lazy">
              </div>
            </div>
          </li>
        </ol>
      </section>
    </section>
  </div>
</template>

<style scoped lang="scss">
.download-main { padding: 36px 0 80px; }
.download-section-block { scroll-margin-top: 96px; margin-bottom: 72px; }
.download-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.download-section-eyebrow { margin: 0 0 6px; color: var(--accent-color); font-size: .75rem; font-weight: 700; letter-spacing: .14em; }
.download-section-title { margin: 0; padding-bottom: 12px; border-bottom: 2px solid var(--primary-color); color: var(--dark-color); font-size: clamp(1.7rem, 3vw, 2.2rem); }
.download-section-count { flex: 0 0 auto; padding: 5px 11px; border-radius: 999px; background: rgba(168, 230, 207, .32); color: var(--dark-color); font-size: .82rem; font-weight: 600; }
.download-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 22px; }
.download-card { display: flex; min-height: 235px; flex-direction: column; padding: 24px; border: 1px solid rgba(168, 230, 207, .55); border-radius: 14px; background: linear-gradient(145deg, #fff, #f8fdfa); box-shadow: 0 10px 26px rgba(52, 94, 84, .07); }
.download-card-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.download-card-header h3, .launcher-card-heading h3 { margin: 0; color: var(--dark-color); font-size: 1.25rem; line-height: 1.35; }
.download-version { display: inline-block; max-width: 100%; padding: 4px 10px; border-radius: 999px; background: var(--primary-color); color: var(--dark-color); font-size: .8rem; overflow-wrap: anywhere; }
.download-desc { flex: 1; margin: 0 0 22px; color: var(--text-color); line-height: 1.7; }
.download-btn { display: inline-flex; width: 100%; align-items: center; justify-content: center; text-align: center; }
.download-state, .download-empty { padding: 30px 20px; border: 1px dashed rgba(52, 94, 84, .28); border-radius: 12px; color: var(--text-color); background: rgba(168, 230, 207, .1); text-align: center; }
.download-state--loading { margin: 0 0 48px; }
.launcher-card-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.launcher-icon { width: 48px; height: 48px; flex: 0 0 auto; border-radius: 8px; object-fit: cover; }
.launcher-card-heading .download-version { margin-top: 6px; }
.download-guide-section { margin-bottom: 0; }
.tutorial-customize-btn { display: inline-flex; min-height: 44px; align-items: center; gap: 9px; padding: 8px 16px; border: 1px solid var(--accent-color); border-radius: 999px; background: #fff; color: var(--dark-color); font: inherit; font-weight: 600; cursor: pointer; transition: background-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.tutorial-customize-btn:hover { background: rgba(168, 230, 207, .22); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(52, 94, 84, .1); }
.tutorial-customize-btn img { width: 24px; height: 24px; border-radius: 5px; object-fit: cover; }
.tutorial-picker { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: -8px 0 20px; padding: 18px 20px; border: 1px solid rgba(168, 230, 207, .65); border-radius: 14px; background: rgba(255, 255, 255, .82); box-shadow: 0 8px 22px rgba(52, 94, 84, .07); }
.tutorial-picker strong { color: var(--dark-color); }
.tutorial-picker p { margin: 3px 0 0; color: var(--text-color); font-size: .9rem; }
.tutorial-picker-options { display: flex; flex-wrap: wrap; gap: 10px; }
.tutorial-picker-option { display: grid; min-width: 126px; grid-template-columns: 36px 1fr 18px; align-items: center; gap: 9px; padding: 10px 12px; border: 1px solid rgba(52, 94, 84, .2); border-radius: 10px; background: #fff; color: var(--dark-color); font: inherit; font-weight: 600; text-align: left; cursor: pointer; transition: border-color .2s ease, background-color .2s ease; }
.tutorial-picker-option:hover, .tutorial-picker-option--active { border-color: var(--accent-color); background: rgba(168, 230, 207, .18); }
.tutorial-picker-option img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
.tutorial-picker-check { color: var(--accent-color); font-size: 1.1rem; text-align: center; }
.tutorial-current { margin: -6px 0 8px 58px; color: var(--text-color); font-size: .9rem; }
.tutorial-current strong { color: var(--dark-color); }
.install-guide { display: grid; gap: 20px; margin: 0; padding: 0; list-style: none; }
.install-step { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 16px; padding: 24px 0 28px; border-top: 1px solid rgba(168, 230, 207, .65); }
.install-step:last-child { border-bottom: 1px solid rgba(168, 230, 207, .65); }
.install-step-number { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 50%; background: var(--accent-color); color: var(--light-text); font-size: 1rem; font-weight: 700; }
.install-step-content { min-width: 0; }
.install-step-content > p { margin: 4px 0 18px; color: var(--dark-color); font-size: 1.08rem; line-height: 1.7; }
.install-guide-image { width: min(100%, 900px); aspect-ratio: 16 / 9; overflow: hidden; border: 1px solid rgba(168, 230, 207, .65); border-radius: 12px; background: rgba(168, 230, 207, .1); box-shadow: 0 8px 22px rgba(52, 94, 84, .08); }
.install-guide-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
@media(max-width:640px){
  .download-main { padding-top: 24px; }
  .download-state--loading { margin-bottom: 38px; }
  .download-section-block { margin-bottom: 56px; }
  .download-section-heading { align-items: flex-start; flex-direction: column; gap: 10px; }
  .download-card { padding: 20px; }
  .tutorial-customize-btn { width: 100%; justify-content: center; }
  .tutorial-picker { align-items: stretch; flex-direction: column; gap: 14px; }
  .tutorial-picker-options { display: grid; grid-template-columns: 1fr 1fr; }
  .tutorial-picker-option { min-width: 0; }
  .tutorial-current { margin-left: 44px; }
  .install-step { grid-template-columns: 32px minmax(0, 1fr); gap: 12px; padding: 20px 0 24px; }
  .install-step-number { width: 30px; height: 30px; font-size: .9rem; }
  .install-step-content > p { font-size: 1rem; }
}
</style>
