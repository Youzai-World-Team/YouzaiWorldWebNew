<script setup lang="ts">
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import PackCard from '~/components/download/PackCard.vue'
import { packagePlatforms, launcherPlatforms } from '~/utils/downloads'

useHead({ title: '下载中心 - Youzai World' })
</script>

<template>
  <div>
    <PageHero title="下载中心" subtitle="Download Center" />
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '下载中心' }]" />

    <section class="download-main container">
      <p>
        请注意选择您所使用的平台对应的资源包进行下载！若发现下载资源包后无法进入服务器，请进入 QQ 群联系管理员反馈问题！
      </p>

      <div class="banner" role="alert">
        <span class="banner-icon" aria-hidden="true">🌱</span>
        <div class="banner-content">
          <strong>注意：</strong>“是否带配置”选项为是否包含客户端的配置文件（即包含原版的 options.txt
          文件），如下载包含该文件的版本，则游戏将优先使用资源包内的配置文件，覆盖掉原有的配置文件；如下载不包含该文件的版本，则游戏将使用原版默认的配置文件（可能存在某些地方的按键冲突）。<br><br>
          <details>
            <summary><strong>我该如何选择是否带配置</strong></summary>
            <strong>新手玩家：</strong>建议选择带配置的版本，使用资源包制作者的 options.txt 文件。<br>
            <strong>高阶玩家：</strong>可以选择不带配置的版本并复制自己的 options.txt 文件到安装完的版本文件夹内，以保留自己的按键设置和视频设置等配置项。
          </details>
          <br>
          <hr>
          <br>
          点击下载按钮后来到的页面有 3 个按钮，请选择<strong style="color: red;">红色</strong>的<strong>普通下载</strong>按钮！
          <img src="https://assets.mcyzw.top/images/download_info.webp" alt="info" loading="lazy" style="height: 100%; width: 100%;">
        </div>
        <button class="banner-close" aria-label="关闭此提示" onclick="this.parentNode.style.display='none'">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="download-section-block" id="download-packages">
        <h2 class="download-section-title">📦 资源包下载</h2>

        <div v-for="platform in packagePlatforms" :key="platform.platformTitle" class="download-platform">
          <h3 class="platform-title">
            <img :src="platform.platformIcon" alt="" class="platform-icon"> {{ platform.platformTitle }}
          </h3>

          <div v-if="platform.cards" class="download-cards">
            <PackCard v-for="card in platform.cards" :key="card.id" :card="card" />
          </div>

          <template v-if="platform.groups">
            <div v-for="group in platform.groups" :key="group.rendererTitle" class="renderer-group">
              <h4 class="renderer-title">
                <img :src="group.rendererIcon" class="renderer-icon" alt=""> {{ group.rendererTitle }}
              </h4>
              <div class="download-cards">
                <PackCard v-for="card in group.cards" :key="card.id" :card="card" />
              </div>
            </div>

            <p class="download-tip">
              💡 不知道什么是 Mobile Glues 渲染器？点击<a
                href="https://www.bilibili.com/video/BV1udbEzfEjv"
                class="external-link"
                target="_blank"
              >这里</a>前往了解！
            </p>
            <div class="banner" role="alert">
              <span class="banner-icon" aria-hidden="true">🌱</span>
              <div class="banner-content">
                <strong>Mobile Glues 支持使用的光影包：</strong>访问<a
                  href="https://github.com/MobileGL-Dev/MobileGlues-release/blob/main/CompatibleShaders.md"
                  target="_blank"
                  class="external-link"
                >https://github.com/MobileGL-Dev/MobileGlues-release/blob/main/CompatibleShaders.md</a>以获取最新的兼容光影包列表！
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="download-section-block" id="download-laucher">
        <h2 class="download-section-title">🚀 启动器下载</h2>

        <div v-for="platform in launcherPlatforms" :key="platform.platformTitle" class="download-platform">
          <h3 class="platform-title">
            <img :src="platform.platformIcon" alt="" class="platform-icon"> {{ platform.platformTitle }}
          </h3>
          <div class="download-cards">
            <div v-for="card in platform.cards" :key="card.title" class="download-card">
              <div class="download-card-header">
                <h4>
                  <img :src="card.icon" class="card-icon" :alt="card.title">
                  {{ card.title }}
                </h4>
                <span class="download-version" v-html="card.version" />
              </div>
              <div class="download-card-body">
                <p class="download-desc">{{ card.desc }}</p>
              </div>
              <div class="download-card-footer">
                <a :href="card.href" target="_blank" class="btn-primary download-btn">
                  {{ card.buttonText || '前往官方网站下载' }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.download-main {
    padding: 40px 0 60px;
}

.download-section-block {
    margin-bottom: 50px;
}

.download-section-title {
    font-size: 2.2rem;
    color: var(--dark-color);
    margin-bottom: 30px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-color);
    position: relative;
}
.download-section-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background-color: var(--accent-color);
}

.download-platform {
    margin-bottom: 40px;
}
.platform-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.8rem;
    color: var(--dark-color);
    margin-bottom: 20px;
}
.platform-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    filter: brightness(0.9);
}

.renderer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 20px;
}
@media (max-width: 640px) {
    .renderer-grid {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}

.renderer-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4rem;
    color: var(--dark-color);
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--primary-color);
}
.renderer-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
}

.download-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
}

.download-card {
    background: linear-gradient(145deg, #ffffff, #f8fdfa);
    border-radius: 18px;
    padding: 24px 22px;
    box-shadow: 0 12px 28px rgba(52, 94, 84, 0.08), 0 4px 12px rgba(52, 94, 84, 0.05);
    border: 1px solid rgba(168, 230, 207, 0.4);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}
.download-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 32px rgba(52, 94, 84, 0.12);
    border-color: var(--accent-color);
}

.download-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.download-card-header h3,
.download-card-header h4 {
    color: var(--dark-color);
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}
.card-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 4px;
    object-fit: cover;
}

.download-version {
    background-color: var(--primary-color);
    color: var(--dark-color);
    padding: 4px 12px;
    border-radius: 40px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.download-card-body {
    flex: 1;
    margin-bottom: 20px;
}
.download-desc {
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 16px;
    opacity: 0.9;
}
.download-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    font-size: 0.9rem;
    color: var(--dark-color);
    background: rgba(168, 230, 207, 0.2);
    padding: 10px 14px;
    border-radius: 30px;
    margin-bottom: 12px;
}
.download-note {
    font-size: 0.85rem;
    color: var(--dark-color);
    background: rgba(255, 193, 7, 0.15);
    padding: 6px 12px;
    border-radius: 30px;
    margin-top: 10px;
    border-left: 3px solid #ffb74d;
}

.download-options {
    margin: 10px 0 15px;
    padding: 10px 12px;
    background: rgba(168, 230, 207, 0.1);
    border-radius: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}
.download-options .options-label {
    font-weight: 600;
    color: var(--dark-color);
    margin-right: 5px;
}
.download-options label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: var(--text-color);
}
.download-options input[type="radio"] {
    accent-color: var(--accent-color);
    width: 14px;
    height: 14px;
    margin-right: 2px;
    cursor: pointer;
}

.download-card-footer {
    margin-top: auto;
}
.download-card-footer .btn-primary {
    width: 100%;
    text-align: center;
    display: inline-block;
    padding: 12px 0;
    font-size: 1.1rem;
    color: var(--light-text);
    text-decoration: none;
}
.download-card-footer .btn-primary:hover {
    background-color: var(--dark-color);
}

.download-tip {
    background: #e8f4f0;
    border-left: 6px solid var(--accent-color);
    padding: 16px 22px;
    border-radius: 12px;
    margin: 25px 0 15px;
    color: var(--dark-color);
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.download-extra {
    text-align: center;
    margin-top: 20px;
    padding: 16px;
    background: rgba(168, 230, 207, 0.15);
    border-radius: 60px;
    color: var(--text-color);
}
.download-extra a {
    font-weight: 600;
}

@media (max-width: 768px) {
    .download-section-title {
        font-size: 1.9rem;
    }
    .platform-title {
        font-size: 1.6rem;
    }
    .download-cards {
        grid-template-columns: 1fr;
    }
    .download-card-header h3,
    .download-card-header h4 {
        font-size: 1.25rem;
    }
    .download-options {
        gap: 12px;
    }
}
@media (max-width: 480px) {
    .download-meta {
        flex-direction: column;
        gap: 6px;
    }
    .download-card {
        padding: 20px 16px;
    }
    .download-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>
