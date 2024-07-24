import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '../stores/authentication'
import { useRouteMemoryStore } from '../stores/router-memory-store'
import DashBaordView from '../views/DashBoardView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import Profile from '../views/ProfileView.vue'
import ManagePlans from '../views/ManagePlansView.vue'
import Applications from '../views/ApplicationsView.vue'
import SelfRequests from '../views/SelfRequestsView.vue'
import SelectMvno from '../views/SelectMvnoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: '로그인',
        requiresAuth: false // No authentication required
      }
    },

    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
      meta: {
        title: '',
        requiresAuth: false
      }
    },

    {
      path: '/',
      name: 'dashboard',
      // redirect: '/profile', //registration-forms
      component: DashBaordView,
      meta: { title: 'Home' },

      children: [
        {
          path: '/profile',
          name: 'profile',
          component: Profile,
          meta: {
            title: '나의정보',
            requiresAuth: true,
            requiredRoles: ['ALL']
          }
        },

        {
          path: '/manage-users',
          name: 'manage-users',
          // component: ManageUsers,
          component: () => import('../views/ManageUsersView.vue'),
          meta: {
            title: '사용자관리',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN']
          }
        },

        {
          path: '/manage-plans',
          name: 'manage-plans',
          component: ManagePlans,
          meta: {
            title: '요금제관리',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN']
          }
        },
        {
          path: 'select-mvno',
          name: 'select-mvno',
          component: SelectMvno,
          meta: {
            title: '신청서접수현황',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN', 'ROLE_OPEN_AGENCY']
          }
        },
        {
          path: 'applications',
          name: 'applications',
          component: () => import('../views/ApplicationsView.vue'),
          meta: {
            title: '신청서접수현황 Applications',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN', 'ROLE_OPEN_AGENCY']
          }
        },

        {
          path: '/partner-requests',
          name: 'partner-requests',
          component: () => import('../views/PartnerRequestsView.vue'),
          meta: {
            title: '판매점가입현황',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN']
          }
        },

        {
          path: '/partners',
          name: 'partners',

          // component: Partners,
          component: () => import('../views/PartnersView.vue'),
          meta: {
            title: '판매점거래현황',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN']
          }
        },

        {
          path: '/self-requests',
          name: 'self-requests',
          component: SelfRequests,
          meta: {
            title: '상담사 개통 문의현황',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_MANAGER',
              'ROLE_OPEN_MEMBER'
            ]
          }
        },

        {
          path: '/rental-forms',
          name: 'rental-forms',
          component: () => import('../views/RentalFormsView.vue'),
          meta: {
            title: '랜탈가입 신청서',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_MANAGER',
              'ROLE_OPEN_MEMBER'
            ]
          }
        },

        {
          path: '/registration-forms',
          name: 'registration-forms',
          component: () => import('../views/RegistrationFormsView.vue'),
          meta: {
            title: '가입/번호이동 신청서',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_MANAGER',
              'ROLE_OPEN_MEMBER'
            ]
          }
        },
        {
          path: '/form-details/:id',
          name: 'form-details',
          component: () => import('../views/FormDetailsView.vue'),
          props: true,
          meta: {
            title: '신청서접수현황',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_MANAGER',
              'ROLE_OPEN_MEMBER'
            ]
          }
        }
      ]
    },
    // this catchs any  route
    {
      // path: '/:pathMatch(.*)*',
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: NotFoundView,
      meta: { title: 'N/A' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthenticationStore()

  // checks if the route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    useRouteMemoryStore().save(to.fullPath)
    return next('/login')
  }

  // checks for role-based access
  if (to.meta.requiredRoles && !to.meta.requiredRoles.includes('ALL')) {
    if (!authStore.containsRole(to.meta.requiredRoles)) {
      return next('/unauthorized')
    }
  }

  // // handles root path redirection to registration-forms or profile
  if (to.path === '/') {
    const routes = router.getRoutes()
    const regForRoute = routes.find((route) => route.path === '/registration-forms')

    if (regForRoute.meta.requiredRoles && authStore.containsRole(regForRoute.meta.requiredRoles)) {
      return next('/registration-forms')
    } else {
      return next('/profile')
    }
  }

  next()
})

export default router
