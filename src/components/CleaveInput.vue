<template>
  <input :value="modelValue" ref="input" v-bind="$attrs" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Cleave from 'cleave.js'
import 'cleave.js/dist/addons/cleave-phone.kr'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['update:modelValue', 'rawValue'])

const input = ref(null)
let cleave

onMounted(() => {
  if (input.value) {
    const cleaveOptions = {
      ...props.options,
      onValueChanged: (event) => {
        emit('update:modelValue', event.target.value)
        emit('rawValue', event.target.rawValue)
      }
    }

    cleave = new Cleave(input.value, cleaveOptions)

    // cleave = new Cleave(input.value, props.options)

    if (props.modelValue) {
      cleave.setRawValue(props.modelValue)
    }
  }
})

onBeforeUnmount(() => {
  if (cleave) {
    cleave.destroy()
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (cleave && newValue !== undefined) {
      cleave.setRawValue(newValue)
    }
  }
)

watch(
  () => props.options,
  (newOptions) => {
    if (cleave) {
      cleave.destroy()
      cleave = new Cleave(input.value, {
        ...newOptions,
        onValueChanged: (event) => {
          emit('update:modelValue', event.target.value)
          emit('rawValue', event.target.rawValue)
        }
      })
    }
  },
  { deep: true }
)
</script>
