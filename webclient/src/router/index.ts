
import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '../pages/PageHome.vue'


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: PageHome},
    ],
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    },
})

export default router