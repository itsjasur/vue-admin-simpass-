<template>
  <div class="sign-container">
    <!-- partner sign container -->
    <p class="sign-title">{{ props.title }}</p>
    <div v-if="!padData" @click="isAgreePadOpen = true" class="singImagesBox">
      <span class="inner-icon material-symbols-outlined"> stylus_note </span>
    </div>
    <div v-else class="singImagesBox">
      <span @click="deletePads()" class="delete-icon material-symbols-outlined"> delete </span>
      <div class="images-row">
        <img class="image" :src="padData" alt="오류 이미지" @error="deletePads" />
      </div>
    </div>
    <p v-if="props.errorMessage" class="input-error-message">{{ props.errorMessage }}</p>
  </div>

  <AgreePadPopup v-if="isAgreePadOpen" @savePad="savePads" @closePopup="isAgreePadOpen = false" />
</template>

<script setup>
import { ref } from 'vue'
import SignPadPopup from './SignPadPopup.vue'
import AgreePadPopup from './AgreePadPopup.vue'

const props = defineProps({
  errorMessage: { type: String, default: null },
  title: { type: String, default: 'Sign title' },
  type: { type: String, default: 'self' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['updated']) // emits with a data object

const isAgreePadOpen = ref(false)
const padData = ref(null)

const deletePads = () => {
  padData.value = null
  emit('updated', { data: null }) // emits cleared data
}

const savePads = (data) => {
  padData.value = data
  emit('updated', { data }) // emits saved data
}
</script>

<style scoped>
.sign-title {
  line-height: 1;
  padding: 0;
  margin: 0;
  margin-bottom: 7px;
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

  background-color: #fff;
}
.singImagesBox .images-row {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
  gap: 5px;
  box-sizing: border-box;
  padding: 5px;
  align-items: center;
}
.singImagesBox .image {
  width: 100%;
  height: 100%;
  min-width: 100px;
  max-height: 100px; /* Set a maximum height limit if needed */
  object-fit: contain;
  background-color: #fbfbfb;
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
</style>
