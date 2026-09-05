<script setup lang="ts">
import {onMounted, ref} from 'vue'
import HeroSection from '~/components/home/HeroSection.vue'
import FeatureCarousel from '~/components/home/FeatureCarousel.vue'
import WorldsExplorer from '~/components/home/WorldsExplorer.vue'
import ChatBoard from '~/components/home/ChatBoard.vue'
import ServerStatusInline from '~/components/ui/ServerStatusInline.vue'
import {fetchActivities} from '~/composables/useActivities'
import {strengths, team} from '~/utils/home'
import {useClipboard} from '~/composables/useClipboard'
import type {Trend} from '~/types'

useHead({title: '主页 - Youzai World'})

const previewTrends = ref<Trend[]>([])
const {copiedKey, copy} = useClipboard()

onMounted(async () => {
  const all = await fetchActivities()
  previewTrends.value = all.slice(0, 3)
})
</script>

<template>
  <div>
    <HeroSection/>

    <ChatBoard/>

    <section id="about" class="gallery">
      <div class="container">
        <h2>关于服务器</h2>
        <div class="ranking-note">
          <p>
            <strong>悠哉世界</strong>，一位腐竹以及管理员们共同维护着的服务器，<strong>2025 年 6 月</strong>开服至今。<br>
            开始，只有服主在服里和班上同学游玩，后面发现班上游玩国际版的同学太少，遂决定开放。<br>
            自 <strong>2026 年 1 月</strong>起，悠哉世界正式从 <strong>Bedrock 版</strong>迁移至 <strong>Java 版</strong>，以<strong>更开放、更灵活</strong>的模组生态，迎接<strong>更广阔的创造可能</strong>。此次迁移使服务器获得了
            <strong>Java
              版独有的红石机制</strong>、<strong>命令系统</strong>与<strong>社区资源</strong>，让<strong>建筑</strong>、<strong>生电</strong>与<strong>冒险体验全面提升</strong>。<br>
            如今，我们<strong>依托 Java 版强大的服务器支持</strong>，实现了<strong>更稳定的多人在线环境</strong>、<strong>更丰富的游戏内容扩展</strong>，并逐步构建起<strong>兼容原版</strong>与<strong>轻度模组</strong>的特色玩法体系，致力于为每一位玩家打造<strong>更自由</strong>、<strong>更持久的</strong>游戏家园。<br>
          </p>
          <br>
          <p style="text-align: right; font-weight: bold; font-style: italic;">
            ——<strong>Youzai World Team</strong>
          </p>
        </div>
      </div>
    </section>

    <section id="gallery" class="gallery">
      <div class="container">
        <h2>服务器展示</h2>
        <div class="gallery-grid">
          <p class="ranking-note">
            Oops！还没有能够展示的图片或视频内容，欢迎各位玩家前往<a class="external-link">投稿</a>~
          </p>
        </div>
      </div>
    </section>

    <section id="trend" class="gallery">
      <div class="container">
        <h2>服务器动态</h2>
        <div class="trend-list">
          <div v-for="t in previewTrends" :key="t.id ?? t.date" class="trend-item">
            <img :src="`https://assets.mcyzw.top/images/${t.icon}`" :alt="t.type" class="trend-icon">
            <div class="trend-content">
              <span class="trend-date">{{ t.date }}</span>
              <span class="trend-text">{{ t.text }}</span>
            </div>
          </div>
        </div>
        <div class="trend-more">
          <NuxtLink to="/trend" class="show-more-btn" style="text-decoration: none;">查看更多动态</NuxtLink>
        </div>
      </div>
    </section>

    <section id="events" class="events">
      <div class="container">
        <h2>近期活动</h2>
        <div class="events-list">
          <p class="ranking-note">Oops！近期没有活动正在举行哦~</p>
        </div>
      </div>
    </section>

    <section id="player-ranking" class="ranking">
      <div class="container">
        <h2>上月玩家之最</h2>
        <div class="ranking-grid">
          <p class="ranking-note">Oops！还没有能够展示的数据内容，各位玩家再接再厉吧~</p>
        </div>
      </div>
    </section>

    <FeatureCarousel/>

    <WorldsExplorer/>

    <section id="team" class="team">
      <div class="container">
        <h2>我们的团队</h2>
        <p class="ranking-note">一群热爱 Minecraft 的管理员，致力于打造最优质的游玩体验！</p>
        <br>
        <div class="team-grid">
          <div v-for="member in team" :key="member.name" class="team-card">
            <div class="team-avatar">
              <img :src="member.avatar" :alt="member.name" loading="lazy">
            </div>
            <div class="team-info">
              <h3>{{ member.name }}</h3>
              <template v-for="(role, i) in member.roles" :key="i">
                <span
                    class="team-role"
                    :style="role.danger ? 'background-color:#ff5a4a;color: aliceblue;' : undefined"
                >{{ role.label }}</span>
                {{ ' ' }}
              </template>
              <p>{{ member.duty }}<br></p>
              <template v-if="member.bio">
                <img class="bioqt" src="https://assets.mcyzw.top/images/qt.svg">
                <p class="bio">{{ member.bio }}</p>
              </template>
              <div class="sclinkarea">
                <a v-for="link in member.links" :key="link.url" :href="link.url" target="_blank">
                  <img :title="link.title" class="sclink" :src="link.icon">
                </a>
              </div>
            </div>
          </div>
        </div>
        <br><br>
        <p class="ranking-note">我们正在招聘开发、维护和管理等成员，有意者请联系服主以获取更多信息~</p>
      </div>
    </section>

    <section id="strength" class="strength">
      <div class="container">
        <h2>我们的优势</h2>
        <div class="strength-grid">
          <div v-for="s in strengths" :key="s.title" class="strength-card">
            <div class="strength-image-container">
              <img :src="s.image" :alt="s.alt" loading="lazy">
            </div>
            <h3>{{ s.title }}</h3>
            <p v-html="s.desc"/>
            <a
                v-if="s.link?.startsWith('http')"
                :href="s.link"
                class="internal-link"
                style="text-decoration: none;"
            >{{ s.linkText }}</a>
            <NuxtLink
                v-else-if="s.link"
                :to="s.link"
                class="internal-link"
                style="text-decoration: none;"
            >{{ s.linkText }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="join" class="join">
      <div class="container">
        <h2>加入服务器</h2>
        <div class="join-content">
          <div class="join-info" id="join-server">
            <h3>服务器地址</h3>
            <div class="server-info-item">
              <span class="info-label">IP 地址</span>
              <span class="info-value">play.mcyzw.top</span>
              <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === 'ip' }"
                  @click="copy('play.mcyzw.top', 'ip')"
              >{{ copiedKey === 'ip' ? '成功' : '复制' }}
              </button>
            </div>
            <div class="download-section">
              <img src="https://assets.mcyzw.top/images/info.svg" alt="信息" class="trend-icon">
              <p>
                在您加入服务器之前，您还需要前往
                <NuxtLink to="/download#download-packs" class="internal-link">此处</NuxtLink>
                下载并安装服务器的整合包~
              </p>
            </div>
            <hr class="b-border">
            <section id="version" style="width: 0px; height: 0px;"/>
            <h3>版本信息</h3>
            <div class="server-info-item">
              <span class="info-label">当前服务器版本</span>
              <span class="info-value">Minecraft Fabric 26.2</span>
            </div>
            <div class="server-info-item">
              <span class="info-label">需用客户端版本</span>
              <span class="info-value">Minecraft Java 26.2</span>
            </div>
            <div class="download-section">
              <img src="https://assets.mcyzw.top/images/info.svg" alt="信息" class="trend-icon">
              <p>
                还没有 Minecraft Java 启动器？前往
                <NuxtLink to="/download#download-launchers" class="internal-link">此处</NuxtLink>
                查看详情并下载启动器~
              </p>
            </div>
            <hr class="b-border">
            <h3>服务器状态</h3>
            <div class="download-section">
              <p>在此处可以查看服务器当前在线人数~</p>
              <ServerStatusInline server="play.mcyzw.top" :port="25565"/>
              <NuxtLink to="/status" class="internal-link">查看详细信息</NuxtLink>
            </div>
          </div>

          <div class="join-info" id="join-qqqun">
            <h3>加入官方 QQ 群</h3>
            <div class="download-section">
              <p class="form-note">加入 QQ 群与其他玩家交流，获取服务器最新动态</p>
              <a
                  href="https://qun.qq.com/universal-share/share?ac=1&authKey=M6tNd6sdN%2BMEAYp9I%2BGBvs7nWccwOedsMPduvR61S7t193ROqakcs3oMZ5KsKuLU&busi_data=eyJncm91cENvZGUiOiI4OTU2ODk2NDIiLCJ0b2tlbiI6IlVmM2pQTVdhT1p4Y3RacmpXTk1Ed0hkZnJuNVRKY2d4eGhzdmpraDhTT2svcklmeTdybHVCcHAvRWMxY2k5bE8iLCJ1aW4iOiI0NDc5MzM5NzkifQ%3D%3D&data=R6unTM903zhIru-geYgOjx3ZbYIlX4UVQ1IJpUvMdyUfVGCrMwOJXl2wIxUAlNiRZ9Sh6lAcjj9DVeUrO9q8xw&svctype=4&tempid=h5_group_info"
                  target="_blank"
                  class="btn-primary qq-group-btn"
              >
                <i class="fa fa-qq" aria-hidden="true">加入 QQ 群</i>
                <div class="external-link"/>
              </a>
            </div>
            <div class="server-info-item">
              <span class="info-label">群号</span>
              <span class="info-value">895689642</span>
              <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === 'qq' }"
                  @click="copy('895689642', 'qq')"
              >{{ copiedKey === 'qq' ? '成功' : '复制' }}
              </button>
            </div>
            <div class="download-section">
              <img src="https://assets.mcyzw.top/images/qqgroup.webp" style="max-width: 80%; max-height: 80%;" alt="qqgroup">
            </div>
            <hr class="b-border">
            <h3>教程中心</h3>
            <div class="download-section">
              <p>对加入服务器有疑问？此处的教程可以帮助您！</p>
              <NuxtLink to="/tutorials/quick_play_guide" class="btn-primary qq-group-btn">
                <i class="fa fa-qq" aria-hidden="true">查看快速游玩指南</i>
              </NuxtLink>
              <br><br>
              <p>更多教程请前往
                <NuxtLink to="/tutorial" class="internal-link">教程中心</NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
