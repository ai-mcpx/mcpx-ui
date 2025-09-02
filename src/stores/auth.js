import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('mcp_registry_token') || null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authMethod: localStorage.getItem('mcp_auth_method') || null
  }),

  getters: {
    hasToken: (state) => !!state.token,
    canEdit: (state) => state.isAuthenticated && state.token,
    canPublish: (state) => state.isAuthenticated && state.token
  },

  actions: {
    // 设置认证令牌
    setToken(token, method = 'unknown') {
      this.token = token
      this.authMethod = method
      this.isAuthenticated = true
      localStorage.setItem('mcp_registry_token', token)
      localStorage.setItem('mcp_auth_method', method)
    },

    // 清除认证信息
    clearAuth() {
      this.token = null
      this.user = null
      this.authMethod = null
      this.isAuthenticated = false
      localStorage.removeItem('mcp_registry_token')
      localStorage.removeItem('mcp_auth_method')
    },

    // GitHub OAuth 认证
    async authenticateWithGitHub(githubToken) {
      this.loading = true
      this.error = null

      try {
        const response = await api.exchangeGitHubToken(githubToken)
        const { token } = response.data
        this.setToken(token, 'github-oauth')
        return { success: true, token }
      } catch (error) {
        this.error = error.response?.data?.message || 'GitHub 认证失败'
        console.error('GitHub auth error:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // GitHub OIDC 认证
    async authenticateWithGitHubOIDC(oidcToken) {
      this.loading = true
      this.error = null

      try {
        const response = await api.exchangeGitHubOIDCToken(oidcToken)
        const { token } = response.data
        this.setToken(token, 'github-oidc')
        return { success: true, token }
      } catch (error) {
        this.error = error.response?.data?.message || 'GitHub OIDC 认证失败'
        console.error('GitHub OIDC auth error:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 获取匿名令牌
    async getAnonymousAuth() {
      this.loading = true
      this.error = null

      try {
        const response = await api.getAnonymousToken()
        const { token } = response.data
        this.setToken(token, 'anonymous')
        return { success: true, token }
      } catch (error) {
        this.error = error.response?.data?.message || '获取匿名令牌失败'
        console.error('Anonymous auth error:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // DNS 认证
    async authenticateWithDNS(domain, timestamp, signedTimestamp) {
      this.loading = true
      this.error = null

      try {
        const response = await api.exchangeDNSToken(domain, timestamp, signedTimestamp)
        const { token } = response.data
        this.setToken(token, 'dns')
        return { success: true, token }
      } catch (error) {
        this.error = error.response?.data?.message || 'DNS 认证失败'
        console.error('DNS auth error:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // HTTP 认证
    async authenticateWithHTTP(domain, timestamp, signedTimestamp) {
      this.loading = true
      this.error = null

      try {
        const response = await api.exchangeHTTPToken(domain, timestamp, signedTimestamp)
        const { token } = response.data
        this.setToken(token, 'http')
        return { success: true, token }
      } catch (error) {
        this.error = error.response?.data?.message || 'HTTP 认证失败'
        console.error('HTTP auth error:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 初始化认证状态
    initAuth() {
      const token = localStorage.getItem('mcp_registry_token')
      const method = localStorage.getItem('mcp_auth_method')

      if (token) {
        this.token = token
        this.authMethod = method
        this.isAuthenticated = true
      }
    }
  }
})
