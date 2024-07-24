import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('status', {
  state: () => ({
    isLoggedIn: localStorage.getItem('accessToken') !== null,
    id: '',
    userName: '',
    isAutoLoggedOut: true,
    userRoles: []
  }),

  actions: {
    logout() {
      this.isLoggedIn = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // window.location.href = '/login'
    },

    login(token, refreshToken, id, userName, roles) {
      this.isLoggedIn = roles
      this.userRoles = roles

      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('id', id)
      localStorage.setItem('userName', userName)

      // const stringifiedRolesArray = JSON.stringify(roles)
      // localStorage.setItem('roles', stringifiedRolesArray)
    },

    updateRoles(roles) {
      if (roles && roles instanceof Array) {
        this.userRoles = roles
      }
    },

    // getRoles() {
    // const roles = localStorage.getItem('roles')
    // const rolesArray = JSON.parse(roles)
    // return rolesArray
    // },

    containsRole(routeRequiredRoles) {
      // console.log('route roles in store: ', routeRequiredRoles)
      // if (!routeRequiredRoles) return true
      return routeRequiredRoles.some((role) => this.userRoles.includes(role))
    }
  }
})
