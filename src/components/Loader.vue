<template>
  <div class="loading-container">
    <div class="loader" :style="loaderStyle"></div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  height: { type: String, default: '40px' },
  color: { type: String, default: '#ffffff' },
  thickness: { type: String, default: '4px' }
})

const loaderStyle = computed(() => {
  return {
    height: props.height,
    padding: props.thickness,
    background: props.color
  }
})
</script>

<style scoped>
/* Scoped styles to prevent conflicts */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Or set a fixed height */
}
/* HTML: <div class="loader"></div> */
.loader {
  aspect-ratio: 1;
  border-radius: 50%;
  --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}

@keyframes l3 {
  to {
    transform: rotate(1turn);
  }
}
</style>
