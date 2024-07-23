import { defineStore } from 'pinia'

export const useSearchaddressStore = defineStore('selectAddressPopup', {
  state: () => ({
    active: false,
    address: '',
    buildingName: ''
  }),

  actions: {
    open() {
      this.active = true
    },

    close() {
      this.active = false
    }
  }
})
