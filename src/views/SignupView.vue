<template>
  <div class="main">
    <div class="content-container">
      <div class="title-container">
        <div class="title">관리자 등록요청</div>
        <div class="subtitle">기본전보 입력하세요</div>
      </div>

      <div class="group">
        <label>아이디</label>
        <input @input="validateForms" v-model="forms.username" />
        <p v-if="isSubmitted && errors.username" class="input-error-message">
          {{ errors.username }}
        </p>
      </div>

      <div class="group">
        <label>이름</label>
        <input @input="validateForms" v-model="forms.name" />
        <p v-if="isSubmitted && errors.name" class="input-error-message">
          {{ errors.name }}
        </p>
      </div>

      <div class="group">
        <label>이메일</label>
        <input @input="validateForms" v-model="forms.email" />
        <p v-if="isSubmitted && errors.email" class="input-error-message">
          {{ errors.email }}
        </p>
      </div>

      <div class="group">
        <label>휴대전화</label>
        <input
          @input="validateForms"
          v-model="forms.phoneNumber"
          v-cleave="{
            phone: true,
            phoneRegionCode: 'KR',
            delimiter: '-',
            onValueChanged: (event) => (forms.phoneNumber = event.target.value)
          }"
        />
        <p v-if="isSubmitted && errors.phoneNumber" class="input-error-message">
          {{ errors.phoneNumber }}
        </p>
      </div>

      <div class="group">
        <label>국가</label>
        <a-select
          v-model:value="forms.country"
          :style="{ width: '100%' }"
          placeholder=""
          show-search
          :options="COUNTRIES"
        >
        </a-select>
      </div>

      <div class="group">
        <label>비밀번호</label>
        <input
          @input="validateForms"
          v-model="forms.password"
          type="password"
          autocomplete="new-password"
        />
        <p v-if="isSubmitted && errors.password" class="input-error-message">
          {{ errors.password }}
        </p>
      </div>

      <div class="group">
        <label>비밓번호 확인</label>
        <input
          @input="validateForms"
          v-model="forms.passwordCheck"
          type="password"
          autocomplete="new-password"
        />
        <p v-if="isSubmitted && errors.passwordCheck" class="input-error-message">
          {{ errors.passwordCheck }}
        </p>
      </div>

      <div></div>
      <button @click="submit">등록하기</button>

      <div>
        이미 계정을 가지고 계십니까?
        <span
          @click="router.push('/login')"
          style="font-weight: 600; color: var(--main-color); cursor: pointer"
          >로그인</span
        >
      </div>

      <div></div>
    </div>

    <p class="foot-note">
      상호 : 심패스(Simpass) | 대표 : 김익태 | 대표전화 : 02-2108-3121 | FAX : 02-2108-3120
      사업자등록번호 : 343-18-00713 | 통신판매신고번호 : 제 2021-서울구로-1451 호 서울시 구로구
      디지털로33길 28, 우림이비지센터 1차 1210호
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthenticationStore } from '../stores/authentication'
import { useSnackbarStore } from '../stores/snackbar'
import LoadingSpinner from '../components/Loader.vue'
import { useRouteMemoryStore } from '@/stores/router-memory-store'
import { useRouter } from 'vue-router'
import { COUNTRIES } from '../assets/constants'
import * as VALIDATOR from '../utils/validators'

const forms = reactive({
  username: null,
  name: null,
  email: null,
  phoneNumber: null,
  country: 'KR',
  password: null,
  passwordCheck: null
})

const errors = reactive({
  username: null,
  name: null,
  email: null,
  phoneNumber: null,
  password: null,
  passwordCheck: null
})

const isSubmitted = ref(false)

const router = useRouter()

function validateForms() {
  isSubmitted.value = true

  const res = [
    (errors.username = VALIDATOR.validateId(forms.username)),
    (errors.name = VALIDATOR.validateName(forms.name)),
    (errors.email = VALIDATOR.validateEmail(forms.email)),
    (errors.phoneNumber = VALIDATOR.validatePhoneNumber(forms.phoneNumber)),
    (errors.password = VALIDATOR.validatePass(forms.password)),
    (errors.passwordCheck = VALIDATOR.validateRentryPass(forms.password, forms.passwordCheck))
  ]
  console.log(res.every((value) => value === null))
  return res.every((value) => value === null)
}

async function submit() {
  if (!validateForms()) return

  isSubmitted.value = true

  const body = {
    username: forms.username,
    password: forms.password,
    email: forms.email,
    name: forms.name,
    country: forms.country,
    phone_number: forms.phoneNumber
  }

  console.log(body)

  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: forms.username,
        password: forms.password,
        email: forms.email,
        name: forms.name,
        country: forms.country,
        phone_number: forms.phoneNumber
      })
    })

    const decodedResponse = await response.json()
    useSnackbarStore().show(decodedResponse?.message ?? 'Server error')

    router.push('/login')
  } catch (err) {
    useSnackbarStore().show(err.toString())
  }
}
</script>

<style scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.content-container {
  display: flex;
  flex-flow: column;
  gap: 20px;
  background-color: #ffffff;
  padding: 0 30px;
  box-sizing: border-box;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 5px #00000013;
  width: 450px;
  height: auto;
}

.title-container {
  margin-top: 30px;
  margin-bottom: 10px;
  font-size: 15px;
}

.title {
  font-size: 26px;
  font-weight: 500;
  margin-bottom: 10px;
}

.group {
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  text-align: start;
}

.foot-note {
  margin: 30px;
  color: #4b4b4b;
  line-height: 1.6;
  font-size: 14px;
  text-align: center;
  width: 500px;
}

@media (max-width: 600px) {
  .main {
    background-color: #fff;
  }

  .content-container {
    background-color: #fff;
    box-shadow: none;

    width: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
  }

  .foot-note {
    width: 90%;
  }
}
</style>
