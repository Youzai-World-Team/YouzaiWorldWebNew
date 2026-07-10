<script setup lang="ts">
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import agreementContent from '~/assets/agreements/server-play.html?raw'

useHead({ title: '玩家游玩协议 - Youzai World' })
</script>

<template>
  <div>
    <PageHero title="玩家游玩协议" subtitle="Play Agreement" />
    <br><br>

    <Breadcrumbs :items="[{ label: '首页', to: '/' }, { label: '玩家游玩协议' }]" />

    <main class="agreement-container" v-html="agreementContent" />
  </div>
</template>
