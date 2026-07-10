<script setup lang="ts">
import {useScrollReveal} from '~/composables/useScrollReveal'
import AppLoader from "~/components/AppLoader.vue";
import AppNavbar from "~/components/AppNavbar.vue";
import AppFooter from "~/components/AppFooter.vue";
import ClickEffect from "~/components/ClickEffect.vue";

useScrollReveal()
</script>

<template>
  <div>
    <AppLoader/>
    <AppNavbar/>

    <main>
      <slot/>
    </main>

    <AppFooter/>
    <ClickEffect/>
  </div>
</template>
