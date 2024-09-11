<template>
  <div class="container">
    <div class="chats-container-section" @drop.prevent="onDrop" @dragover.prevent>
      <div class="chats-list" ref="chatContainer">
        <template v-for="(chat, index) in webSocketStore.chats" :key="index">
          <template v-if="chat.attachment_paths.length > 0">
            <template v-for="(attachmentPath, pathIndex) in chat.attachment_paths" :key="pathIndex">
              <img
                v-if="attachmentPath"
                :src="attachmentPath"
                @load="scrollToBottom"
                alt=""
                :class="[
                  'attachment-img',
                  { ismyattachment: userInfo?.agent_cd?.includes(chat.sender) }
                ]"
              />
            </template>
          </template>

          <template v-if="chat.text">
            <div :class="['chat-bubble', { ismychat: userInfo?.agent_cd?.includes(chat.sender) }]">
              {{ chat.text }}
            </div>
          </template>
        </template>
      </div>

      <div class="bottom-actions">
        <div v-if="attachments.length > 0" class="attachments-row">
          <div v-for="(file, index) in attachments" :key="index" class="attached-images">
            <img :src="file.url" :alt="'image index: ' + index" />
            <div class="overlay">
              <div @click="attachments.splice(index, 1)" class="delete-icon">&#10005;</div>
            </div>
          </div>
        </div>

        <div class="input-row">
          <input
            id="file-input"
            @change="handleFileUpload"
            type="file"
            class="file-input"
            accept="image/*"
            multiple
            style="display: none"
          />
          <label for="file-input" class="attach-images-icon">
            <span class="material-symbols-outlined"> add_photo_alternate </span>
          </label>

          <span @click="sendNewMessage" class="send-message-icon material-symbols-outlined">
            send
          </span>
          <a-textarea
            size="large"
            @keydown="handleKeyDown"
            v-model:value="newMessage"
            type="text"
            :auto-size="{ minRows: 1, maxRows: 5 }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useWebSocketStore } from '@/stores/webscoket-store'

const webSocketStore = useWebSocketStore()

const chatContainer = ref(null)
const userInfo = ref()
const newMessage = ref('')

// adds logic for the action to take on Enter without Shift
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendNewMessage()
  }
}

onMounted(() => {
  chatContainer.value = document.querySelector('.container') //chat container to scroll up or down
  fetchData()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      webSocketStore.resetRoomUnreadCount()
    }
  })
}

async function sendNewMessage() {
  const attachmentPaths = await uploadFiles()

  if (newMessage.value.trim() || attachmentPaths.length > 0) {
    webSocketStore.sendMessage(newMessage.value, attachmentPaths)

    newMessage.value = ''
    attachments.value = []
    scrollToBottom()
  }
}

//drop to attach files handler
const attachments = ref([])
const onDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter((file) => file.type.startsWith('image/')) // Filter out non-image files
  const urls = imageFiles.map((file) => ({ url: URL.createObjectURL(file), file }))
  attachments.value.push(...urls)
}
//this handles attach icon click image uploads
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))
  const urls = imageFiles.map((file) => ({ url: URL.createObjectURL(file), file }))
  attachments.value.push(...urls)
}

async function uploadFiles() {
  const uploadedFilesPaths = []

  for (const { file } of attachments.value) {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('filename', 'filename')

    try {
      const response = await fetch(import.meta.env.VITE_CHAT_SERVER_URL + 'upload', {
        method: 'POST',
        body: formData
      })

      // console.log(response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      uploadedFilesPaths.push(result.path)

      attachments.value = []
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  return uploadedFilesPaths
}

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('agent/userInfo', { method: 'GET' })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    userInfo.value = decodedResponse.data.info
  } catch (error) {
    useSnackbarStore().show(error.toString())
  }
}
</script>

<style scoped>
.chatroom .arrow_icon {
  font-size: 22px;
}

.chatroom.isSelected {
  /* border: 1.5px solid var(--main-color); */
  background-color: #fff;
}

.chatroom:hover {
  cursor: pointer;
  background-color: #fff;
  filter: brightness(0.8);
}

.chats-container-section {
  /* background-color: var(--main-background-color); */
  background-color: #fff;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}

.chats-list {
  width: 100%;
  /* height: 100%; */
  padding: 20px;
  padding-top: 70px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex-direction: column-reverse;
}

.chat-bubble {
  background-color: #787878;
  color: #fff;
  border-radius: 20px;
  /* line-height: 1; */
  word-wrap: break-word;
  word-break: break-word; /*  prevents overflow of long words */
  white-space: pre-wrap; /*  preserves line breaks */

  align-self: flex-start;
  max-width: 60%;
  padding: 10px;
}
.ismychat {
  background-color: #19a619;
  align-self: flex-end;
  text-align: end;
  padding: 10px;
}
.attachment-img {
  max-height: 200px;
  max-width: 50%;
  /* object-fit: cover; */
  align-self: flex-start;
  border-radius: 10px;
}
.ismyattachment {
  align-self: flex-end;
}

.bottom-actions {
  /* position: sticky; */
  margin: 0 20px;
  margin-bottom: 20px;
}
.attachments-row {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background-color: #00000024;
  border-radius: 8px;
}

.attached-images {
  height: 80px;
  width: 80px;
  /* object-fit: cover; */
  position: relative;
  border-radius: 8px;
}
.attached-images img {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.delete-icon {
  color: white;
  font-size: 24px;
  cursor: pointer;
}
.attached-images:hover .overlay {
  opacity: 1;
}

.input-row {
  position: relative;
}
.input-row .ant-input {
  padding-left: 50px;
  padding-right: 50px;
  border-radius: 8px;
  font-size: 16px;
}

.input-row .attach-images-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 1;
}
.input-row .send-message-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 1;
}

.input-row .material-symbols-outlined {
  color: #fff;
  padding: 7px;
  background-color: #19a619;
  border-radius: 30px;
  font-size: 20px;
}
</style>
