<template>
  <div class="menu">
    <div class="logo">
      <router-link @click="sideMenuChoose" to="/profile"
        ><img src="../assets/logo.png" alt="Logo" style="width: 200px" />
      </router-link>
    </div>

    <template v-for="(item, index) in menuItems" :key="index">
      <div
        @click="sideMenuChoose(item)"
        class="menu-item"
        :class="{ currentlyOpen: isActive(item.path) }"
      >
        <span class="material-symbols-outlined"> {{ item.icon }} </span>
        <span class="menu-title">{{ item.name }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { SIDEMENUNAMES } from '../assets/constants'
import { useSideMenuStore } from '../stores/side-menu'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const menuItems = ref([
  { name: SIDEMENUNAMES[0], path: '/profile', icon: 'person' },
  { name: SIDEMENUNAMES[1], path: '/manage-users', icon: 'patient_list' },
  { name: SIDEMENUNAMES[2], path: '/manage-plans', icon: 'dashboard' },
  { name: SIDEMENUNAMES[3], path: '/select-mvno', icon: 'article' },
  { name: SIDEMENUNAMES[4], path: '/partner-requests', icon: 'storefront' },
  { name: SIDEMENUNAMES[5], path: '/partners', icon: 'storefront' },
  { name: SIDEMENUNAMES[6], path: '/self-requests', icon: 'phone_in_talk' }
])

const router = useRouter()
const route = useRoute()
const sideMenuStore = useSideMenuStore()

function isActive(path) {
  if (path === '/select-mvno' && route.path === '/applications') return true
  if (path === route.path) return true
}

function sideMenuChoose(item) {
  if (!sideMenuStore.isDesktop) sideMenuStore.close()
  router.push(item.path)
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
