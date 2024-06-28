import { defineStore } from 'pinia'

export const useNameSignDataStore = defineStore('nameSignDataStore', {
  state: () => ({
    nameData: '',
    signData: '',
  }),

  actions: {
    save(nameData, signData) {
      this.nameData = nameData
      this.signData = signData
    },

    clear() {
      this.nameData = ''
      this.signData = ''
    },
  },
})
