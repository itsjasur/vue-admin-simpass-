import { defineStore } from 'pinia'

export const usePrintableStore = defineStore('printablePopup', {
  state: () => ({
    active: false,
    images: []
  }),

  actions: {
    open(imagesList) {
      this.images = imagesList
      this.active = true
    },

    close() {
      this.images = []
      this.active = false
    }
  }
})
