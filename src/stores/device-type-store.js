// import { defineStore } from 'pinia'

// export const useDeviceTypeStore = defineStore('deviceType', {
//   state: () => ({
//     isMobile: ''
//   }),

//   actions: {
//     isDeviceMobile() {
//       const userAgent = navigator.userAgent.toLowerCase()
//       const mobileTabletRegex = /android|webos|iphone|ipad/i
//       this.isMobile = mobileTabletRegex.test(userAgent)
//       return mobileTabletRegex.test(userAgent)
//     }

//     // initializeDeviceTypeCheck() {
//     //   this.checkDeviceType()
//     //   window.addEventListener('resize', this.checkDeviceType)
//     // },

//     // cleanupDeviceTypeCheck() {
//     //   window.removeEventListener('resize', this.checkDeviceType)
//     // },
//   }
// })

import { defineStore } from 'pinia'

export const useDeviceTypeStore = defineStore('deviceType', {
  state: () => ({
    isMobile: false
  }),

  actions: {
    isDeviceMobile() {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i
      const tabletRegex =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i

      // Check if it's a mobile device
      if (mobileRegex.test(userAgent)) {
        this.isMobile = true
        return true
      }

      // Check if it's a tablet
      if (tabletRegex.test(userAgent)) {
        this.isMobile = true
        return true
      }

      // Check for iPad running iOS 13+ (which can report as a Mac)
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        this.isMobile = true
        return true
      }

      this.isMobile = false
      return false
    }
  }
})
