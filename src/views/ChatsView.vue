<template>
  <div class="container">
    <div class="receivers-section">
      <div class="search-receiver">
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Search"
          v-model="searchText"
        />
      </div>
      <div class="reveivers-list">
        <div class="receiver">Partner1</div>
        <div class="receiver"></div>
        <div class="receiver"></div>
        <div class="receiver"></div>
        <div class="receiver"></div>
      </div>
    </div>
    <div class="message-container-section">
      <div class="chat"></div>
    </div>
  </div>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { fetchWithTokenRefresh } from '@/utils/tokenUtils'
import { onMounted, ref } from 'vue'
import { io } from 'socket.io-client'

const searchText = ref()
const userInfo = ref()
const chatContainer = ref(null)
const connectionStatus = ref('Disconnected')

const partnerCode = 'SM00001'

// SOCKET CONNECTION
const socket = io('http://127.0.0.1:5000', { transports: ['websocket', 'polling'] })

onMounted(() => {
  fetchData()

  chatContainer.value = document.querySelector('.container') //chat container to scroll up or down

  socket.on('connected', () => {
    console.log('Connected to server')
    connectionStatus.value = 'Connected'

    socket.emit('get_rooms', {
      userToken: localStorage.getItem('accessToken')
    })
  })

  socket.on('rooms', (rooms) => {
    console.log('agent rooms', rooms)
  })

  // socket.on('disconnect', () => {
  //   console.log('Disconnected from server')
  //   connectionStatus.value = 'Disconnected'
  // })

  // socket.on('connect_error', (error) => {
  //   console.error('Connection error:', error)
  //   connectionStatus.value = 'Error: ' + error.message
  // })

  // socket.on('error', (error) => {
  //   useSnackbarStore().show(error.message)
  //   console.error('Connection error:', error)
  //   connectionStatus.value = 'Error: ' + error.message
  // })

  // //partner page chats-info returns list of chats for selected agentCode
  // socket.on('chats-info', (data) => {
  //   chats.value = data
  //   scrollToBottom()
  //   // console.log('parner chats', chatList)
  // })

  // socket.on('message', (newMessage) => {
  //   console.log('parner chats', newMessage)
  //   chats.value.push(newMessage)
  //   scrollToBottom()
  // })
})

async function fetchData() {
  try {
    const response = await fetchWithTokenRefresh('admin/myInfo', { method: 'GET' })
    if (!response.ok) throw 'Fetch data error'
    const decodedResponse = await response.json()
    userInfo.value = decodedResponse.data.info
  } catch (error) {
    chatPopupStore.close()
    useSnackbarStore().show(error.toString())
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-flow: row;
  max-width: 1200px;
  height: 100%;
  width: 100%;
  /* overflow-y: hidden; */
}

.receivers-section {
  width: 500px;
  height: 100%;
  /* position: relative; */
  overflow-y: auto;
  /* margin: 0 10px; */
  box-sizing: border-box;
  background-color: #efefef;
}
.search-receiver {
  position: sticky;
  top: 0;
  padding: 0 20px;
  height: 70px;
  align-content: center;
  background-color: #efefef;
}

.reveivers-list {
  padding: 0 20px;
  box-sizing: border-box;
  margin-top: 10px;
  margin-bottom: 60px;
  display: flex;
  flex-flow: column;
  gap: 20px;
  overflow-y: auto;
}
.reveivers-list .receiver {
  padding: 13px 10px;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
  background-color: #fff;
}

.reveivers-list .receiver:hover {
  cursor: pointer;
  /* opacity: 0.5; */
  filter: brightness(0.8);
}

.message-container-section {
  background-color: #15ff041f;
  width: 100%;
  height: 100%;
}
</style>
