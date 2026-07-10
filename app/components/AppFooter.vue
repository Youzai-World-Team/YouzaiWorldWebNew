<script setup lang="ts">
import {footerLinks, friendLinks} from '~/utils/site'
import {useUptime} from '~/composables/useUptime'

const uptime = useUptime()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="nav-logo">
            <img src="/images/youzaiworldlight.webp" alt="悠哉世界">
          </div>
          <br>
          <p>一个充满创意与冒险的 Minecraft 服务器，致力于为玩家提供最佳的游戏体验。</p>
          <br><br>
          <img src="/images/cloudflare.svg" alt="Cloudflare">
          <p>
            本站由
            <a class="external-link" href="https://cloudflare.com" target="_blank">Cloudflare</a>
            提供安全防护
          </p>
        </div>

        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li v-for="link in footerLinks" :key="link.label">
              <NuxtLink :to="link.to" class="internal-link">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>友情外链</h3>
          <div class="friend-links-grid">
            <a
                v-for="friend in friendLinks"
                :key="friend.href"
                :href="friend.href"
                class="friend-link-card"
                target="_blank"
            >
              <div class="friend-link-icon">
                <img :src="friend.icon" :alt="friend.title">
              </div>
              <div class="friend-link-content">
                <h4>{{ friend.title }}</h4>
                <p>{{ friend.desc }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>
          Copyright &copy;
          <a
              href="https://github.com/Youzai-World-Team"
              class="external-link"
              style="text-decoration: none;"
              target="_blank"
          >Youzai World Team</a><br>
          <a
              href="https://icp.gov.moe/?keyword=20256020"
              class="external-link"
              style="text-decoration: none;"
              target="_blank"
          >萌 ICP 备 20256020 号</a>
          <br>本站已正常运行 <span>{{ uptime }}</span>
        </p>
      </div>
    </div>
  </footer>
</template>
