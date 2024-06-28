<template>
  <SearchAddressPopup v-if="searchAddressPopup.active" />

  <div class="content-container">
    <div class="partition">
      <div class="title">판매점 정보</div>
      <div class="group">
        <label>상호명*</label>
        <input v-model="companyName" placeholder="" />
        <p v-if="!companyName && isSubmitted" class="input-error-message">상호명을 입력하세요.</p>
      </div>

      <div class="group" style="max-width: 400px">
        <label>사업자번호*</label>

        <div class="group-inner-row">
          <input ref="companyNumberRef" placeholder="" value="" />
          <button @click="checkBusinessRegNumber">중복체크</button>
        </div>

        <p v-if="!companyRegNumber && isSubmitted" class="input-error-message">사업자번호를 정확하게 입력하세요.</p>
        <p v-if="companyRegNumberPrompt" :class="['input-error-message', { 'input-success': isCompanyRegNumberOk }]">
          {{ companyRegNumberPrompt }}
        </p>
      </div>

      <div class="group-row">
        <div class="group" style="max-width: 200px">
          <label>연락 번호*</label>
          <input
            placeholder=""
            v-model="signUpStore.data.phoneNumber"
            readonly
            v-cleave="{
              phone: true,
              phoneRegionCode: 'KR',
              delimiter: '-',
            }"
          />
        </div>

        <div class="group">
          <label>대표자 명*</label>
          <input :value="signUpStore.data.name" placeholder="" readonly />
        </div>
      </div>

      <div class="group" style="max-width: 400px">
        <label>이메일주소*</label>

        <div class="group-inner-row">
          <input v-model="email" placeholder="" @input="validateEmail" />
          <a-select
            v-model:value="emailAddition"
            @change="validateEmail"
            :style="{ minWidth: '140px' }"
            placeholder=""
            :options="EMAILOPTIONS"
          >
          </a-select>
        </div>
        <p v-if="!email && isSubmitted" class="input-error-message">이메일주소를 입력해주세요.</p>
        <p v-if="email && emailError" class="input-error-message">올바른 이메일 주소를 입력해주세요.</p>
      </div>

      <div class="group-row">
        <div class="group" style="max-width: 200px">
          <label>매장 전화</label>

          <input
            placeholder=""
            v-model="shopPhoneNumber"
            v-cleave="{
              phone: true,
              phoneRegionCode: 'KR',
              delimiter: '-',
            }"
          />
          <p v-if="!shopPhoneNumber && isSubmitted" class="input-error-message">매장 전화번호를 입력하세요.</p>
        </div>

        <div class="group" style="max-width: 200px">
          <label>매장 팩스</label>
          <input
            placeholder=""
            v-model="shopPhoneFax"
            v-cleave="{
              phone: true,
              phoneRegionCode: 'KR',
              delimiter: '-',
            }"
          />
        </div>
      </div>

      <div class="group-row">
        <div class="group" style="max-width: 60%">
          <label>주소</label>
          <input @click="searchAddressPopup.open()" v-model="address" placeholder="" readonly />
          <p v-if="!address && isSubmitted" class="input-error-message">주소를 입력하세요.</p>
        </div>

        <div class="group" style="max-width: 40%">
          <label>상세주소</label>
          <input v-model="addressDetails" placeholder="" />
        </div>
      </div>
    </div>
    <div class="partition">
      <div class="title">가입 정보</div>

      <div class="group" style="max-width: 400px">
        <label>아이디*</label>

        <div class="group-inner-row">
          <input
            type="username"
            v-model="username"
            @input="
              (event) => {
                validateIdInput(event)
                if (isUsernameOk || !usernamePrompt) {
                  isUsernameOk = false
                  usernamePrompt = null
                }
              }
            "
            placeholder=""
          />
          <button @click="checkUsername">중복체크</button>
        </div>
        <p v-if="!username && isSubmitted" class="input-error-message">아이디를 입력하세요.</p>
        <p v-if="username && usernamePrompt" :class="['input-error-message', { 'input-success': isUsernameOk }]">
          {{ usernamePrompt }}
        </p>
      </div>

      <div class="group-row">
        <div class="group">
          <label>패스워드</label>
          <input v-model="password" placeholder="" type="password" @input="checkPass" />
          <p v-if="!password && isSubmitted" class="input-error-message">비밀번호를 입력해주세요.</p>
          <p v-if="password && passwordPrompt" :class="['input-error-message', { 'input-success': passwordValid }]">
            {{ passwordPrompt }}
          </p>
        </div>

        <div class="group">
          <label>패스워드 확인</label>
          <input v-model="passwordCheck" placeholder="" type="password" @input="checkPass" />
          <p v-if="!passwordCheck && isSubmitted" class="input-error-message">비밀번호를 다시 입력해주세요.</p>
          <p
            v-if="passwordCheck && passwordCheckPrompt"
            :class="['input-error-message', { 'input-success': passwordCheckValid }]"
          >
            {{ passwordCheckPrompt }}
          </p>
        </div>
      </div>
    </div>

    <button @click="submit" class="submit-button" :disabled="isLoading">
      <template v-if="isLoading">
        <LoadingSpinner height="20px" color="#ffffff" />
      </template>
      <template v-else>
        <span>가입신청</span>
      </template>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import { message } from 'ant-design-vue'
import SearchAddressPopup from '../components/SearchAddressPopup.vue'
import { useSearchaddressStore } from '@/stores/select-address-popup'
import { useSignUpstore } from '../stores/signup-store'
import Cleave from 'cleave.js'
import * as helpers from '@/utils/helpers'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../components/Loader.vue'
import { useWarningStore } from '../stores/warning'
import { EMAILOPTIONS } from '../assets/constants'

const warningStore = useWarningStore()

const router = useRouter()

const signUpStore = useSignUpstore()
const searchAddressPopup = useSearchaddressStore()

const isLoading = ref(false)

watch(
  () => searchAddressPopup.address,
  () => {
    address.value = searchAddressPopup.address
    addressDetails.value = searchAddressPopup.buildingName
  }
)

async function checkUsername() {
  isUsernameOk.value = false
  usernamePrompt.value = null

  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/chkUserId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value }),
    })

    const data = await response.json()
    if (data?.result === 'OK') isUsernameOk.value = true
    usernamePrompt.value = data?.message
  } catch (err) {
    useSnackbarStore().showSnackbar(err.toString())
  }
}
const checkBusinessRegNumber = async () => {
  isCompanyRegNumberOk.value = false
  companyRegNumberPrompt.value = null

  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/chkBizNum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_num: companyRegNumber.value }),
    })

    const data = await response.json()

    if (data?.result === 'OK') isCompanyRegNumberOk.value = true
    companyRegNumberPrompt.value = data?.message
  } catch (err) {
    useSnackbarStore().showSnackbar(err.toString())
  }
}

const companyName = ref()
const companyRegNumber = ref('')
const isCompanyRegNumberOk = ref(false)
const companyRegNumberPrompt = ref()

const email = ref()
const emailAddition = ref('')
const emailError = ref(false)

const shopPhoneNumber = ref()
const shopPhoneFax = ref()

const username = ref('')
const isUsernameOk = ref(false)
const usernamePrompt = ref()

const address = ref()
const addressDetails = ref()

const password = ref()
const passwordValid = ref(false)
const passwordPrompt = ref()
const passwordCheck = ref()
const passwordCheckValid = ref()
const passwordCheckPrompt = ref()

const isSubmitted = ref(false)

function checkPass() {
  passwordPrompt.value = null
  passwordValid.value = false
  passwordCheckPrompt.value = null
  passwordCheckValid.value = false

  if (!helpers.isValidPassword(password.value)) {
    passwordPrompt.value =
      '최소 8자이상, 영문대문자 1개이상포함, 숫자 1개이상포함, 특수문자(! @ # $ & ~ * % ^ ?) 1개이상포함'
  } else {
    passwordValid.value = true
    passwordPrompt.value = 'OK'
  }

  if (password.value !== passwordCheck.value) {
    passwordCheckPrompt.value = '비밀번호가 일치하지 않습니다'
  } else {
    passwordCheckValid.value = true
    passwordCheckPrompt.value = 'OK'
  }
}

async function submit() {
  if (password.value !== passwordCheck.value) useSnackbarStore().showSnackbar('비밀번호가 일치하지 않습니다')

  isSubmitted.value = true

  const isAllfilled = [
    companyName.value,
    companyRegNumber.value,
    shopPhoneNumber.value,
    address.value,
    username.value,
    password.value,
    password.value === passwordCheck.value,
    passwordCheck.value,
    username.value && isUsernameOk.value,
    email.value && !emailError.value,
  ].every(Boolean)

  if (companyRegNumber.value && !isCompanyRegNumberOk.value) {
    companyRegNumberPrompt.value = '사업자번호 중복체크 해야합니다'
    useSnackbarStore().showSnackbar('사업자번호 중복체크 해야합니다')
  }

  if (username.value && !isUsernameOk.value) {
    usernamePrompt.value = '아이디 중복체크 해야합니다'
    useSnackbarStore().showSnackbar('아이디 중복체크 해야합니다')
    return
  }

  //checks if all required fields and requirements are met
  if (!isAllfilled) return

  try {
    isLoading.value = true

    const body = {
      username: username.value, //아이디
      password: password.value, //패스워드
      partner_nm: companyName.value, //판매점명
      business_num: companyRegNumber.value, //사업자번호
      address: address.value, //주소
      dtl_address: addressDetails.value, //상세주소
      email: email.value + emailAddition.value,
      store_contact: shopPhoneNumber.value?.replace(/-/g, ''), //매장번호
      store_fax: shopPhoneFax.value?.replace(/-/g, ''), //매장팩스

      contractor: signUpStore.data.name, //대표자명
      receipt_id: signUpStore.data.receiptId,
      id_cert_type: signUpStore.data.idCertType,
      phone_number: signUpStore.data?.phoneNumber?.replace(/-/g, ''),
      birthday: signUpStore.data?.birthday?.replace(/-/g, ''), // 생년월일
      sales_cd: signUpStore.data.salesCd, //영업사원코드
    }

    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/partnerjoin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (data.result === 'SUCCESS') {
      //success redirect to login

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      await delay(2000)

      warningStore.open('등록이 성공적으로 완료되었습니다', ['아이디와 비밀번호로 로그인해주세요.'])

      signUpStore.clear()
      router.push('login')

      return
    } else {
      //errors redirect to login
      throw data?.message
    }
  } catch (err) {
    useSnackbarStore().showSnackbar(err.toString())
  } finally {
    isLoading.value = false
  }
}

const validateIdInput = (event) => {
  const regex = /[^a-zA-Z0-9]/g // Regular expression to match non-alphanumeric characters
  event.target.value = event.target.value.toLowerCase().replace(regex, '')
  username.value = event.target.value
}

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailPattern.test(email.value + emailAddition.value)
}

const companyNumberRef = ref(null)
let cleaveInstanceCompanyNumber = null

onMounted(() => {
  cleaveInstanceCompanyNumber = new Cleave(companyNumberRef.value, {
    delimiter: '-',
    blocks: [3, 2, 5],
    numericOnly: true,
    onValueChanged: (event) => {
      companyRegNumber.value = event.target.rawValue
      isCompanyRegNumberOk.value = false
      companyRegNumberPrompt.value = null
    },
  })
})

onUnmounted(() => {
  if (cleaveInstanceCompanyNumber) {
    cleaveInstanceCompanyNumber.destroy()
    cleaveInstanceCompanyNumber = null
  }
})
</script>

<style scoped>
.content-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 5px #00000013;
  width: 700px;
  padding: 30px;
  margin: 20px;
  min-height: 600px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 30px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.partition {
  display: flex;
  flex-flow: column;
  gap: 20px;
}

.group-row {
  display: flex;
  gap: 20px;

  /* width: 100%; */
  align-items: flex-start;
  /* background-color: #7fffd4bd; */
}

.group {
  display: flex;
  flex-flow: column;
  /* align-items: flex-start; */
  justify-content: flex-start;
  width: 100%;
  /* background-color: #ffff005f; */
}

.group-inner-row {
  display: flex;
  flex-flow: row;
  gap: 20px;
  width: 100%;
}

.group-inner-row button {
  max-width: 100px;
  background-color: #8b97a9;
}

.submit-button {
  margin-top: 10px;
  margin-bottom: 30px;
  width: 200px;
  height: 45px;
  align-self: center;
}

.input-success {
  color: #00c227;
}

@media (max-width: 600px) {
  .content-container {
    width: 100%;
    box-shadow: none;
    padding: 0;
  }

  .group-row {
    flex-flow: column;
    align-items: flex-start;
    gap: 20px;
  }

  .group {
    max-width: none !important;
  }
}
</style>
