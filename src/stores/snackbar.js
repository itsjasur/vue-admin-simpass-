import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    active: false,
    message: '',
    timeout: null,
  }),

  actions: {
    showSnackbar(message) {
      if (message) {
        this.message = message

        this.active = true

        // clearing any existing timeout
        if (this.timeout) {
          clearTimeout(this.timeout)
        }

        // setting  new timeout to hide the snackbar after 5 seconds
        this.timeout = setTimeout(() => {
          this.hideSnackbar()
        }, 4000)
      }
    },

    //this hides snackbar
    hideSnackbar() {
      this.message = ''
      this.timeout = null
      this.active = false
    },
  },
})
