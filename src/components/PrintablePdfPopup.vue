<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">PDF Print</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div style="height: 100%" v-if="popup.url">
        <object :data="popup.url" type="application/pdf" width="100%" height="100%"></object>
      </div>
      <div v-else>
        <h1>Not pdf blob url</h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { usePrintablePdfPopup } from '../stores/printable-pdf-popup'

const pdfUrl = ref(null)
const popup = usePrintablePdfPopup()

// converts base64 to Blob URL
onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

//this handles keyboard actions
function keydownHandle(event) {
  if (event.key === 'Escape') {
    popup.close()
  }
}

onUnmounted(() => {
  popup.close()
  document.removeEventListener('keydown', keydownHandle)
})
</script>

<style scoped>
.overlay {
  display: flex;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  z-index: 1100;
  background-color: rgba(0, 0, 0, 0.552);
  padding: 20px;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  height: 100%;
  width: 1000px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #efefef;
  position: relative;
}

.innerHeader {
  position: sticky;
  top: 0;
  height: 50px;
  padding: 0 20px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Bottom shadow */
}

.scrollable-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 20px;
  height: 100%;
}

.close-button {
  font-size: 30px;
}

.print-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: auto;
  min-width: 150px;
  height: 50px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  font-size: 16px;
  box-shadow: 0 0 10px #00000025; /* Bottom shadow */
}

.print-icon {
  font-size: 25px;
  margin-right: 10px;
}

.pdf-viewer {
  width: 100%;
  height: 600px;
  border: none;
}
</style>
