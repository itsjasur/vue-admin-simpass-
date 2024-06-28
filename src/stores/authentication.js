import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('status', {
  state: () => ({
    isLoggedIn: localStorage.getItem('accessToken') !== null,
    // role: [],
    id: '',
    userName: '',
    isAutoLoggedOut: true,
  }),

  actions: {
    logout() {
      this.isLoggedIn = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // window.location.href = '/login'
    },

    login(token, refreshToken, id, userName) {
      this.isLoggedIn = true
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('id', id)
      localStorage.setItem('userName', userName)

      // window.location.href = '/home'
      // router.push('/home')
    },

    // retrieveFromStorage() {
    //   const token = localStorage.getItem('token')
    //   const refreshToken = localStorage.getItem('refreshToken')
    //   const roleJSON = localStorage.getItem('role')
    // }
  },
})
