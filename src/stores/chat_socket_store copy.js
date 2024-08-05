// import { defineStore } from 'pinia'
// import { io } from 'socket.io-client'
// import { useSnackbarStore } from './snackbar'
// import { fetchWithTokenRefresh } from '@/utils/tokenUtils'

// export const useSocketStore = defineStore('socket', {
//   state: () => ({
//     socket: null,
//     isConnected: false,
//     isAuthenticated: false,
//     connectionStatus: 'Disconnected',
//     totalUnreadCount: 0,
//     searchText: '',
//     userInfo: {}
//   }),

//   actions: {
//     initSocket() {
//       console.log('initScoket called')
//       // Only initialize if not already connected

//       // const socket = io('http://158.247.236.202:5000', { transports: ['websocket', 'polling'] })
//       this.socket = io('http://127.0.0.1:5000', { transports: ['websocket', 'polling'] })

//       this.socket.on('connect', () => {
//         this.isConnected = true
//         this.connectionStatus = 'Connected'
//         console.log('Connected to server')
//         this.socket.emit('authenticate', localStorage.getItem('accessToken'))
//       })

//       this.socket.on('disconnect', (error) => {
//         this.isConnected = false
//         this.connectionStatus = 'Disconnected'
//         console.log('Disconnected from server', error)
//       })

//       this.socket.on('connect_error', (error) => {
//         this.connectionStatus = 'Error: ' + error.message
//         console.error('Connection error:', error)
//       })

//       this.socket.on('error', (error) => {
//         useSnackbarStore().show(error.message)
//         this.connectionStatus = 'Error: ' + error.message
//         console.error('Error:', error)
//       })

//       this.socket.emit('authenticate', localStorage.getItem('accessToken'))

//       this.socket.on('authenticated', () => {
//         this.isAuthenticated = true
//         this.connectionStatus = 'Authenticated'
//         console.log('User authenticated')
//         this.updateTotalCount()
//       })

//       this.socket.on('total_unread_count', (totalCount) => {
//         this.totalUnreadCount = totalCount
//         console.log('total count', totalCount)
//       })
//     },

//     updateTotalCount() {
//       this.socket.emit('get_total_unread_count')
//     },

//     closeSocket() {
//       if (this.socket) {
//         this.socket.disconnect()
//         this.socket = null
//         this.isConnected = false
//         this.connectionStatus = 'Disconnected'
//       }
//     }
//   }
// })
