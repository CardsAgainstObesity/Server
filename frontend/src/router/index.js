import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChooseView from '../views/ChooseView.vue'
import VoteView from '../views/VoteView.vue'

let router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/partida',
            name: 'choose',
            component: ChooseView
        },
        {
            path: '/partida',
            name: 'vote',
            component: VoteView
        }
        // ,
        // {
        //     path: '/about',
        //     name: 'about',
        //     // route level code-splitting
        //     // this generates a separate chunk (About.[hash].js) for this route
        //     // which is lazy-loaded when the route is visited.
        //     component: () =>
        //         import ('../views/AboutView.vue')
        // }
    ]
})

export default router