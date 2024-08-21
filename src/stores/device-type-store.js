import { defineStore } from 'pinia'

export const useDeviceTypeStore = defineStore('deviceType', {
  state: () => ({
    isMobile: false
  }),

  actions: {
    isDeviceMobile() {
      // const userAgent = navigator.userAgent.toLowerCase()
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
      this.isMobile = isTouchDevice
      // console.log('touch device ', isTouchDevice)
      return this.isMobile
    }
  }
})
