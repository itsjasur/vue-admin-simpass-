<template>
  <div class="dashboard-container">
    <div v-if="sideMenuStore.isDesktop" :class="['dashboard-side-menu', { open: sideMenuStore.isOpen }]">
      <SideMenu />
    </div>

    <div class="dashboard-view-content">
      <span class="dashboard-view-content-header">
        <Header />
      </span>

      <div :class="['scrollable-view', { sidemenuOpen: sideMenuStore.isOpen }]">
        <RouterView />
      </div>
    </div>
    <template v-if="!sideMenuStore.isDesktop">
      <div v-if="sideMenuStore.isOpen" @click="sideMenuStore.close()" class="m-dashboard-side-menu-overlay"></div>
      <div :class="['m-dashboard-side-menu', { closed: !sideMenuStore.isOpen }]">
        <SideMenu />
      </div>
    </template>
  </div>

  <SelectPlanPopup v-if="selectPlansPopup.active" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SideMenu from '../components/SideMenu.vue'
import Header from '../components/Header.vue'
import { useSideMenuStore } from '../stores/side-menu'
import SelectPlanPopup from '@/components/SelectPlanPopup.vue'
import { useSelectPlansPopup } from '@/stores/select-plans-popup'
import { useWebSocketStore } from '@/stores/webscoket-store'

const selectPlansPopup = useSelectPlansPopup()
const sideMenuStore = useSideMenuStore()
const webSocketStore = useWebSocketStore()

const handleResize = () => {
  sideMenuStore.updateIsDesktop()
}

const checkConnection = () => {
  if (!webSocketStore.isConnected) {
    setTimeout(checkConnection, 100) // checks every 100ms
  } else {
  }
}

onMounted(() => {
  sideMenuStore.updateIsDesktop()
  window.addEventListener('resize', handleResize)
  // console.log('dashboard mounted')

  if (!webSocketStore.socket) webSocketStore.connect()
  checkConnection()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  webSocketStore.disconnect() // disconnects from WebSocket
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-flow: row;
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: #ffc0cb76;
  overflow-y: hidden;
}

.dashboard-side-menu {
  height: 100%;
  width: 0px;
  transition: width 0.3s ease;
  z-index: 1001;
  overflow-x: none;
}

.dashboard-side-menu.open {
  width: 300px;
}

.dashboard-view-content {
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--main-background-color);
  z-index: 1003;
  overflow-x: hidden;
}

.dashboard-view-content-header {
  height: 65px;
  width: 100%;
  box-shadow: 0 2px 4px #00000010;
  z-index: 1002;
}

.scrollable-view {
  display: flex;
  flex-flow: column;
  height: 100%;
  min-width: 100%;
  position: relative;
  overflow-y: auto;
}

.scrollable-view.sidemenuOpen {
  width: calc(100% - 300px);
}

.icon {
  cursor: pointer;
  font-size: 30px;
}

.m-dashboard-side-menu-overlay {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000047;
  z-index: 1100;
}

.m-dashboard-side-menu {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 300px;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1101;
}

.m-dashboard-side-menu.closed {
  width: 0;
}
</style>
