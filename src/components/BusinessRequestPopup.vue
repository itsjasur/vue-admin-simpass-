<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">판매점 계약 동의 및 계약내용 확인</h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button"> cancel </span>
      </div>

      <div class="scrollable-content">
        <span class="title-note"
          >본 신청서는 심패스에서 직접 운영하는 판매점 전자계약서이며 고객님에 소중한 개인정보는 암호화되어 안전하게
          보호됩니다.
        </span>

        <div>
          <a-checkbox class="checkbox" v-model:checked="agreeToContracTerms">판매점 계약서 내용 동의 (필수)</a-checkbox>
          <span @click="agreementPopupIsOpen = true" class="agree-view">계약서 확인</span>
        </div>

        <div class="part-title">판매점 정보</div>

        <div class="group">
          <label>상호명*</label>
          <input :value="serverData.partner_nm" readonly />
          <p v-if="submitted && !serverData.partner_nm" class="input-error-message">상호명를 입력하세요.</p>
        </div>

        <div class="group-row">
          <div class="group">
            <label>사업자번호*</label>
            <input
              :value="serverData.business_num"
              placeholder="000-00-00000"
              name="businessNumber"
              v-cleave="{ ...cleavePatterns.businessNumberPattern }"
              readonly
            />
            <p v-if="submitted && !serverData.business_num" class="input-error-message">사업자번호를 입력하세요.</p>
          </div>

          <div class="group">
            <label>대표자명*</label>
            <input :value="serverData.contractor" readonly />
            <p v-if="submitted && !serverData.contractor" class="input-error-message">대표자명를 입력하세요.</p>
          </div>
        </div>

        <div class="group-row">
          <div class="group">
            <label>연락 번호*</label>
            <input
              :value="serverData.phone_number"
              placeholder="010-1234-5678"
              name="mobileNumber"
              v-cleave="{ ...cleavePatterns.phoneNumberPattern }"
              readonly
            />
            <p v-if="submitted && !serverData.phone_number" class="input-error-message">연락 번호를 입력하세요.</p>
          </div>

          <div class="group">
            <label>이메일주소*</label>

            <div class="group-inner-row">
              <input :value="serverData.email" readonly />
              <!-- <a-select
                v-model:value="forms.emailAddition"
                :style="{ minWidth: '140px' }"
                @change="validateEmail"
                :options="EMAILOPTIONS"
              >
              </a-select> -->
            </div>
            <p v-if="submitted && !serverData.email" class="input-error-message">이메일주소를 입력해주세요.</p>
            <!-- <p v-if="forms.email && emailError" class="input-error-message">올바른 이메일 주소를 입력해주세요.</p> -->
          </div>
        </div>
        <div class="group-row">
          <div class="group">
            <label>매장 전화</label>
            <input
              v-model="forms.telNumber"
              placeholder="02-1234-5678"
              name="telNumber"
              v-cleave="{ ...cleavePatterns.phoneNumberPattern, onValueChanged }"
            />
          </div>

          <div class="group">
            <label>매장 팩스</label>
            <input
              v-model="forms.faxNumber"
              placeholder="02-1234-5678"
              name="faxNumber"
              v-cleave="{ ...cleavePatterns.phoneNumberPattern, onValueChanged }"
            />
          </div>
        </div>

        <div class="group-row">
          <div class="group">
            <label>주소*</label>
            <input v-model="forms.address" @click="searchAddressPopup.open()" readonly />
            <p v-if="submitted && !forms.address" class="input-error-message">주소를 입력하세요.</p>
          </div>

          <div class="group" style="width: 70%">
            <label>상세주소*</label>
            <input v-model="forms.addressAdditions" />
            <p v-if="submitted && !forms.addressAdditions" class="input-error-message">상세주소를 입력하세요.</p>
          </div>
        </div>

        <!-- payment data -->
        <div class="part-title">수수료 입금계좌 정보</div>

        <div class="group-row">
          <div class="group">
            <label>예급주 명*</label>
            <input :value="serverData.contractor" readonly />
            <p v-if="submitted && !serverData.contractor" class="input-error-message">예급주 명를 입력하세요.</p>
          </div>

          <div class="group" style="width: 60%">
            <label>생년월일*</label>
            <input
              :value="serverData.birthday"
              placeholder="1991-01-31"
              name="accountBirthday"
              v-cleave="{ ...cleavePatterns.birthdayPatternFull }"
              readonly
            />
            <p v-if="submitted && !serverData.birthday" class="input-error-message">생년월일를 입력하세요.</p>
          </div>
        </div>

        <div class="group-row">
          <div class="group">
            <label>은행명 (첨부할 자료와 동일)*</label>
            <input v-model="forms.bankName" />
            <p v-if="submitted && !forms.bankName" class="input-error-message">은행명를 입력하세요.</p>
          </div>

          <div class="group">
            <label>계좌번호 (첨부할 자료와 동일)*</label>
            <input v-model="forms.accountNumber" />
            <p v-if="submitted && !forms.accountNumber" class="input-error-message">계좌번호를 입력하세요.</p>
          </div>
        </div>

        <!-- files data -->
        <div class="part-title">판매점 서류 등록</div>

        <div v-for="(item, index) in imageUploads" :key="index" class="image-uploads">
          <div class="upload-row">
            <input
              :id="`file-input-${index}`"
              @change="handleFileUpload($event, index)"
              type="file"
              style="display: none"
              accept="image/*"
            />
            <span class="upload-title"> {{ item.title }} </span>

            <div class="right-side">
              <div v-if="item.initial" class="submitted">
                <span>문서가 제출되었습니다</span>
                <span class="material-symbols-outlined"> new_releases </span>
              </div>

              <div v-if="!item.initial && !item.new" class="not-submitted">
                <span class="material-symbols-outlined"> add </span>
                <label :for="`file-input-${index}`">이미지 업로드</label>
              </div>

              <div v-if="!item.initial && item.new" class="file-name">
                <span>{{ item.new.name }}</span>
              </div>

              <div v-if="!item.initial && item.new" class="not-submitted">
                <span class="material-symbols-outlined"> add </span>
                <label :for="`file-input-${index}`">재업로드</label>
              </div>
            </div>
          </div>
          <p v-if="submitted && !item.initial && !item.new && item.required" class="input-error-message">
            이미지를 업로드해주세요.
          </p>
        </div>

        <button @click="submit" :disabled="isSubmitting">
          <LoadingSpinner v-if="isSubmitting" height="20px" color="#ffffff" />
          <span v-else> 온라인 판매점 계약신청 </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watchEffect } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { EMAILOPTIONS } from '../assets/constants'
import { useSearchaddressStore } from '@/stores/select-address-popup'
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { useRouter } from 'vue-router'
import { useWarningStore } from '@/stores/warning'
import LoadingSpinner from '../components/Loader.vue'

const router = useRouter()
const warning = useWarningStore()

const emit = defineEmits(['closePopup'])

const props = defineProps({ agentCd: { type: String, required: true } })

//cleave value change callback
function onValueChanged(event) {
  if (event.target.name === 'telNumber') forms.telNumber = event.target.rawValue
  if (event.target.name === 'faxNumber') forms.faxNumber = event.target.rawValue
}

const agreeToContracTerms = ref(false)

const forms = reactive({
  telNumber: '',
  faxNumber: '',
  address: '',
  addressAdditions: '',

  bankName: '',
  accountNumber: '',
})

const serverData = ref({})

//docs and images
const imageUploads = reactive({
  businessLicence: { initial: null, new: null, required: true, title: '사업자 등록증 (필수)' },
  directorId: { initial: null, new: null, required: true, title: '대표자 신분증 (필수)' },
  bankBook: { initial: null, new: null, required: true, title: '통잔 사본 (필수)' },
  shopBanner: { initial: null, new: null, required: false, title: '매장간판사진 (선택)' },
  shopInterior: { initial: null, new: null, required: false, title: '매장내부사진 (선택)' },
})

//setting address and addressdetail to store value
const searchAddressPopup = useSearchaddressStore()
watchEffect(() => {
  forms.address = searchAddressPopup.address
  forms.addressAdditions = searchAddressPopup.buildingName
})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/partnerInfo', { method: 'GET' })

    if (!response.ok) throw 'Fetch data error'

    const decodedResponse = await response.json()
    const info = decodedResponse.data.info
    serverData.value = info

    forms.telNumber = info.store_contact
    forms.faxNumber = info.store_fax
    forms.address = info.address
    forms.addressAdditions = info.dtl_address
    forms.accountNumber = info.bank_num
    forms.bankName = info.bank_nm

    imageUploads.businessLicence.initial = info.bs_reg_no
    imageUploads.directorId.initial = info.id_card
    imageUploads.bankBook.initial = info.bank_book
    imageUploads.shopBanner.initial = info.shop_info_1
    imageUploads.shopInterior.initial = info.shop_info_2
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

//  a ref for storing File objects
const handleFileUpload = async (event, itemName) => {
  if (itemName === 'businessLicence') imageUploads.businessLicence.new = event.target.files[0]
  if (itemName === 'directorId') imageUploads.directorId.new = event.target.files[0]
  if (itemName === 'bankBook') imageUploads.bankBook.new = event.target.files[0]
  if (itemName === 'shopBanner') imageUploads.shopBanner.new = event.target.files[0]
  if (itemName === 'shopInterior') imageUploads.shopInterior.new = event.target.files[0]
}

const submitted = ref(false)
const isSubmitting = ref(false)
const formData = new FormData()

async function submit() {
  submitted.value = true

  if (!agreeToContracTerms.value) {
    useSnackbarStore().showSnackbar('판매점 계약서 내용에 동의해주세요.')
    return
  }

  const formstruthy = Object.values(forms).every((item) => item)
  const imagestruthy = Object.values(imageUploads).every((item) => !item.required || item.initial || item.new)

  let result = [formstruthy, imagestruthy].every(Boolean)

  if (!result) {
    useSnackbarStore().showSnackbar('채워지지 않은 필드가 있습니다.')
    return
  }

  if (result) {
    if (imageUploads.businessLicence.new && imageUploads.businessLicence.new instanceof File)
      formData.set('bs_reg_no_attach', imageUploads.businessLicence.new, imageUploads.businessLicence.new.name)

    if (imageUploads.directorId.new && imageUploads.directorId.new instanceof File)
      formData.set('id_card_attach', imageUploads.directorId.new, imageUploads.directorId.new.name)

    if (imageUploads.bankBook.new && imageUploads.bankBook.new instanceof File)
      formData.set('bank_book_attach', imageUploads.bankBook.new, imageUploads.bankBook.new.name)

    if (imageUploads.shopBanner.new && imageUploads.shopBanner.new instanceof File)
      formData.set('shop_info_1_attach', imageUploads.shopBanner.new, imageUploads.shopBanner.new.name)

    if (imageUploads.shopInterior.new && imageUploads.shopInterior.new instanceof File)
      formData.set('shop_info_2_attach', imageUploads.shopInterior.new, imageUploads.shopInterior.new.name)

    formData.set('agent_cd', props.agentCd)

    formData.set('contractor', serverData.value.contractor)
    formData.set('birthday', serverData.value.birthday)
    formData.set('partner_nm', serverData.value.partner_nm)

    formData.set('business_num', serverData.value.business_num)
    formData.set('phone_number', serverData.value.phone_number)
    formData.set('email', serverData.value.email)

    formData.set('store_contact', forms.telNumber)
    formData.set('store_fax', forms.faxNumber)

    formData.set('address', forms.address)
    formData.set('dtl_address', forms.addressAdditions)

    formData.set('bank_nm', forms.bankName)
    formData.set('bank_num', forms.accountNumber)

    formData.set('id_cert_type', serverData.value.id_cert_type)
    formData.set('receipt_id', serverData.value.receipt_id)

    try {
      isSubmitting.value = true

      const response = await fetchWithTokenRefresh('agent/contract', { method: 'POST', body: formData })

      if (!response.ok) {
        const decodedResponse = await response.json()
        throw decodedResponse?.message ?? 'Request'
      }

      const decodedResponse = await response.json()

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      await delay(2000)

      emit('closePopup')
      warning.open('성공', [decodedResponse?.message ?? 'Success'])
      router.push('/')
    } catch (error) {
      useSnackbarStore().showSnackbar(error.toString())
    } finally {
      isSubmitting.value = false
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') emit('closePopup')
}

onMounted(() => {
  fetchData()
  document.addEventListener('keydown', keydownHandle)
})
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
  background-color: #000000b2;
  padding: 20px;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  height: 100%;
  max-width: 900px;
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
  padding: 25px;
  box-sizing: border-box;

  display: flex;
  flex-flow: column;
  gap: 30px;
  overflow-y: auto;
}

.title-note {
  font-size: 15px;
  color: #6e7881;
  line-height: 1.5;
  font-weight: 500;
  margin-top: 10px;
}

.checkbox {
  font-weight: 600;
}

.agree-view {
  color: #0365e6;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  font-size: 15px;
  border: 1.5px solid var(--main-color);
}
.group-row {
  display: flex;
  flex-flow: row;
  gap: 20px;
  width: 100%;
}

.group {
  width: 100%;
}

.group-inner-row {
  display: flex;
  flex-flow: row;
  gap: 10px;
}

.part-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: -10px;
}

button {
  margin-top: 30px;
  margin-bottom: 50px;
  min-width: 200px;
  width: auto;
  align-self: flex-end;
}

.upload-row {
  display: flex;
  flex-flow: row;
  justify-content: space-between;

  min-height: 50px;
  padding: 0 10px;
  align-items: center;
  border-radius: 4px;
  border: 1.5px dashed var(--main-color);
  box-sizing: border-box;
}

.right-side {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  line-height: 1;
  align-items: center;
  gap: 7px;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
}

.submitted .material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 400;
  color: #00be00;
  font-size: 22px;
  line-height: 1;
}
.submitted {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
}

.not-submitted {
  display: flex;
  align-items: center;
  padding: 0 5px;
  border-radius: 3px;
  min-height: 30px;
  border: 1px dashed var(--main-color);
  font-size: 15px;
  color: var(--main-color);
  cursor: pointer;
}

.upload-add-box {
  margin: 0;
  display: flex;
  align-items: center;
  color: var(--main-color);
}

.upload-row label {
  all: unset;
}

.file-name {
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 15px;
}

@media (max-width: 600px) {
  .group-row {
    flex-flow: column;
  }

  .group {
    width: 100% !important;
  }
}
</style>
