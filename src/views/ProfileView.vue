<template>
  <div class="container">
    <div class="title">가입신청/고객정보</div>
    <div class="row">
      <div class="groups">
        <label>판매점 아이디 </label>
        <input v-model="pcode" placeholder="SM00000" readonly />
      </div>

      <div class="groups">
        <label>판매점명</label>
        <input v-model="pname" placeholder="" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label for="contact">대표자명</label>
        <input id="contact" :value="data.contractor" placeholder="" readonly />
      </div>

      <div class="groups">
        <label>사업자번호</label>
        <input :value="data.business_num" placeholder="" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label for="contact">연락처</label>
        <input id="contact" v-model="contact" placeholder="" readonly />
      </div>

      <div class="groups">
        <label>이메일</label>
        <input v-model="email" placeholder="" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label>매장주소</label>
        <input v-model="storeAddress" placeholder="" readonly />
      </div>

      <div class="groups">
        <label>매장상세주소</label>
        <input v-model="storeDetailAddress" placeholder="" readonly />
      </div>
    </div>

    <div class="row">
      <div class="groups">
        <label>가입일자 </label>
        <input v-model="contractDate" placeholder="" readonly />
      </div>

      <div class="groups">
        <label>상태 </label>
        <input v-model="status" placeholder="" readonly />
      </div>
    </div>

    <div class="title">판매자 서명</div>

    <SignImageRowContainer type="self" :placeholder="data.contractor" @updated="updatePads" title="" />

    <button @click="submit">사인 저장</button>
  </div>
</template>

//
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSnackbarStore } from '../stores/snackbar'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import SignImageRowContainer from '../components/SignImageRowContainer.vue'

import { useNameSignDataStore } from '../stores/name-sign-data-store'

const signStore = useNameSignDataStore()

const data = ref({})

const pname = ref('')
const pcode = ref('')
const contact = ref('')
const email = ref('')
const storeAddress = ref('')
const storeDetailAddress = ref('')
const contractDate = ref('')
const status = ref('')

const nameImageData = ref(null)
const signImageData = ref(null)

const updatePads = ({ name, sign, type }) => {
  nameImageData.value = name
  signImageData.value = sign
}

async function fetchProfileData() {
  try {
    const response = await fetchWithTokenRefresh('agent/partnerInfo', {
      method: 'GET',
      // body: JSON.stringify(requestModel)
    })
    if (response.ok) {
      const decodedResponse = await response.json()
      if (decodedResponse.data && decodedResponse.data.info) {
        let info = decodedResponse.data.info
        data.value = info

        pname.value = info.partner_nm
        pcode.value = info.partner_cd
        contact.value = info.phone_number
        email.value = info.email
        storeAddress.value = info.address
        storeDetailAddress.value = info.dtl_address
        contractDate.value = new Date(info.apply_date).toLocaleString()
        status.value = info.status_nm
        signStore.save(info.partner_seal, info.partner_sign)
      }
    } else {
      throw new Error('Fetch profile data error')
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

//FORM DATA REQUEST
const formData = new FormData()

async function submit() {
  //adding sign images data
  formData.set('partner_sign', nameImageData.value)
  formData.set('partner_seal', signImageData.value)

  // //checks if all values are filled

  try {
    const response = await fetchWithTokenRefresh('agent/setActSign', {
      method: 'POST',
      body: {
        partner_sign: nameImageData.value,
        partner_seal: signImageData.value,
      },
    })

    if (response.ok) {
      const decodedResponse = await response.json()
      useSnackbarStore().showSnackbar(decodedResponse.message)
    }
  } catch (error) {
    useSnackbarStore().showSnackbar(error.toString())
  }
}

onMounted(fetchProfileData)

onUnmounted(signStore.clear)
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

button {
  max-width: 200px;
  margin-top: 20px;
  height: 45px;
  margin-bottom: 400px;
}

@media (max-width: 600px) {
  .row {
    flex-direction: column;
    width: 100%;
    align-items: center;
  }
}
</style>
