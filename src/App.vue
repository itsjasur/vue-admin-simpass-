<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#00d42a', //primary
        colorPrimaryHover: '#00d42a', //primary hover
        colorBorder: '#cccccc', // border color
        controlHeight: 40, // input/select/button height
        borderRadius: 4, //all border radius
        lineWidth: 1, //border line width
        controlOutline: 'none', //focus outline
        fontSize: 15
      }
    }"
  >
  </a-config-provider>
  <router-view />

  <Snackbar />
  <Warning />
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import Snackbar from './components/Snackbar.vue'
import Warning from './components/Warning.vue'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from './stores/authentication'
import { useRouteMemoryStore } from './stores/router-memory-store'
import { useSideMenuStore } from './stores/side-menu'

const router = useRouter()
const authStore = useAuthenticationStore()

// Watch for changes in isLoggedIn and redirect to login
watch(
  () => authStore.isLoggedIn,
  (newIsLoggedIn) => {
    if (!newIsLoggedIn) {
      if (authStore.isAutoLoggedOut) useRouteMemoryStore().save(router.currentRoute.value.fullPath)
      router.push('/login')
    }
  }
)

const sidemenuStore = useSideMenuStore()

const handleResize = () => {
  if (window.innerWidth <= 960) {
    sidemenuStore.close()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() //
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: var(--main-background-color);
}
</style>
