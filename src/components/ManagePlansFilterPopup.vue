<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">데이터 필터링</h3>
        <span @click="popup.close()" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div class="scrollable-content">
        <div class="filters">
          <div class="group" style="max-width: 120px">
            <label>통신망</label>
            <a-select
              v-model:value="popup.carrier"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.carrier_cd.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>
          <div class="group" style="max-width: 300px">
            <label>통신사</label>
            <a-select
              v-model:value="popup.mvno"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.mvno_cd.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>

          <div class="group" style="max-width: 170px">
            <label>대리점</label>
            <a-select
              v-model:value="popup.agent"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.agent_cd.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>

          <div class="group" style="max-width: 130px">
            <label>서비스 유형</label>
            <a-select
              v-model:value="popup.carrierType"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.carrier_type.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>

          <div class="group" style="max-width: 120px">
            <label>가입대상</label>
            <a-select
              v-model:value="popup.carrierPlanType"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.carrier_plan_type.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>
          <div class="group" style="max-width: 120px">
            <label>상태</label>
            <a-select
              v-model:value="popup.status"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :filter-option="filterOption"
              :options="
                data.status_cd.map((i) => ({ value: i.cd, label: i.value })) ?? [
                  { value: 'N/A', label: 'N/A' }
                ]
              "
            >
            </a-select>
          </div>
        </div>
        <div class="action-buttons">
          <button @click="popup.clear" class="reset">초기화</button>
          <button @click="popup.close()" class="search">완료</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

import { usePlansFilterPopup } from '../stores/manage-plans-popup-store'

const popup = usePlansFilterPopup()

// const dataList = ref({})

const data = reactive({
  carrier_cd: [],
  mvno_cd: [],
  agent_cd: [],
  carrier_type: [],
  carrier_plan_type: [],
  status_cd: []
})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/plan', {
      method: 'POST',
      body: {
        usim_plan_nm: popup.value, //요금제명
        carrier_cd: popup.carrier, //통신사
        mvno_cd: popup.mvno, //브랜드
        agent_cd: popup.agent, //대리점
        carrier_type: popup.carrierType, //서비스유형
        carrier_plan_type: popup.carrierPlanType, // 가입대상
        status: popup.status, //상태
        page: popup.currentPage,
        rowLimit: popup.rowLimit
      }
    })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    data.carrier_cd = decodedResponse.data.carrier_cd
    data.mvno_cd = decodedResponse.data.mvno_cd
    data.agent_cd = decodedResponse.data.agent_cd
    data.carrier_type = decodedResponse.data.carrier_type
    data.carrier_plan_type = decodedResponse.data.carrier_plan_type
    data.status_cd = decodedResponse.data.status_cd

    popup.totalCount = decodedResponse.data.totalNum
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

//this makes the search with value and label in a-select
const filterOption = (input, option) => {
  return (
    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  )
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
  fetchData()
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
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000c7;
  padding: 20px;
  z-index: 2000;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-height: 100%;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  box-sizing: border-box;
}

.fixed-header {
  position: sticky;
  top: 0;
  min-height: 50px;
  padding: 0 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px #0000001a;
  box-sizing: border-box;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  font-size: 30px;
  color: #737373;
}

.scrollable-content {
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 20px;
  overflow-x: auto;
}

.filters {
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}

.group {
  width: 100%;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  justify-content: center;
}

.action-buttons * {
  min-width: 120px;
  width: auto;
}
.action-buttons .reset {
  background-color: #737373;
}

@media (max-width: 600px) {
  .popup-content {
    width: 100%;
  }
}
</style>
