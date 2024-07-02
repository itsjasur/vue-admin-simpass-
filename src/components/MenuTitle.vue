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
  if (route.path === '/profile') {
    return SIDEMENUNAMES[0]
  }

  if (route.path === '/manage-users') {
    return SIDEMENUNAMES[1]
  }

  if (route.path === '/manage-plans') {
    return SIDEMENUNAMES[2]
  }

  if (route.path === '/applications') {
    return SIDEMENUNAMES[3]
  }
  if (route.path === '/application') {
    return SIDEMENUNAMES[4]
  }

  return ''
})
</script>

<style scoped></style>
