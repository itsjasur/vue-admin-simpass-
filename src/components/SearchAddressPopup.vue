<template>
  <div v-if="popup.active" class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">주소 검색</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button">cancel</span>
      </div>
      <div style="margin-top: 10px; width: 100%; height: calc(100% - 70px)" ref="embed"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useSearchaddressStore } from '../stores/select-address-popup'

const popup = useSearchaddressStore()
const embed = ref(null)

// This handles keyboard actions
function keydownHandle(event) {
  if (event.key === 'Escape') popup.close()
}

onMounted(() => {
  // listen for keydown events
  document.addEventListener('keydown', keydownHandle)
})

onUnmounted(() => {
  // cleanup keydown event listener
  document.removeEventListener('keydown', keydownHandle)
})

// watchs for changes in popup.active and mount the Daum Postcode widget when active
watchEffect(() => {
  if (popup.active) {
    if (embed.value) {
      new window.daum.Postcode({
        width: '100%', // Width of the iframe
        height: '100%',
        oncomplete: (data) => {
          let selectedType = data.userSelectedType
          let roadAddr = data.roadAddress
          let jibunAddr = data.jibunAddress
          let buildingName = data.buildingName

          popup.address = selectedType === 'R' ? roadAddr : jibunAddr
          popup.buildingName = buildingName
          popup.close()
        },
      }).embed(embed.value)
    }
  }
})
</script>

<style scoped>
.overlay {
  display: flex;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  justify-content: center; /* cnters horizontally */
  align-items: center; /* centers vertically */
  z-index: 1100;
  background-color: rgba(0, 0, 0, 0.552);
  padding: 20px;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  width: 600px;
  height: 100%;
  max-height: 600px;
  overflow: auto;
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
  z-index: 1101;
}
</style>
