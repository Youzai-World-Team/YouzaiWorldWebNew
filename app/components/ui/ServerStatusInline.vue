<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {fetchMinecraftStatus, type McStatus} from '~/composables/useServerStatus'

const props = withDefaults(
    defineProps<{
      server: string
      port?: number
    }>(),
    {port: 25565},
)

type State = 'loading' | 'online' | 'offline'
const state = ref<State>('loading')
const data = ref<McStatus | null>(null)

onMounted(async () => {
  const result = await fetchMinecraftStatus(props.server, props.port)
  data.value = result ?? {
    online: false,
    host: undefined,
    port: NaN,
    players: {online: NaN, max: NaN},
    version: NaN,
    delay: NaN,
    error: undefined
  } as unknown as McStatus
  state.value = result?.online ? 'online' : 'offline'
})
</script>

<template>
  <div class="server-status" :class="state === 'loading' ? 'inloading' : state">
    <div class="server-status-content">
      <div class="server-status-details">
        <div class="server-status-title">
          <span class="status-indicator" :class="state === 'loading' ? 'inloading' : state"/>
          <template v-if="state === 'loading'">{{ server }} - 正在获取...</template>
          <template v-else-if="state === 'online'">
            {{ server }} - 在线玩家数量: {{ data?.players?.online ?? 0 }}/{{ data?.players?.max ?? 0 }}
          </template>
          <template v-else>{{ server }} - 获取失败</template>
        </div>
      </div>
    </div>
  </div>
</template>
