<template>
  <div class="container">
    <div class="mvnos">
      <div class="card" v-for="(item, index) in mvnos" :key="index" @click="selectMvno(item)">
        <img :src="item.image_url" :alt="item.mvno_nm" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { logoFinder } from '../utils/logoFinder'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMvnoSelectStore } from '../stores/mvno_select_store'

const router = useRouter()

const mvnos = ref([])

function selectMvno(item) {
  useMvnoSelectStore().select(item.mvno_cd)
  router.push('/applications')
}

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyCarrier', {
      method: 'POST',
      body: { carrier_type: '', carrier_cd: '' }
    })

    const decodedResponse = await response.json()
    if (!response.ok) throw decodedResponse?.message ?? 'Fetch data error'
    if (decodedResponse.data && decodedResponse.data.info) mvnos.value = decodedResponse.data.info
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  margin-top: 20px;
  padding: 0 15px;
  height: 100%;
  width: 100%;

  align-content: center;
  padding: 30px;
  box-sizing: border-box;
}

.mvnos {
  display: flex;
  gap: 20px;
  flex-flow: wrap;
  justify-content: center;
}

.card {
  width: 200px;
  height: 200px;

  padding: 60px 30px;
  font-size: 20px;
  box-sizing: border-box;
  align-content: center;
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 600px) {
  .container {
    flex-direction: column;
  }

  .mvnos {
    display: flex;
    flex-wrap: wrap;
  }

  .card {
    height: 150px;
    width: 100%;
    padding: 60px 30px;
  }
}
</style>
