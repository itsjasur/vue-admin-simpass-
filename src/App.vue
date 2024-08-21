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

  <Loading />
  <Snackbar />
  <Warning />
  <SearchAddressPopup />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Snackbar from './components/Snackbar.vue'
import Warning from './components/Warning.vue'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from './stores/authentication'
import { useRouteMemoryStore } from './stores/router-memory-store'
import { useSideMenuStore } from './stores/side-menu'
import Loading from './components/Loading.vue'
import SearchAddressPopup from './components/SearchAddressPopup.vue'
import { messaging, getToken, onMessage } from './firebase'
import sound from '@/assets/sound.mp3'

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

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  handleResize()

  // try {
  //   var currentToken = await getToken(messaging, { vapidKey: FIREBASEVAPIDKEY })
  //   localStorage.setItem('fcmToken', currentToken)
  //   console.log(currentToken)
  // } catch (e) {
  //   console.log(e)
  // }

  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload)

    const audio = new Audio(sound)
    audio.play()

    // checks if the browser supports notifications
    if ('Notification' in window) {
      // requests permission if not already granted
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
      } else {
        // creates and shows the notification

        const notification = new Notification(payload.notification.title, {
          body: payload.notification.body
          // icon: logo
        })

        //  click event to the notification
        notification.onclick = function () {
          window.focus()
          notification.close()
          //action to go to the chat
        }
      }
    }
  })
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
  height: 100%;
  z-index: 1;
}
</style>
