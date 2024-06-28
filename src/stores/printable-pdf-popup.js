import { defineStore } from 'pinia'

export const usePrintablePdfPopup = defineStore('printablePdfPopup', {
  state: () => ({
    active: false,
    url: '',
  }),

  actions: {
    open(url) {
      this.url = url
      this.active = true
    },

    async close() {
      // Clean up URL object and url blob
      if (this.url) {
        URL.revokeObjectURL(this.url)
      }

      this.url = ''
      this.active = false
    },
  },
})
