import { defineStore } from 'pinia'

export const useNameSignDataStore = defineStore('nameSignDataStore', {
  state: () => ({
    signData: '',
    sealData: ''
  }),

  actions: {
    save(signData, sealData) {
      this.signData = signData
      this.sealData = sealData
    },

    clear() {
      this.signData = ''
      this.sealData = ''
    }
  }
})
