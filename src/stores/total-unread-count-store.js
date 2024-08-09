import { defineStore } from 'pinia'

export const useTotalUnreadCountStore = defineStore('total-unread-count-store', {
  state: () => ({
    totalUnreadCount: 0
  }),

  actions: {
    update(newCount) {
      this.totalUnreadCount = newCount
    }
  }
})
