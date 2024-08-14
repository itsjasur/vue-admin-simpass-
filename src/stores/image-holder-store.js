import { defineStore } from 'pinia'

export const useImagesHolderStore = defineStore('imagesHolderStore', {
  state: () => ({
    // active: false,
    images: []
  }),

  actions: {
    save(imagesList) {
      this.images = imagesList
      // this.active = true
    },

    clear() {
      this.images = []
      // this.active = false
    }
  }
})
