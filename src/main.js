import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import Antd from 'ant-design-vue'
import '@/assets/global.css'
import LoadingSpinner from './components/Loader.vue'
import GlobalPopupWithOverlay from './components/GlobalPopupWithOverlay.vue'
import CleaveInput from './components/CleaveInput.vue'
import GlobalSearchAddress from './components/GlobalSearchAddress.vue'
// import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)
app.component('CleaveInput', CleaveInput)

//common components
app.component('LoadingSpinner', LoadingSpinner)
app.component('GlobalPopupWithOverlay', GlobalPopupWithOverlay)
app.component('GlobalSearchAddress', GlobalSearchAddress)

app.mount('#app')
