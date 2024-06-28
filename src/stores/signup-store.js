import { defineStore } from 'pinia'

export const useSignUpstore = defineStore('signupStore', {
  state: () => ({
    signupStep: 'initial',
    data: {},
  }),

  actions: {
    next(newStep, data) {
      this.signupStep = newStep
      this.data = data
    },

    clear() {
      this.signupStep = 'initial'
      this.data = {}
    },
  },
})
