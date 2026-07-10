import { ref } from 'vue'

export function useClipboard(resetMs = 1000) {
  const copiedKey = ref<string | null>(null)

  const fallback = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      // @ts-ignore: document.execCommand is deprecated but used as a fallback
      document.execCommand('copy')
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const copy = async (text: string, key = text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      fallback(text)
    }
    copiedKey.value = key
    window.setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = null
    }, resetMs)
  }

  return { copiedKey, copy }
}
