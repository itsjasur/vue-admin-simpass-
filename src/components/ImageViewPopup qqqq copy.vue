<template>
  <div v-if="popup.active" class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">증빙서류</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div v-if="imageUrls.length > 0" class="scrollable-content">
        <img
          v-for="(image, index) in imageUrls"
          :key="index"
          class="image"
          :src="image"
          alt=""
          loading="lazy"
        />
      </div>
      <div class="empty-content" v-else>증빙서류 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useImagesHolderStore } from '@/stores/image-holder-store'

const popup = useImagesHolderStore()

const imageUrls = ref([])

function base64ToBlob(base64Data) {
  let contentType = 'application/octet-stream' // Default content type
  let raw = base64Data

  // checking if the base64 string includes the data URL prefix
  if (base64Data?.startsWith('data:')) {
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

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') popup.close()
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
  background-color: #000000c2;
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
  box-shadow: 0 2px 4px #0000001a; /* Bottom shadow */
}

.scrollable-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 20px;
  height: 100%;
}

.empty-content {
  height: 100%;
  align-self: center;
  align-content: center;
}

.close-button {
  font-size: 30px;
}
</style>
