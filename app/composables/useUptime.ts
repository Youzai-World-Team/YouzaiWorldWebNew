import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { SITE_START } from '~/utils/site'

export function useUptime(startISO: string = SITE_START): Ref<string> {
  const text = ref('')
  let timer: number | undefined

  const update = () => {
    const diff = Date.now() - new Date(startISO).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    text.value = `${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`
  }

  onMounted(() => {
    update()
    timer = window.setInterval(update, 1000)
  })
  onBeforeUnmount(() => {
    if (timer) window.clearInterval(timer)
  })

  return text
}
