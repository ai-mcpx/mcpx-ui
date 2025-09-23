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
  } else if (response.data && response.data._meta) {
    // Transform single server response (direct format)
    response.data = transformServerResponse(response.data)
  }
  return response
}, (error) => {
  return Promise.reject(error)
})

// Transform the new API format to the format expected by the UI
function transformServerResponse(serverResponse) {
  // Check if this is already the new format with _meta
  if (serverResponse._meta && serverResponse._meta['io.modelcontextprotocol.registry/official']) {
    const registry = serverResponse._meta['io.modelcontextprotocol.registry/official']

    return {
      id: registry.serverId, // Use serverId from metadata
      versionId: registry.versionId, // Add versionId from metadata
      name: serverResponse.name,
      description: serverResponse.description,
      status: serverResponse.status,
      repository: serverResponse.repository,
      version: serverResponse.version || serverResponse.version_detail?.version,
      version_detail: {
        version: serverResponse.version || serverResponse.version_detail?.version,
        release_date: registry.publishedAt || serverResponse.version_detail?.release_date,
        is_latest: registry.isLatest !== undefined ? registry.isLatest : serverResponse.version_detail?.is_latest
      },
      packages: serverResponse.packages || [],
      remotes: serverResponse.remotes || [],
      // Add registry metadata
      published_at: registry.publishedAt,
      updated_at: registry.updatedAt,
      is_latest: registry.isLatest
    }
  }

  // Handle legacy format with nested server object
  if (serverResponse.server) {
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

  // Already in the expected format, return as-is
  return serverResponse
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
  },

  // 更新服务器 (需要认证)
  updateServer(id, serverData, token) {
    return apiClient.put(`/servers/${id}`, serverData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 发布新服务器 (需要认证)
  publishServer(serverData, token) {
    return apiClient.post('/publish', serverData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除服务器版本 (使用 PUT 端点进行软删除)
  deleteServerVersion(versionId, token) {
    // First get all servers to find the one with matching version ID
    return apiClient.get('/servers').then(response => {
      const servers = response.data.servers || []
      const targetServer = servers.find(server => {
        if (server._meta && server._meta['io.modelcontextprotocol.registry/official']) {
          return server._meta['io.modelcontextprotocol.registry/official'].versionId === versionId
        }
        return false
      })

      if (!targetServer) {
        throw new Error(`Version not found: ${versionId}`)
      }

      const registry = targetServer._meta['io.modelcontextprotocol.registry/official']
      const serverId = registry.serverId
      const version = targetServer.version

      // Use PUT endpoint to soft delete by setting status to deleted
      const endpoint = `/servers/${serverId}?version=${version}`
      const editRequest = {
        name: targetServer.name,
        description: targetServer.description,
        status: 'deleted', // Set status to deleted
        repository: {
          url: targetServer.repository.url,
          source: targetServer.repository.source,
          id: targetServer.repository.id
        },
        version: targetServer.version
      }

      return apiClient.put(endpoint, editRequest, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
  },

  // GitHub OAuth 认证 - 交换访问令牌为注册表 JWT
  exchangeGitHubToken(githubToken) {
    return apiClient.post('/auth/github-at', {
      github_token: githubToken
    })
  },

  // GitHub OIDC 认证 - 交换 OIDC 令牌为注册表 JWT
  exchangeGitHubOIDCToken(oidcToken) {
    return apiClient.post('/auth/github-oidc', {
      oidc_token: oidcToken
    })
  },

  // 获取匿名令牌
  getAnonymousToken() {
    return apiClient.post('/auth/none')
  },

  // DNS 认证
  exchangeDNSToken(domain, timestamp, signedTimestamp) {
    return apiClient.post('/auth/dns', {
      domain,
      timestamp,
      signed_timestamp: signedTimestamp
    })
  },

  // HTTP 认证
  exchangeHTTPToken(domain, timestamp, signedTimestamp) {
    return apiClient.post('/auth/http', {
      domain,
      timestamp,
      signed_timestamp: signedTimestamp
    })
  }
}