<template>
  <div class="main">
    <div class="container">
      <template v-for="(form, index) in forms" :key="index">
        <div class="card">
          <!-- <span class="material-symbols-outlined" style="color: red"> assignment </span> -->
          <img class="carrier-logo" :src="logoFinder(form.carrier_cd)" :alt="form.carrier_nm" height="100%" />
          <div class="mvno-logo-card">
            <img class="mvno-logo" :src="form.image_url" :alt="form.title" />
          </div>
          <span class="name">{{ form.title }}</span>
          <span class="type">{{ form.sub_title }}</span>
          <div class="buttons-row">
            <button @click="downloadPdf(form)" class="download">다운로드</button>
            <button v-if="!isMobile" @click="printPdf(form)" class="print">프린트</button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <PrintablePdfPopup v-if="usePrintablePdfPopup().active" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { logoFinder } from '../utils/logoFinder'
import { usePrintablePdfPopup } from '../stores/printable-pdf-popup'
import PrintablePdfPopup from '../components/PrintablePdfPopup.vue'

const isMobile = ref(false)
const router = useRouter()
const forms = ref([])

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyForms', { method: 'GET' })

    if (!response.ok) throw new Error('Fetch data error')
    const decodedResponse = await response.json()
    if (decodedResponse.data && decodedResponse.data.info) {
      forms.value = decodedResponse.data.info
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

const fetchPdfBlob = async (form) => {
  try {
    const response = await fetchWithTokenRefresh(`agent/attach/${form.filename}`, { method: 'GET' })

    if (!response.ok) throw new Error('Network response was not ok')
    // const blob = await response.blob()

    const pdfData = await response.blob()
    const blob = new Blob([pdfData], { type: 'application/pdf' })

    // a URL for the Blob
    const url = URL.createObjectURL(blob)
    return url
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

const downloadPdf = async (form) => {
  try {
    //  a URL for the Blob
    const url = await fetchPdfBlob(form)
    //  temporary anchor element to trigger the download
    const a = document.createElement('a')
    a.href = url
    a.download = form.title + '.pdf' // desired file name
    document.body.appendChild(a)
    a.click()

    window.open(url, '_blank')

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

const printPdf = async (form) => {
  try {
    const url = await fetchPdfBlob(form)
    usePrintablePdfPopup().open(url)
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

onMounted(() => {
  isMobile.value = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  fetchData()
})
</script>

<style scoped>
.main {
  min-height: 100%;
  align-content: center;
}
.container {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
  height: auto;
  padding: 40px 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.card {
  height: 200px;
  width: 300px;
  padding: 10px;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
  gap: 10px;
}

.card:hover {
  cursor: default;
  background-color: #fff;
}

.mvno-logo-card {
  width: 50%;
  height: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: #f6f6f6;
  border-radius: 30px;
  position: relative;
}

.mvno-logo {
  position: absolute;
  max-width: 80%;
  /* max-height: 80%; */
  object-fit: contain;
}

.carrier-logo {
  position: absolute;
  right: 10px;
  top: 10px;
  height: auto;
  max-height: 8%;
  width: 18%;
  object-fit: contain;
}

.card .name {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  white-space: normal;
  text-align: center;
}

.card .type {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  white-space: normal;
  text-align: center;
}

.card .buttons-row {
  display: flex;
  gap: 20px;
  width: 50%;
  justify-content: center;
}

.card button {
  background-color: transparent;
  border: 1.5px dashed #838383;
  color: var(--text-color);
  min-width: 100px;
}

.card button:hover {
  background-color: #f3f3f3;
}

.card .download {
  border-color: var(--main-color);
  color: var(--main-color);
}

.card .print {
  border-color: #3675fd;
  color: #3675fd;
}

@media (max-width: 600px) {
  .card {
    height: 200px;
    width: 100%;
  }
}
</style>
