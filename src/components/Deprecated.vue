<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="innerHeader">
        <h3 class="title">주소 검색</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div class="scrollable-content">
        <img v-for="(image, index) in imageUrls" :key="index" class="image" :src="image" alt="" loading="lazy" />
        <!-- below is used to display pdf in the browser -->
        <!-- <iframe :src="imagePdfUrl" width="100%" height="100%"></iframe> -->
      </div>

      <button @click="convertToPdfAndPrint" class="print-button">
        <span class="material-symbols-outlined print-icon"> print </span>
        <span>출력</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import jsPDF from 'jspdf'
import { onMounted, onUnmounted, ref } from 'vue'
import { usePrintablePopup } from '../stores/printable-popup'

const popup = usePrintablePopup()
const imagePdfUrl = ref(null)
const imageUrls = ref([])

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

// converts base64 to Blob URL
onMounted(() => {
  imageUrls.value = popup.images.map((image) => blobToURL(base64ToBlob(image)))
  convertToPdfAndPrint()
})

// // cleans up the Blob URL to avoid memory leaks
// onUnmounted(() => {
//   imageUrls.value.forEach((url) => {
//     URL.revokeObjectURL(url)
//   })
//   imageUrls.value = []
// })

//this converts base64 images to pdf and then prints pdf
// using iframe by converting pdf to url
const convertToPdfAndPrint = () => {
  window.print()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

  const pdfWidth = doc.internal.pageSize.getWidth()
  const pdfHeight = doc.internal.pageSize.getHeight()

  popup.images.forEach((imgData, index) => {
    const img = doc.getImageProperties(imgData)
    let imgWidth = pdfWidth
    let imgHeight = (img.height * pdfWidth) / img.width

    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight
      imgWidth = (img.width * pdfHeight) / img.height
    }

    const x = (pdfWidth - imgWidth) / 2 // centers the image horizontally
    const y = (pdfHeight - imgHeight) / 2 // centers the image vertically

    doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

    if (index < popup.images.length - 1) doc.addPage()
  })

  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  imagePdfUrl.value = pdfUrl

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  //  focus listener handles if focus is back and then cleans up iframe
  window.addEventListener('focus', handleFocus)
  function handleFocus() {
    document.body.removeChild(iframe)
    window.removeEventListener('focus', handleFocus)
  }

  iframe.onload = () => iframe.contentWindow.print()
  iframe.src = pdfUrl
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
  height: 50px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-sizing: border-box; */
  padding: 0 30px;
  font-size: 16px;
  box-shadow: 0 0 10px #00000025; /* Bottom shadow */
}

.print-icon {
  font-size: 25px;
  margin-right: 10px;
}
</style>
