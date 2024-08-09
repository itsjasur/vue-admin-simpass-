<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">요청 세부정보</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div v-if="Object.keys(details).length > 0" class="scrollable-content">
        <div class="forms">
          <div class="group" style="width: 300px">
            <label>이름</label>
            <input :value="details.name" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>연락처</label>
            <input :value="details.contact" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>국가</label>
            <input :value="details.country_nm" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>요금제</label>
            <input :value="details.plan_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>요금제코드</label>
            <input :value="details.plan_id" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>가입구분명</label>
            <input :value="details.usim_act_nm" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>요청날짜</label>
            <input :value="details.reg_time" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>상태</label>
            <input :value="details.status_nm" readonly />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, ref } from 'vue'

const emits = defineEmits(['closePopup'])
const props = defineProps({ id: { type: Number, default: null } })

const details = ref({})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('admin/selfInquDtl', {
      method: 'POST',
      body: { id: props.id }
    })

    if (!response.ok) throw 'Self request detail error'

    const decodedResponse = await response.json()
    details.value = decodedResponse?.data?.apply_detail_info ?? {}
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
  fetchData()
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
  width: 600px;
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

.main-info-row {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
}

.forms {
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  align-items: center;
}

.forms .title {
  font-weight: 600;
  width: 100%;
  margin-top: 10px;
  line-height: 1;
}

@media (max-width: 600px) {
  .popup-content {
    min-width: unset;
    width: 100%;
  }
}
</style>
