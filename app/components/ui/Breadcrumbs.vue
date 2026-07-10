<script setup lang="ts">
interface Crumb {
  label: string
  to?: string
}

defineProps<{
  items: Crumb[]
}>()
</script>

<template>
  <div class="container">
    <div class="breadcrumbs">
      <template v-for="(item, i) in items" :key="i">
        <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumb-current">{{ item.label }}</span>
        <span v-if="i < items.length - 1" class="breadcrumb-separator">/</span>
      </template>
    </div>
  </div>
</template>
