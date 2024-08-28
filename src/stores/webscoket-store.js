import { defineStore } from 'pinia'
import { messaging, getToken } from '../firebase'
import { FIREBASEVAPIDKEY } from '../../sensitive'

export const useWebSocketStore = defineStore('webSocket', {
  state: () => ({
    socket: null,
    isConnected: false,
    totalUnreadCount: 0,
    selectedRoomId: null,
    chatRooms: [],
    reconnectInterval: null,
    chats: []
  }),

  actions: {
    connect() {
      const accessToken = localStorage.getItem('accessToken')
      // this.socket = new WebSocket(`ws://localhost:8000/ws/${accessToken}`)
      // this.socket = new WebSocket(`wss://chat.baroform.com/ws/${accessToken}`)
      // this.socket = new WebSocket(`https://chat.baroform.com/ws/${accessToken}`)
      this.socket = new WebSocket(import.meta.env.VITE_CHAT_SERVER_URL + `ws/${accessToken}`)

      this.socket.onopen = async () => {
        console.log('Socket connected')
        this.isConnected = true
        this.clearReconnectInterval()

        try {
          var currentFcmToken = await getToken(messaging, { vapidKey: FIREBASEVAPIDKEY })
          // console.log(currentFcmToken)
          if (currentFcmToken) {
            this.socket.send(
              JSON.stringify({ action: 'update_fcm_token', fcmToken: currentFcmToken })
            )
          }
        } catch (e) {
          console.log(e)
        }
      }

      this.socket.onclose = () => {
        console.log('Socket disconnected')
        this.isConnected = false
        this.attemptReconnect()
      }

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data?.type === 'total_count') {
          this.totalUnreadCount = data?.total_unread_count
          // console.log('total unread count: ', data?.total_unread_count)
        }

        if (data?.type === 'chat_rooms') {
          this.chatRooms = data?.rooms
          // console.log('chatrooms: ', data?.rooms)
        }

        if (data?.type === 'room_added') {
          this.chatRooms.push(data?.new_room)
        }

        if (data?.type === 'room_modified') {
          // console.log(data?.modified_room)
          const modifiedRoom = data?.modified_room
          const index = this.chatRooms.findIndex((room) => room.room_id === modifiedRoom?.room_id)
          // console.log('index ', index)
          if (index !== -1) this.chatRooms[index] = modifiedRoom
        }

        if (data?.type === 'new_chat_room') {
          this.chatRooms.push(data?.chat_room)
          //   console.log(data.new_chat)
        }

        if (data?.type === 'chats') {
          this.selectedRoomId = data?.room_id
          this.chats = data?.chats
        }

        if (data?.type === 'new_chat') {
          if (this.selectedRoomId === data?.new_chat.room_id) this.chats.push(data?.new_chat)
          //   console.log(data.new_chat)
        }
      }
    },

    getChatRooms(searchText) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: 'get_chat_rooms', searchText: searchText }))
      }
    },

    joinRoom(partnerCd, partnerNm) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            action: 'join_room',
            roomId: this.selectedRoomId,
            partnerCode: partnerCd,
            partnerName: partnerNm
          })
        )
      }
    },

    resetRoomUnreadCount() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({ action: 'reset_room_unread_count', roomId: this.selectedRoomId })
        )
      }
    },

    sendMessage(text, attachmentPaths) {
      this.socket.send(
        JSON.stringify({
          action: 'new_message',
          text: text,
          attachmentPaths: attachmentPaths,
          roomId: this.selectedRoomId
        })
      )
    },

    attemptReconnect() {
      if (!this.reconnectInterval) {
        this.reconnectInterval = setInterval(() => {
          console.log('Attempting to reconnect...')
          this.connect()
        }, 5000)
      }
    },

    clearReconnectInterval() {
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval)
        this.reconnectInterval = null
      }
    },

    disconnect() {
      this.clearReconnectInterval()
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: 'disconnect' }))
        this.socket.close()
      }
      this.socket = null
      this.isConnected = false
    }
  }
})
