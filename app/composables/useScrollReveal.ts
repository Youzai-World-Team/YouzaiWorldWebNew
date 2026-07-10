import { watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const REVEAL_SELECTOR = [
  '.strength-card',
  '.team-card',
  '.tutorial-item',
  '.event-item',
  '.trend-item',
  '.donate-card',
  '.download-card',
  '.penalty-stats .stat-card',
  '.status-node-card',
  '.error-container',
  '.gallery-item',
  '.join-info',
  '.join-info-wide',
  '.friend-link-card',
  '.penalty-table-container',
  '.donators-table-container',
  '.trends-stats',
  '.trends-filter-section',
  '.download-section-block',
  '.latest-news',
].join(',')

function initScrollReveal(observers: IntersectionObserver[]) {
  const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
  if (!els.length) return

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('scroll-animate', 'animated'))
    return
  }

  els.forEach((el) => el.classList.add('scroll-animate'))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
  )
  els.forEach((el) => observer.observe(el))
  observers.push(observer)

  window.setTimeout(() => {
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('animated')
        observer.unobserve(el)
      }
    })
  }, 100)
}

function initCountUp(observers: IntersectionObserver[]) {
  const countEls = Array.from(document.querySelectorAll<HTMLElement>('.donate-stat-value'))
  if (!countEls.length) return

  const parseTarget = (el: HTMLElement) =>
    parseFloat(el.getAttribute('data-target') || el.innerText.replace(/[^0-9.-]/g, ''))

  if (!('IntersectionObserver' in window)) {
    countEls.forEach((el) => {
      const target = parseTarget(el)
      if (!Number.isNaN(target)) el.innerText = String(target)
    })
    return
  }

  interface Counter {
    el: HTMLElement
    target: number
    isCurrency: boolean
    animated: boolean
  }

  const counters: Counter[] = []
  countEls.forEach((el) => {
    const targetText = el.getAttribute('data-target') || el.innerText.replace(/[^0-9.-]/g, '')
    const target = parseFloat(targetText)
    if (Number.isNaN(target)) return
    const isCurrency = el.innerText.includes('¥')
    const isTime = el.innerText.includes('天') || el.innerText.includes('时')
    if (isTime && targetText.length > 4) return
    counters.push({ el, target, isCurrency, animated: false })
  })

  const run = (counter: Counter) => {
    const { el, target, isCurrency } = counter
    let current = 0
    const duration = 1500
    const stepTime = 20
    const steps = duration / stepTime
    const increment = target / steps
    let step = 0
    const timer = window.setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        current = target
        window.clearInterval(timer)
        el.classList.add('count-updated')
        window.setTimeout(() => el.classList.remove('count-updated'), 300)
      }
      el.innerText = isCurrency
        ? '¥' + Math.floor(current).toLocaleString()
        : Number.isInteger(target)
          ? Math.floor(current).toLocaleString()
          : current.toFixed(2)
    }, stepTime)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const counter = counters.find((c) => c.el === entry.target)
        if (entry.isIntersecting && counter && !counter.animated) {
          counter.animated = true
          run(counter)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 },
  )
  counters.forEach((c) => observer.observe(c.el))
  observers.push(observer)
}

function initFooter(observers: IntersectionObserver[]) {
  const footer = document.querySelector<HTMLElement>('.footer')
  if (!footer) return
  if (!('IntersectionObserver' in window)) {
    footer.classList.add('animated')
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          footer.classList.add('animated')
          observer.unobserve(footer)
        }
      })
    },
    { threshold: 0.1 },
  )
  observer.observe(footer)
  observers.push(observer)
}

function initStatusStagger(observers: IntersectionObserver[]) {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.status-node-card'))
  if (!cards.length) return
  if (!('IntersectionObserver' in window)) {
    cards.forEach((c) => c.classList.add('animated'))
    return
  }
  let index = 0
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target as HTMLElement
          window.setTimeout(() => card.classList.add('animated'), index * 150)
          index++
          observer.unobserve(card)
        }
      })
    },
    { threshold: 0.2 },
  )
  cards.forEach((c) => observer.observe(c))
  observers.push(observer)
}

function initDonatorsRows(observers: IntersectionObserver[]) {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('.donators-table tbody tr'))
  if (!rows.length) return
  if (!('IntersectionObserver' in window)) {
    rows.forEach((r) => r.classList.add('animated'))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 },
  )
  rows.forEach((r) => observer.observe(r))
  observers.push(observer)
}

export function useScrollReveal() {
  const route = useRoute()
  let observers: IntersectionObserver[] = []

  const teardown = () => {
    observers.forEach((o) => o.disconnect())
    observers = []
  }

  const scan = async () => {
    if (typeof window === 'undefined') return
    teardown()
    await nextTick()

    window.setTimeout(() => {
      initScrollReveal(observers)
      initCountUp(observers)
      initFooter(observers)
      initStatusStagger(observers)
      initDonatorsRows(observers)
    }, 50)
  }

  watch(
    () => route.fullPath,
    () => scan(),
    { immediate: true },
  )

  onBeforeUnmount(teardown)
}
