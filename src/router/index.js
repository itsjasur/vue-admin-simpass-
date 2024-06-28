import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '../stores/authentication'
import { useRouteMemoryStore } from '../stores/router-memory-store'
import DashBaordView from '../views/DashBoardView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import HomeView from '../views/HomeView.vue'
import RegistrationFormsView from '../views/RegistrationFormsView.vue'
import ProfileView from '../views/ProfileView.vue'
import FormDetailsView from '../views/FormDetailsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import RentalRegistrationView from '../views/RentalFormsView.vue'
import ApplicationsView from '../views/ApplicationsView.vue'
import DownloadForms from '../views/DownloadForms.vue'
import BusinessRequest from '../views/BusinessRequestView.vue'
import BusinessPartners from '../views/BusinessPartnersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false, // No authentication required
      },
    },

    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      name: 'dashboard',
      redirect: '/home',
      component: DashBaordView,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/home',
          name: 'home',
          component: HomeView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: '/profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: '/registration-forms',
          name: 'registration-forms',
          component: RegistrationFormsView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: '/form-details/:id',
          name: 'form-details',
          component: FormDetailsView,
          meta: {
            requiresAuth: true,
          },
          props: true,
        },
        {
          path: '/rental-forms',
          name: 'rental-forms',
          component: RentalRegistrationView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: '/applications',
          name: 'applications',
          component: ApplicationsView,
          meta: {
            requiresAuth: true,
          },
        },

        {
          path: '/download-forms',
          name: 'download-forms',
          component: DownloadForms,
          meta: {
            requiresAuth: true,
          },
        },

        {
          path: '/business-request',
          name: 'business-request',
          component: BusinessRequest,
          meta: {
            requiresAuth: true,
          },
        },

        {
          path: '/business-partners',
          name: 'business-partners',
          component: BusinessPartners,
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
    // this catchs any  route
    {
      // path: '/:pathMatch(.*)*',
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: NotFoundView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ],
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
