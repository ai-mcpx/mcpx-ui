import { defineStore } from 'pinia'
import api from '../services/api'
import { useAuthStore } from './auth'

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

        console.log('Fetching servers with params:', params)
        console.log('API URL:', '/api/servers')
        const response = await api.getServers(params)
        console.log('Full API response:', response)
        console.log('Response status:', response.status)
        console.log('Response data:', response.data)

        // Handle different response formats
        if (Array.isArray(response.data)) {
          // Direct array response
          console.log('Handling direct array response')
          this.servers = response.data
          this.totalCount = response.data.length
        } else if (response.data && Array.isArray(response.data.servers)) {
          // Wrapped response with servers array
          console.log('Handling wrapped response with servers array')
          this.servers = response.data.servers
          this.totalCount = response.data.metadata?.count || response.data.total_count || response.data.servers.length
        } else if (response.data && response.data.body && Array.isArray(response.data.body.servers)) {
          // Huma API wrapped response
          console.log('Handling Huma API wrapped response')
          this.servers = response.data.body.servers
          this.totalCount = response.data.body.metadata?.count || response.data.body.servers.length
        } else {
          // Fallback - try to extract servers from any other format
          console.log('Using fallback - unexpected response format')
          this.servers = []
          this.totalCount = 0
          console.warn('Unexpected API response format:', response.data)
          console.warn('Response structure:', JSON.stringify(response.data, null, 2))
        }

        this.nextPage = response.data.next || response.data.body?.metadata?.nextCursor || null

        console.log('Final servers loaded:', this.servers.length, 'servers')
        console.log('Servers data:', this.servers)
        return response.data
      } catch (error) {
        this.error = error.message || '获取服务器列表失败'
        console.error('Error fetching servers:', error)
        console.error('Error details:', error.response?.data)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchServerDetail(serverName, version = null) {
      this.loading = true
      this.error = null

      try {
        // First try the direct API endpoint
        try {
          const response = await api.getServerDetail(serverName, version)
          this.currentServer = response.data || response
          return this.currentServer
        } catch (apiError) {
          console.warn(`Direct API failed for ${serverName}, trying workaround:`, apiError.message)

          // Workaround: Find the server in the existing servers list
          if (this.servers && this.servers.length > 0) {
            const server = this.servers.find(s => s.name === serverName)
            if (server) {
              console.log(`Found server in existing list: ${serverName}`)
              this.currentServer = server
              return server
            }
          }

          // If not found in existing list, fetch all servers and find the target
          console.log(`Server not in existing list, fetching all servers to find: ${serverName}`)
          const response = await api.getServers({ limit: 1000 }) // Get all servers
          const servers = response.data.servers || response.data

          if (Array.isArray(servers)) {
            const server = servers.find(s => s.server?.name === serverName || s.name === serverName)
            if (server) {
              console.log(`Found server in fresh list: ${serverName}`)
              this.currentServer = server
              return server
            }
          }

          // If still not found, throw the original error
          throw apiError
        }
      } catch (error) {
        this.error = error.message || '获取服务器详情失败'
        console.error(`Error fetching server ${serverName}:`, error)
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

    // 更新服务器
    async updateServer(serverName, version, serverData) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        if (!authStore.token) {
          throw new Error('需要认证令牌才能更新服务器')
        }

        const response = await api.updateServer(serverName, version, serverData, authStore.token)
        const updatedServer = response.data

        // 更新本地状态
        if (this.currentServer && this.currentServer.name === serverName) {
          this.currentServer = updatedServer
        }

        // 更新服务器列表中的项目
        const index = this.servers.findIndex(server => server.name === serverName)
        if (index !== -1) {
          this.servers[index] = updatedServer
        }

        return updatedServer
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '更新服务器失败'
        console.error(`Error updating server ${serverName}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 发布新服务器
    async publishServer(serverData) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        if (!authStore.token) {
          throw new Error('需要认证令牌才能发布服务器')
        }

        const response = await api.publishServer(serverData, authStore.token)
        const newServer = response.data

        // 添加到本地列表
        this.servers.unshift(newServer)

        return newServer
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '发布服务器失败'
        console.error('Error publishing server:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 软删除服务器版本 (设置状态为 deleted)
    async deleteServerVersion(serverName, version) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        if (!authStore.token) {
          throw new Error('需要认证令牌才能删除服务器版本')
        }

        // 获取原始服务器 JSON 作为更新请求体，确保包含 $schema、name、version 等必需字段
        const rawResp = await api.getServerDetailRaw(serverName, version)
        // Huma API wraps the response under body; otherwise expect ServerResponse shape
        const rawBody = rawResp.data?.body || rawResp.data
        const serverJSON = rawBody?.server || rawBody
        if (!serverJSON || !serverJSON.$schema) {
          throw new Error('无法获取服务器原始配置用于删除操作')
        }

        const response = await api.updateServerStatus(serverName, version, serverJSON, 'deleted', authStore.token)

        // 更新本地状态 - 从列表中移除已删除的服务器版本
        if (this.currentServer && this.currentServer.name === serverName && this.currentServer.version === version) {
          this.currentServer = null
        }

        // 从服务器列表中移除匹配的版本
        const index = this.servers.findIndex(server => server.name === serverName && server.version === version)
        if (index !== -1) {
          this.servers.splice(index, 1)
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '删除服务器版本失败'
        console.error(`Error deleting server version ${serverName}/${version}:`, error)
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