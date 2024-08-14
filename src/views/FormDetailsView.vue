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
    <template v-for="(typeFormNames, index) of availableForms" :key="index">
      <template v-if="typeFormNames.length > 0">
        <div class="partition">
          <div v-if="index === 'usim'" class="title">요금제 정보</div>
          <div v-if="index === 'customer'" class="title">고객 정보</div>
          <div v-if="index === 'deputy'" class="title">법정대리인</div>
          <div v-if="index === 'payment'" class="title">
            <span> 자동이체 </span>
            <a-checkbox class="checkbox left-margin" v-model:checked="selfRegisterChecked"
              >가입자와 동일</a-checkbox
            >
          </div>

          <template v-for="(formName, index) in typeFormNames" :key="index">
            <div class="group" :style="{ maxWidth: FIXED_FORMS[formName].maxwidth }">
              <label>{{ FIXED_FORMS[formName].label }}</label>

              <!-- input -->
              <template v-if="FIXED_FORMS[formName].type === 'input'">
                <div class="group-input-moon" v-if="formName === 'usim_plan_nm'">
                  <input v-model="FIXED_FORMS[formName].value" v-bind="inputBindings(formName)" />
                  <button @click="changeUsimPlan">변경</button>
                </div>

                <input
                  v-else
                  v-model="FIXED_FORMS[formName].value"
                  v-bind="inputBindings(formName)"
                />
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

              <p v-if="formSubmitted && !filledCheckValues[formName]" class="input-error-message">
                {{ FIXED_FORMS[formName].errorMessage }}
              </p>
            </div>
          </template>
        </div>
      </template>
    </template>

    <!-- IMAGE UPLOAD -->
    <div class="supperted-images">
      <a-checkbox class="checkbox" v-model:checked="supportedImagesChecked"
        >증빙자료첨부(선택사항)</a-checkbox
      >
      <input
        id="file-input"
        @change="handleFileUpload"
        type="file"
        style="display: none"
        accept="image/*"
        multiple
      />

      <div v-if="supportedImagesChecked" class="uploadedImagesRow">
        <label for="file-input" class="uploadImageBox">
          <span class="inner-icon material-symbols-outlined"> add </span>
          <p>이미지 업로드</p>
        </label>

        <div v-for="(image, index) in supportedImages" :key="index" class="uploadImageBox">
          <img :src="image" :alt="index" />
          <span @click="deleteDocImages(index)" class="delete-icon material-symbols-outlined">
            delete
          </span>
        </div>
      </div>
    </div>

    <!-- checks and enables sign container -->
    <a-checkbox
      v-if="useDeviceTypeStore().isDeviceMobile()"
      class="checkbox"
      v-model:checked="signAfterPrintChecked"
      >신청서 프린트 인쇄후 서명/사인 자필</a-checkbox
    >

    <div class="sing-name-pads" v-if="!signAfterPrintChecked">
      <!-- form sign pad -->
      <SignImageRowContainer
        :overlayText="FIXED_FORMS.name?.value"
        @updateSignSeal="
          (signData, sealData) => {
            nameImageData = signData
            signImageData = sealData
          }
        "
        title="가입자서명"
        :errorMessage="
          !nameImageData && !signImageData && formSubmitted ? '가입자서명을 하지 않았습니다.' : null
        "
      />
      <!-- payment pad-->
      <SignImageRowContainer
        v-if="serverData?.usim_plan_info?.carrier_type === 'PO' && !selfRegisterChecked"
        :overlayText="FIXED_FORMS.account_name?.value"
        @updateSignSeal="
          (signData, sealData) => {
            paymentNameImageData = signData
            paymentSignImageData = sealData
          }
        "
        title="자동이체 서명"
        :errorMessage="
          !paymentNameImageData && !paymentSignImageData && formSubmitted
            ? '후불이체동의 서명을 하지 않았습니다.'
            : null
        "
      />
      <!-- deputy sign pad -->
      <SignImageRowContainer
        v-if="availableForms.deputy.length > 0"
        :overlayText="FIXED_FORMS.deputy_name?.value"
        @updateSignSeal="
          (signData, sealData) => {
            deputyNameImageData = signData
            deputySignImageData = sealData
          }
        "
        title="법정대리인 서명"
        :errorMessage="
          !deputyNameImageData && !deputySignImageData && formSubmitted
            ? '법정대리인서명을 하지 않았습니다.'
            : null
        "
      />
      <!-- partner sign pad -->
      <SignImageRowContainer
        v-if="serverData?.chk_partner_sign === 'N' && serverData?.usim_plan_info?.mvno_cd === 'UPM'"
        @updateSignSeal="
          (signData, sealData) => {
            partnerNameImageData = signData
            partnerSignImageData = sealData
          }
        "
        title="판매자 서명"
        :errorMessage="
          !partnerNameImageData && !partnerSignImageData && formSubmitted
            ? '판매자서명을 하지 않았습니다.'
            : null
        "
      />

      <AgreePadContainer
        v-if="serverData?.usim_plan_info?.mvno_cd === 'UPM'"
        title="동의합니다"
        @updateAgreePadData="
          (padData) => {
            console.log(padData)
            // agreePadData = padData
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
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FORMS } from '../assets/constants'
import { PLANSINFO } from '../assets/constants'
import _ from 'lodash'
import SignImageRowContainer from '../components/SignImageRowContainer.vue'
import { useSearchaddressStore } from '../stores/select-address-popup'
import LoadingSpinner from '../components/Loader.vue'
import { usePrintablePopup } from '../stores/printable-popup'
import { useSelectPlansPopup } from '../stores/select-plans-popup'
import { useDeviceTypeStore } from '@/stores/device-type-store'
import AgreePadContainer from '../components/AgreePadContainer.vue'

//address poup
const selectAddressPopup = useSearchaddressStore()

const route = useRoute()
const router = useRouter()

const printablePopup = usePrintablePopup()

//watches printable active status and then redirects to home
watch(
  () => printablePopup.active,
  (newV, oldV) => {
    if (newV === false && oldV === true) router.push('/')
  }
)

//need to make deep copy in order to reset when page reloads
const FIXED_FORMS = reactive(_.cloneDeep(FORMS))

//setting address and addressdetail to store value
watchEffect(() => {
  FIXED_FORMS.address.value = selectAddressPopup.address
  FIXED_FORMS.addressdetail.value = selectAddressPopup.buildingName
})

//this inits page
onMounted(fetchData)

//clearing up the address store once unmounted
onUnmounted(() => {
  selectAddressPopup.address = ''
  selectAddressPopup.buildingName = ''
})

//this watches route id (if plan id changed)
watch(() => route.params.id, fetchData)

// 1 first fetched data onMounted()
const serverData = ref(null)

// finding forms
const availableForms = reactive({ usim: [], customer: [], deputy: [], payment: [] })

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/applyInit', {
      method: 'POST',
      body: { usim_plan_id: route.params.id }
    })
    if (!response.ok) throw 'Fetch data error'

    const decodedResponse = await response.json()
    serverData.value = decodedResponse.data

    //setting usim plan name everytime it refetches
    FIXED_FORMS.usim_plan_nm.value = serverData.value.usim_plan_info.usim_plan_nm

    // usim list select required
    FIXED_FORMS.usim_model_list.required = serverData.value?.chk_usim_model === 'Y'

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
  let selectedCarrierInfo = selectedTypeInfo.carriers.find(
    (carrier) => carrier.code === usimPlanInfo.carrier_cd
  ) //selected carrier
  let selectedMvnoInfo = selectedCarrierInfo.mvnos.find(
    (mvno) => mvno.code === usimPlanInfo.mvno_cd
  ) //selected mvno

  //setting available forms in each mvno
  availableForms.usim = [...(selectedMvnoInfo?.usimForms ?? [])]
  availableForms.customer = [...(selectedMvnoInfo?.customerForms ?? [])]
  availableForms.deputy = []

  //finding payment forms in each type
  availableForms.payment = [...(selectedTypeInfo?.paymentForms ?? [])]

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
    availableForms.usim.push('wish_number')
    //wish numbers input with cleave
    let wishArray = Array(selectedMvnoInfo.wishCount).fill(4) //[4,4,4]
    FIXED_FORMS.wish_number.pattern = { numericOnly: true, delimiter: ' / ', blocks: wishArray } //4,4,4
    FIXED_FORMS.wish_number.placeholder = wishArray.map((e) => '1234').join(' / ')
  }

  //adding transferable number when type is 신규가입 mvno is UPM (umobile)
  if (
    FIXED_FORMS?.usim_act_cd?.value === 'N' &&
    serverData.value?.usim_plan_info?.mvno_cd === 'COM'
  ) {
    availableForms.usim.push('phone_number')
    FIXED_FORMS.phone_number.required = false
    FIXED_FORMS.phone_number.pattern.prefix = null
  }

  if (FIXED_FORMS?.usim_act_cd?.value === 'M')
    availableForms.usim.push('mnp_carrier_type', 'phone_number', 'mnp_pre_carrier')
  if (FIXED_FORMS?.mnp_pre_carrier?.value === 'MV') availableForms.usim.push('mnp_pre_carrier_nm')

  if (FIXED_FORMS?.paid_transfer_cd?.value === 'C') availableForms.payment.push('card_yy_mm')

  //adding deputy forms
  if (FIXED_FORMS?.cust_type_cd?.value === 'COL') {
    availableForms.deputy.push(
      'deputy_name',
      'deputy_birthday',
      'relationship_cd',
      'deputy_contact'
    )
  }

  //after extra forms added, set default should be called again!
  setDefault()

  //settnig country code
  FIXED_FORMS.country.value = ''
  if (FIXED_FORMS?.cust_type_cd?.value !== 'MEA') FIXED_FORMS.country.value = '대한민국'

  //removing gender if not underage for HVS
  if (serverData.value['usim_plan_info']['mvno_cd'] === 'HVS') {
    if (FIXED_FORMS?.cust_type_cd?.value != 'COL') {
      const index = availableForms.customer.indexOf('gender_cd')
      if (index !== -1) availableForms.customer.splice(index, 1)
    }
  }

  if (serverData.value['usim_plan_info']['mvno_cd'] === 'SVM') {
    const index = availableForms.payment.indexOf('account_birthday')
    if (index !== -1) {
      availableForms.payment.splice(index, 1)
      availableForms.payment.push('account_birthday_full')
    }
    const index1 = availableForms.deputy.indexOf('deputy_birthday')
    if (index1 !== -1) {
      availableForms.deputy.splice(index1, 1)
      availableForms.deputy.push('deputy_birthday_full')
    }
  }

  //checkable forms in order to submit or showing error
  filledCheckValues.value = Object.fromEntries(
    [
      //
      ...availableForms.usim,
      ...availableForms.customer,
      ...availableForms.payment,
      ...availableForms.deputy
    ].map((formName) => [
      formName,
      FIXED_FORMS[formName]?.value ? true : !FIXED_FORMS[formName]?.required
    ])
  )
}

//sets default values
function setDefault() {
  for (const formName in FIXED_FORMS) {
    //setting empty default error messages
    if (!FIXED_FORMS[formName].value)
      FIXED_FORMS[formName].errorMessage = FIXED_FORMS[formName].error

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
  if (['account_name', 'account_birthday', 'account_birthday_full'].includes(formName)) {
    bindings.readonly = selfRegisterChecked.value
  }

  if (formName === 'address') {
    bindings.onClick = (event) => selectAddressPopup.open()
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
    FIXED_FORMS.account_birthday_full.value = FIXED_FORMS.birthday_full.value
  } else {
    FIXED_FORMS.account_name.value = ''
    FIXED_FORMS.account_birthday.value = ''
    FIXED_FORMS.account_birthday_full.value = ''
  }
})

//this handles cleave input updates. it has raw values!
const handleCleaveInput = (formattedValue, formName) => {
  FIXED_FORMS[formName].value = formattedValue

  if (['birthday', 'deputy_birthday', 'account_birthday'].includes(formName)) {
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
const nameImageData = ref(null)
const signImageData = ref(null)

const paymentNameImageData = ref(null)
const paymentSignImageData = ref(null)

const deputyNameImageData = ref(null)
const deputySignImageData = ref(null)

//shows if partner has no sign in profile
const partnerNameImageData = ref(null)
const partnerSignImageData = ref(null)

//i agreee pad
const agreePadData = ref(null)

const filledCheckValues = ref({})

for (const formName in FIXED_FORMS) {
  watch(
    () => FIXED_FORMS[formName].value,
    (newValue, oldValue) => {
      let field = FIXED_FORMS[formName]
      let isValid = true
      field.errorMessage = null

      // Phone number validation
      if (['deputy_contact', 'contact', 'phone_number'].includes(formName)) {
        if (newValue && newValue?.replaceAll('-', '')?.length < 10) {
          field.errorMessage = '전화번호를 정확하게 입력하세요.'
          isValid = false
        }
      }

      // Card expiry validation
      else if (formName === 'card_yy_mm' && field.value?.replaceAll('/', '')?.length < 4) {
        field.errorMessage = '카드 만료일은 MM(월) 및 YY(년)여야 합니다.'
        isValid = false
      }

      // Birthday validation
      else if (
        ['birthday', 'deputy_birthday', 'account_birthday'].includes(formName) &&
        field.value?.replaceAll('-', '')?.length < 6
      ) {
        field.errorMessage = '올바른 날짜를 입력하십시오'
        isValid = false
      }

      // Required field validation
      if (field.required && !field.value) {
        field.errorMessage = field.error
        isValid = false
      }

      // Set filledCheckValues.value based on final validation state
      filledCheckValues.value[formName] = Boolean(isValid)
    },
    { immediate: true }
  )
}

//SUBMIT //FORM DATA REQUEST
const formSubmitting = ref(false)
const formSubmitted = ref(false)
const formData = new FormData()

async function submit() {
  formSubmitted.value = true
  formSubmitting.value = true

  //removing froms
  delete filledCheckValues.value.formsSignPad
  delete filledCheckValues.value.paymentSignPad
  delete filledCheckValues.value.deputySignPad
  delete filledCheckValues.value.agreeSignPad

  if (!signAfterPrintChecked.value) {
    filledCheckValues.value.formsSignPad = Boolean(nameImageData.value && signImageData.value)

    if (!selfRegisterChecked.value)
      filledCheckValues.value.paymentSignPad = Boolean(
        paymentNameImageData.value && paymentSignImageData.value
      )

    if (availableForms.deputy.length > 0)
      filledCheckValues.value.deputySignPad = Boolean(
        deputyNameImageData.value && deputySignImageData.value
      )

    if (serverData.value?.usim_plan_info?.mvno_cd === 'UPM')
      filledCheckValues.value.agreeSignPad = Boolean(agreePadData.value)
  }

  if (Object.values(filledCheckValues.value).every(Boolean)) await fetchForms()
  else useSnackbarStore().show('채워지지 않은 필드가 있습니다.')

  formSubmitting.value = false
}

async function fetchForms() {
  for (const file of fileObjects.value) {
    formData.set('attach_files[]', file) //adding files
  }

  formData.set('bill_sign', paymentNameImageData.value)
  formData.set('bill_seal', paymentSignImageData.value)

  formData.set('apply_sign', nameImageData.value)
  formData.set('apply_seal', signImageData.value)

  formData.set('partner_sign', partnerNameImageData.value)
  formData.set('partner_seal', partnerSignImageData.value)

  formData.set('deputy_sign', deputyNameImageData.value)
  formData.set('deputy_seal', deputySignImageData.value)

  formData.set('agree_sign', agreePadData.value)

  formData.set('carrier_type', serverData.value?.usim_plan_info?.carrier_type)
  formData.set('carrier_cd', serverData.value?.usim_plan_info?.carrier_cd)
  formData.set('mvno_cd', serverData.value?.usim_plan_info?.mvno_cd)
  formData.set('usim_plan_id', serverData.value?.usim_plan_info?.id)

  formData.set('chk_eq_yn', selfRegisterChecked.value === true ? 'Y' : 'N')

  const dashRemovables = [
    'birthday',
    'deputy_birthday',
    'account_birthday',
    'birthday_full',
    'deputy_birthday_full',
    'account_birthday_full',
    'deputy_contact',
    'contact',
    'phone_number'
  ]

  const avlFormNames = [
    ...availableForms.usim,
    ...availableForms.customer,
    ...availableForms.deputy,
    ...availableForms.payment
  ]
  for (var formName of avlFormNames) {
    // console.log(formName)
    if (
      dashRemovables.includes(formName) &&
      FIXED_FORMS[formName].value !== null &&
      FIXED_FORMS[formName].value
    ) {
      FIXED_FORMS[formName].value = FIXED_FORMS?.[formName]?.value?.replaceAll('-', '')
    }

    if (formName === 'wish_number' && FIXED_FORMS[formName]?.value) {
      const wishList = FIXED_FORMS[formName]?.value.split(' / ')
      wishList.forEach((item, index) => {
        const key = 'request_no_' + (index + 1)
        formData.set(key, item)
      })
      //
    } else if (formName === 'country') {
      formData.set('country_cd', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'usim_model_list') {
      formData.set('usim_model_no', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'gender_cd') {
      formData.set('gender', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'data_roming_block_cd') {
      formData.set('data_roming_block', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'data_block_cd') {
      formData.set('data_block', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'phone_bill_block_cd') {
      formData.set('phone_bill_block', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'extra_service_cd') {
      formData.set('extra_service', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'birthday_full') {
      formData.set('birthday', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'deputy_birthday_full') {
      formData.set('deputy_birthday', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'account_birthday_full') {
      formData.set('account_birthday', FIXED_FORMS[formName].value)
      //
    } else if (formName === 'usim_plan_nm') {
    } else {
      formData.set(formName, FIXED_FORMS[formName].value)
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
    console.log(decodedResponse)
    const base64Images = decodedResponse?.data?.apply_forms_list ?? []

    if (base64Images?.length > 0)
      printablePopup.open(base64Images, serverData.value?.chk_agent_role_info === 'Y')
    else throw decodedResponse?.message ?? 'Could not fetch image data'
  } catch (error) {
    useSnackbarStore().show(error.toString())
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
}

.partition {
  display: flex;
  flex-flow: wrap;
  gap: 15px;
  margin-bottom: 10px;
  min-height: 100px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  padding: 0;
  margin-top: 10px;
  margin-bottom: 0px;
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
