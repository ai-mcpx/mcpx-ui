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
  } else if (response.data && response.data.name && response.data.version) {
    // Transform direct server response (new API format)
    response.data = transformServerResponse(response.data)
  }
  return response
}, (error) => {
  return Promise.reject(error)
})

// Transform the new API format to the format expected by the UI
function transformServerResponse(serverResponse) {
  // Check if this is the new format with _meta
  if (serverResponse._meta && serverResponse._meta['io.modelcontextprotocol.registry/official']) {
    const registry = serverResponse._meta['io.modelcontextprotocol.registry/official']

    return {
      id: registry.serverId, // Use serverId from metadata
      versionId: registry.versionId, // Add versionId from metadata
      name: serverResponse.name,
      description: serverResponse.description,
      status: serverResponse.status,
      repository: serverResponse.repository,
      version: serverResponse.version || serverResponse.versionDetail?.version,
      versionDetail: {
        version: serverResponse.version || serverResponse.versionDetail?.version,
        releaseDate: registry.publishedAt || serverResponse.versionDetail?.releaseDate,
        isLatest: registry.isLatest !== undefined ? registry.isLatest : serverResponse.versionDetail?.isLatest
      },
      packages: serverResponse.packages || [],
      remotes: serverResponse.remotes || [],
      // Add registry metadata
      publishedAt: registry.publishedAt,
      updatedAt: registry.updatedAt,
      isLatest: registry.isLatest
    }
  }

  // Handle current API format (ServerResponse with Meta field)
  if (serverResponse.server && serverResponse.meta) {
    const server = serverResponse.server
    const meta = serverResponse.meta

    return {
      id: server.name, // Use name as ID since serverId is not available
      name: server.name,
      description: server.description,
      status: meta.official?.status || 'active',
      repository: server.repository,
      version: server.version,
      versionDetail: {
        version: server.version,
        releaseDate: meta.official?.publishedAt,
        isLatest: meta.official?.isLatest || false
      },
      packages: server.packages || [],
      remotes: server.remotes || [],
      // Add registry metadata
      publishedAt: meta.official?.publishedAt,
      updatedAt: meta.official?.updatedAt,
      isLatest: meta.official?.isLatest || false
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
      versionDetail: {
        ...server.versionDetail,
        releaseDate: registry.releaseDate || server.versionDetail?.releaseDate,
        isLatest: registry.isLatest !== undefined ? registry.isLatest : server.versionDetail?.isLatest
      },
      packages: server.packages || [],
      remotes: server.remotes || [],
      // Add registry metadata
      publishedAt: registry.publishedAt,
      updatedAt: registry.updatedAt,
      isLatest: registry.isLatest
    }
  }

  // Handle direct server response (new API format)
  if (serverResponse.name && serverResponse.version) {
    return {
      id: serverResponse.id || serverResponse.name, // Use name as ID if no ID provided
      name: serverResponse.name,
      description: serverResponse.description,
      status: serverResponse.status,
      repository: serverResponse.repository,
      version: serverResponse.version,
      versionDetail: {
        version: serverResponse.version,
        releaseDate: serverResponse.versionDetail?.releaseDate,
        isLatest: serverResponse.versionDetail?.isLatest
      },
      packages: serverResponse.packages || [],
      remotes: serverResponse.remotes || []
    }
  }

  // Fallback: ensure we have required fields
  return {
    id: serverResponse.id || serverResponse.name || 'unknown',
    name: serverResponse.name || 'Unknown Server',
    description: serverResponse.description || 'No description available',
    status: serverResponse.status || 'active',
    repository: serverResponse.repository || {},
    version: serverResponse.version || '1.0.0',
    versionDetail: {
      version: serverResponse.version || '1.0.0',
      releaseDate: serverResponse.versionDetail?.releaseDate || new Date().toISOString(),
      isLatest: serverResponse.versionDetail?.isLatest || true
    },
    packages: serverResponse.packages || [],
    remotes: serverResponse.remotes || [],
    publishedAt: serverResponse.publishedAt,
    updatedAt: serverResponse.updatedAt,
    isLatest: serverResponse.isLatest || true
  }
}

export default {
  // 获取服务器列表
  getServers(params = {}) {
    return apiClient.get('/v0/servers', { params })
  },

  // 获取服务器详情
  getServerDetail(serverName, version = null) {
    if (version) {
      // Get specific version: /v0/servers/{serverName}/versions/{version}
      return apiClient.get(`/v0/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}`)
    } else {
      // Get latest version: /v0/servers/{serverName}
      return apiClient.get(`/v0/servers/${encodeURIComponent(serverName)}`)
    }
  },

  // 搜索服务器
  searchServers(query, limit = 50, cursor = null) {
    const params = {
      search: query,
      limit
    }
    if (cursor) {
      params.cursor = cursor
    }
    return apiClient.get('/v0/servers', { params })
  },

  // 更新服务器 (需要认证)
  updateServer(serverName, version, serverData, token) {
    return apiClient.put(`/v0/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}`, serverData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 发布新服务器 (需要认证)
  publishServer(serverData, token) {
    return apiClient.post('/v0/publish', serverData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除服务器版本 (使用 PUT 端点进行软删除)
  deleteServerVersion(serverName, version, token) {
    // Use PUT endpoint to soft delete by setting status to deleted
    const endpoint = `/v0/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}?status=deleted`
    const editRequest = {
      name: serverName,
      description: 'Server marked for deletion',
      repository: {
        url: 'https://example.com/deleted',
        source: 'github',
        id: 'deleted/deleted'
      },
      version: version
    }

    return apiClient.put(endpoint, editRequest, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // GitHub OAuth 认证 - 交换访问令牌为注册表 JWT
  exchangeGitHubToken(githubToken) {
    return apiClient.post('/v0/auth/github-at', {
      github_token: githubToken
    })
  },

  // GitHub OIDC 认证 - 交换 OIDC 令牌为注册表 JWT
  exchangeGitHubOIDCToken(oidcToken) {
    return apiClient.post('/v0/auth/github-oidc', {
      oidc_token: oidcToken
    })
  },

  // 获取匿名令牌
  getAnonymousToken() {
    return apiClient.post('/v0/auth/none')
  },

  // DNS 认证
  exchangeDNSToken(domain, timestamp, signedTimestamp) {
    return apiClient.post('/v0/auth/dns', {
      domain,
      timestamp,
      signed_timestamp: signedTimestamp
    })
  },

  // HTTP 认证
  exchangeHTTPToken(domain, timestamp, signedTimestamp) {
    return apiClient.post('/v0/auth/http', {
      domain,
      timestamp,
      signed_timestamp: signedTimestamp
    })
  }
}