<template>
  <div class="overlay">
    <div class="popup-content">
      <span @click="$emit('closePopup')" class="material-symbols-outlined close-button"> cancel </span>

      <p class="title">서명(Name)란</p>
      <div class="image-container">
        <img
          ref="backgroundImage"
          src="../assets/umobile_agree_seal.png"
          alt="umobi agree image"
          @load="initializePad"
        />
        <canvas ref="drawingCanvas" @mousedown="onBegin" @mouseup="onEnd"></canvas>
      </div>

      <div class="pen-style">
        <span class="title">펜 잉크 멀미: {{ signPenSickness }} </span>
        <a-slider v-model:value="signPenSickness" :min="1" :max="5" :step="0.5" />
      </div>

      <div class="buttons">
        <button class="button clear" @click="clearCanvase">지우기</button>
        <button class="button save" @click="savePad">서명 저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import SignaturePad from 'signature_pad'
import { useSnackbarStore } from '../stores/snackbar'

const emit = defineEmits(['savePad', 'closePopup'])

const drawingCanvas = ref(null)
const pad = ref(null)
const signPenSickness = ref(3)

watch(signPenSickness, (newValue) => {
  if (pad.value) {
    pad.value.off()
    pad.value = null
  }
  initializePad()
})

onMounted(() => {
  document.addEventListener('keydown', keydownHandle)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownHandle)
})

function keydownHandle(event) {
  if (event.key === 'Escape') emit('closePopup')
}

const initializePad = () => {
  const canvas = drawingCanvas.value
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  canvas.width = canvas.offsetWidth * ratio
  canvas.height = canvas.offsetHeight * ratio
  canvas.getContext('2d').scale(ratio, ratio)

  pad.value = new SignaturePad(canvas, {
    velocityFilterWeight: 0.1,
    minWidth: signPenSickness.value,
    maxWidth: signPenSickness.value,
    throttle: 1,
    minPointDistance: 1,
    dotSize: undefined,
    penColor: 'black',
    onBegin: onBegin,
    onEnd: onEnd,
    backgroundColor: 'rgba(0,0,0,0)',
  })
}

const onBegin = () => {
  pad.value.on()
}

const onEnd = () => {
  pad.value.off()
}

const clearCanvase = () => {
  pad.value.clear()
}

const savePad = () => {
  if (pad.value.isEmpty()) {
    useSnackbarStore().showSnackbar('먼저 서명을 해주세요.')
  } else {
    const padData = pad.value.toDataURL()
    emit('savePad', padData, padData)
    emit('closePopup')
  }
}
</script>

<style scoped>
.overlay {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  background-color: rgba(0, 0, 0, 0.552);
  padding: 20px;
  overflow-y: scroll;
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  overflow: auto;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-flow: column;
  gap: 20px;
  position: relative;
}

.image-container {
  position: relative;
}

.image-container img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none !important;
}

canvas {
  position: absolute;
  border-radius: 3px;
  background-color: #00000012;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.pen-style {
  margin-top: 10px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 30px;
}

.title {
  font-weight: 600;
  line-height: 1;
  margin-bottom: 10px;
}

.buttons {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
  justify-content: end;
}

.button {
  min-width: 100px;
  height: 45px;
}

.clear {
  background-color: #8d8d8d;
}
.save {
  background-color: var(--main-color);
}

@media (max-width: 600px) {
  .signCanvas {
    width: 100%;
  }
}
</style>
