<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">증빙서류</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div v-if="imageUrls.length > 0" class="scrollable-content">
        <img
          v-for="(imageUrl, index) in imageUrls"
          :key="index"
          class="image"
          :src="imageUrl"
          alt=""
          loading="lazy"
        />
      </div>
      <div class="empty-content" v-else>증빙서류 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { useImagesHolderStore } from '@/stores/image-holder-store'
import { onMounted, ref } from 'vue'

const emits = defineEmits(['closePopup'])

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

onMounted(() => {
  imageUrls.value = useImagesHolderStore().images?.map((image) => blobToURL(base64ToBlob(image)))
})
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
