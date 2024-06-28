<template>
  <div class="overlay">
    <div class="popup-content">
      <span @click="$emit('closePopup')" class="material-symbols-outlined close-button"> cancel </span>

      <div class="scrollable-content">
        <div class="main-note" style="font-size: 16px">
          <div style="font-weight: 600; font-size: 18px">인증을 진행해 주세요</div>
          <div>입력하신 휴대폰으로인증 요청 메시지를 보냈습니다.</div>
          <div>앱에서 인증을 진행해주세요.</div>
        </div>

        <div class="steps">
          <div class="step">
            <img
              v-if="props.data?.idCertType === 'KAKAO'"
              class="circle-cont"
              src=" ../assets/logos/kakao.png"
              alt="kakao"
            />
            <img v-else class="circle-cont" src=" ../assets/logos/pass.png" alt="KAKAO" />

            <span>STEP 01</span>
            <span>앱에서 인증요청 메시지확인</span>
          </div>
          <span class="material-symbols-outlined next-icon"> arrow_forward_ios </span>
          <div class="step">
            <span class="material-symbols-outlined circle-cont"> person_check </span>
            <span>STEP 02</span>
            <span>앱에서 인증서 인증진행(비밀번호 등)</span>
          </div>

          <span class="material-symbols-outlined next-icon"> arrow_forward_ios </span>
          <div class="step">
            <span class="material-symbols-outlined circle-cont step3"> password </span>
            <span>STEP 03</span>
            <span> 앱 인증완료 후, 하단의 인증완료 클릭 </span>
          </div>
        </div>

        <div class="footer-note">
          <template v-if="props.data?.idCertType === 'KAKAO'">
            <span>문제발생시 조치방법</span>
            <span>
              1. 카카오인증서 이용에 문제가 있는 경우<a
                href="https://cs.kakao.com/helps?service=179&locale=ko"
                target="_blank"
              >
                [고객센터 도움말] </a
              >에서 해결방법을 찾아보세요.
            </span>

            <span
              >2. 문제가 지속되면
              <a href="https://cs.kakao.com/requests?service=179&locale=ko" target="_blank"> [고객센터 문의하기] </a>
              또는 <a href="https://pf.kakao.com/_SzxixaC" target="_blank"> [상담톡채널] </a> 채팅하기를 통해 문의해
              주세요.</span
            >
          </template>

          <template v-else>
            <span>인증요청(알림)이 휴대폰으로오지 않았다면 아래 순서로 확인해 주세요.</span>
            <span>
              1. <strong>[PASS 앱 실행>홈화면 또는 인증서 메뉴]</strong> 에서 인증 요청 내용을 확인할 수 있습니다.
            </span>
            <span>2. PASS 앱 설치 확인 및 알림 수신동의 되어있는지 확인해 주세요. </span>
            <span>3. 문제가 계속된다면 <strong>[PASS인증서 고객센터:1800-4273] </strong> 로 연략해 주세요.</span>
          </template>
        </div>

        <button @click="submit" :disabled="isLoading">
          <template v-if="isLoading">
            <LoadingSpinner height="20px" color="#ffffff" />
          </template>
          <template v-else>
            <span>인증완료</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { ref, onMounted, onUnmounted } from 'vue'
import { useSignUpstore } from '@/stores/signup-store'
import LoadingSpinner from '../components/Loader.vue'

import { useWarningStore } from '../stores/warning'
const warningStore = useWarningStore()
const signUpStore = useSignUpstore()

const isLoading = ref(false)

function openWarning() {
  warningStore.open('인증 미완료', [
    '본인인증 전자서명이 완료되지 않았습니다.',
    'PASS앱에서 인증서 전자서명을 완료한 이후에 다시 시도해주세요.',
  ])
}

const emit = defineEmits(['closePopup'])

const props = defineProps({
  data: { type: Object, required: true },
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') emit('closePopup')
}

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

async function submit() {
  try {
    isLoading.value = true

    const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'auth/chkSign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: props.data?.name,
        birthday: props.data?.birthday.replace(/-/g, ''),
        cert_phone_number: props.data?.phoneNumber.replace(/-/g, ''),
        id_cert_type: props.data?.idCertType,
        receipt_id: props.data?.receiptId,
      }),
    })

    // if (!response.ok) throw 'Request error'
    const data = await response.json()

    // if (true) {
    if (data.result === 'SUCCESS') {
      //this closes the popup and updates the signup step in the store
      emit('closePopup')
      signUpStore.next('secondary', props.data)
      return
    }

    if (data?.result === 'WAIT') {
      warningStore.open('인증 미완료', [data?.message])
      return
    }

    if (data?.result === 'EXPIRE' || data?.result === 'ERROR' || data?.result === 'BAD') {
      warningStore.open('인증서 요청 만료', [data?.message])
      emit('closePopup')
      signUpStore.clear()
      return
    }
  } catch (err) {
    useSnackbarStore().showSnackbar(err.toString())
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.552);
  position: fixed;
  padding: 20px;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  max-width: 1000px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  max-height: 90vh;
}

.scrollable-content {
  width: 100%;
  display: flex;
  flex-flow: column;
  gap: 40px;
  align-items: center;
  max-height: 90vh;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  align-self: flex-end;
  color: #333;
  font-size: 30px;
  cursor: pointer;
  padding: 5px;
  border-radius: 30px;
  background-color: #ffffff71;
}
.main-note {
  margin-top: 40px;
  text-align: center;
  display: flex;
  flex-flow: column;
  gap: 10px;
  width: 80%;
}

.steps {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 80%;
  font-size: 15px;
}

.step {
  display: flex;
  flex-flow: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  width: 30%;
}

.next-icon {
  color: #ccc;
}

.circle-cont {
  height: 65px;
  width: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30px;
  background-color: #5ba7ee;
}

.step3 {
  font-variation-settings: 'FILL' 1;
  background-color: #2ec12c;
}

.footer-note {
  width: 80%;
  border-radius: 8px;
  background-color: #f1f8fd;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 10px;
  font-size: 15px;
}
.footer-note a {
  text-decoration: none;
  color: rgb(0, 32, 147);
  font-weight: 600;
}
button {
  height: 45px;
  width: 80%;
  max-width: 400px;
  margin-bottom: 40px;
}

@media (max-width: 600px) {
  .steps {
    flex-flow: column;
    width: none;
  }

  .steps .next-icon {
    transform: rotate(90deg);
  }

  .step {
    width: 80%;
  }
}
</style>
