<script setup lang="ts">
import {computed, ref} from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'
import NoticeBanner from '~/components/ui/NoticeBanner.vue'

useHead({title: '教程中心主页 - Youzai World'})

interface Tutorial {
  id: number
  title: string
  description: string
  image: string
  category: string
  date: string
  link: string
  sticky?: boolean
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: '快速游玩指南',
    description: '了解如何快速开始悠哉世界的冒险。',
    image: 'https://assets.mcyzw.top/images/background_9.webp',
    category: '入门|玩法',
    date: '2025-11-23',
    link: '/tutorials/quick_play_guide',
    sticky: true,
  },
]

const search = ref('')
const category = ref('all')

const allCategories = computed(() => {
  const set = new Set<string>()
  tutorials.forEach((t) => t.category.split('|').forEach((c) => set.add(c.trim())))
  return [...set]
})

const filtered = computed(() => {
  const term = search.value.toLowerCase().trim()
  let list = tutorials.slice()

  if (category.value !== 'all') {
    list = list.filter((t) =>
        t.category
            .split('|')
            .map((c) => c.trim())
            .includes(category.value),
    )
  }

  if (term !== '') {
    list = list.filter((t) => {
      const cats = t.category.split('|').map((c) => c.trim())
      const categoryMatch = cats.some((c) => c.toLowerCase().includes(term))
      return (
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          categoryMatch
      )
    })
  }

  const noFilters = term === '' && category.value === 'all'
  list.sort((a, b) => {
    if (noFilters) {
      if (a.sticky && !b.sticky) return -1
      if (!a.sticky && b.sticky) return 1
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  return list
})

function categoriesOf(t: Tutorial) {
  return t.category.split('|').map((c) => c.trim())
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div>
    <PageHero title="教程中心主页" subtitle="Tutorial Center Home"/>
    <br><br>

    <Breadcrumbs :items="[{ label: '主页', to: '/' }, { label: '教程中心主页' }]"/>

    <NoticeBanner contained>
      <strong>提示：</strong>此页面及其子页面部分内容属于前 Bedrock 版服务器的遗留内容，正在逐步更新中！
    </NoticeBanner>

    <section class="tutorials">
      <div class="container">
        <div class="tutorial-intro">
          <p>在这里找到所有服务器相关教程，帮助您更好地游玩悠哉世界</p>
        </div>

        <div class="search-section">
          <div class="filter-container">
            <div class="search-container">
              <input
                  id="tutorialSearch"
                  v-model="search"
                  type="text"
                  placeholder="搜索教程标题..."
                  class="search-input"
              >
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                    fill="#345e54"
                />
              </svg>
            </div>
            <div class="category-filter-container">
              <select id="categoryFilter" v-model="category" class="category-filter">
                <option value="all">全部分类</option>
                <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          <p class="search-results-info">找到 <span>{{ filtered.length }}</span> 个教程</p>
        </div>

        <div class="tutorial-list">
          <template v-if="filtered.length">
            <NuxtLink
                v-for="t in filtered"
                :key="t.id"
                :to="t.link"
                class="tutorial-item"
            >
              <div class="tutorial-image">
                <img :src="t.image" :alt="t.title">
                <span v-if="t.sticky" class="sticky-badge">置顶</span>
              </div>
              <div class="tutorial-item-content">
                <h3>{{ t.title }}</h3>
                <p>{{ t.description }}</p>
                <div class="tutorial-meta">
                  <div class="tutorial-categories">
                    <span v-for="cat in categoriesOf(t)" :key="cat" class="tutorial-category">
                      {{ cat }}
                    </span>
                  </div>
                  <span>{{ formatDate(t.date) }}</span>
                </div>
              </div>
            </NuxtLink>
          </template>
          <div v-else class="empty-state">
            <h3>未找到相关教程</h3>
            <p>尝试使用不同的关键词搜索，或选择其他分类~</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.tutorials {
  padding: 80px 0;
  background: var(--background);
}

.tutorial-intro {
  text-align: center;
  margin-bottom: 50px;
}

.tutorial-intro p {
  font-size: 1.2rem;
  color: var(--text-color);
  max-width: 600px;
  margin: 0 auto;
}

.search-section {
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: center;
}

.search-container {
  position: relative;
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid var(--accent-color);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--light-text);
}

.search-input:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.category-filter-container {
  margin-bottom: 15px;
}

.category-filter {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid var(--accent-color);
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--light-text);
  color: var(--text-color);
  cursor: pointer;
  appearance: none;
  background-image: url('https://assets.mcyzw.top/images/ui/select-chevron.svg');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
}

.category-filter:focus {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 3px rgba(107, 179, 155, 0.2);
}

.search-results-info {
  color: var(--text-color);
  font-size: 0.9rem;
}

.tutorial-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.tutorial-item {
  background-color: var(--light-text);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
}

.tutorial-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tutorial-image {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.tutorial-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.sticky-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  letter-spacing: 1px;
}

.tutorial-item-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tutorial-item-content h3 {
  margin-bottom: 10px;
  color: var(--dark-color);
  font-size: 1.3rem;
}

.tutorial-item-content p {
  color: var(--text-color);
  margin-bottom: 15px;
  flex: 1;
}

.tutorial-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 0.9rem;
  color: #666;
}

.tutorial-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tutorial-category {
  background-color: var(--primary-color);
  color: var(--dark-color);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  grid-column: 1 / -1;
}

.empty-state h3 {
  color: var(--dark-color);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-color);
}

@media (min-width: 769px) {
  .filter-container {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .search-container {
    flex: 2;
    margin-bottom: 0;
  }

  .category-filter-container {
    flex: 1;
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .tutorials {
    padding: 60px 0;
  }

  .tutorial-intro p {
    font-size: 1.1rem;
  }

  .tutorial-list {
    grid-template-columns: 1fr;
  }

  .search-input {
    padding: 12px 20px 12px 45px;
  }

  .search-icon {
    left: 15px;
    width: 18px;
    height: 18px;
  }

  .category-filter {
    padding: 12px 15px;
    background-position: right 12px center;
  }

  .sticky-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .tutorial-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tutorial-categories {
    width: 100%;
  }
}

.tutorial-item {
  text-decoration: none;
  color: inherit;
}
</style>
