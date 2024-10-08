<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">상태 수정</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div class="scrollable-content">
        <div class="group">
          <label>상태</label>
          <a-select
            v-model:value="newStatus"
            :style="{ width: '100%' }"
            :options="
              props.statuses.map((i) => ({ value: i.cd, label: i.value })) ?? [
                { value: 'N/A', label: 'N/A' }
              ]
            "
          >
          </a-select>
        </div>

        <div v-if="newStatus === 'Y' && props.isNewNumber" class="group">
          <label>휴대전화</label>

          <CleaveInput
            @rawValue="phoneNumber = $event"
            :options="{ phone: true, phoneRegionCode: 'KR', delimiter: '-', prefix: '010' }"
          />

          <p v-if="isSubmitted && phoneNumber.length !== 11" class="input-error-message">
            휴대전화 입력하세요.
          </p>
        </div>

        <button @click="updateStatus" class="save-button" :disabled="isStatusUpdating">
          <span v-if="isStatusUpdating">
            <LoadingSpinner height="20px" color="#ffffff" />
          </span>
          <span v-else> 저장 </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import LoadingSpinner from '../components/Loader.vue'

const props = defineProps({
  actNo: { type: String, default: null },
  statuses: { type: Array, default: [] },
  currentStatus: { type: String, default: '' },
  isNewNumber: { type: Boolean, default: false }
})

const emits = defineEmits(['closePopup'])

const newStatus = ref(props.currentStatus)
const phoneNumber = ref()

const isStatusUpdating = ref(false)

const isSubmitted = ref(false)

async function updateStatus() {
  // console.log(phoneNumber.value)
  // return
  try {
    isSubmitted.value = true
    isStatusUpdating.value = true

    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    // await delay(3000)

    if (newStatus.value === 'Y' && props.isNewNumber && phoneNumber.value.length !== 11) return

    const response = await fetchWithTokenRefresh('agent/setApplyStatus', {
      method: 'POST',
      body: {
        act_no: props.actNo,
        phone_number: phoneNumber.value,
        usim_act_status: newStatus.value
      }
    })
    if (!response.ok) throw 'Change status error'
    const decodedResponse = await response.json()

    useSnackbarStore().show(decodedResponse?.message ?? 'Could not update status')
    emits('closePopup', true)
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    isStatusUpdating.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') emits('closePopup')
}
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

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
  width: 350px;
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

.save-button {
  margin-top: 20px;
  width: auto;
  align-self: center;
  min-width: 120px;
}

@media (max-width: 600px) {
  .popup-content {
    width: 100%;
  }
}
</style>
