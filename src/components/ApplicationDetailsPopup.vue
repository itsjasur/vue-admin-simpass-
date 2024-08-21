<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">접수 정보</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div v-if="Object.keys(applicationDetails).length > 0" class="scrollable-content">
        <div class="main-info-row">
          <span>
            <span>접수번호: </span>
            <span style="font-weight: 600">{{ props?.actNo }} </span>
          </span>

          <span>
            <span>판매점명: </span>
            <span style="font-weight: 600"> {{ applicationDetails?.partner_nm }}</span>
          </span>
        </div>

        <div class="forms">
          <div class="title">요금제</div>

          <div class="group" style="width: 150px">
            <label>서비스유형</label>
            <input :value="applicationDetails.carrier_type_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>통신망</label>
            <input :value="applicationDetails.carrier_nm" readonly />
          </div>

          <div class="group" style="width: 200px">
            <label>통신사</label>
            <input :value="applicationDetails.mvno_nm" readonly />
          </div>

          <div class="group" style="width: 400px">
            <label>요금제명</label>
            <input :value="applicationDetails.usim_plan_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>유심비용청구</label>
            <input :value="applicationDetails.usim_fee_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>USIM 모델명</label>
            <input :value="applicationDetails.usim_model_no" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>일련번호</label>
            <input :value="applicationDetails.usim_no" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>개통구분</label>
            <input :value="applicationDetails.usim_act_nm" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>가입/이동 전화번호</label>

            <CleaveInput
              :value="applicationDetails.phone_number"
              :options="cleavePatterns.phoneNumberPattern"
              readonly
            />
          </div>

          <div class="group" style="width: 200px">
            <label>희망번호</label>
            <input
              :value="
                applicationDetails?.request_no_1 ?? '' + applicationDetails?.request_no_2
                  ? (' / ', applicationDetails?.request_no_2)
                  : '' + applicationDetails?.request_no_3
                    ? (' / ', applicationDetails?.request_no_3)
                    : ''
              "
              readonly
            />
          </div>

          <div class="title">가입신청/고객정보</div>

          <div class="group" style="width: 150px">
            <label>고객정보</label>
            <input :value="applicationDetails.cust_type_nm" readonly />
          </div>

          <div class="group" style="width: 400px">
            <label>이름</label>
            <input :value="applicationDetails.name" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>연락처</label>

            <CleaveInput
              :value="applicationDetails.contact"
              :options="{ phone: true, phoneRegionCode: 'KR', delimiter: '-' }"
              readonly
            />
          </div>

          <div class="group" style="width: 150px">
            <label>생년월일</label>

            <CleaveInput
              :value="applicationDetails.birthday"
              :options="cleavePatterns.birthdayPattern"
              readonly
            />
          </div>

          <div class="group" style="width: 150px">
            <label>신분증/여권번호</label>
            <input :value="applicationDetails.id_no" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>국적</label>
            <input :value="applicationDetails.country_cd" readonly />
          </div>

          <div class="group" style="width: 400px">
            <label>주소(주소 + 상세주소)</label>
            <input :value="applicationDetails.address" readonly />
          </div>

          <div class="title">자동이체</div>

          <div class="group" style="width: 150px">
            <label>결제구분</label>
            <input :value="applicationDetails.paid_transfer_nm" readonly />
          </div>

          <div class="group" style="width: 400px">
            <label>예금주명</label>
            <input :value="applicationDetails.account_name" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>예금주 생년월일</label>

            <CleaveInput
              :value="applicationDetails.account_birthday"
              :options="cleavePatterns.birthdayPattern"
              readonly
            />
          </div>

          <div class="group" style="width: 200px">
            <label>은행 (카드사)명</label>
            <input :value="applicationDetails.account_agency" readonly />
          </div>

          <div class="group" style="width: 150px">
            <label>계좌/카드 번호</label>
            <input :value="applicationDetails.account_number" readonly />
          </div>
        </div>

        <button @click="openDocsPopup" class="attached-docs-button">증빙서료</button>

        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>

  <GlobalPopupWithOverlay ref="imageViewerRef">
    <ImageViewPopup @closePopup="closeImageViewPopup" :canPrint="true" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { usePageLoadingStore } from '@/stores/page-loading-store'
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, ref } from 'vue'
import GlobalPopupWithOverlay from './GlobalPopupWithOverlay.vue'
import ImageViewPopup from './ImageViewPopup.vue'
import { useImagesHolderStore } from '@/stores/image-holder-store'
import * as cleavePatterns from '../utils/cleavePatterns'

const emits = defineEmits(['closePopup'])
const props = defineProps({ actNo: { type: String, default: null } })

const imageViewerRef = ref()
function openImageViewPopup() {
  imageViewerRef.value.showPopup()
}
function closeImageViewPopup() {
  useImagesHolderStore().clear()
  imageViewerRef.value.closePopup()
}

const applicationDetails = ref({})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/actDetail', {
      method: 'POST',
      body: { act_no: props.actNo }
    })

    if (!response.ok) throw 'Change status error'
    const decodedResponse = await response.json()

    applicationDetails.value = decodedResponse?.data?.act_detail_info ?? {}
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

async function openDocsPopup() {
  usePageLoadingStore().start()

  try {
    const response = await fetchWithTokenRefresh('agent/actAttachs', {
      method: 'POST',
      body: { act_no: props.actNo }
    })
    if (!response.ok) throw 'Fetch forms data error'
    const decodedResponse = await response.json()

    console.log(decodedResponse?.data?.apply_attach_list)

    useImagesHolderStore().save(decodedResponse?.data?.apply_attach_list ?? [])
    openImageViewPopup()
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    usePageLoadingStore().stop()
  }
}

onMounted(fetchData)
</script>

<style scoped>
.overlay {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}
@media (max-width: 600px) {
  .overlay {
    padding: 0px;
  }
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

.attached-docs-button {
  margin-top: 10px;
  max-width: 150px;
  border: 1px dashed var(--main-color);
  color: var(--main-color);
  background-color: transparent;
}

@media (max-width: 600px) {
  .popup-content {
    min-width: unset;
    width: 100%;
  }
}
</style>
