import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import RoleSelectionView from '../views/RoleSelectionView.vue'
import SettlementView from '../views/SettlementView.vue'

// 清空所有存储的数据
const clearAllStorage = () => {
  localStorage.removeItem('chat_state')
  localStorage.removeItem('chat_messages')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
    },
    {
      path: '/select-role',
      name: 'role-selection',
      component: RoleSelectionView,
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
    {
      path: '/settlement',
      name: 'settlement',
      component: SettlementView,
    },
  ],
})

// 路由守卫：当导航到欢迎页时，清空所有存储
router.beforeEach((to, from) => {
  // 如果导航到欢迎页，清空存储
  if (to.name === 'welcome') {
    clearAllStorage()
  }
})

export default router
