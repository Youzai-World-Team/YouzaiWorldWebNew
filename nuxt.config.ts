// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devServer: {port: 3400},
    devtools: {enabled: true},

    ssr: true,

    app: {
        baseURL: '/',
        head: {
            htmlAttrs: {lang: 'zh-CN'},
            meta: [
                {charset: 'UTF-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1.0'},
            ],
            link: [
                {rel: 'icon', href: 'https://assets.mcyzw.top/images/logocircle.webp'},
                {
                    rel: 'preload',
                    as: 'font',
                    type: 'font/woff2',
                    href: 'https://assets.mcyzw.top/fonts/zkklt2016xdb.woff2',
                    crossorigin: '',
                },
            ],
            title: '悠哉世界 - Youzai World',
        },
        pageTransition: {name: 'page', mode: 'out-in'},
    },

    css: ['~/assets/scss/main.scss'],

    nitro: {
        prerender: {
            crawlLinks: true,
            routes: ['/'],
            ignore: [/world_rules/, '/tools/ECRFLU'],
        },
    },

    hooks: {
        'pages:extend'(pages) {
            const worlds = ['survival', 'creative', 'building']
            for (const world of worlds) {
                pages.push({
                    name: `agreement-world-${world}`,
                    path: `/read_agreements/world_rules&play_agreement/${world}`,
                    file: '~/pages/read_agreements/world-rule.vue',
                })
            }
        },
    },
})
