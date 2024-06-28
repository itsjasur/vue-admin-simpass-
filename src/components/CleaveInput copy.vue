<!-- CleaveInput.vue -->
<template>
  <input ref="inputRef" :value="modelValue" @input="onInput" :placeholder="placeholder" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Cleave from 'cleave.js'
import 'cleave.js/dist/addons/cleave-phone.kr'

const props = defineProps(['modelValue', 'options', 'placeholder'])
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
let cleave = null

onMounted(() => {
  if (inputRef.value) {
    cleave = new Cleave(inputRef.value, props.options)
  }
})

onBeforeUnmount(() => {
  if (cleave) {
    cleave.destroy()
  }
})

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (cleave && newValue !== inputRef.value.value) {
      cleave.setRawValue(newValue)
    }
  }
)
</script>
