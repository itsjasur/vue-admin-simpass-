import { defineStore } from 'pinia'
import { fetchWithTokenRefresh } from '../utils/tokenUtils'
import { useSnackbarStore } from '../stores/snackbar'

// export const useSelectPlansPopup = defineStore('selectPlansPopup', {
//   state: () => ({
//     active: false,

//     type: '',
//     carrierCd: '',
//     mvnoCd: '',
//     searchText: '',

//     mvnoName: '',
//     carrierName: '',
//     typeName: '',
//   }),

//   actions: {
//     open() {
//       this.active = true
//     },

//     close() {
//       this.active = false
//     },

//     getTypeString() {
//       if (this.typeName) return this.typeName

//       if (this.type === 'PO') return '후불'
//       if (this.type === 'PR') return '선불'

//       return 'N/A'
//     },

//     getCarrierString() {
//       if (this.carrierName) return this.carrierName
//       if (this.carrierCd === 'KT') return 'KT'
//       if (this.carrierCd === 'SK') return 'SKT'
//       if (this.carrierCd === 'LG') return 'LG U+'

//       return 'N/A'
//     },

//     getMvnoName() {
//       if (this.mvnoName) return this.mvnoName
//       if (this.mvnoCd === 'HPM') return '한패스 모바일'
//       if (this.mvnoCd === 'COM') return '코드 모바일'
//       if (this.mvnoCd === 'HVS') return 'LG 헬로비젼'
//       if (this.mvnoCd === 'UPM') return 'U+유모바일'
//       if (this.mvnoCd === 'KTM') return 'KT M모바일'
//       if (this.mvnoCd === 'KTS') return 'KT Sky Life'
//       if (this.mvnoCd === 'SVM') return '7모바일'
//     },
//   },
// })

export const useSelectPlansPopup = defineStore('selectPlansPopup', {
  state: () => ({
    active: false,
    type: '',
    carrierCd: '',
    mvnoCd: '',
    searchText: '',
  }),

  actions: {
    open(type, carrierCd, mvnoCd) {
      this.active = true
      this.type = type
      this.carrierCd = carrierCd
      this.mvnoCd = mvnoCd
    },

    close() {
      this.active = false
    },
  },
})
