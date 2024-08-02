<template>
  <div class="menu">
    <div class="logo">
      <router-link @click="router.push('/')" to="/profile"
        ><img src="../assets/logo.png" alt="Logo" style="width: 200px" />
      </router-link>
    </div>

    <template v-for="(item, index) in visibleMenuItems" :key="index">
      <div
        @click="sideMenuChoose(item)"
        class="menu-item"
        :class="{ currentlyOpen: isActive(item.path) }"
      >
        <span class="material-symbols-outlined"> {{ item.icon }} </span>
        <span class="menu-title">{{ getTitleByRouteNameOrPath(item.path) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useSideMenuStore } from '../stores/side-menu'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthenticationStore } from '@/stores/authentication'

const authStore = useAuthenticationStore()
const userRoles = authStore.userRoles

const router = useRouter()
const route = useRoute()
const sideMenuStore = useSideMenuStore()

const menuItems = [
  {
    path: '/profile',
    icon: 'person'
  },
  {
    path: '/manage-users',
    icon: 'patient_list'
  },
  {
    path: '/manage-plans',
    icon: 'dashboard'
  },
  {
    path: '/manage-plans-for-print',
    icon: 'print_connect'
  },
  {
    path: '/applications',
    icon: 'article'
  },
  {
    path: '/applications-for-print',
    icon: 'print'
  },
  {
    path: '/partner-requests',
    icon: 'fact_check'
  },
  {
    path: '/partners',
    icon: 'storefront'
  },
  {
    path: '/self-requests',
    icon: 'phone_in_talk'
  },
  {
    path: '/rental-forms',
    icon: 'demography'
  },
  {
    path: '/registration-forms',
    icon: 'description'
  },
  {
    path: '/chats',
    icon: 'chat'
  }
]

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => {
    //if null or undefined return, removes from avl items
    if (!getRolesByRouteNameOrPath(item.path)) return false
    //if it has 'ALL' it will be available to all, whcih is true
    if (getRolesByRouteNameOrPath(item.path).includes('ALL')) return true
    //checks if role contains path required roles
    return authStore.containsRole(getRolesByRouteNameOrPath(item.path))
  })
)
// console.log(authStore.containsRole(getRolesByRouteNameOrPath(item.path)))
// console.log(visibleMenuItems.value)

function isActive(path) {
  if (route.name === 'form-details' && path === '/registration-forms') return true
  if (route.name === 'applications' && path === '/select-mvno') return true
  if (path === route.path) return true
}

function sideMenuChoose(item) {
  if (!sideMenuStore.isDesktop) sideMenuStore.close()
  router.push(item.path)
}

// gets  the title by path name or path
function getTitleByRouteNameOrPath(nameOrPath) {
  const routes = router.getRoutes()
  const routeInfo = routes.find((route) => route.name === nameOrPath || route.path === nameOrPath)
  if (routeInfo && routeInfo.meta && routeInfo.meta.title) return routeInfo.meta.title
  else return 'No title'
}
function getRolesByRouteNameOrPath(nameOrPath) {
  const routes = router.getRoutes()
  const routeInfo = routes.find((route) => route.name === nameOrPath || route.path === nameOrPath)
  return routeInfo.meta.requiredRoles
}
</script>

<style scoped>
.menu {
  min-width: 300px;
  width: 100%;
  height: 100%;
  background-color: #282c35;
  display: flex;
  flex-flow: column;
  gap: 15px;
  overflow-y: auto;
}
.logo {
  padding: 10px;
  margin: 15px 10px;
  user-select: none;
}
img {
  color: antiquewhite;
}

.logo:hover {
  background-color: #4e4e4e;
  border-radius: 5px;
}

a {
  text-decoration: none; /* router link underline */
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 15px;
  border-radius: 5px;
  padding: 0 10px;
  min-height: 50px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.menu-item:hover {
  background-color: #ffffff45;
}

.currentlyOpen {
  background-color: #ffffff25;
}

.menu-item:active {
  background-color: #ffffff57;
}
</style>
