<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">상세 정보</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div v-if="Object.keys(partnerDetails).length > 0" class="scrollable-content">
        <div class="forms">
          <div class="group" style="width: 150px">
            <label>판매점코드</label>
            <input :value="partnerDetails.partner_cd" readonly />
          </div>

          <div class="group" style="width: 300px">
            <label>대표자명</label>
            <input :value="partnerDetails.contractor" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>대표자 생년월일</label>
            <input
              :value="partnerDetails.birthday"
              v-cleave="{ date: true, delimiter: '-', datePattern: ['Y', 'm', 'd'] }"
              readonly
            />
          </div>

          <div class="group" style="width: 300px">
            <label>판매점명</label>
            <input :value="partnerDetails.partner_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>연락처</label>
            <input
              :value="partnerDetails.phone_number"
              readonly
              v-cleave="{ phone: true, phoneRegionCode: 'KR', delimiter: '-' }"
            />
          </div>

          <div class="group" style="width: 150px">
            <label>사업자번호</label>
            <input :value="partnerDetails.business_num" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>주민등록번호</label>
            <input :value="partnerDetails.id_no" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>매장번호</label>
            <input
              :value="partnerDetails.store_contact"
              readonly
              v-cleave="{ phone: true, phoneRegionCode: 'KR', delimiter: '-' }"
            />
          </div>

          <div class="group" style="width: 150px">
            <label>팩스번호</label>
            <input
              :value="partnerDetails.store_fax"
              readonly
              v-cleave="{ phone: true, phoneRegionCode: 'KR', delimiter: '-' }"
            />
          </div>

          <div class="group" style="width: 400px">
            <label>매장주소</label>
            <input :value="partnerDetails.address" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>매장상세주소</label>
            <input :value="partnerDetails.dtl_address" readonly />
          </div>

          <div class="group" style="width: 250px">
            <label>이메일</label>
            <input :value="partnerDetails.email" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>접수일자</label>
            <input :value="partnerDetails.apply_date" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>계약일자</label>
            <input :value="partnerDetails.contract_date" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>은행명</label>
            <input :value="partnerDetails.bank_nm" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>계좌번호</label>
            <input :value="partnerDetails.bank_num" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>상태코드명</label>
            <input :value="partnerDetails.status_nm" readonly />
          </div>

          <div></div>
          <div></div>
        </div>

        <div class="buttons-row">
          <button @click="fetchImageByName(partnerDetails.bs_reg_no)">사업자등록증</button>
          <button @click="fetchImageByName(partnerDetails.id_card)">신분증</button>
          <button @click="fetchImageByName(partnerDetails.bank_book)">통장사본</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePageLoadingStore } from '@/stores/page-loading-store'
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useImagesHolderStore } from '@/stores/image-holder-store'
import { useInternalMessage } from 'ant-design-vue/es/message/useMessage'

const emits = defineEmits(['closePopup'])
const props = defineProps({ partnerCd: { type: String, default: null } })

const partnerDetails = ref({})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/partnerDetail', {
      method: 'POST',
      body: {
        partner_cd: props.partnerCd
      }
    })

    if (!response.ok) throw 'Partner detail error'
    const decodedResponse = await response.json()
    partnerDetails.value = decodedResponse?.data?.partner_info ?? {}
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

async function fetchImageByName(fileName) {
  usePageLoadingStore().start()
  try {
    const response = await fetchWithTokenRefresh('agent/partnerAttach', {
      method: 'POST',
      body: { partner_cd: props.partnerCd, file_name: fileName }
    })

    if (!response.ok) throw 'Partner detail error'
    const decodedResponse = await response.json()
    useImagesHolderStore().close()
    useImagesHolderStore().open([decodedResponse.data.image])
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    usePageLoadingStore().stop()
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
  /* width: 100vw; */
  /* height: 100vh; */
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

.buttons-row {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  margin-top: 20px;
}

.buttons-row * {
  width: auto;
  padding: 10px;
  background-color: transparent;
  border: 1px dashed #31b93d;
  color: #31b93d;
  min-width: 120px;
}
.buttons-row button:nth-child(1) {
  border: 1px dashed #e56f15;
  color: #e56f15;
}

.buttons-row button:nth-child(2) {
  border: 1px dashed #5e31b9;
  color: #5e31b9;
}

@media (max-width: 600px) {
  .popup-content {
    min-width: unset;
    width: 100%;
  }
}
</style>
