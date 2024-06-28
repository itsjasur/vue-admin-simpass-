<template>
  <span>
    {{ title }}
  </span>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { SIDEMENUNAMES } from '../assets/constants'

const route = useRoute()

const title = computed(() => {
  if (route.path === '/home') {
    return SIDEMENUNAMES[0]
  }

  if (route.path === '/profile') {
    return SIDEMENUNAMES[1]
  }

  if (route.path === '/registration-forms') {
    return SIDEMENUNAMES[2]
  }

  if (route.path === '/rental-forms') {
    return SIDEMENUNAMES[3]
  }
  if (route.path === '/applications') {
    return SIDEMENUNAMES[4]
  }
  if (route.path === '/download-forms') {
    return SIDEMENUNAMES[5]
  }

  // console.log(route.name)

  if (route.name === 'form-details') {
    return SIDEMENUNAMES[2]
  }

  if (route.name === 'business-request') {
    return '거래요청'
  }
  if (route.name === 'business-partners') {
    return '거래요청 상태'
  }

  return ''
})
</script>

<style scoped></style>
