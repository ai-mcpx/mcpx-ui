import { defineStore } from 'pinia'
import api from '../services/api'

export const useServersStore = defineStore('servers', {
  state: () => ({
    servers: [],
    currentServer: null,
    loading: false,
    error: null,
    totalCount: 0,
    nextPage: null
  }),

  getters: {
    getServerById: (state) => (id) => {
      return state.servers.find(server => server.id === id) || null
    }
  },

  actions: {
    async fetchServers(limit = 50, cursor = null) {
      this.loading = true
      this.error = null

      try {
        // Use cursor-based pagination instead of offset
        const params = { limit }
        if (cursor) {
          params.cursor = cursor
        }

        const response = await api.getServers(params)
        this.servers = response.data.servers || []
        this.totalCount = response.data.total_count || 0
        this.nextPage = response.data.next || null
        return response.data
      } catch (error) {
        this.error = error.message || '获取服务器列表失败'
        console.error('Error fetching servers:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchServerDetail(id, version = null) {
      this.loading = true
      this.error = null

      try {
        const response = await api.getServerDetail(id, version)
        this.currentServer = response.data || response
        return this.currentServer
      } catch (error) {
        this.error = error.message || '获取服务器详情失败'
        console.error(`Error fetching server ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchServers(query, limit = 50, cursor = null) {
      this.loading = true
      this.error = null

      try {
        const response = await api.searchServers(query, limit, cursor)
        return response.data || response
      } catch (error) {
        this.error = error.message || '搜索服务器失败'
        console.error('Error searching servers:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearCurrentServer() {
      this.currentServer = null
    }
  }
})