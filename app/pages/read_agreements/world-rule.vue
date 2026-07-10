<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import creativeContent from '~/assets/agreements/creative.html?raw'

const route = useRoute()

const world = computed(() => decodeURIComponent(route.path.split('/').pop() || ''))

const titles: Record<string, string> = {
  survival: '生存世界规则与游玩协议',
  creative: '创造世界规则与游玩协议',
  building: '建造世界规则与游玩协议',
}
const title = computed(() => titles[world.value] || '世界规则与游玩协议')

const content = computed(() => (world.value === 'creative' ? creativeContent : ''))

useHead(() => ({ title: `${title.value} - Youzai World` }))
</script>

<template>
  <div>
    <PageHero :title="title" subtitle="World Rules & Agreement" />
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: title }]" />

    <main v-if="content" class="agreement-container" v-html="content" />

    <main v-else class="agreement-container">
      <div class="agreement-card">
        <div class="agreement-section">
          <h2>内容正在完善中</h2>
          <p>该世界的规则与游玩协议正在整理中，敬请期待~</p>
          <p>
            在此期间，您可以先阅读
            <NuxtLink to="/read_agreements/server_play_agreement" class="internal-link">
              《悠哉世界·玩家游玩协议》
            </NuxtLink>
            了解服务器的通用规则。
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
