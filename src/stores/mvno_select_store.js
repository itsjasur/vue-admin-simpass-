import { defineStore } from 'pinia'

export const useMvnoSelectStore = defineStore('mvno-select-store', {
  state: () => ({
    selected: ''
  }),

  actions: {
    select(newMvnoCd) {
      this.selected = newMvnoCd
    },
    clear() {
      this.selected = ''
    }
  }
})
