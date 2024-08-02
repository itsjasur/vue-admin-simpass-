<template>
  <div class="container">
    <div class="chatrooms-section">
      <div class="search-chatroom">
        <input
          type="text"
          id="username"
          name="username"
          @input="getRooms"
          placeholder="Search"
          v-model="searchText"
        />
      </div>
      <div class="reveivers-list">
        <template v-for="(room, index) in chatRooms" :key="index">
          <div
            @click="selectRoom(room)"
            :class="['chatroom', { isSelected: selectedRoom?.room_id === room?.room_id }]"
          >
            <div v-if="userInfo?.agent_cd?.length > 1" class="chatroom-name">
              <span> {{ room.partner_name }}</span>
              <span class="material-symbols-outlined arrow_icon"> double_arrow </span>
              {{ room.agent_code }}
            </div>

            <div class="unread-count-badge">11</div>
          </div>
        </template>
      </div>
    </div>
    <div class="chats-container-section" @drop.prevent="onDrop" @dragover.prevent>
      <div class="chats-list" ref="chatContainer">
        <template v-for="(chat, index) in chats" :key="index">
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

      <div v-if="selectedRoom" class="bottom-actions">
        <div v-if="attachments.length > 0" class="attachments-row">
          <div v-for="(file, index) in attachments" :key="index" class="attached-images">
            <img :src="file.url" :alt="'image index: ' + index" />
            <div class="overlay">
              <div @click="removeAttachment(index)" class="delete-icon">&#10005;</div>
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

          <span @click="sendMessage" class="send-message-icon material-symbols-outlined">
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
import { nextTick, onMounted, ref } from 'vue'
import { io } from 'socket.io-client'

const searchText = ref('')
const userInfo = ref()
const chatContainer = ref(null)
const connectionStatus = ref('Disconnected')
const newMessage = ref('')

const selectedRoom = ref(null)

const chatRooms = ref([])
const chats = ref([])

// SOCKET CONNECTION
const socket = io('http://127.0.0.1:5000', { transports: ['websocket', 'polling'] })
// const socket = io('http://158.247.236.202:5000', { transports: ['websocket', 'polling'] })

// adds logic for the action to take on Enter without Shift
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function getRooms() {
  console.log('get rooms called')
  socket.emit('get_rooms', {
    searchText: searchText.value
  })
}

onMounted(() => {
  fetchData()

  chatContainer.value = document.querySelector('.container') //chat container to scroll up or down

  socket.on('connected', () => {
    console.log('Connected to server')
    connectionStatus.value = 'Connected'
    socket.emit('authenticate', localStorage.getItem('accessToken'))
    // getRooms()
  })
  socket.on('authenticated', () => {
    console.log('Authenticated to server')
    connectionStatus.value = 'Authenticated'
    getRooms()
  })

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
  })

  socket.on('rooms', (rooms) => {
    // console.log('agent rooms', rooms)
    chatRooms.value = rooms

    //clean current chat and selectedRoom if search result does not contain the room
    if (!chatRooms.value.find((obj) => obj?.room_id === selectedRoom.value)) {
      chats.value = []
      selectedRoom.value = null
    }

    //initiatal opening chatroom
    if (chatRooms.value.length > 0 && selectedRoom.value === null) {
      selectRoom(chatRooms.value[0])
    }
  })

  socket.on('chats', (data) => {
    // console.log(data)
    chats.value = data
    scrollToBottom()
  })

  socket.on('new_room_added', (newRoom) => {
    console.log('rooms update called')
    // console.log(newRoom)
    if (!chatRooms.value.find((obj) => obj.room_id === newRoom['room_id'])) {
      chatRooms.value.push(newRoom)
    }
    //initiatal opening chatroom
    if (chatRooms.value.length > 0 && selectedRoom.value === null) {
      selectRoom(chatRooms.value[0])
    }
  })

  socket.on('room_removed', (removedRoomId) => {
    console.log('removed room called', removedRoomId)
    const indexToRemove = chatRooms.value.findIndex((obj) => obj.room_id === removedRoomId)
    if (indexToRemove !== -1) {
      chatRooms.value.splice(indexToRemove, 1)
    }

    //clean if the removed item is open
    if (selectedRoom.value && selectedRoom.value.room_id === removedRoomId) {
      chats.value = []
      selectedRoom.value = null
    }
  })

  socket.on('message', (newMessage) => {
    chats.value.push(newMessage)
    scrollToBottom()
  })
  socket.on('error', (error) => {
    console.log(error.message)
    useSnackbarStore().show(error.message.toString())
    // useAuthenticationStore().logout()
  })
})

function selectRoom(room) {
  selectedRoom.value = room
  // console.log(room)
  socket.emit('join_room', {
    userToken: localStorage.getItem('accessToken'),
    roomId: room.room_id
  })
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

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const sendMessage = async () => {
  // console.log(newMessage.value)
  if (newMessage.value.trim() || attachments.value.length > 0) {
    const attachmentPaths = await uploadFiles()

    const newMessageToSend = {
      userToken: localStorage.getItem('accessToken'),
      text: newMessage.value,
      attachmentPaths: attachmentPaths,
      roomId: selectedRoom.value.room_id,
      agentCd: selectedRoom.value.agent_code,
      partnerCd: selectedRoom.value.partner_code
    }
    socket.emit('new_message', newMessageToSend)
    //clears input field text
    newMessage.value = ''
  }
}

async function uploadFiles() {
  const uploadedFilesPaths = []

  for (const { file } of attachments.value) {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('filename', 'filename')

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
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
.container {
  display: flex;
  flex-flow: row;
  /* max-width: 1200px; */
  height: 100%;
  width: 100%;
  /* overflow-y: hidden; */
}

.chatrooms-section {
  width: 450px;
  height: 100%;
  /* position: relative; */
  overflow-y: auto;
  /* margin: 0 10px; */
  box-sizing: border-box;
  background-color: #e8e8e8;
}
.search-chatroom {
  position: sticky;
  top: 0;
  /* padding: 0 20px; */
  align-content: center;
  background-color: #e8e8e8;
}

.search-chatroom input,
input:focus {
  border: none;
  outline: none;
  background-color: transparent;
  box-shadow: none;
  border-bottom: 1px solid #ccc;
  height: 50px;
  padding-left: 15px;
}

.reveivers-list {
  box-sizing: border-box;
  margin-top: 10px;
  margin-bottom: 60px;
  display: flex;
  flex-flow: column;
  width: 100%;
  gap: 10px;
  overflow-y: auto;
  padding: 0 10px;
}
.chatroom {
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  font-weight: 600;
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatroom-name {
  display: flex;
  gap: 10px;
  align-items: center;
}

.unread-count-badge {
  background-color: rgb(244, 159, 94);
  height: 18px;
  min-width: 18px;
  padding: 5px;
  border-radius: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 1;

  color: #fff;
  font-size: 14px;
}

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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
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
  margin-bottom: 30px;
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
