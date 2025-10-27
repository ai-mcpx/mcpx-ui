import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/server/:name',
    name: 'ServerDetail',
    component: () => import('../views/ServerDetail.vue'),
    props: true
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    props: (route) => ({ query: route.query.q })
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../views/Docs.vue')
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/Playground.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router