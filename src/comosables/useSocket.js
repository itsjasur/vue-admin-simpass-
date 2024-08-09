// // useSocket.js
// import { ref, onMounted, onUnmounted } from 'vue'
// import { io } from 'socket.io-client'

// export function useSocket() {
//   const socket = ref(null)
//   const isConnected = ref(false)
//   const isAuthenticated = ref(false)

//   const totalCount = ref(0)

//   function connect() {
//     socket.value = io('http://127.0.0.1:5000', { transports: ['websocket', 'polling'] })
//     // const socket = io('http://158.247.236.202:5000', { transports: ['websocket', 'polling'] })

//     socket.value.on('connected', () => {
//       console.log('Connected to server')
//       isConnected.value = true
//     })

//     socket.value.on('connect_error', (error) => {
//       console.error('Connection error:', error)
//     })

//     socket.value.on('total_unread_count', (newTotalCount) => {
//       totalCount.value = newTotalCount
//     })
//   }

//   function authenticate() {
//     // console.log('authenticated called')

//     if (socket.value && isConnected.value) {
//       console.log('authenticated')
//       socket.value.emit('authenticate', localStorage.getItem('accessToken'))
//     }

//     socket.value.on('authenticated', () => {
//       console.log('Authenticated to server')
//       isAuthenticated.value = true
//       socket.value.emit('get_total_unread_count')
//     })
//   }

//   function disconnect() {
//     if (socket.value && socket.value.connected) {
//       console.log('discounnect called')
//       socket.value.disconnect()
//     }
//   }

//   // onMounted(() => {
//   //   // connect()
//   //   // authenticate()
//   // })

//   onUnmounted(() => {
//     disconnect()
//   })

//   return {
//     socket,
//     isConnected,
//     isAuthenticated,
//     totalCount,
//     connect,
//     authenticate
//   }
// }
