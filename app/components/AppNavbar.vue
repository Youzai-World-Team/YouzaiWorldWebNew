<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {navItems} from '~/utils/site'

const route = useRoute()

const scrolled = ref(false)
const menuOpen = ref(false)
const openIndex = ref(-1)
const dropdownOpenTop = ref(false)

const isDesktop = () => window.innerWidth > 768

function updateNavbarState() {
  if (openIndex.value !== -1) return
  if (menuOpen.value) return
  if (window.scrollY > 50) {
    scrolled.value = true
  } else {
    scrolled.value = false
    dropdownOpenTop.value = false
  }
}

function closeAllDropdowns() {
  openIndex.value = -1
  if (window.scrollY <= 50) dropdownOpenTop.value = false
}

function toggleDropdown(index: number) {
  const wasActive = openIndex.value === index
  closeAllDropdowns()
  if (!wasActive) {
    openIndex.value = index
    if (isDesktop() && window.scrollY <= 50) dropdownOpenTop.value = true
  }
}

function toggleMenu() {
  const opening = !menuOpen.value
  menuOpen.value = opening
  if (!opening) {
    closeAllDropdowns()
    updateNavbarState()
  }
}

function onLinkClick() {
  if (window.innerWidth <= 768) {
    menuOpen.value = false
    closeAllDropdowns()
    updateNavbarState()
  } else {
    closeAllDropdowns()
  }
}

function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.nav-item.dropdown')) {
    closeAllDropdowns()
    updateNavbarState()
  }
}

function onResize() {
  closeAllDropdowns()
  menuOpen.value = false
  updateNavbarState()
}

function onScroll() {
  updateNavbarState()
}

watch(
    () => route.fullPath,
    () => {
      menuOpen.value = false
      closeAllDropdowns()
      updateNavbarState()
    },
)

onMounted(() => {
  window.addEventListener('scroll', onScroll, {passive: true})
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onDocumentClick)
  updateNavbarState()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <nav
      class="navbar"
      :class="{ scrolled, 'menu-open': menuOpen, 'dropdown-open': dropdownOpenTop }"
  >
    <div class="nav-container">
        <NuxtLink to="/" class="nav-logo" aria-label="悠哉世界 主页">
        <img src="/images/uzw-tm.png" alt="悠哉世界">
      </NuxtLink>

      <div class="nav-menu" :class="{ active: menuOpen }">
        <template v-for="(item, index) in navItems" :key="item.label">
          <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="nav-link"
              @click="onLinkClick"
          >
            {{ item.label }}
          </NuxtLink>

          <div v-else class="nav-item dropdown">
            <div
                class="nav-link dropdown-toggle"
                role="button"
                tabindex="0"
                @click.stop="toggleDropdown(index)"
                @keydown.enter.prevent="toggleDropdown(index)"
            >
              {{ item.label }}
            </div>
            <ul class="dropdown-menu" :class="{ active: openIndex === index }">
              <li v-for="child in item.children" :key="child.to">
                <NuxtLink :to="child.to" class="dropdown-link" @click="onLinkClick">
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </div>

      <div
          class="nav-toggle"
          :class="{ active: menuOpen }"
          role="button"
          tabindex="0"
          aria-label="打开菜单"
          @click="toggleMenu"
          @keydown.enter.prevent="toggleMenu"
      >
        <span class="bar"/>
        <span class="bar"/>
        <span class="bar"/>
      </div>
    </div>
  </nav>
</template>
