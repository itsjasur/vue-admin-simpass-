<template>
  <div v-if="popup.active" class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">프린트</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div class="scrollable-content">
        <img v-for="(image, index) in imageUrls" :key="index" class="image" :src="image" alt="" loading="lazy" />
      </div>
      <button v-if="popup.images" @click="printContent" :disabled="isPrinting" class="print-button">
        <template v-if="isPrinting">
          <LoadingSpinner height="20px" color="#ffffff" />
        </template>

        <template v-else>
          <span class="material-symbols-outlined print-icon"> print </span>
          <span>출력</span>
        </template>
      </button>
    </div>
  </div>
  <iframe ref="printIframe" style="display: none"></iframe>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { usePrintablePopup } from '../stores/printable-popup'
import LoadingSpinner from '../components/Loader.vue'

const popup = usePrintablePopup()
const imageUrls = ref([])
const printIframe = ref(null)

const isPrinting = ref(false)

function base64ToBlob(base64Data) {
  let contentType = 'application/octet-stream' // Default content type
  let raw = base64Data

  // checking if the base64 string includes the data URL prefix
  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(';base64,')
    contentType = parts[0].split(':')[1]
    raw = parts[1]
  }

  const byteCharacters = atob(raw)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

function blobToURL(blob) {
  return URL.createObjectURL(blob)
}

// watchs for changes in popup.active and mounts
watchEffect(() => {
  if (popup.active) {
    imageUrls.value = popup.images?.map((image) => blobToURL(base64ToBlob(image)))
  }
})

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

// Function to print the content
function printContent() {
  isPrinting.value = true

  if (!printIframe.value) return

  const doc = printIframe.value.contentDocument
  doc.open()
  doc.write(`
    <html>
      <head>
        <style>
          @page {
            size: A4;
            margin: 0;
            padding: 0;
          }
          body { 
            margin: 0; 
            padding: 0; 
          }
          .page {
            width: 100%;
            height: 100%;
            overflow: hidden;
            page-break-after: always;
          }

          .image-container {
            max-width: 100%;
            max-height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          img { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
            display: block;
          }
        </style>
      </head>
      <body>
        ${imageUrls.value
          .map(
            (url) => `
          <div class="page">
            <div class="image-container">
              <img src="${url}" />
            </div>
          </div>
        `
          )
          .join('')}
      </body>
    </html>
  
  `)
  doc.close()

  // Wait for images to load before printing
  printIframe.value.onload = () => {
    printIframe.value.contentWindow.print()
  }
  isPrinting.value = false
}
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
  height: 60px;
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
  position: absolute; /* Add this line */

  bottom: 20px; /* Add this line */
  right: 20px; /* Add this line */
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
</style>
