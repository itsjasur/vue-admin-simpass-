import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import Antd from 'ant-design-vue'
import './assets/global.css'
import cleaveDirective from './directives/cleaveDirective'
import LoadingSpinner from './components/Loader.vue'
// import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.directive('cleave', cleaveDirective)
app.use(router)
app.use(Antd)

//common components
app.component('LoadingSpinner', LoadingSpinner)

app.mount('#app')
