<template>
  <div v-if="htmlFetched" class="html_content_container">
    <div class="fixed-header">
      <p class="title">{{ htmlTitle }}</p>
      <span @click="$emit('closePopup')" class="material-symbols-outlined close-button">
        cancel
      </span>
    </div>

    <div class="scrollable_content">
      <div v-if="htmlContent" v-html="htmlContent" class="content"></div>
      <div v-else>No content available</div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'

const props = defineProps({
  id: { type: String, default: null }
})

const emit = defineEmits(['closePopup'])

const htmlFetched = ref(false)
const htmlTitle = ref('')
const htmlContent = ref('')

const fetchHtmlContent = async () => {
  if (!props.id) {
    htmlFetched.value = true
    return
  }

  try {
    const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'get-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: props.id })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const decodedResponse = await response.json()
    htmlTitle.value = decodedResponse?.html?.title || ''
    htmlContent.value = decodedResponse?.html?.content || ''
  } catch (error) {
    console.error('Error fetching html:', error)
    useSnackbarStore().show(error.toString())
  } finally {
    htmlFetched.value = true
  }
}

onMounted(fetchHtmlContent)
</script>

<style scoped>
.html_content_container {
  background-color: var(--main-background-color);
  border-radius: 8px;
  /* width: 900px; */
  width: 100%;
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
  margin: 20px;
  overflow-y: auto;
}

.scrollable_content {
  padding: 25px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  gap: 30px;
  overflow-y: auto;
}
</style>
