<template>
  <div ref="fullscreenElement" class="signpad_main">
    <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
      cancel
    </span>

    <div class="signpad_main_content">
      <div class="buttons">
        <button class="button clear" @click="clear">지우기</button>
        <button class="button save" @click="save">저장</button>
      </div>

      <div class="pen_style">
        <span class="pen_style_title">펜 잉크 멀미: {{ signPenSickness }} </span>
        <a-slider v-model:value="signPenSickness" :min="1" :max="8" :step="1" />
      </div>

      <div
        class="canvas_container"
        :style="{ maxWidth: props.popupFor === 'sign' ? '700px' : '500px' }"
      >
        <span class="overlay-text" :style="nameStyle">{{ overlayText }}</span>
        <canvas ref="signatureCanvas" class="signature_pad"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import SignaturePad from 'signature_pad'

const fullscreenElement = ref(null)
const signPenSickness = ref(3)
const signatureCanvas = ref(null)
let padData = null

const props = defineProps({
  overlayText: { type: String, default: '' },
  popupFor: { type: String, required: true }
})

const emit = defineEmits(['closePopup', 'savePad'])

watch(signPenSickness, (newValue) => {
  if (padData) {
    padData.minWidth = newValue
    padData.maxWidth = newValue
  }
})

const nameStyle = ref()

const length = props?.overlayText?.length ?? 0

const setNameStyle = () => {
  const screenWidth = window.innerWidth
  if (screenWidth <= 768) {
    nameStyle.value = {
      fontSize: '5vw',
      letterSpacing: '2px'
    }

    if (length <= 4) {
      nameStyle.value = {
        fontSize: '22vw',
        letterSpacing: '12px'
      }
    }

    if (length > 4 && length < 20) {
      nameStyle.value = {
        fontSize: '11vw',
        letterSpacing: '5px'
      }
    }
    if (length >= 20 && length < 40) {
      nameStyle.value = {
        fontSize: '8.5vw',
        letterSpacing: '3px'
      }
    }
  }

  if (screenWidth > 768) {
    nameStyle.value = {
      fontSize: '40px',
      letterSpacing: '10px'
    }

    if (length <= 4) {
      nameStyle.value = {
        fontSize: '180px',
        letterSpacing: '10px'
      }
    }

    if (length > 4 && length < 20) {
      nameStyle.value = {
        fontSize: '80px',
        letterSpacing: '5px'
      }
    }
    if (length >= 20 && length < 40) {
      nameStyle.value = {
        fontSize: '60px',
        letterSpacing: '5px'
      }
    }
  }
}

const initializeSignaturePad = () => {
  setNameStyle()

  const canvas = signatureCanvas.value
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  canvas.width = canvas.offsetWidth * ratio
  canvas.height = canvas.offsetHeight * ratio
  canvas.getContext('2d').scale(ratio, ratio)

  padData = new SignaturePad(canvas, {
    velocityFilterWeight: 0.1,
    minWidth: 3,
    maxWidth: 3,
    throttle: 1,
    minPointDistance: 1,
    dotSize: undefined,
    penColor: 'black',
    backgroundColor: 'rgba(0,0,0,0)'
  })
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

onMounted(() => {
  if (!isIOS && !document.fullscreenElement) {
    fullscreenElement.value.requestFullscreen()
  }
  window.addEventListener('resize', initializeSignaturePad)
  initializeSignaturePad()
})

onUnmounted(() => {
  window.removeEventListener('resize', initializeSignaturePad)
})

const clear = () => {
  if (padData) padData.clear()
}

const save = async () => {
  if (padData.isEmpty()) {
    useSnackbarStore().show('먼저 서명을 해주세요.')
  } else {
    const padDataUrl = await padData.toDataURL()
    emit('savePad', padDataUrl)
    emit('closePopup')
  }
}
</script>

<style scoped>
.signpad_main {
  width: 100%;
  height: 100%;
  background-color: #fff;

  position: relative;
}

.signpad_main_content {
  height: 100%;
  width: 100%;

  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;

  /* background-color: rgb(149, 137, 86); */
}

.signpad_main_content .buttons {
  display: flex;
  flex-flow: row;
  gap: 20px;
  margin-bottom: 15px;
}

.signpad_main_content .button.clear {
  min-width: 100px;
}
.signpad_main_content .button.save {
  min-width: 100px;
  background-color: var(--main-color);
}

.pen_style {
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.pen_style_title {
  font-size: 13px;
  width: auto;
}

.ant-slider {
  width: 200px;
  margin: 0;
}

.canvas_container {
  display: flex;
  height: 200px;
  width: 90%;
  justify-content: center;
  position: relative;

  align-items: center;

  padding: 10px;
  box-sizing: border-box;
}

canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #00000012;
  border-radius: 6px;
}

.overlay-text {
  pointer-events: none !important;
  white-space: normal; /* Allow text to wrap */
  box-sizing: border-box;
  overflow: hidden;
  color: #00000010; /* Set the desired text color */
  font-weight: 900;
}
</style>
