import { defineStore } from 'pinia'

export const usePrintablePopup = defineStore('printablePopup', {
  state: () => ({
    active: false,
    canPrint: true,
    images: []
  }),

  actions: {
    open(imagesList, canPrint = true) {
      this.images = imagesList
      this.canPrint = canPrint
      this.active = true
    },

    close() {
      this.images = []
      this.active = false
      this.canPrint = true
    }
  }
})
