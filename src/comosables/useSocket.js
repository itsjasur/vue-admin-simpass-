// useSocket.js
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

export function useSocket(url) {
  const socket = ref(null)
  const isConnected = ref(false)
  const lastMessage = ref(null)

  function connect() {
    const socket = io('http://127.0.0.1:5000', { transports: ['websocket', 'polling'] })
    // const socket = io('http://158.247.236.202:5000', { transports: ['websocket', 'polling'] })

    socket.on('connected', () => {
      console.log('Connected to server')
      // connectionStatus.value = 'Connected'
      socket.emit('authenticate', localStorage.getItem('accessToken'))
      // getRooms()
    })
    socket.on('authenticated', () => {
      console.log('Authenticated to server')
      // connectionStatus.value = 'Authenticated'
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    lastMessage
  }
}
