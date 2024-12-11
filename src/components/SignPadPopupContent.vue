<template>
  <div ref="fullscreenElement" class="signpad_main">
    <span @click="$emit('closePopup')" class="material-symbols-outlined close-button"> cancel </span>

    <div class="signpad_main_content">
      <div class="buttons">
        <button class="button clear" @click="clear">지우기</button>
        <button class="button save" @click="save">저장</button>
      </div>

      <div class="pen_style">
        <span class="pen_style_title">펜 잉크 멀미: {{ signPenSickness }} </span>
        <a-slider v-model:value="signPenSickness" :min="1" :max="8" :step="1" />
      </div>

      <div class="canvas_container" :style="{ maxWidth: props.popupFor === 'sign' ? '700px' : '500px' }">
        <canvas ref="signatureCanvas" class="signature_pad"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
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

const initializeSignaturePad = () => {
  const canvas = signatureCanvas.value
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  canvas.width = canvas.offsetWidth * ratio
  canvas.height = canvas.offsetHeight * ratio
  canvas.getContext('2d').scale(ratio, ratio)

  padData = new SignaturePad(canvas, {
    velocityFilterWeight: 0.1,
    minWidth: signPenSickness.value,
    maxWidth: signPenSickness.value,
    throttle: 1,
    minPointDistance: 1,
    dotSize: undefined,
    penColor: 'black',
    backgroundColor: null
    // backgroundColor: 'rgba(0,0,0,0)'
    // backgroundColor: 'red'
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

const trimCanvas = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = imageData

  let top = 0,
    left = 0,
    right = width,
    bottom = height
  let found = false

  for (let y = 0; y < height && !found; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        // Check alpha value
        top = y
        found = true
        break
      }
    }
  }

  found = false
  for (let y = height - 1; y >= 0 && !found; y--) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        bottom = y
        found = true
        break
      }
    }
  }

  found = false
  for (let x = 0; x < width && !found; x++) {
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        left = x
        found = true
        break
      }
    }
  }

  found = false
  for (let x = width - 1; x >= 0 && !found; x--) {
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        right = x
        found = true
        break
      }
    }
  }

  const trimmedCanvas = document.createElement('canvas')
  trimmedCanvas.width = right - left
  trimmedCanvas.height = bottom - top

  trimmedCanvas.getContext('2d').putImageData(ctx.getImageData(left, top, right - left, bottom - top), 0, 0)

  return trimmedCanvas
}

const trimCanvasVertical = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = imageData

  let top = 0
  let bottom = height

  // Find the first non-transparent row (top)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        // Check alpha value
        top = y
        break
      }
    }
    if (top > 0) break
  }

  // Find the last non-transparent row (bottom)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        // Check alpha value
        bottom = y
        break
      }
    }
    if (bottom < height) break
  }

  // Create a new canvas with the trimmed content
  const trimmedCanvas = document.createElement('canvas')
  trimmedCanvas.width = width
  trimmedCanvas.height = bottom - top

  const trimmedCtx = trimmedCanvas.getContext('2d')
  trimmedCtx.putImageData(ctx.getImageData(0, top, width, bottom - top), 0, 0)

  return trimmedCanvas
}

const save = async () => {
  if (padData.isEmpty()) {
    useSnackbarStore().show('먼저 서명을 해주세요.')
  } else {
    let padDataUrl = null
    if (props.popupFor === 'sign') {
      // const trimmedCanvas = trimCanvas(signatureCanvas.value)
      const trimmedCanvas = trimCanvasVertical(signatureCanvas.value)
      padDataUrl = trimmedCanvas.toDataURL('image/png')
    } else {
      padDataUrl = padData.toDataURL('image/png')
    }

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
  height: 80%;
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
