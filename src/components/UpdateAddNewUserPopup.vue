<template>
  <div class="overlay">
    <div class="popup-content">
      <div class="fixed-header">
        <h3 class="title">
          {{ props.isNew ? ' 신규 사용자 등록' : '사용자 정보 수정' }}
        </h3>
        <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
          cancel
        </span>
      </div>

      <div class="scrollable-content">
        <div class="group-row">
          <div class="group">
            <label>아이디</label>
            <input
              v-model="forms.username"
              placeholder=""
              @input="validateForms"
              :readonly="!props.isNew"
            />

            <p v-if="isSubmitted && errors.username" class="input-error-message">
              {{ errors.username }}
            </p>
          </div>

          <div class="group">
            <label>이름</label>
            <input v-model="forms.name" placeholder="" @input="validateForms" />

            <p v-if="isSubmitted && errors.name" class="input-error-message">
              {{ errors.name }}
            </p>
          </div>
        </div>

        <div class="group-row">
          <div class="group">
            <label>이메일 </label>
            <input v-model="forms.email" placeholder="" @input="validateForms" />
            <p v-if="isSubmitted && errors.email" class="input-error-message">
              {{ errors.email }}
            </p>
          </div>

          <div class="group">
            <label>휴대전화</label>
            <input
              v-model="forms.phoneNumber"
              placeholder=""
              @input="validateForms"
              name="phoneNumber"
              v-cleave="{ ...cleavePatterns.phoneNumberPattern, onValueChanged }"
            />
            <p v-if="isSubmitted && errors.phoneNumber" class="input-error-message">
              {{ errors.phoneNumber }}
            </p>
          </div>
        </div>

        <div v-if="props.isNew" class="group-row">
          <div class="group">
            <label>비밀번호 </label>
            <input
              v-model="forms.password"
              placeholder=""
              @input="validateForms"
              type="password"
              autocomplete="new-password"
            />
            <p v-if="isSubmitted && errors.password" class="input-error-message">
              {{ errors.password }}
            </p>
          </div>

          <div class="group">
            <label>비밀번호 확인</label>
            <input
              v-model="forms.passwordCheck"
              placeholder=""
              type="password"
              @input="validateForms"
              autocomplete="new-password"
            />
            <p v-if="isSubmitted && errors.passwordCheck" class="input-error-message">
              {{ errors.passwordCheck }}
            </p>
          </div>
        </div>

        <div class="group-row">
          <div class="group">
            <label>국가 </label>
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
            <label>상태</label>
            <a-select
              v-model:value="forms.status"
              :style="{ width: '100%' }"
              placeholder=""
              show-search
              :options="MEMBER_STATUSES"
            >
            </a-select>
          </div>
        </div>

        <div class="roles">
          <a-checkbox
            v-for="(role, roleIndex) of userRoles"
            :key="roleIndex"
            :disabled="role.state === 'hidden'"
            class="checkbox"
            @change="checkRole(role)"
            v-model:checked="role.checked"
            >{{ role.label }}</a-checkbox
          >
        </div>

        <button class="submit" @click="registerOrUpdateUser">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watchEffect } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { MEMBER_STATUSES, COUNTRIES, USER_ROLES } from '../assets/constants'
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { useAuthenticationStore } from '@/stores/authentication'
import lodash from 'lodash'

import * as VALIDATOR from '../utils/validators'
import router from '@/router'

const emit = defineEmits(['closePopup'])

const props = defineProps({
  username: { type: String, default: null },
  isNew: { type: Boolean, default: true }
})

const userId = ref()

async function fetchMemberDetails() {
  try {
    const response = await fetchWithTokenRefresh('admin/memberDetail', {
      method: 'POST',
      body: { username: props.username }
    })
    if (!response.ok) throw 'Fetch memberDetail data error'

    const decodedResponse = await response.json()

    const info = decodedResponse?.data?.info ?? {}

    forms.username = info.username
    forms.name = info.name
    forms.email = info.email
    forms.phoneNumber = info.phone_number
    forms.country = info.country
    forms.status = info.status
    userId.value = info.id
    info.strRoles.forEach((item) => selectedRoles.value.add(item))

    handleCheckboxes()
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

//cleave value change callback
function onValueChanged(event) {
  if (event.target.name === 'phoneNumber') forms.phoneNumber = event.target.value
}

const forms = reactive({
  username: '',
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  passwordCheck: '',
  country: 'KR',
  status: 'Y'
})
const errors = reactive({
  username: null,
  name: null,
  email: null,
  phoneNumber: null,
  password: null,
  passwordCheck: null,
  country: null,
  status: null
})

const isSubmitted = ref(false)

function validateForms() {
  const res = [
    (errors.username = VALIDATOR.validateId(forms.username)),
    (errors.name = VALIDATOR.validateName(forms.name)),
    (errors.email = VALIDATOR.validateEmail(forms.email)),
    (errors.phoneNumber = VALIDATOR.validatePhoneNumber(forms.phoneNumber))
  ]

  if (props.isNew) {
    res.push((errors.password = VALIDATOR.validatePass(forms.password)))
    res.push(
      (errors.passwordCheck = VALIDATOR.validateRentryPass(forms.password, forms.passwordCheck))
    )
  }

  return res.every((value) => value === null)
}

async function registerOrUpdateUser() {
  isSubmitted.value = true
  //not all forms validated
  if (!validateForms()) return

  if (!selectedRoles.value.size > 0) {
    useSnackbarStore().show('사용자 역할을 1개 이상 선택하세요.')
    return
  }

  let registerBody = {
    username: forms.username,
    password: forms.password,
    email: forms.email,
    name: forms.name,
    country: forms.country,
    state: forms.status,
    phone_number: forms.phoneNumber,
    role: [...selectedRoles.value]
  }

  let updateBody = {
    id: userId.value,
    username: forms.username,
    name: forms.name,
    country: forms.country,
    email: forms.email,
    phone_number: forms.phoneNumber,
    status: forms.status,
    strRoles: [...selectedRoles.value]
  }

  try {
    const response = await fetchWithTokenRefresh(
      props.isNew ? 'admin/register' : 'admin/memberUpdate',
      { method: 'POST', body: props.isNew ? registerBody : updateBody }
    )

    const decodedResponse = await response.json()
    if (!response.ok) throw decodedResponse?.message ?? 'Could not add/update user data'

    useSnackbarStore().show(decodedResponse?.message ?? 'Success')
    emit('closePopup', true, props.isNew)
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}

//deep copy to not keep state when page refsheses
const userRoles = reactive(lodash.cloneDeep(USER_ROLES))
// const userRoles = reactive([...USER_ROLES])

const globalLowRoleCodes = ref(new Set([]))
const globalHighRoleCodes = ref(new Set([]))

const selectedRoles = ref(new Set([]))

function checkRole(role) {
  useSnackbarStore().hide()

  if (globalHighRoleCodes.value.has(role.code)) {
    role.checked = false
    useSnackbarStore().show('이미 선택권한의 하위권한이 선택 또는 존재합니다.')
  } else {
    role.checked ? selectedRoles.value.add(role.code) : selectedRoles.value.delete(role.code)
    handleCheckboxes()
  }
}
function handleCheckboxes() {
  globalLowRoleCodes.value.clear()
  globalHighRoleCodes.value.clear()

  //checking if ROLE_ADMIN in the selected roles
  if (selectedRoles.value.has('ROLE_ADMIN')) {
    selectedRoles.value.clear()
    selectedRoles.value.add('ROLE_ADMIN')

    for (const role of userRoles) {
      if (role.code !== 'ROLE_ADMIN') {
        role.checked = false
        role.state = 'hidden'
      }

      if (role.code === 'ROLE_ADMIN') {
        role.checked = true
        role.state = 'active'
      }
    }
    return
  }

  for (const role of userRoles) {
    //if avilable in selected
    if (selectedRoles.value.has(role.code)) {
      role.checked = true
      role.low.forEach((item) => globalLowRoleCodes.value.add(item))
      role.high.forEach((item) => globalHighRoleCodes.value.add(item))
    }
    //if not available in selected list
    else {
      role.checked = false
    }

    if (globalLowRoleCodes.value.has(role.code)) {
      role.state = 'hidden'
    } else {
      role.state = 'active'
    }
  }
}

function checkSelfRoles() {
  const myRoles = useAuthenticationStore().userRoles
  if (myRoles?.includes('ROLE_SUPER')) {
    userRoles[0].state = 'active'
  }
}

onMounted(() => {
  if (props.username) fetchMemberDetails()
  checkSelfRoles()
})
</script>

<style scoped>
.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  max-width: 700px;
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
  overflow-y: auto;
  gap: 20px;
}

.group-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.group {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  width: 100%;
}

.roles {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  margin-top: 20px;
}

.checkbox {
  max-width: 200px;
  padding: 10px;
  border-radius: 4px;
  user-select: none;
}

.checkbox:hover {
  background-color: #e9e9e9;
}

.submit {
  align-self: center;
  width: auto;
  min-height: 45px;
  min-width: 200px;
  margin: 20px 0;
}

@media (max-width: 600px) {
  .popup-content {
    height: 100%;
  }

  .group-row {
    flex-flow: column;
  }

  .group {
    width: 100% !important;
  }
}
</style>
