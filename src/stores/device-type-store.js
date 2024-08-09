import { defineStore } from 'pinia'

export const useDeviceTypeStore = defineStore('deviceType', {
  state: () => ({
    isMobile: ''
  }),

  actions: {
    isDeviceMobile() {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileTabletRegex = /android|webos|iphone|ipad/i
      this.isMobile = mobileTabletRegex.test(userAgent)
      return mobileTabletRegex.test(userAgent)
    }

    // initializeDeviceTypeCheck() {
    //   this.checkDeviceType()
    //   window.addEventListener('resize', this.checkDeviceType)
    // },

    // cleanupDeviceTypeCheck() {
    //   window.removeEventListener('resize', this.checkDeviceType)
    // },
  }
})
