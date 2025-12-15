import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Add request interceptor to conditionally add auth headers
apiClient.interceptors.request.use((config) => {
  console.log('Making API request:', config.method?.toUpperCase(), config.url)
  console.log('Request config:', config)

  // Only add auth headers for endpoints that require authentication
  const authRequiredEndpoints = ['/publish', '/servers/*/versions/*', '/auth/']
  const needsAuth = authRequiredEndpoints.some(endpoint =>
    config.url.includes(endpoint.replace('*', ''))
  )

  if (needsAuth) {
    const token = localStorage.getItem('mcp_registry_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added auth header for protected endpoint')
    }
  } else {
    console.log('Skipping auth header for public endpoint')
  }

  return config
})

// Response interceptor to transform the new API format
apiClient.interceptors.response.use((response) => {
  // Allow callers to opt out of transformation and receive raw data
  if (response.config?.headers && response.config.headers['X-Raw-Response'] === 'true') {
    return response
  }
  console.log('API response received:', response.status, response.config.url)
  console.log('Response data before transformation:', response.data)

  // Handle the new wrapper format for server responses
  if (response.data && Array.isArray(response.data.servers)) {
    console.log('Transforming servers list response')
    response.data.servers = response.data.servers.map(transformServerResponse)
  } else if (response.data && Array.isArray(response.data)) {
    // Handle direct array response (list of servers)
    console.log('Transforming direct array response')
    response.data = response.data.map(transformServerResponse)
  } else if (response.data && response.data.body && Array.isArray(response.data.body.servers)) {
    // Handle Huma API wrapped response
    console.log('Transforming Huma API wrapped servers list response')
    response.data.body.servers = response.data.body.servers.map(transformServerResponse)
  } else if (response.data && response.data.body && Array.isArray(response.data.body)) {
    // Handle Huma API wrapped direct array
    console.log('Transforming Huma API wrapped direct array response')
    response.data.body = response.data.body.map(transformServerResponse)
  } else if (response.data && response.data.server) {
    console.log('Transforming single server response')
    response.data = transformServerResponse(response.data)
  } else if (response.data && response.data._meta) {
    console.log('Transforming direct format response')
    response.data = transformServerResponse(response.data)
  } else if (response.data && response.data.name && response.data.version) {
    console.log('Transforming new API format response')
    response.data = transformServerResponse(response.data)
  } else {
    console.log('No transformation applied to response')
  }

  console.log('Response data after transformation:', response.data)
  return response
}, (error) => {
  console.error('API request failed:', error.config?.url, error.response?.status, error.message)
  console.error('Error response data:', error.response?.data)
  return Promise.reject(error)
})

// Transform the new API format to the format expected by the UI
function transformServerResponse(serverResponse) {
  // Check if this is the new format with server and _meta as separate fields
  if (serverResponse.server && serverResponse._meta && serverResponse._meta['io.modelcontextprotocol.registry/official']) {
    const server = serverResponse.server
    const registry = serverResponse._meta['io.modelcontextprotocol.registry/official']

    return {
      id: registry.serverId || server.name, // Use serverId from metadata or fallback to name
      versionId: registry.versionId || `${server.name}@${server.version}`, // Add versionId from metadata or generate
      name: server.name,
      description: server.description,
      status: registry.status || 'active', // Use status from metadata
      repository: server.repository,
      version: server.version,
      versionDetail: {
        version: server.version,
        releaseDate: registry.publishedAt,
        isLatest: registry.isLatest !== undefined ? registry.isLatest : true
      },
      packages: server.packages || [],
      remotes: server.remotes || [],
      // Add registry metadata
      publishedAt: registry.publishedAt,
      updatedAt: registry.updatedAt,
      isLatest: registry.isLatest
    }
  }

  // Check if this is the old format with _meta at top level
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
    return apiClient.get('/servers', { params })
  },

  // 获取服务器详情
  getServerDetail(serverName, version = null) {
    if (version) {
      // Get specific version: /servers/{serverName}/versions/{version}
      return apiClient.get(`/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}`)
    } else {
      // Get latest version: /servers/{serverName}
      return apiClient.get(`/servers/${encodeURIComponent(serverName)}`)
    }
  },

  // 获取原始服务器详情（不进行响应转换）
  getServerDetailRaw(serverName, version = null) {
    const headers = { 'X-Raw-Response': 'true' }
    if (version) {
      return apiClient.get(`/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}`, { headers })
    } else {
      return apiClient.get(`/servers/${encodeURIComponent(serverName)}`, { headers })
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
    return apiClient.get('/servers', { params })
  },

  // 更新服务器 (需要认证)
  updateServer(serverName, version, serverData, token) {
    return apiClient.put(`/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}`, serverData, {
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

  // 更新服务器状态（例如将状态设置为 deleted 进行软删除）
  updateServerStatus(serverName, version, serverData, status, token) {
    const endpoint = `/servers/${encodeURIComponent(serverName)}/versions/${encodeURIComponent(version)}${status ? `?status=${encodeURIComponent(status)}` : ''}`
    return apiClient.put(endpoint, serverData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // GitHub OAuth 认证 - 交换访问令牌为注册表 JWT
  exchangeGitHubToken(githubToken) {
    return apiClient.post('/auth/github/oauth', {
      github_token: githubToken
    })
  },

  // GitHub OIDC 认证 - 交换 OIDC 令牌为注册表 JWT
  exchangeGitHubOIDCToken(oidcToken) {
    return apiClient.post('/auth/github/oidc', {
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