<template>
  <div class="container">
    <div class="title">나의 정보</div>
    <div class="row">
      <div class="groups">
        <label>아이디 </label>
        <input :value="data.username" readonly />
      </div>

      <div class="groups">
        <label>이름</label>
        <input :value="data.name" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label>이메일</label>
        <input :value="data.email" readonly />
      </div>

      <div class="groups">
        <label>휴대전화</label>
        <input :value="data.phone_number" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label>국가</label>
        <input :value="data.country_nm" readonly />
      </div>

      <div class="groups">
        <label>상태</label>
        <input :value="data.status_nm" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label>시작일자 </label>
        <input :value="data.from_date" readonly />
      </div>

      <div class="groups">
        <label>종료일자 </label>
        <input :value="data.expire_date" readonly />
      </div>
    </div>

    <div>
      <label>권한</label>
      <div class="roles-row">
        <div v-for="(role, index) in data.roles_value" :key="index" class="card">
          {{ role.label }}
        </div>
      </div>
    </div>
  </div>
  <hr />

  <div class="password-change-container">
    <div class="title">비밀번호 변경</div>
    <div class="groups" style="max-width: 400px">
      <label>현재 비밀번호 </label>
      <input type="password" v-model="oldPassword" placeholder="비밀번호" />
      <p v-if="isSubmitted && !oldPassword" class="input-error-message">
        현재 비밀번호를 입력해주세요.
      </p>
    </div>
    <div class="groups" style="max-width: 400px">
      <label>새 비밀번호 </label>
      <input type="password" v-model="newPassword" placeholder="비밀번호" />
      <p v-if="isSubmitted && !newPassword" class="input-error-message">
        새 비밀번호를 입력해주세요.
      </p>
    </div>
    <div class="groups" style="max-width: 400px">
      <label>현재 비밀번호 확인 </label>
      <input type="password" v-model="newPasswordCheck" placeholder="비밀번호" />
      <p v-if="isSubmitted && !newPasswordCheck" class="input-error-message">
        새 비밀번호를 다시 입력해주세요.
      </p>
      <p
        v-if="isSubmitted && newPassword && newPasswordCheck && newPassword !== newPasswordCheck"
        class="input-error-message"
      >
        비밀번호가 일치하지 않습니다.
      </p>
    </div>

    <button @click="changePassword" :disabled="isLoading">
      <LoadingSpinner v-if="isLoading" height="20px" color="#ffffff" />
      <span v-else> 비밀번호 업데이트 </span>
    </button>

    <div class="password-change-rules">
      <div class="rule-title">강력한 비밀번호를 얻으려면 이 가이드를 따르세요.</div>

      <ul>
        <li>특수 문자 1개</li>
        <li>최소 8글자</li>
        <li>숫자 1개(2개 권장)</li>
        <li>자주 바꾸세요</li>
      </ul>
    </div>
  </div>
</template>

//
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'

const snackbar = useSnackbarStore()

const data = ref({})

const oldPassword = ref(null)
const newPassword = ref(null)
const newPasswordCheck = ref(null)

const isSubmitted = ref(false)
const isLoading = ref(false)

async function fetchProfileData() {
  try {
    const response = await fetchWithTokenRefresh('admin/myInfo', { method: 'GET' })

    if (!response.ok) throw 'Fetch profile data error'

    const decodedResponse = await response.json()

    if (decodedResponse?.data && decodedResponse?.data?.info) {
      let info = decodedResponse.data.info
      data.value = info
    }
  } catch (error) {
    snackbar.show(error.toString())
  }
}

async function changePassword() {
  isSubmitted.value = true

  if (!oldPassword.value || !newPassword.value) {
    snackbar.show('이전 비밀번호와 새 비밀번호를 입력하세요.')
    return
  }
  if (newPassword.value !== newPasswordCheck.value) {
    snackbar.show('비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    isLoading.value = true

    const response = await fetchWithTokenRefresh('admin/myPassword', {
      method: 'POST',
      body: {
        id: data.value.id,
        username: data.value.username,
        password: oldPassword.value,
        new_password: newPassword.value
      }
    })

    const decodedResponse = await response.json()
    snackbar.show(decodedResponse?.message ?? 'Password change error')
  } catch (error) {
    snackbar.show(error.toString())
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchProfileData)
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin-top: 20px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 30px;
  padding: 0 20px;
}

.groups {
  width: 100%;
}

.row {
  display: flex;
  width: 100%;
  gap: 20px;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  margin: 0;
  padding: 0;
}

.roles-row {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}

.card {
  min-height: 40px;
  width: auto;
  padding: 0 20px;
  text-align: center;
  align-content: center;
  border: 1px solid #ccc;
}

.password-change-container {
  display: flex;
  flex-flow: column;
  gap: 20px;
  padding: 0 20px;

  margin-bottom: 150px;
}

hr {
  border: none;
  border-top: 5px solid #e8e8e8;
  color: #fff;
  /* width: auto; */
  margin: 40px 20px;
}

button {
  max-width: 200px;
  height: 45px;
  margin: 20px 0;
}

.password-change-rules {
  display: flex;
  flex-flow: column;
  gap: 10px;
}
.password-change-rules .rule-title {
  color: #4f4f4f;
}

.password-change-rules ul {
  padding-left: 15px;
  margin: 0;
  box-sizing: border-box;
  color: #4f4f4f;
}

@media (max-width: 600px) {
  .row {
    flex-direction: column;
    width: 100%;
    align-items: center;
  }

  .groups {
    max-width: 100% !important;
  }
}
</style>
