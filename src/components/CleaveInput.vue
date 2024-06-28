<!-- CleaveInput.vue -->
<template>
  <input ref="inputRef" :value="modelValue" @input="onInput" v-bind="$attrs" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, useAttrs } from 'vue'
import Cleave from 'cleave.js'

const props = defineProps({
  modelValue: String,
  options: Object,
  rawValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

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
  const value = props.rawValue ? cleave.getRawValue() : event.target.value
  emit('update:modelValue', value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (cleave && newValue !== inputRef.value.value) {
      cleave.setRawValue(newValue)
    }
  }
)
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<!-- <CleaveInput
  v-model="FIXED_FORMS[formName].value"
  :options="FIXED_FORMS[formName].pattern"
  :rawValue="false"
  v-bind="inputBindings(formName)"
/> -->
