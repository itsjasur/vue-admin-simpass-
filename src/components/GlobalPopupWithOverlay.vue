<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isVisible" class="popup-overlay">
        <slot></slot>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

const showPopup = () => {
  isVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closePopup = () => {
  isVisible.value = false
  document.body.style.overflow = ''
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && isVisible.value) {
    closePopup()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({ showPopup, closePopup })
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  /* z-index: 100; */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
