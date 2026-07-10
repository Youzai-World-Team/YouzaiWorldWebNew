import type {RouterConfig} from '@nuxt/schema'

export default <RouterConfig>{
    scrollBehavior(to, _from, savedPosition) {
        if (savedPosition) return savedPosition

        if (to.hash) {
            const noOffset = ['#hero']
            const top = noOffset.includes(to.hash) ? 0 : 80
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({el: to.hash, top, behavior: 'smooth'})
                }, 350)
            })
        }

        return {left: 0, top: 0}
    },
}
