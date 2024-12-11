<template>
  <div v-if="serverData" class="container">
    <div v-if="serverData.chk_agent_role_info !== 'Y'" class="info-note">
      <div class="notes">
        <span> * {{ serverData?.agent_role_message_1 ?? '' }}</span>
        <span> * {{ serverData?.agent_role_message_2 ?? '' }} </span>
      </div>

      <button
        v-if="serverData.chk_agent_role_info === 'W' || serverData.chk_agent_role_info === 'P'"
        @click="router.push('/business-partners')"
      >
        거래요청 상태으로 가기
      </button>
      <button v-else @click="router.push('/business-request')">거래요청으로 가기</button>
    </div>

    <!-- FORMS -->
    <template v-for="(part, index) of displayingForms" :key="index">
      <template v-if="part.forms.length > 0">
        <div class="partition">
          <div v-if="part.type === 'payment'" class="title">
            <span> 자동이체 </span>
            <a-checkbox class="checkbox left-margin" v-model:checked="selfRegisterChecked">가입자와 동일</a-checkbox>
          </div>

          <div v-else :class="part.type === 'empty' ? 'empty_title' : 'title'">
            {{ part.title }}
          </div>

          <template v-for="(formName, formIndex) of part.forms" :key="formIndex">
            <div class="group" :style="{ maxWidth: FIXED_FORMS[formName].maxwidth }">
              <label>{{ FIXED_FORMS[formName].label }}</label>

              <!-- input -->
              <template v-if="FIXED_FORMS[formName].type === 'input'">
                <div class="group-input-moon" v-if="formName === 'usim_plan_nm'">
                  <input v-model="FIXED_FORMS[formName].value" v-bind="inputBindings(formName)" />
                  <button @click="changeUsimPlan">변경</button>
                </div>

                <input v-else v-model="FIXED_FORMS[formName].value" v-bind="inputBindings(formName)" />
              </template>

              <!-- select -->
              <template v-if="FIXED_FORMS[formName].type === 'select'">
                <a-select
                  v-model:value="FIXED_FORMS[formName].value"
                  :style="{ width: '100%' }"
                  @change="generateInitialForms"
                  :options="FIXED_FORMS[formName].options"
                  v-bind="inputBindings(formName)"
                >
                </a-select>
              </template>

              <!-- cleave -->
              <template v-if="FIXED_FORMS[formName].type === 'cleave'">
                <CleaveInput
                  :options="FIXED_FORMS[formName].pattern"
                  :value="FIXED_FORMS[formName].value"
                  v-bind="inputBindings(formName)"
                  @update:modelValue="handleCleaveInput($event, formName)"
                />
              </template>

              <p
                v-if="formSubmitted && FIXED_FORMS[formName].required && FIXED_FORMS[formName].error() !== null"
                class="input-error-message"
              >
                {{ FIXED_FORMS[formName].error() }}
              </p>
            </div>
          </template>
        </div>
      </template>
    </template>

    <!-- IMAGE UPLOAD -->
    <div class="supperted-images">
      <a-checkbox class="checkbox" v-model:checked="supportedImagesChecked">증빙자료첨부(선택사항)</a-checkbox>
      <input id="file-input" @change="handleFileUpload" type="file" style="display: none" accept="image/*" multiple />

      <div v-if="supportedImagesChecked" class="uploadedImagesRow">
        <label for="file-input" class="uploadImageBox">
          <span class="inner-icon material-symbols-outlined"> add </span>
          <p>이미지 업로드</p>
        </label>

        <div v-for="(image, index) in supportedImages" :key="index" class="uploadImageBox">
          <img :src="image" :alt="index" />
          <span @click="deleteDocImages(index)" class="delete-icon material-symbols-outlined"> delete </span>
        </div>
      </div>
    </div>

    <!-- checks and enables sign container -->
    <a-checkbox v-if="useDeviceTypeStore().isDeviceMobile()" class="checkbox" v-model:checked="signAfterPrintChecked"
      >신청서 프린트 인쇄후 서명/사인 자필</a-checkbox
    >

    <div class="sing-name-pads" v-if="!signAfterPrintChecked">
      <!-- form sign pad -->
      <SignImageRowContainer
        :overlayText="FIXED_FORMS.name?.value"
        signComment="가입자 이름을 적어주세요"
        sealComment="가입자 사인을 해주세요"
        @updateSignSeal="
          (signData, sealData) => {
            nameImageData = signData
            signImageData = sealData
          }
        "
        title="가입자서명"
        :errorMessage="(!nameImageData || !signImageData) && formSubmitted ? '가입자서명을 하지 않았습니다.' : null"
      />
      <!-- payment pad-->
      <SignImageRowContainer
        v-if="serverData?.usim_plan_info?.carrier_type === 'PO' && !selfRegisterChecked"
        signComment="자동이체 이름을 적어주세요"
        sealComment="자동이체 사인을 해주세요"
        :overlayText="FIXED_FORMS.account_name?.value"
        @updateSignSeal="
          (signData, sealData) => {
            paymentNameImageData = signData
            paymentSignImageData = sealData
          }
        "
        title="자동이체 서명"
        :errorMessage="
          (!paymentNameImageData || !paymentSignImageData) && formSubmitted
            ? '후불이체동의 서명을 하지 않았습니다.'
            : null
        "
      />
      <!-- deputy sign pad -->
      <SignImageRowContainer
        v-if="FIXED_FORMS?.cust_type_cd?.value === 'COL'"
        signComment="법정대리인 이름을 적어주세요"
        sealComment="법정대리인 사인을 해주세요"
        :overlayText="FIXED_FORMS.deputy_name?.value"
        @updateSignSeal="
          (signData, sealData) => {
            deputyNameImageData = signData
            deputySignImageData = sealData
          }
        "
        title="법정대리인 서명"
        :errorMessage="
          (!deputyNameImageData || !deputySignImageData) && formSubmitted ? '법정대리인서명을 하지 않았습니다.' : null
        "
      />
      <!-- partner sign pad -->
      <SignImageRowContainer
        v-if="serverData?.chk_partner_sign === 'N' && serverData?.usim_plan_info?.mvno_cd === 'UPM'"
        signComment="판매자 이름을 적어주세요"
        sealComment="판매자 사인을 해주세요"
        @updateSignSeal="
          (signData, sealData) => {
            partnerNameImageData = signData
            partnerSignImageData = sealData
          }
        "
        title="판매자 서명"
        :errorMessage="
          (!partnerNameImageData || !partnerSignImageData) && formSubmitted ? '판매자서명을 하지 않았습니다.' : null
        "
      />

      <AgreePadContainer
        v-if="serverData?.usim_plan_info?.mvno_cd === 'UPM'"
        title="동의합니다"
        @updateAgreePadData="
          (padData) => {
            agreePadData = padData
          }
        "
        :errorMessage="!agreePadData && formSubmitted ? '가입약관에 동의하지 않았습니다.' : null"
      />
    </div>

    <button class="submit" @click="submit" :disabled="formSubmitting">
      <LoadingSpinner v-if="formSubmitting" height="20px" color="#ffffff" />
      <span v-else> 개통 신청/서식출력</span>
    </button>
  </div>

  <div v-else class="plan-not-found">요금제를 찾을 수 없습니다</div>

  <GlobalPopupWithOverlay ref="imageViewerRef">
    <ImageViewPopup
      @closePopup="closeImageViewPopup"
      :imageUrls="imageBlobUrls"
      :baseFilename="FIXED_FORMS.name?.value"
      :canPrint="canPrintImages"
    />
  </GlobalPopupWithOverlay>

  <GlobalPopupWithOverlay ref="addressPopupRef">
    <GlobalSearchAddress @selected="handleAddressSelected" @closePopup="closeAddressPopup" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FORMS, PLANSINFO, displayingForms, generateDisplayingForms } from '../assets/plans_forms'
import _ from 'lodash'
import SignImageRowContainer from '../components/SignImageRowContainer.vue'
import LoadingSpinner from '../components/Loader.vue'
import { useSelectPlansPopup } from '../stores/select-plans-popup'
import { useDeviceTypeStore } from '@/stores/device-type-store'
import AgreePadContainer from '../components/AgreePadContainer.vue'
import ImageViewPopup from '../components/ImageViewPopup.vue'
import { base64ToBlobUrl } from '@/utils/helpers'
import * as cleavePatterns from '../utils/cleavePatterns'
import { validateBirthday } from '@/utils/validators'

const availableForms = ref([])

watch(availableForms, (newList, oldList) => {
  if (newList !== oldList) generateDisplayingForms(availableForms)
})

const imageViewerRef = ref()
const imageBlobUrls = ref([])
const canPrintImages = ref(false)

function openImageViewPopup(base64Images) {
  if (base64Images.length > 0) {
    imageBlobUrls.value = base64Images?.map((i) => base64ToBlobUrl(i)) || []
    imageViewerRef.value.showPopup()
  } else {
    useSnackbarStore().show('이미지가 없습니다!')
  }
}
function closeImageViewPopup() {
  imageViewerRef.value.closePopup()
  router.push('/')
}

const route = useRoute()
const router = useRouter()

//need to make deep copy in order to reset when page reloads
const FIXED_FORMS = reactive(_.cloneDeep(FORMS))

// address select popup and setting value
const addressPopupRef = ref(null)
const closeAddressPopup = () => {
  addressPopupRef.value.closePopup()
}
function openAddressPopup() {
  addressPopupRef.value.showPopup()
}
const handleAddressSelected = (data) => {
  FIXED_FORMS.address.value = data.address
  FIXED_FORMS.addressdetail.value = data.buildingName
}

//this inits page
onMounted(fetchData)

//this watches route id (if plan id changed)
watch(() => route?.params?.id, fetchData)

// 1 first fetched data onMounted()
const serverData = ref(null)

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyInit', {
      method: 'POST',
      body: { usim_plan_id: route?.params?.id }
    })
    if (!response.ok) throw 'Fetch data error'

    const decodedResponse = await response.json()
    serverData.value = decodedResponse.data
    // console.log(serverData.value)
    //setting usim plan name everytime it refetches
    FIXED_FORMS.usim_plan_nm.value = serverData.value.usim_plan_info.usim_plan_nm

    // usim list select required
    FIXED_FORMS.usim_model_list.required = serverData.value?.chk_usim_model === 'Y'

    console.log(decodedResponse.data)

    generateInitialForms()
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

//generates forms here
function generateInitialForms() {
  //usim plan info is form server data
  const usimPlanInfo = serverData.value?.usim_plan_info

  let selectedTypeInfo = PLANSINFO.find((item) => item.code === usimPlanInfo.carrier_type) //selected type
  let selectedCarrierInfo = selectedTypeInfo.carriers.find((carrier) => carrier.code === usimPlanInfo.carrier_cd) //selected carrier
  let selectedMvnoInfo = selectedCarrierInfo.mvnos.find((mvno) => mvno.code === usimPlanInfo.mvno_cd) //selected mvno

  availableForms.value = [...(selectedMvnoInfo?.forms ?? []), ...(selectedTypeInfo?.paymentForms ?? [])]

  //adding options to select forms
  for (const formName in FIXED_FORMS) {
    if (FIXED_FORMS[formName]?.type === 'select')
      FIXED_FORMS[formName].options = serverData.value[formName]?.map((i) => ({
        value: i.cd,
        label: i.value
      })) ?? [{ value: 'N/A', label: 'N/A' }]
  }
  //set default once forms created and after additional forms added
  setDefault()

  //EXTRA FIELDS FOR FORMS
  //adding usim extra forms when type is 신규가입 and when it is not (UPM Umobile) COM
  if (FIXED_FORMS?.usim_act_cd?.value === 'N') {
    availableForms.value.push('wish_number')
    //wish numbers input with cleave
    let wishArray = Array(selectedMvnoInfo?.wishCount).fill(4) //[4,4,4]
    FIXED_FORMS.wish_number.pattern = { numericOnly: true, delimiter: ' / ', blocks: wishArray } //4,4,4
    FIXED_FORMS.wish_number.placeholder = wishArray.map((e) => '1234').join(' / ')
  }

  //adding transferable number when type is 신규가입 mvno is UPM (codemobile)
  if (FIXED_FORMS?.usim_act_cd?.value === 'N' && serverData.value?.usim_plan_info?.mvno_cd === 'COM') {
    availableForms.value.push('phone_number')
    FIXED_FORMS.phone_number.required = false
    FIXED_FORMS.phone_number.pattern.prefix = null
    FIXED_FORMS.phone_number.value = ''
  }

  if (FIXED_FORMS?.usim_act_cd?.value === 'M') {
    availableForms.value.push('mnp_carrier_type', 'phone_number', 'mnp_pre_carrier')
  }

  if (FIXED_FORMS?.mnp_pre_carrier?.value === 'MV') availableForms.value.push('mnp_pre_carrier_nm')

  if (FIXED_FORMS?.paid_transfer_cd?.value === 'C') availableForms.value.push('card_yy_mm')

  //adding deputy forms
  if (FIXED_FORMS?.cust_type_cd?.value === 'COL') {
    availableForms.value.push('deputy_name', 'deputy_birthday', 'relationship_cd', 'deputy_contact')
  }

  //after extra forms added, set default should be called again!
  setDefault()

  //settnig country code
  FIXED_FORMS.country.value = ''
  if (FIXED_FORMS?.cust_type_cd?.value !== 'MEA') FIXED_FORMS.country.value = '대한민국'

  //removing gender if not underage for HVS
  if (serverData.value['usim_plan_info']['mvno_cd'] === 'HVS') {
    if (FIXED_FORMS?.cust_type_cd?.value != 'COL') {
      const index = availableForms.value.indexOf('gender_cd')
      if (index !== -1) availableForms.value.splice(index, 1)
    }
  }

  if (serverData.value['usim_plan_info']['mvno_cd'] === 'SVM') {
    if (serverData.value['usim_plan_info']['combine']) availableForms.value.push('extra_service_cd')

    const birthdays = ['birthday', 'account_birthday', 'deputy_birthday']
    for (var i of birthdays) {
      FIXED_FORMS[i].pattern = cleavePatterns.birthdayPatternFull
      FIXED_FORMS[i].placeholder = '1991-01-31'
      FIXED_FORMS[i].error = function () {
        return validateBirthday(this.value)
      }
    }
  }
}

//sets default values
function setDefault() {
  for (const formName in FIXED_FORMS) {
    //setting empty default error messages

    if (
      FIXED_FORMS[formName].type === 'select' &&
      FIXED_FORMS[formName].hasDefault &&
      FIXED_FORMS[formName].value === null
    )
      FIXED_FORMS[formName].value = serverData.value[formName]?.[0]?.cd ?? null
  }
}

function changeUsimPlan() {
  useSelectPlansPopup().open(
    serverData.value?.usim_plan_info?.carrier_type,
    serverData.value?.usim_plan_info?.carrier_cd,
    serverData.value?.usim_plan_info?.mvno_cd
  )
}

//creating extra bindings for forms
const inputBindings = (formName) => {
  let bindings = { placeholder: FIXED_FORMS[formName].placeholder }

  //usim plan name is readonly
  if (formName === 'usim_plan_nm') {
    bindings.onClick = changeUsimPlan
    bindings.readonly = true
  }

  //checking all forms with name
  if (['name', 'deputy_name', 'account_name'].includes(formName)) {
    bindings.onInput = (event) => {
      FIXED_FORMS[formName].value = event.target.value.toUpperCase()
    }
  }

  //setting payment
  if (['account_name', 'account_birthday'].includes(formName)) {
    bindings.readonly = selfRegisterChecked.value
  }

  if (formName === 'address') {
    bindings.onClick = (event) => openAddressPopup()
    bindings.readonly = true
  }
  if (formName === 'account_number') {
    bindings.onInput = (event) => {
      FIXED_FORMS[formName].value = event.target.value.replace(/[^0-9]/g, '')
    }
  }

  return bindings
}

// weather the registerer is owner or somebody else
const selfRegisterChecked = ref(true)

watchEffect(() => {
  if (selfRegisterChecked.value) {
    FIXED_FORMS.account_name.value = FIXED_FORMS.name.value
    FIXED_FORMS.account_birthday.value = FIXED_FORMS.birthday.value
  } else {
    FIXED_FORMS.account_name.value = ''
    FIXED_FORMS.account_birthday.value = ''
  }
})

//this handles cleave input updates. it has raw values!
const handleCleaveInput = (formattedValue, formName) => {
  FIXED_FORMS[formName].value = formattedValue

  //if not seven mobile validate short date
  if (
    ['birthday', 'deputy_birthday', 'account_birthday'].includes(formName) &&
    serverData.value['usim_plan_info']['mvno_cd'] !== 'SVM'
  ) {
    const today = new Date()
    const currYear = today.getFullYear() % 100

    if (formattedValue.length === 8) {
      const [yy, mm, dd] = formattedValue.split('-')
      if (yy > currYear) formattedValue = '19' + formattedValue
      else formattedValue = '20' + formattedValue

      const date = new Date(formattedValue)
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      FIXED_FORMS[formName].value = `${year}-${month}-${day}`
    }
  }
}

//supported docs checkbox and handler
const supportedImagesChecked = ref(false)
// this handles file upload
const supportedImages = ref([])

//  a ref for storing File objects
const fileObjects = ref([])
const handleFileUpload = async (event) => {
  const selectedFiles = event.target.files
  for (let i = 0; i < selectedFiles.length; i++) {
    fileObjects.value.push(selectedFiles[i])
  }
  createImageUrls()
}
//create url images
const createImageUrls = () => {
  supportedImages.value = []
  for (let i = 0; i < fileObjects.value.length; i++) {
    const imageUrl = URL.createObjectURL(fileObjects.value[i])
    supportedImages.value.push(imageUrl)
  }
}

const deleteDocImages = (index) => {
  fileObjects.value.splice(index, 1)
  createImageUrls()
}

//will sign after print, if device is not mobile, make signAfterPrintChecked true
const signAfterPrintChecked = ref(!useDeviceTypeStore().isDeviceMobile())

//signs image data
const nameImageData = ref()
const signImageData = ref()

const paymentNameImageData = ref()
const paymentSignImageData = ref()

const deputyNameImageData = ref()
const deputySignImageData = ref()

//shows if partner has no sign in profile
const partnerNameImageData = ref()
const partnerSignImageData = ref()

//i agreee pad
const agreePadData = ref()

//SUBMIT //FORM DATA REQUEST
const formSubmitting = ref(false)
const formSubmitted = ref(false)
const formData = new FormData()

async function submit() {
  formSubmitted.value = true

  //here checking if any required form available is filled, if not return and show snackbar
  for (var formname of availableForms.value) {
    if (FIXED_FORMS[formname].required && FIXED_FORMS[formname].error() !== null) {
      useSnackbarStore().show(`채워지지 않은 필드가 있습니다 (${FIXED_FORMS[formname]?.label})`)
      return
    }
  }

  //here all the image pads are being checked
  if (!signAfterPrintChecked.value) {
    if (!nameImageData.value || !signImageData.value) {
      useSnackbarStore().show('가입자서명을 하지 않았습니다.')
      return
    }

    if (!selfRegisterChecked.value) {
      if (!paymentNameImageData.value || !paymentSignImageData.value) {
        useSnackbarStore().show('후불이체동의 서명을 하지 않았습니다.')
        return
      }
    }

    if (availableForms.value.includes('deputy_name')) {
      if (!deputyNameImageData.value || !deputySignImageData.value) {
        useSnackbarStore().show('법정대리인서명을 하지 않았습니다.')
        return
      }
    }

    if (serverData.value?.usim_plan_info?.mvno_cd === 'UPM') {
      if (!agreePadData.value) {
        useSnackbarStore().show('판매자서명을 하지 않았습니다.')
        return
      }
    }

    if (serverData?.chk_partner_sign === 'N' && serverData?.usim_plan_info?.mvno_cd === 'UPM') {
      if (!partnerNameImageData.value || !partnerSignImageData.value) {
        useSnackbarStore().show('가입약관에 동의하지 않았습니다.')
        return
      }
    }
  }

  formSubmitting.value = true

  await fetchForms()
}

async function fetchForms() {
  for (const file of fileObjects.value) {
    formData.set('attach_files[]', file) //adding files
  }

  formData.set('apply_sign', nameImageData?.value ?? '')
  formData.set('apply_seal', signImageData?.value ?? '')
  formData.set('bill_sign', paymentNameImageData?.value ?? '')
  formData.set('bill_seal', paymentSignImageData?.value ?? '')
  formData.set('partner_sign', partnerNameImageData?.value ?? '')
  formData.set('partner_seal', partnerSignImageData?.value ?? '')
  formData.set('deputy_sign', deputyNameImageData?.value ?? '')
  formData.set('deputy_seal', deputySignImageData?.value ?? '')
  formData.set('agree_sign', agreePadData?.value ?? '')

  formData.set('carrier_type', serverData.value?.usim_plan_info?.carrier_type)
  formData.set('carrier_cd', serverData.value?.usim_plan_info?.carrier_cd)
  formData.set('mvno_cd', serverData.value?.usim_plan_info?.mvno_cd)
  formData.set('usim_plan_id', serverData.value?.usim_plan_info?.id)

  formData.set('chk_eq_yn', selfRegisterChecked.value === true ? 'Y' : 'N')

  const dashRemovables = [
    'birthday',
    'deputy_birthday',
    'account_birthday',
    'deputy_contact',
    'contact',
    'phone_number'
  ]

  var formsAndValues = {}

  for (var formName of availableForms.value) {
    if (dashRemovables.includes(formName)) {
      formsAndValues[formName] = FIXED_FORMS[formName]?.value?.replaceAll('-', '')
    } else {
      formsAndValues[formName] = FIXED_FORMS[formName].value
    }
  }

  for (const [formName, value] of Object.entries(formsAndValues)) {
    if (formName === 'wish_number' && value) {
      const wishList = value.split(' / ')
      wishList.forEach((item, index) => {
        const key = 'request_no_' + (index + 1)
        formData.set(key, item)
      })
      //
    } else if (formName === 'country') {
      formData.set('country_cd', value)
      //
    } else if (formName === 'address') {
      formData.set('address', value + ' ' + formsAndValues?.addressdetail)
    } else if (formName === 'usim_model_list') {
      formData.set('usim_model_no', value)
      //
    } else if (formName === 'gender_cd') {
      formData.set('gender', value)
      //
    } else if (formName === 'data_roming_block_cd') {
      formData.set('data_roming_block', value)
      //
    } else if (formName === 'data_block_cd') {
      formData.set('data_block', value)
      //
    } else if (formName === 'phone_bill_block_cd') {
      formData.set('phone_bill_block', value)
      //
    } else if (formName === 'extra_service_cd') {
      formData.set('extra_service', value)
    } else if (formName === 'usim_plan_nm') {
    } else {
      formData.set(formName, value)
    }
  }

  // for (const [key, value] of formData.entries()) {
  //   console.log(key, value)
  // }

  try {
    const response = await fetchWithTokenRefresh('agent/actApply', {
      method: 'POST',
      body: formData
    })

    const decodedResponse = await response.json()

    const base64Images = decodedResponse?.data?.apply_forms_list ?? []

    if (base64Images?.length > 0) {
      canPrintImages.value = serverData.value?.chk_agent_role_info === 'Y'
      openImageViewPopup(base64Images)
    } else {
      throw decodedResponse?.message ?? 'Could not fetch image data'
    }
  } catch (error) {
    useSnackbarStore().show(error.toString())
  } finally {
    formSubmitting.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 20px;
  margin-top: 20px;
}

.partition {
  display: flex;
  flex-flow: wrap;
  gap: 15px;
  box-sizing: border-box;
}

.empty_title {
  width: 100%;
}

.title {
  font-size: 18px;
  font-weight: 600;
  padding: 0;
  margin-top: 10px;
  width: 100%;
}

.group {
  width: 100%;
  /* background-color: aquamarine; */
}

.checkbox {
  font-size: 16px;
  font-weight: 500;
}

.left-margin {
  margin-left: 15px;
}
.uploadedImagesRow {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  margin-top: 15px;
}
.uploadImageBox {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 100px;
  border-radius: 5px;
  border: 1px dashed var(--main-color);
  cursor: pointer;
  position: relative;
  background-color: #fff;
}
.uploadImageBox img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-sizing: border-box;
}
.delete-icon {
  position: absolute;
  top: 3px;
  right: 3px;
  color: #ff3535 !important;
  cursor: pointer !important;
  background-color: #ffffff;
  padding: 2px;
  border-radius: 20px;
}

.sing-name-pads {
  display: flex;
  flex-flow: column;
  gap: 25px;
  font-weight: 500;
}
.plan-not-found {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* font-size: 16px; */
}
.submit {
  height: 45px;
  margin-top: 30px;
  max-width: 200px;
  margin-bottom: 400px;
}

.group-input-moon {
  display: flex;
  flex-flow: row;
  gap: 20px;
}

.group-input-moon button {
  width: auto;
  min-width: 70px;
}

.info-note {
  margin-top: 20px;
  background-color: #ff353521;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.info-note .notes {
  display: flex;
  flex-flow: column;
  gap: 10px;
  align-items: start;
  font-weight: 600;
}

.info-note button {
  width: auto;
  padding: 0 10px;
  white-space: nowrap;
}

.supperted-images {
  margin-top: 20px;
}

@media (max-width: 600px) {
  .container {
    width: 100%;
  }

  .group {
    /* width: auto; */
  }

  .info-note {
    flex-flow: column;
  }
}
</style>
