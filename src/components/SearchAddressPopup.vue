<template>
  <div class="overlay">
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
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useSearchaddressStore } from '../stores/select-address-popup'

const popup = useSearchaddressStore()
const embed = ref(null)

// This handles keyboard actions
function keydownHandle(event) {
  if (event.key === 'Escape') popup.close()
}

function loadDaumPostcodeScript() {
  return new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Daum Postcode script'))
    document.head.appendChild(script)
  })
}

function initializePostcode() {
  if (embed.value) {
    new window.daum.Postcode({
      width: '100%',
      height: '100%',
      oncomplete: (data) => {
        let selectedType = data.userSelectedType
        let roadAddr = data.roadAddress
        let jibunAddr = data.jibunAddress
        let buildingName = data.buildingName

        popup.address = selectedType === 'R' ? roadAddr : jibunAddr
        popup.buildingName = buildingName
        popup.close()
      }
    }).embed(embed.value)
  }
}

onMounted(async () => {
  document.addEventListener('keydown', keydownHandle)

  try {
    await loadDaumPostcodeScript()
    initializePostcode()
  } catch (error) {
    console.error('Error loading Daum Postcode script:', error)
  }
})

onUnmounted(() => {
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
  justify-content: center;
  align-items: center;
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
  height: 50px;
  padding: 0 20px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1101;
}
</style>
