<template>
  <div class="sign_seal_container">
    <p class="sign_title">{{ props.title }}</p>
    <div class="group">
      <div class="image_container sign">
        <span v-if="!agreePadData" class="edit_icon material-symbols-outlined" @click="showPopup()"> stylus_note </span>
        <span v-else class="delete_icon material-symbols-outlined" @click="deletePad('sign')"> delete </span>
        <img v-if="agreePadData" class="data_image" :src="agreePadData" alt="서명 오류" @error="agreePadData = null" />
      </div>
    </div>

    <div class="input-error-message" v-if="errorMessage">{{ errorMessage }}</div>
  </div>

  <GlobalPopupWithOverlay ref="popupRef">
    <AgreePadPopupContent @closePopup="closePopup" @savePad="savePadData" />
  </GlobalPopupWithOverlay>
</template>

<script setup>
import { ref } from 'vue'
import GlobalPopupWithOverlay from './GlobalPopupWithOverlay.vue'
import AgreePadPopupContent from './AgreePadPopupContent.vue'

const props = defineProps({
  errorMessage: { type: String, default: null },
  title: { type: String, default: 'Sign title' }
})
const emits = defineEmits(['updateAgreePadData'])

const popupRef = ref(null)

const agreePadData = ref()

const showPopup = () => {
  popupRef.value.showPopup()
}

const closePopup = () => {
  popupRef.value.closePopup()
}

function savePadData(data) {
  agreePadData.value = data
  emits('updateAgreePadData', agreePadData.value)
}

function deletePad(pfor) {
  agreePadData.value = null
  emits('updateAgreePadData', agreePadData.value)
}
</script>

<style scoped>
.sign_title {
  width: 100%;
  padding: 0;
  margin: 0;
  margin-bottom: 5px;
  line-height: 1;
  font-weight: 600;
}

.sign_seal_container {
  display: flex;
  flex-flow: wrap;
  gap: 10px;
}

.group_title {
  font-size: 13px;
  margin-bottom: 2px;
}

.image_container {
  border-radius: 5px;
  border: 1px dashed var(--main-color);
  box-sizing: border-box;
  height: 70px;
  background-color: #ffffff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image_container.no_data {
  border-color: #ff3535;
}

.image_container.sign {
  width: 300px;
}

.delete_icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #ff3535 !important;
  cursor: pointer !important;
  background-color: #e4e4e4;
  padding: 2px;
  border-radius: 20px;
  font-size: 22px;
}

.edit_icon {
  color: var(--main-color);
  cursor: pointer;
  font-size: 24px;
  padding: 10px;
  border-radius: 50px;
}

.data_image {
  height: 100%;
  width: 100%;
  /* object-fit: contain; */
}

.input-error-message {
  margin-top: -5px;
  width: 100%;
}
</style>
