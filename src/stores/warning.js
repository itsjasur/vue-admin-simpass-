import { defineStore } from 'pinia'

export const useWarningStore = defineStore('warning', {
  state: () => ({
    active: false,
    title: '',
    messages: [], //list of strings
  }),

  actions: {
    open(title, messages) {
      if (messages) {
        this.active = true
        this.title = title
        this.messages = messages
      }
    },

    close() {
      this.active = false
      this.messages = []
      this.title = ''
    },
  },
})
