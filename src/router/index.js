import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '../stores/authentication'
import { useRouteMemoryStore } from '../stores/router-memory-store'
import DashBaordView from '../views/DashBoardView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import Profile from '../views/ProfileView.vue'
import SelfRequests from '../views/SelfRequestsView.vue'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'

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
      redirect: '/profile',
      component: DashBaordView,
      // component: () => import('../views/DashBoardView.vue'),

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
          // component: ManagePlans,
          component: () => import('../views/ManagePlansView.vue'),
          meta: {
            title: '요금제관리',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN', 'ROLE_AGENCY_ADMIN']
          }
        },
        {
          path: '/manage-plans-for-print',
          name: 'manage-plans-for-print',
          component: () => import('../views/ManagePlansForPrintView.vue'),
          meta: {
            title: '요금제관리(출력용)',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN']
          }
        },

        {
          path: 'applications',
          name: 'applications',
          component: () => import('../views/ApplicationsView.vue'),
          meta: {
            title: '신청서접수현황',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_AGENCY',
              'ROLE_OPEN_MANAGER',
              'ROLE_OPEN_MEMBER',
              'ROLE_AGENCY_ADMIN'
            ]
          }
        },
        {
          path: 'applications-for-print',
          name: 'applications-for-print',
          component: () => import('../views/ApplicationsForPrintView.vue'),
          meta: {
            title: '신청서출력현황',
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
          path: '/partner-requests',
          name: 'partner-requests',
          component: () => import('../views/PartnerRequestsView.vue'),
          meta: {
            title: '판매점가입현황',
            requiresAuth: true,
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN', 'ROLE_AGENCY_ADMIN']
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
            requiredRoles: ['ROLE_SUPER', 'ROLE_ADMIN', 'ROLE_OPEN_ADMIN', 'ROLE_AGENCY_ADMIN']
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
        },

        {
          path: '/chats',
          name: 'chats',
          component: () => import('../views/ChatsView.vue'),
          // component: Chats,
          meta: {
            title: '채팅',
            requiresAuth: true,
            requiredRoles: ['ALL']
          }
        },

        {
          path: '/htmls',
          name: 'htmls',
          component: () => import('../views/HtmlsView.vue'),
          meta: {
            title: '정책등록관리',
            requiresAuth: true,
            requiredRoles: [
              'ROLE_SUPER',
              'ROLE_ADMIN',
              'ROLE_MANAGER',
              'ROLE_OPEN_ADMIN',
              'ROLE_OPEN_MANAGER',
              'ROLE_AGENCY_ADMIN'
            ]
          }
        },

        {
          path: '/order-usim',
          name: 'order-usim',
          component: () => import('../views/UsimOrderView.vue'),
          meta: {
            title: '유심 주문요청',
            requiresAuth: true,
            requiredRoles: ['ALL']
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthenticationStore()

  // checks if user is logged in
  if (to.path !== '/login' && to.path !== '/signup' && !authStore.isLoggedIn) {
    useRouteMemoryStore().save(to.fullPath)
    return next('/login')
  }

  // handles root path redirection
  if (to.path === '/') {
    const regForRoute = router.getRoutes().find((route) => route.path === '/registration-forms')
    if (regForRoute.meta.requiredRoles && authStore.containsRole(regForRoute.meta.requiredRoles)) {
      return next('/registration-forms')
    } else {
      return next('/profile')
    }
  }

  // if the route doesn't require auth, proceed
  if (!to.meta.requiresAuth) {
    return next()
  }

  // always fetchs user info for authenticated routes
  try {
    const response = await fetchWithTokenRefresh('admin/myInfo', { method: 'GET' })
    if (!response.ok) throw new Error('Fetch profile data error')
    const decodedResponse = await response.json()
    let info = decodedResponse.data.info
    authStore.updateRoles(info.strRoles)
  } catch (error) {
    console.error('Error fetching user info:', error)
    authStore.logout()
    useRouteMemoryStore().save(to.fullPath)
    return next('/login')
  }

  // Now check roles after fetching updated info
  if (to.meta.requiredRoles && !to.meta.requiredRoles.includes('ALL')) {
    if (!authStore.containsRole(to.meta.requiredRoles)) {
      return next('/unauthorized')
    }
  }

  next()
})

export default router
