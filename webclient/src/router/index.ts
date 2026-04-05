
import { createRouter, createWebHistory } from 'vue-router'
import PageLeaderboard from '../pages/PageLeaderboard.vue'


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: PageLeaderboard },
        { path: '/leaderboard', component: PageLeaderboard },
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