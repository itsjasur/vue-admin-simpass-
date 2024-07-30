<template>
  <div class="container">
    <div class="forms">
      <div class="title">가입신청/고객정보</div>
      <div class="group" style="max-width: 500px">
        <label>가입자명</label>
        <input
          v-model="registrer"
          placeholder="홍길동"
          @input="registrer = registrer.toUpperCase()"
        />
        <p v-if="!registrer && submitted" class="input-error-message">가입자명 입력하세요.</p>
      </div>

      <div class="group" style="max-width: 200px">
        <label>생년월일</label>
        <input
          v-model="registrerBirthday"
          placeholder="91-01-31"
          name="birthday"
          v-cleave="{ ...cleavePatterns.birthdayPattern, onValueChanged }"
        />
        <p v-if="!registrerBirthday && submitted" class="input-error-message">
          생년월일 입력하세요.
        </p>
      </div>

      <div class="group" style="max-width: 200px">
        <label>개통번호외 연락번호</label>
        <input
          v-model="registrerPhoneNumber"
          placeholder="010-0000-0000"
          name="phoneNumber"
          v-cleave="{ ...cleavePatterns.phoneNumberPattern, onValueChanged }"
        />
        <p v-if="!registrerPhoneNumber && submitted" class="input-error-message">
          연락처 입력하세요.
        </p>
      </div>

      <div class="group" style="max-width: 500px">
        <label>주소</label>
        <input
          @click="addressPopup.active = true"
          v-model="address"
          placeholder="서울시 구로구 디지털로33길 28"
          readonly
        />
        <p v-if="!address && submitted" class="input-error-message">주소 입력하세요.</p>
      </div>

      <div class="group" style="max-width: 300px">
        <label>상세주소</label>
        <input v-model="addressDetails" placeholder="1001호" />
      </div>

      <div class="group" style="max-width: 300px">
        <label>USIM 일련번호</label>
        <input v-model="usimNumber" placeholder="0000000" />
        <p v-if="!usimNumber && submitted" class="input-error-message">USIM 일련번호 입력하세요.</p>
      </div>
    </div>

    <div class="upload-docs">
      <div class="title">증빙자료첨부</div>

      <!-- uploads images -->
      <input
        id="file-input"
        @change="handleFileUpload"
        type="file"
        class="file-input"
        accept="image/*"
        multiple
      />

      <div class="upload-images-row">
        <label for="file-input" class="upload-images-box">
          <span class="inner-icon material-symbols-outlined"> add </span>
          <p>이미지 업로드</p>
        </label>

        <div v-for="(image, index) in supportedImages" :key="index" class="upload-images-box">
          <img :src="image" :alt="index" />
          <span @click="deleteDocImages(index)" class="delete-icon material-symbols-outlined">
            delete
          </span>
        </div>
      </div>
    </div>

    <!-- checks and enables sign container -->
    <a-checkbox class="checkbox" v-model:checked="registererSignChecked"
      >신청서 프린트 인쇄후 서명/사인 자필</a-checkbox
    >

    <!-- partner sign container -->
    <div v-if="!registererSignChecked">
      <SignImageRowContainer
        type="self"
        :placeholder="registrer"
        @updated="updatePads"
        title="가입자서명"
      />
      <p v-if="!nameImageData && !signImageData && submitted" class="input-error-message">
        판매자서명을 하지 않았습니다.
      </p>
    </div>

    <button class="submit" @click="submit" :disabled="isLoading">
      <LoadingSpinner v-if="isLoading" height="20px" color="#ffffff" />
      <span v-else> 접수하기</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as cleavePatterns from '../utils/cleavePatterns'
import { useSearchaddressStore } from '../stores/select-address-popup'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import SignImageRowContainer from '../components/SignImageRowContainer.vue'
import { usePrintablePopup } from '../stores/printable-popup'
import LoadingSpinner from '../components/Loader.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const addressPopup = useSearchaddressStore()
const printablePopup = usePrintablePopup()

const registrer = ref('')
const registrerBirthday = ref('')
const registrerPhoneNumber = ref('')
const address = ref('')
const addressDetails = ref('')
const usimNumber = ref('')

const submitted = ref(false)

//sign checker
const registererSignChecked = ref(false)
const nameImageData = ref(null)
const signImageData = ref(null)

const updatePads = ({ name, sign, type }) => {
  nameImageData.value = name
  signImageData.value = sign
}

//cleave value change callback
function onValueChanged(event) {
  if (event.target.name === 'phoneNumber') registrerPhoneNumber.value = event.target.value

  if (event.target.name === 'birthday') {
    const today = new Date()
    const currYear = today.getFullYear() % 100

    let formattedValue = event.target.value
    if (event.target.rawValue.length === 6) {
      const [yy, mm, dd] = formattedValue.split('-')
      if (yy > currYear) formattedValue = '19' + formattedValue
      else formattedValue = '20' + formattedValue

      const date = new Date(formattedValue)
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')

      registrerBirthday.value = `${year}-${month}-${day}`
    }
  }
}

watch(
  () => addressPopup.address,
  () => {
    address.value = addressPopup.address
    addressDetails.value = addressPopup.buildingName
  }
)

watch(
  () => printablePopup.active,
  (newV, oldV) => {
    if (newV === false && oldV === true) router.push('/')
  }
)

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

//FORM DATA REQUEST
const formData = new FormData()
const isLoading = ref(false)

async function submit() {
  submitted.value = true
  //adding files
  for (const file of fileObjects.value) {
    formData.set('attach_files[]', file)
  }

  //adding sign images data
  formData.set('apply_sign', nameImageData.value)
  formData.set('apply_seal', signImageData.value)

  formData.set('name', registrer.value)
  formData.set('birthday', registrerBirthday.value)
  formData.set('contact', registrerPhoneNumber.value)
  formData.set('address', address.value + addressDetails.value)
  formData.set('usim_no', usimNumber.value)

  // //checks if all values are filled
  const checklist = [
    registrer.value,
    registrerBirthday.value,
    registrerPhoneNumber.value,
    address.value,
    usimNumber.value
  ]

  //form signs
  if (!registererSignChecked.value)
    checklist.push([nameImageData.value, signImageData.value].every(Boolean))

  if (checklist.every(Boolean)) {
    try {
      isLoading.value = true
      const response = await fetchWithTokenRefresh('agent/rentalApply', {
        method: 'POST',
        body: formData
      })

      const decodedResponse = await response.json()

      const base64Images = decodedResponse?.data?.apply_forms_list ?? []
      if (base64Images?.length > 0) usePrintablePopup().open(base64Images)

      useSnackbarStore().show(decodedResponse?.message ?? 'Update error')
    } catch (error) {
      useSnackbarStore().show(error.toString())
    } finally {
      isLoading.value = false
    }
  } else {
    useSnackbarStore().show('채워지지 않은 필드가 있습니다.')
  }
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 30px;
  padding: 20px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  /* margin-bottom: 20px; */
  margin-top: 10px;
  width: 100%;
}
.forms {
  width: 100%;
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  margin-top: 10px;
}

.group {
  width: 100%;
}

.upload-docs {
  width: 100%;
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  margin-top: 10px;
}

.file-input {
  display: none;
}

.upload-images-row {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}
.upload-images-box {
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

.upload-images-box img {
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
  background-color: #fff;
  padding: 2px;
  border-radius: 20px;
}
.inner-icon {
  font-size: 28px;
  color: var(--main-color);
}

.upload-images-box img:hover {
  opacity: 0.2;
}

.singImagesBox {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  max-width: 400px;
  width: 100%;
  height: 100px;
  border-radius: 5px;
  border: 1px dashed var(--main-color);
  cursor: pointer;
  position: relative;
}
.singImagesBox .images-row {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
  gap: 5px;
  box-sizing: border-box;
  padding: 5px;
}
.singImagesBox .image {
  width: 100%;
  height: auto;
  min-width: 100px;
  max-height: 100px; /* Set a maximum height limit if needed */
  /* object-fit: contain;  */
  background-color: #fbfbfb;
}
.sign-title {
  line-height: 1;
  padding: 0;
  margin: 0;
  margin-bottom: 7px;
}

button {
  max-width: 200px;
  margin-top: 20px;
  height: 45px;
  margin-bottom: 400px;
}
</style>
