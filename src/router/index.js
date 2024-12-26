import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import AssetDetailView from '../views/AssetDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/asset/:id',
    name: 'asset-detail',
    component: AssetDetailView
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
