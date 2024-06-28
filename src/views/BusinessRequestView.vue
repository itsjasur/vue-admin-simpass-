<template>
  <div class="container">
    <div v-for="(agent, index) in data" :key="index" class="agent-card">
      <div class="intro">
        <img class="agent-logo" :src="agent.logo_img_url" alt="SP" />
        <span class="agent-name">{{ agent.agent_nm }}</span>
      </div>

      <div class="column-card">
        <div class="title-text">정보</div>
        <div class="content-row">
          <div class="info-title">주소:</div>
          <div class="info-content">{{ agent.address + ' ' + agent.dtl_address }}</div>
        </div>
        <div class="content-row">
          <div class="info-title">사업자번호:</div>
          <div class="info-content">{{ agent.business_num }}</div>
        </div>
        <div class="content-row">
          <div class="info-title">전화번호:</div>
          <div class="info-content">{{ agent.contact }}</div>
        </div>
      </div>

      <template v-for="(type, typeIndex) in agent.usim_agent_info" :key="typeIndex">
        <div v-if="type.list.length > 0" class="column-card">
          <div class="title-text">{{ type.carrier_type_nm }}</div>

          <template
            v-for="(carrier, carrierIndex) in generateCarrierList(type.list)"
            :key="carrierIndex"
          >
            <template v-if="carrier.length > 0">
              <div class="content-row">
                <div class="carrier-name">{{ carrierIndex }}</div>
                <div
                  v-for="(provider, providerIndex) in carrier"
                  :key="providerIndex"
                  class="providers"
                >
                  <img class="provider-logo" :src="provider.image_url" :alt="provider.mvno_nm" />
                </div>
              </div>
            </template>
          </template>
        </div>
      </template>

      <!-- <button @click="router.push({ name: '/business-request-form', params: { id: 1 } })">거래요청</button> -->
      <button @click="openPopup(agent.agent_cd)">거래요청</button>
    </div>
  </div>

  <BusinessRequestPopup
    v-if="businessRequestPopup"
    :agentCd="selectedAgentCd"
    @closePopup="businessRequestPopup = false"
  />
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BusinessRequestPopup from '../components/BusinessRequestPopup.vue'

const router = useRouter()

//business request popup
const businessRequestPopup = ref(false)
const selectedAgentCd = ref()

function openPopup(agentCd) {
  businessRequestPopup.value = true
  selectedAgentCd.value = agentCd
}

const data = ref()

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/getAgentInfo', { method: 'GET' })

    if (!response.ok) throw 'Fetch profile data error'

    const decodedResponse = await response.json()
    data.value = decodedResponse.data
    // console.log(data.value)
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}
function generateCarrierList(list) {
  const carriers = { KT: [], SK: [], LG: [] }

  for (const carrierCd in carriers) {
    list.forEach((item) => {
      if (item.carrier_cd === carrierCd) carriers[carrierCd].push(item)
      else return
    })
  }

  //   console.log('list ', carriers)
  return carriers
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  padding: 40px 20px;
  box-sizing: border-box;
  min-height: 100%;
  min-width: 100%;

  display: flex;
  flex-flow: wrap;
  gap: 30px;

  justify-content: center;
  align-items: center;

  overflow-y: auto;
  /* background-color: aquamarine; */
}

.agent-card {
  width: 500px;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #fff;
  border-radius: 8px;
  box-shadow: 0 0 5px #00000013;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 20px;
}

.intro {
  display: flex;
  flex-flow: row;
  align-items: center;
  /* justify-content: center; */
  gap: 10px;
}

.agent-logo {
  height: 60px;
  width: 150px;
  background-color: #0000000b;
  border-radius: 30px;
  box-sizing: border-box;
  padding: 0 10px;
  object-fit: contain;
}

.agent-name {
  font-size: 20px;
  font-weight: 600;
  color: #454545;
}

.column-card {
  width: 100%;
  /* height: 100px; */
  padding: 10px;
  box-sizing: border-box;
  background-color: #0000000c;
  border-radius: 5px;

  display: flex;
  flex-flow: column;
  gap: 10px;
}

.column-card .title-text {
  font-weight: 600;

  /* background-color: aquamarine; */
}

.content-row {
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 10px;
}

.carrier-name {
  /* min-width: 30px; */
  white-space: nowrap;
  font-weight: 600;
}

.providers {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  gap: 10px;
}

.provider-logo {
  height: 30px;
  width: 110px;
  background-color: #fff;
  border-radius: 30px;
  box-sizing: border-box;
  padding: 0 10px;
  object-fit: contain;
}

.info-title {
  font-weight: 600;
  white-space: nowrap;
}

/* hr {
  border: none;
  height: 2px;
  background-color: #0000000b;
  width: 100%;
  margin: 0;
  padding: 0;
} */

button {
  width: auto;
  min-width: 100px;
  align-self: center;
}
</style>
