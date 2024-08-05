import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    totalUnreadCount: 0
  }),

  actions: {}
})
