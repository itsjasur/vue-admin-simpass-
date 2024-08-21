<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">증빙서료</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div v-if="props?.imageUrls?.length > 0" class="scrollable-content">
        <img
          v-for="(imageUrl, index) in props?.imageUrls"
          :key="index"
          class="image"
          :src="imageUrl"
          alt=""
          loading="lazy"
        />
      </div>
      <div class="empty-content" v-else>증빙서료 없습니다.</div>

      <div v-if="props?.canPrint ?? true" class="buttons">
        <button class="download_button" @click="downloadAllImages()">
          <span class="material-symbols-outlined download-icon"> download </span>
          <span>다운로드</span>
        </button>

        <button v-if="imageUrls.length > 0" @click="printContent" :disabled="isPrinting">
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
  </div>
  <iframe ref="printIframe" style="display: none"></iframe>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  baseFilename: { type: String, default: 'image' },
  imageUrls: { type: Array, defalut: [] },
  canPrint: { type: Boolean, defalut: true }
})

console.log(props)

const emits = defineEmits(['closePopup'])

const isDownloading = ref(false)
async function downloadAllImages() {
  if (isDownloading.value) return
  isDownloading.value = true

  try {
    for (let i = 0; i < props.imageUrls.length; i++) {
      const url = props.imageUrls[i]
      const response = await fetch(url)
      const blob = await response.blob()

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${props.baseFilename}_${i + 1}.png`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  } catch (error) {
    console.error('Error downloading images:', error)
  } finally {
    isDownloading.value = false
  }
}

const isPrinting = ref(false)
const printIframe = ref(null)
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
        ${props.imageUrls
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
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  height: 100%;
  width: 800px;
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
  box-shadow: 0 2px 4px #0000001a; /* Bottom shadow */
}

.scrollable-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 20px;
  height: 100%;

  padding-bottom: 100px;
  padding-top: 20px;
}

.empty-content {
  height: 100%;
  align-self: center;
  align-content: center;
}

.close-button {
  font-size: 30px;
}

.buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-flow: row;
  gap: 20px;
}

.buttons button {
  width: auto;
  min-width: 120px;
  height: 45px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 0 0 10px #00000025;
}

.download_button {
  background-color: #7f7f7f;
}

.print-icon {
  font-size: 25px;
  margin-right: 10px;
}
</style>
