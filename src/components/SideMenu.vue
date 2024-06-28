<template>
  <div class="menu">
    <div class="logo">
      <router-link @click="sideMenuClose" to="/profile"
        ><img src="../assets/logo.png" alt="Logo" style="width: 200px" />
      </router-link>
    </div>

    <router-link @click="sideMenuClose" to="/profile" class="menu-item">
      <span class="material-symbols-outlined"> person </span>
      <span class="menu-title">{{ SIDEMENUNAMES[0] }}</span>
    </router-link>

    <router-link @click="sideMenuClose" to="/manage-users" class="menu-item">
      <span class="material-symbols-outlined"> patient_list </span>
      <span class="menu-title">{{ SIDEMENUNAMES[1] }}</span>
    </router-link>
  </div>
</template>

<script setup>
import MenuTitle from '../components/MenuTitle.vue'
import { SIDEMENUNAMES } from '../assets/constants'
import { useSideMenuStore } from '../stores/side-menu'

const sideMenuStore = useSideMenuStore()

function sideMenuClose() {
  if (!sideMenuStore.isDesktop) sideMenuStore.close()
}
</script>

<style scoped>
.menu {
  min-width: 300px;
  width: 100%;
  height: 100%;
  background-color: #404a54;
  display: flex;
  flex-flow: column;
  gap: 15px;
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
  /* background-color: #ffffff2c; */
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
.menu-item:active {
  background-color: #ffffff57;
}

.menu-item.router-link-active {
  background-color: #ffffff25;
}
</style>
