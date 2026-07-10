<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { featureSlides } from '~/utils/home'

const modules = [Autoplay, Pagination, Navigation, EffectFade]

let bgSwiper: SwiperClass | null = null

function onBgReady(sw: SwiperClass) {
  bgSwiper = sw
}

function onContentSlideChange(sw: SwiperClass) {
  bgSwiper?.slideToLoop(sw.realIndex, 1000)
  const active = sw.slides[sw.activeIndex]
  if (active) {
    active.classList.add('slide-active-animation')
    window.setTimeout(() => active.classList.remove('slide-active-animation'), 500)
  }
}
</script>

<template>
  <section id="features" class="join">
    <div class="container">
      <h2>玩法特性一览</h2>
    </div>

    <section id="hero">
      <Swiper
        class="hero-bg-swiper"
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :loop="true"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :speed="1000"
        :allow-touch-move="false"
        @swiper="onBgReady"
      >
        <SwiperSlide v-for="slide in featureSlides" :key="'bg-' + slide.title">
          <div class="hero-bg" :style="{ backgroundImage: `url('${slide.image}')` }" />
        </SwiperSlide>
      </Swiper>

      <Swiper
        class="hero-content-swiper"
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :loop="true"
        :speed="1000"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :navigation="true"
        @slide-change="onContentSlideChange"
      >
        <SwiperSlide v-for="slide in featureSlides" :key="'content-' + slide.title">
          <div class="hero-content">
            <div class="album-info">
              <h2>{{ slide.title }}</h2>
              <p style="color: white;" v-html="slide.description" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  </section>
</template>
