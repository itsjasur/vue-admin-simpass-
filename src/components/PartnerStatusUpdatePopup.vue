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

        <button @click="updateStatus" class="save-button">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps({
  partnerCd: { type: String, default: null },
  agentCd: { type: String, default: null },
  statuses: { type: Array, default: [] },
  currentStatus: { type: String, default: '' },
  popupFor: { type: String, default: '' }
})

const emits = defineEmits(['closePopup'])

const newStatus = ref(props.currentStatus)
const phoneNumber = ref()

async function updateStatus() {
  var url = 'agent/setPartnerStatus'
  var body = {
    partner_cd: props.partnerCd,
    status: newStatus.value
  }

  if (props.popupFor === 'partners') {
    url = 'agent/setContractStatus'
    body = {
      partner_cd: props.partnerCd,
      agent_cd: props.agentCd,
      status: newStatus.value
    }
  }

  try {
    const response = await fetchWithTokenRefresh(url, {
      method: 'POST',
      body: body
    })
    if (!response.ok) throw 'Change status error'
    const decodedResponse = await response.json()

    useSnackbarStore().show(decodedResponse?.message ?? 'Could not update status')
    emits('closePopup', true)
  } catch (error) {
    useSnackbarStore().show(error.toString())
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
