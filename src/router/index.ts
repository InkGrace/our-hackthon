import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import WelcomeView from '../views/WelcomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
  ],
})

export default router
