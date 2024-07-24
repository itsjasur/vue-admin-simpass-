<template>
  <div class="container">
    <div class="types">
      <div
        class="button"
        v-for="(item, index) in types"
        :key="index"
        :class="{ selected: selectedType === item.cd }"
        @click="changeType(item.cd)"
      >
        {{ item.label }}
      </div>
    </div>

    <div class="carriers">
      <div
        class="button"
        v-for="(item, index) in carriers"
        :key="index"
        :class="{ selected: selectedCarrierCd === item.cd }"
        @click="changeCarrier(item.cd)"
      >
        {{ item.label }}
      </div>
    </div>

    <div class="mvnos">
      <div class="card" v-for="(item, index) in mvnos" :key="index" @click="selectMvno(item)">
        <img :src="item.image_url" :alt="item.mvno_nm" width="100%" />
        <img class="logo" :src="logoFinder(item.carrier_cd)" :alt="item.carrier_nm" height="100%" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '../stores/snackbar'
import { useSelectPlansPopup } from '../stores/select-plans-popup'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { logoFinder } from '../utils/logoFinder'
import { onMounted, ref } from 'vue'
import { CARRIERS, PLANTYPES } from '../assets/constants'

const selectPlansPopup = useSelectPlansPopup()

const selectedType = ref('PO')
const selectedCarrierCd = ref('')

const types = ref(PLANTYPES)
const carriers = ref(CARRIERS)

const mvnos = ref([])

function changeType(cd) {
  selectedType.value = cd
  fetchData()
}

function changeCarrier(cd) {
  selectedCarrierCd.value = cd
  fetchData()
}

function selectMvno(item) {
  selectPlansPopup.searchText = ''
  selectPlansPopup.open(selectedType.value, item.carrier_cd, item.mvno_cd)
}

async function fetchData() {
  // console.log('fetch caled')
  try {
    const response = await fetchWithTokenRefresh('agent/applyCarrier', {
      method: 'POST',
      body: { carrier_type: selectedType.value, carrier_cd: selectedCarrierCd.value }
    })

    const decodedResponse = await response.json()
    if (!response.ok) throw decodedResponse?.message ?? 'Fetch data error'
    if (decodedResponse.data && decodedResponse.data.info) mvnos.value = decodedResponse.data.info
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

onMounted(async () => {
  fetchData()
  useSnackbarStore().hide()
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  await delay(1000)
  useSnackbarStore().show('가입신청  접수할 통신사를 선택해주세요', 'warning')
})
</script>

<style scoped>
.container {
  margin-top: 20px;
  padding: 0 20px;
  display: flex;
  flex-flow: column;
  gap: 40px;
}

.types {
  display: flex; /* Display the carrier buttons in a row */
  gap: 20px;
  flex-flow: wrap;
}

.carriers {
  display: flex; /* Display the carrier buttons in a row */
  gap: 20px;
  flex-flow: wrap;
}

.mvnos {
  display: flex; /* Display the carrier buttons in a row */
  gap: 20px;
  flex-flow: wrap;
}

.button {
  min-height: 55px;
  min-width: 140px;
}

.card {
  position: relative;
  width: 200px;
  padding: 50px 30px;
  z-index: 1;
}

.card .logo {
  position: absolute;
  right: 5%;
  top: 8%;
  height: 10%;
}

@media (max-width: 600px) {
  .container {
    flex-direction: column;
  }

  .carriers {
    display: flex;
    flex-wrap: wrap;
  }

  .mvnos {
    display: flex;
    flex-wrap: wrap;
  }

  .button {
    flex: 1 0 calc(50% - 20px); /* each item takes half of the container width with a gap of 20px */
    max-width: calc(50% - 10px); /* ensures items don't exceed half of the container width */
  }

  .card {
    flex: 1 0 calc(50% - 20px); /* each item takes half of the container width with a gap of 20px */
    max-width: calc(50% - 10px); /* ensures items don't exceed half of the container width */
    padding: 8vw 8vw;
  }
}
</style>
