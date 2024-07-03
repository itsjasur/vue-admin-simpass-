<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">신규 요금제 등록</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div class="scrollable-content">
        <div class="filters">
          <div class="group" style="max-width: 140px">
            <label>통신사</label>
            <a-select
              v-model:value="forms.carrier"
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
            <p v-if="isSubmitted && !forms.carrier" class="input-error-message">
              통신사 선택하세요.
            </p>
          </div>
          <div class="group" style="max-width: 300px">
            <label>브랜드</label>
            <a-select
              v-model:value="forms.mvno"
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
            <p v-if="isSubmitted && !forms.mvno" class="input-error-message">브랜드 선택하세요.</p>
          </div>

          <div class="group" style="max-width: 170px">
            <label>디리점</label>
            <a-select
              v-model:value="forms.agent"
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
            <p v-if="isSubmitted && !forms.agent" class="input-error-message">디리점 선택하세요.</p>
          </div>

          <div class="group" style="max-width: 140px">
            <label>서비스 유형</label>
            <a-select
              v-model:value="forms.carrierType"
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
            <p v-if="isSubmitted && !forms.carrierType" class="input-error-message">
              서비스 유형 선택하세요.
            </p>
          </div>

          <div class="group" style="max-width: 140px">
            <label>가입대상</label>
            <a-select
              v-model:value="forms.carrierPlanType"
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
            <p v-if="isSubmitted && !forms.carrierPlanType" class="input-error-message">
              가입대상 선택하세요.
            </p>
          </div>
          <div class="group" style="max-width: 400px">
            <label>요금제명</label>
            <input v-model="forms.planName" />
            <p v-if="isSubmitted && !forms.planName" class="input-error-message">
              요금제명 입력하세요.
            </p>
          </div>

          <div class="group" style="max-width: 140px">
            <label>상태</label>
            <a-select
              v-model:value="forms.status"
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
            <p v-if="isSubmitted && !forms.status" class="input-error-message">
              가입대상 선택하세요.
            </p>
          </div>
          <div class="group" style="max-width: 150px">
            <label>기본료</label>
            <input
              v-model="forms.basicFee"
              name="basicFee"
              v-cleave="{ numeral: true, onValueChanged }"
            />
            <p v-if="isSubmitted && !forms.basicFee" class="input-error-message">
              기본료 입력하세요.
            </p>
          </div>

          <div class="group" style="max-width: 150px">
            <label>판매금액</label>
            <input
              v-model="forms.salesFee"
              name="salesFee"
              v-cleave="{ numeral: true, onValueChanged }"
            />
            <p v-if="isSubmitted && !forms.salesFee" class="input-error-message">
              판매금액 입력하세요.
            </p>
          </div>

          <div class="group" style="max-width: 150px">
            <label>문자</label>
            <input v-model="forms.message" />
            <p v-if="isSubmitted && !forms.message" class="input-error-message">문자 입력하세요.</p>
          </div>

          <div class="group" style="max-width: 150px">
            <label>데이터</label>
            <input v-model="forms.data" />
            <p v-if="isSubmitted && !forms.data" class="input-error-message">데이터 입력하세요.</p>
          </div>

          <div class="group" style="max-width: 150px">
            <label>음성</label>
            <input v-model="forms.voice" />
            <p v-if="isSubmitted && !forms.voice" class="input-error-message">음성 입력하세요.</p>
          </div>

          <div class="group" style="max-width: 150px">
            <label>영사 / 기타</label>
            <input v-model="forms.videEtc" />
          </div>

          <div class="group" style="max-width: 150px">
            <label>QOS</label>
            <input v-model="forms.qos" />
          </div>

          <div class="group" style="max-width: 150px">
            <label>우선순위</label>
            <input
              v-model="forms.priority"
              name="priority"
              v-cleave="{ numeral: true, onValueChanged }"
            />
          </div>

          <!--  -->
        </div>

        <button class="save-button" @click="updateAddPlan">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'

const emit = defineEmits(['closePopup'])
const props = defineProps({ id: { type: Number, default: null } })

const forms = reactive({
  carrier: null,
  mvno: null,
  agent: null,
  carrierType: null,
  carrierPlanType: null,
  status: null,
  planName: null,
  basicFee: null,
  salesFee: null,
  message: null,
  data: null,
  voice: null,
  videEtc: null,
  qos: null,
  priority: null
})

const rawForms = reactive({
  basicFee: null,
  salesFee: null,
  priority: null
})

const data = reactive({
  carrier_cd: [],
  mvno_cd: [],
  agent_cd: [],
  carrier_type: [],
  carrier_plan_type: [],
  status_cd: []
})

const isSubmitted = ref(false)

function onValueChanged(event) {
  forms[event.target.name] = event.target.value
  rawForms[event.target.name] = event.target.rawValue
}

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/plan', {
      method: 'POST',
      body: {
        id: props.id,
        usim_plan_nm: '', //요금제명
        carrier_cd: '', //통신사
        mvno_cd: '', //브랜드
        agent_cd: '', //대리점
        carrier_type: '', //서비스유형
        carrier_plan_type: '', // 가입대상
        status: '', //상태
        page: 1,
        rowLimit: 1
      }
    })
    if (!response.ok) throw 'Fetch data error'

    const decodedResponse = await response.json()

    //if props comes with id, values are set to 1st item in the list
    if (props.id) {
      const planInfo = decodedResponse.data.plan_list[0]
      forms.carrier = planInfo?.carrier_cd ?? ''
      forms.mvno = planInfo?.mvno_cd ?? ''
      forms.agent = planInfo?.agent_cd ?? ''
      forms.carrierType = planInfo?.carrier_type ?? ''
      forms.carrierPlanType = planInfo?.carrier_plan_type ?? ''
      forms.status = planInfo?.status ?? ''
      forms.planName = planInfo?.usim_plan_nm ?? ''
      forms.basicFee = planInfo?.basic_fee ?? ''
      forms.salesFee = planInfo?.sales_fee ?? ''
      forms.message = planInfo?.message ?? ''
      forms.data = planInfo?.cell_data ?? ''
      forms.voice = planInfo?.voice ?? ''
      forms.videEtc = planInfo?.video_etc ?? ''
      forms.qos = planInfo?.qos ?? ''
      forms.priority = planInfo?.priority ?? ''
    }

    data.carrier = data.carrier_cd = decodedResponse.data.carrier_cd
    data.mvno_cd = decodedResponse.data.mvno_cd
    data.agent_cd = decodedResponse.data.agent_cd
    data.carrier_type = decodedResponse.data.carrier_type
    data.carrier_plan_type = decodedResponse.data.carrier_plan_type
    data.status_cd = decodedResponse.data.status_cd

    forms.totalCount = decodedResponse.data.totalNum
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

async function updateAddPlan() {
  isSubmitted.value = true

  const requiredFields = [
    'carrier',
    'mvno',
    'agent',
    'carrierType',
    'carrierPlanType',
    'status',
    'planName',
    'basicFee',
    'salesFee',
    'message',
    'data',
    'voice'
  ]

  const allReqFilled = requiredFields.every((field) => forms[field] !== null && forms[field] !== '')
  if (!allReqFilled) return

  try {
    const response = await fetchWithTokenRefresh('agent/setPlan', {
      method: 'POST',
      body: {
        id: props?.id ?? null, //sending id=null adds new plan. if id given, updates
        usim_plan_nm: forms.planName,
        carrier_cd: forms.carrier,
        mvno_cd: forms.mvno,
        agent_cd: forms.agent,
        basic_fee: rawForms.basicFee,
        sales_fee: rawForms.salesFee,
        voice: forms.voice,
        message: forms.message,
        cell_data: forms.data,
        video_etc: forms.videEtc,
        qos: forms.qos,
        carrier_plan_type: forms.carrierPlanType,
        carrier_type: forms.carrierType,
        priority: rawForms.priority,
        status: forms.status
      }
    })

    const decodedResponse = await response.json()

    if (decodedResponse?.result === 'SUCCESS') {
      useSnackbarStore().show(decodedResponse.message)
      emit('closePopup', true, props?.id === null)
      return
    }

    useSnackbarStore().show(decodedResponse?.message ?? 'Set plan error')
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
  if (event.key === 'Escape') emit('closePopup', false)
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
  width: 700px;
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
  overflow-y: auto;
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

.save-button {
  margin: 20px 0;
  min-width: 140px;
  width: auto;
  align-self: center;
}

@media (max-width: 600px) {
  .popup-content {
    min-width: unset;
    width: 100%;
  }
}
</style>
