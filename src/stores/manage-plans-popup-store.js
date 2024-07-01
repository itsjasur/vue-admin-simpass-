import { defineStore } from 'pinia'

export const usePlansFilterPopup = defineStore('plansFilter', {
  state: () => ({
    active: false,
    currentPage: 1,
    rowLimit: 10,
    totalCount: 0,

    searchText: '',
    carrier: '',
    mvno: '',
    agent: '',
    carrierType: '',
    carrierPlanType: '',
    status: ''
  }),

  actions: {
    open() {
      this.active = true
    },

    close() {
      this.active = false
    },
    clear() {
      this.active = false
      this.carrier = ''
      this.mvno = ''
      this.agent = ''
      this.carrierType = ''
      this.carrierPlanType = ''
      this.status = ''
    },

    activeFiltersCount() {
      const filterFields = ['carrier', 'mvno', 'agent', 'carrierType', 'carrierPlanType', 'status']
      let count = filterFields.filter((field) => this[field] !== '').length
      return count === 0 ? null : count
    }
  }
})
