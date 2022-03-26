import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '../views/IndexView.vue';
import RulesView from '../views/RulesView.vue';
import LobbyView from '../views/game/LobbyView.vue';
import ChooseView from '../views/game/ChooseView.vue';
import VoteView from '../views/game/VoteView.vue';
import AboutView from '../views/AboutView.vue';

let router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'index',
            component: IndexView
        },
        {
            path: '/game/:id',
            name: 'lobby',
            component: LobbyView
        },
        {
            path: '/game/:id',
            name: 'choose',
            component: ChooseView
        },
        {
            path: '/game/:id',
            name: 'vote',
            component: VoteView
        },
        {
            path: '/rules',
            name: 'rules',
            component: RulesView
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView
        },
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