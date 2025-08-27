import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Response interceptor to transform the new API format
apiClient.interceptors.response.use((response) => {
  // Handle the new wrapper format for server responses
  if (response.data && Array.isArray(response.data.servers)) {
    // Transform servers list response
    response.data.servers = response.data.servers.map(transformServerResponse)
  } else if (response.data && response.data.server) {
    // Transform single server response
    response.data = transformServerResponse(response.data)
  }
  return response
}, (error) => {
  return Promise.reject(error)
})

// Transform the new API format to the format expected by the UI
function transformServerResponse(serverResponse) {
  if (!serverResponse.server) {
    // Already in the old format, return as-is
    return serverResponse
  }

  const server = serverResponse.server
  const registry = serverResponse['x-io.modelcontextprotocol.registry'] || {}

  return {
    id: registry.id || server.name,
    name: server.name,
    description: server.description,
    status: server.status,
    repository: server.repository,
    version_detail: {
      ...server.version_detail,
      release_date: registry.release_date || server.version_detail?.release_date,
      is_latest: registry.is_latest !== undefined ? registry.is_latest : server.version_detail?.is_latest
    },
    packages: server.packages || [],
    remotes: server.remotes || [],
    // Add registry metadata
    published_at: registry.published_at,
    updated_at: registry.updated_at,
    is_latest: registry.is_latest
  }
}

export default {
  // 获取服务器列表
  getServers(params = {}) {
    return apiClient.get('/servers', { params })
  },

  // 获取服务器详情
  getServerDetail(id, version = null) {
    const params = version ? { version } : {}
    return apiClient.get(`/servers/${id}`, { params })
  },

  // 搜索服务器
  searchServers(query, limit = 50, cursor = null) {
    const params = {
      q: query,
      limit
    }
    if (cursor) {
      params.cursor = cursor
    }
    return apiClient.get('/servers', { params })
  }
}