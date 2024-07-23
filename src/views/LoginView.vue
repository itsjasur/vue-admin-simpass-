<template>
  <div class="main">
    <div class="login-container">
      <div class="title-container">
        <div class="title">로그인</div>
        <div class="subtitle">사용자 아이디 와 비밀번호를 입력하세요</div>
      </div>

      <div class="group">
        <label for="username">사용자 아이디</label>
        <input type="text" id="username" name="username" v-model="username" />
        <p v-if="!username" class="input-error-message">{{ usernameErr }}</p>
      </div>

      <div class="group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" v-model="password" />
        <p v-if="!password" class="input-error-message">{{ passwordErr }}</p>
      </div>

      <button @click="login" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">
          <LoadingSpinner height="20px" color="#ffffff" />
        </span>
        <span v-else>로그인</span>
      </button>

      <div class="sign-up-div">
        <span>계정이 없나요?</span>
        <span @click="router.push('/signup')" class="sign-up-text">사용자 등록</span>
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
import { ref } from 'vue'
import { useAuthenticationStore } from '../stores/authentication'
import { useSnackbarStore } from '../stores/snackbar'
import LoadingSpinner from '../components/Loader.vue'
import { useRouteMemoryStore } from '@/stores/router-memory-store'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const usernameErr = ref('')
const passwordErr = ref('')
const isLoading = ref(false)

const router = useRouter()

async function login(event) {
  isLoading.value = true

  // Check if input fields are empty
  if (!username.value) {
    usernameErr.value = '아이디를 정확히 입력해주세요'
  }
  if (!password.value) {
    passwordErr.value = '비밀번호를 입력하세요.'
  }

  // If any input field is empty, do not proceed with the login request
  if (!username.value || !password.value) {
    isLoading.value = false
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/adminSignin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (!response.ok) throw '로그인정보가 없거나 일치하지 않습니다.'

    const data = await response.json()

    useAuthenticationStore().login(
      data['accessToken'],
      data['refreshToken'],
      data['id'],
      data['username'],
      data['roles']
    )

    //checks if user had intended route, and push that route. if not push '/'
    if (useRouteMemoryStore().intendedRoute) {
      let url = useRouteMemoryStore().intendedRoute
      useRouteMemoryStore().clear() //clearing intended route afters redirected
      router.push(url)
    } else {
      router.push('/')
    }
  } catch (err) {
    useSnackbarStore().show(err.toString())
  }

  isLoading.value = false
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

.login-container {
  display: flex;
  flex-flow: column;
  gap: 20px;
  background-color: #ffffff;
  padding: 0 30px;
  box-sizing: border-box;
  border-radius: 10px;
  text-align: center;
  width: 450px;
  height: auto;
  box-shadow: 0 0 5px #00000013;
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
}

.input-group {
  margin: 20px 0;
  text-align: left;
  width: 100%;
}

.foot-note {
  padding-top: 50px;
  width: 80%;
  color: #4b4b4b;
  line-height: 1.6;
  font-size: 14px;
  text-align: center;
  width: 500px;
}

.submit-button {
  width: 100%;
  margin-top: 20px;
}

hr {
  border: none;
  border-top: 1px dashed #ccc;
  color: #fff;
  margin: 10px;
}

.sign-up-div {
  font-size: 15px;
}

.sign-up-text {
  margin-left: 10px;
  font-weight: 500;
  color: var(--main-color);
  cursor: pointer;
}

@media (max-width: 600px) {
  .main {
    background-color: #fff;
  }

  .login-container {
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
