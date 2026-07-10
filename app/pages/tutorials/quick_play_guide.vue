<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import NoticeBanner from '~/components/ui/NoticeBanner.vue'
import guideContent from '~/assets/guide/quick-play-guide.html?raw'
import PageHero from "~/components/ui/PageHero.vue";
import Breadcrumbs from "~/components/ui/Breadcrumbs.vue";

useHead({title: '快速游玩指南 - Youzai World'})

const allToc = [
  {id: 'section1', label: '1 获取客户端'},
  {id: 'section1-1', label: '1.1 注册账号'},
  {id: 'section1-2', label: '1.2 下载游戏'},
  {id: 'section1-3', label: '1.3 安装游戏'},
  {id: 'section1-4', label: '1.4 登录游戏'},
  {id: 'section2', label: '2 加入服务器'},
  {id: 'section3', label: '3 服务器基本玩法教程'},
  {id: 'section3-1', label: '3.1 主菜单'},
  {id: 'section3-2', label: '3.2 领地系统'},
  {id: 'section3-3', label: '3.3 公会系统'},
  {id: 'section3-4', label: '3.4 等级'},
  {id: 'section3-5', label: '3.5 传送系统'},
  {id: 'section3-6', label: '3.6 交易系统'},
  {id: 'section3-7', label: '3.7 经济系统'},
  {id: 'section3-8', label: '3.8 决斗系统'},
  {id: 'section3-9', label: '3.9 双码使用系统'},
  {id: 'section3-9-1', label: '3.9.1 邀请码'},
  {id: 'section3-9-2', label: '3.9.2 兑换CDK'},
  {id: 'section3-10', label: '3.10 签到系统'},
  {id: 'section3-11', label: '3.11 全服消息与侧边栏显隐状态'},
  {id: 'section3-12', label: '3.12 信息统计'},
  {id: 'section3-12-1', label: '3.12.1 排行榜'},
  {id: 'section3-12-2', label: '3.12.2 集中统计'},
  {id: 'section3-13', label: '3.13 管理员菜单'},
  {id: 'section3-13-1', label: '3.13.1 设置您的游戏模式'},
  {id: 'section3-13-2', label: '3.13.2 编辑记分板'},
  {id: 'section3-13-3', label: '3.13.3 兑换码设置'},
  {id: 'section3-13-4', label: '3.13.4 封禁玩家菜单'},
  {id: 'section3-13-5', label: '3.13.5 高级领地管理'},
  {id: 'section3-13-6', label: '3.13.6 控制台'},
  {id: 'section3-13-7', label: '3.13.7 编辑菜单'},
]

const toc = allToc.filter((item) => guideContent.includes(`id="${item.id}"`))

const activeId = ref('')
const sidebarActive = ref(false)

function goTo(id: string, e: MouseEvent) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  activeId.value = id

  const top = el.getBoundingClientRect().top + window.scrollY - 100
  window.scrollTo({top, behavior: 'smooth'})
  if (window.innerWidth <= 768) sidebarActive.value = false
}

function toggleSidebar() {
  sidebarActive.value = !sidebarActive.value
}

function closeSidebar() {
  sidebarActive.value = false
}

function onScroll() {
  const line = 150
  for (const item of toc) {
    const el = document.getElementById(item.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top <= line && rect.bottom > line) {
      activeId.value = item.id
    }
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, {passive: true}))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div>
    <PageHero title="快速游玩指南" subtitle="Quick Play Guide"/>
    <br><br>

    <Breadcrumbs
        :items="[{ label: '主页', to: '/' }, { label: '教程中心主页', to: '/tutorial' }, { label: '快速游玩指南'}]"/>

    <NoticeBanner contained>
      <strong>提示：</strong>此页面及其子页面部分内容属于前 Bedrock 版服务器的遗留内容，正在逐步更新中！
    </NoticeBanner>

    <main class="tutorial-container">
      <aside class="tutorial-sidebar" :class="{ active: sidebarActive }">
        <nav>
          <ul class="tutorial-nav">
            <li v-for="item in toc" :key="item.id">
              <a
                  :href="`#${item.id}`"
                  :class="{ active: activeId === item.id }"
                  @click="goTo(item.id, $event)"
              >{{ item.label }}</a>
            </li>
          </ul>
        </nav>
      </aside>

      <div class="tutorial-content" v-html="guideContent"/>
    </main>
  </div>
</template>