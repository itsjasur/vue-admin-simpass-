import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '../stores/authentication'
import { useRouteMemoryStore } from '../stores/router-memory-store'
import DashBaordView from '../views/DashBoardView.vue'
import LoginView from '../views/LoginView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import Profile from '../views/ProfileView.vue'
import ManageUsers from '../views/ManageUsersView.vue'
import ManagePlans from '../views/ManagePlansView.vue'
import Applications from '../views/ApplicationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false // No authentication required
      }
    },

    {
      path: '/',
      name: 'dashboard',
      redirect: '/profile',
      component: DashBaordView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '/profile',
          name: 'profile',
          component: Profile,
          meta: {
            requiresAuth: true
          }
        },

        {
          path: '/manage-users',
          name: 'manage-users',
          component: ManageUsers,
          meta: {
            requiresAuth: true
          }
        },

        {
          path: '/manage-plans',
          name: 'manage-plans',
          component: ManagePlans,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/applications',
          name: 'application',
          component: Applications,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    // this catchs any  route
    {
      // path: '/:pathMatch(.*)*',
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: NotFoundView
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!useAuthenticationStore().isLoggedIn) {
      useRouteMemoryStore().save(to.fullPath)
      next('/login')
    } else {
      next()
    }
  } else {
    // non-protected route, allow access
    next()
  }
})

export default router
