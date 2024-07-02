import { defineStore } from 'pinia'

export const useRouteMemoryStore = defineStore('router-memory-store', {
  state: () => ({
    intendedRoute: null
  }),

  actions: {
    save(url) {
      this.intendedRoute = url
    },
    clear() {
      this.intendedRoute = null
    }
  }
})
