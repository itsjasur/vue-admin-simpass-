import { defineStore } from 'pinia'

export const usePageLoadingStore = defineStore('pageLoadingStore', {
  state: () => ({
    loading: false
  }),

  actions: {
    start() {
      this.loading = true
    },

    stop() {
      this.loading = false
    }
  }
})
