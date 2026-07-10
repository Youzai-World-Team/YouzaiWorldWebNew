<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'

interface Track {
  name: string
  url: string
}

const playlist: Track[] = [
  {name: 'Minecraft', url: '/medias/minecraft.m4a'},
  {name: 'Watcher', url: '/medias/Watcher.m4a'},
]

const isPlaying = ref(false)
const currentIndex = ref(0)
const playlistOpen = ref(false)
const showTip = ref(false)

let audio: HTMLAudioElement | null = null
let consecutiveErrors = 0
let pendingPlay = false
let tipShown = false
const MAX_CONSECUTIVE_ERRORS = 2

const loaderHidden = useState<boolean>('app.loaderHidden', () => false)

function showMusicTip() {
  if (tipShown) return
  tipShown = true
  showTip.value = true
  window.setTimeout(() => {
    showTip.value = false
  }, 5000)

  const playOnInteraction = () => {
    if (audio && !isPlaying.value) audio.play().catch(() => {
    })
    document.removeEventListener('click', playOnInteraction)
    document.removeEventListener('touchstart', playOnInteraction)
  }
  document.addEventListener('click', playOnInteraction)
  document.addEventListener('touchstart', playOnInteraction)
}

function onCanPlay() {
  if (pendingPlay || (!isPlaying.value && audio && audio.paused)) {
    pendingPlay = false
    audio?.play().catch(showMusicTip)
  }
}

function onPlay() {
  isPlaying.value = true
  consecutiveErrors = 0
  pendingPlay = false
}

function onPause() {
  isPlaying.value = false
}

function onEnded() {
  playNext(false)
}

function onError() {
  consecutiveErrors++
  if (consecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
    playNext(false)
  } else if (audio) {
    audio.pause()
    audio = null
    isPlaying.value = false
  }
}

function detach(a: HTMLAudioElement) {
  a.removeEventListener('canplay', onCanPlay)
  a.removeEventListener('play', onPlay)
  a.removeEventListener('pause', onPause)
  a.removeEventListener('ended', onEnded)
  a.removeEventListener('error', onError)
}

function loadAndPlay(index: number, userInitiated = false) {
  index = (index + playlist.length) % playlist.length
  if (index === currentIndex.value && audio && !audio.paused) return

  if (audio) {
    detach(audio)
    audio.pause()
    audio.src = ''
    audio.load()
    audio = null
  }

  currentIndex.value = index
  audio = new Audio(playlist[index]!.url)
  audio.volume = 0.5
  audio.loop = false
  audio.addEventListener('canplay', onCanPlay)
  audio.addEventListener('play', onPlay)
  audio.addEventListener('pause', onPause)
  audio.addEventListener('ended', onEnded)
  audio.addEventListener('error', onError)
  audio.load()

  if (userInitiated) pendingPlay = true
}

function playNext(userInitiated = true) {
  loadAndPlay(currentIndex.value + 1, userInitiated)
}

function playPrev() {
  loadAndPlay(currentIndex.value - 1, true)
}

function togglePlayPause() {
  if (!audio) return
  if (isPlaying.value) audio.pause()
  else audio.play().catch(showMusicTip)
}

function selectTrack(i: number) {
  loadAndPlay(i, true)
  playlistOpen.value = false
}

function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.music-playlist') && !target.closest('.music-playlist-btn')) {
    playlistOpen.value = false
  }
}

watch(
    loaderHidden,
    (hidden) => {
      if (hidden && audio && audio.paused && !isPlaying.value) {
        audio.play().catch(showMusicTip)
      }
    },
    {immediate: true},
)

onMounted(() => {
  loadAndPlay(0, false)
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  if (audio) {
    detach(audio)
    audio.pause()
    audio = null
  }
})
</script>

<template>
  <div class="music-player" id="musicPlayer">
    <button class="music-btn" title="播放/暂停" @click="togglePlayPause">
      <svg
          v-show="isPlaying"
          class="music-icon music-playing"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
      >
        <path d="M3 9v6h4l5 5V4L7 9H3z"/>
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.7"/>
      </svg>
      <svg
          v-show="!isPlaying"
          class="music-icon music-paused"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
      >
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>

    <button class="music-btn music-prev" title="上一首" @click="playPrev">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>

    <button class="music-btn music-next" title="下一首" @click="playNext(true)">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>

    <div class="music-playlist-btn" title="播放列表" @click="playlistOpen = !playlistOpen">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm13-1v8l6-4z"/>
      </svg>
    </div>

    <div class="music-playlist" :class="{ open: playlistOpen }">
      <div class="playlist-header">播放列表</div>
      <ul class="playlist-items">
        <li
            v-for="(track, i) in playlist"
            :key="track.url"
            :class="{ active: i === currentIndex }"
            @click="selectTrack(i)"
        >
          {{ track.name }}
        </li>
      </ul>
    </div>

    <Teleport to="body">
      <div v-if="showTip" class="music-tip">
        🎵 浏览器限制了自动播放，点击任意位置即可播放背景音乐 🎵
      </div>
    </Teleport>
  </div>
</template>
