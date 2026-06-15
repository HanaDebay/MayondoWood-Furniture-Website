import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.withCredentials = true

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async checkAuth() {
      try {
        const { data } = await axios.get('/api/me')
        this.setAuth(data.user)
      } catch (e) {
        this.user = null
        this.role = null
      } finally {
        this.initialized = true
      }
    },

    async login(email, password) {
      const { data } = await axios.post('/api/login', { email, password })
      this.setAuth(data.user)
      return data
    },

    setAuth(user) {
      this.user = user
      this.role = user.role
      this.initialized = true
    },

    async logout() {
      try {
        await axios.get('/api/logout')
      } catch (e) {
        console.error("Logout failed:", e)
      } finally {
        this.user = null
        this.role = null
      }
    }
  }
})