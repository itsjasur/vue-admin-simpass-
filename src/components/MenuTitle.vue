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

  if (route.path === '/select-mvno') {
    return '통신사 선택'
  }
  if (route.path === '/partners') {
    return SIDEMENUNAMES[4]
  }
  if (route.path === '/self-requests') {
    return SIDEMENUNAMES[5]
  }

  return ''
})
</script>

<style scoped></style>
