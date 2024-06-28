<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <span class="header-title">개인정보 수집·이용약관</span>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button"> cancel </span>
      </div>
      <div class="html-content" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['closePopup'])

const htmlContent = ref('')

// Function to fetch the HTML file content
async function loadHtml() {
  try {
    const response = await fetch('/src/assets/agreement.html')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    htmlContent.value = await response.text()
  } catch (error) {
    console.error('Error loading HTML file:', error)
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') emit('closePopup')
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
  loadHtml()
})
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.552);
  /* z-index: 1100; */
  /* padding: 20px; */
  overflow-y: auto;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  height: 100%;
  width: 900px;

  max-height: 900px;
  max-width: 800px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
}

.fixed-header {
  position: sticky;
  top: 0;
  min-height: 50px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* background-color: #fdc3c3; */
  box-sizing: border-box;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.html-content {
  padding: 30px;
  padding-bottom: 100px;
  box-sizing: border-box;
  overflow-y: auto;
}

.close-button {
  font-size: 30px;
  color: #737373;
}
</style>
