// MCP Client for WebSocket communication
export class MCPClient {
  constructor() {
    this.ws = null
    this.messageId = 0
    this.pendingRequests = new Map()
    this.tools = []
    this.resources = []
    this.prompts = []
    this.isConnected = false
    this.listeners = new Map()
  }

  // Connect to MCP server via WebSocket
  async connect(serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(serverUrl)

        this.ws.onopen = () => {
          this.isConnected = true
          this.initialize()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data))
        }

        this.ws.onclose = () => {
          this.isConnected = false
          this.emit('disconnected')
        }

        this.ws.onerror = (error) => {
          this.isConnected = false
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Initialize MCP session
  async initialize() {
    try {
      // Send initialize request
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          clientInfo: {
            name: 'mcpx-ui',
            version: '1.0.0'
          }
        }
      })

      // Send initialized notification
      this.sendNotification({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      })

      // List available tools
      await this.listTools()

      // List available resources
      await this.listResources()

      // List available prompts
      await this.listPrompts()

      this.emit('initialized', response)
    } catch (error) {
      console.error('Failed to initialize MCP session:', error)
      throw error
    }
  }

  // Send JSON-RPC request
  sendRequest(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to server'))
        return
      }

      const id = message.id
      this.pendingRequests.set(id, { resolve, reject })

      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Request timeout'))
        }
      }, 30000) // 30 second timeout

      this.ws.send(JSON.stringify(message))
    })
  }

  // Send JSON-RPC notification
  sendNotification(message) {
    if (!this.isConnected) {
      console.warn('Not connected to server')
      return
    }
    this.ws.send(JSON.stringify(message))
  }

  // Handle incoming messages
  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)
      this.pendingRequests.delete(message.id)

      if (message.error) {
        reject(new Error(message.error.message || 'Unknown error'))
      } else {
        resolve(message.result)
      }
    } else if (message.method) {
      // Handle notifications
      this.emit('notification', message)
    }
  }

  // List available tools
  async listTools() {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'tools/list'
      })
      this.tools = response.tools || []
      this.emit('toolsUpdated', this.tools)
      return this.tools
    } catch (error) {
      console.error('Failed to list tools:', error)
      return []
    }
  }

  // List available resources
  async listResources() {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'resources/list'
      })
      this.resources = response.resources || []
      this.emit('resourcesUpdated', this.resources)
      return this.resources
    } catch (error) {
      console.error('Failed to list resources:', error)
      return []
    }
  }

  // List available prompts
  async listPrompts() {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'prompts/list'
      })
      this.prompts = response.prompts || []
      this.emit('promptsUpdated', this.prompts)
      return this.prompts
    } catch (error) {
      console.error('Failed to list prompts:', error)
      return []
    }
  }

  // Call a tool
  async callTool(name, arguments_ = {}) {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'tools/call',
        params: {
          name,
          arguments: arguments_
        }
      })
      return response
    } catch (error) {
      console.error(`Failed to call tool ${name}:`, error)
      throw error
    }
  }

  // Read a resource
  async readResource(uri) {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'resources/read',
        params: { uri }
      })
      return response
    } catch (error) {
      console.error(`Failed to read resource ${uri}:`, error)
      throw error
    }
  }

  // Get a prompt
  async getPrompt(name, arguments_ = {}) {
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.getMessageId(),
        method: 'prompts/get',
        params: {
          name,
          arguments: arguments_
        }
      })
      return response
    } catch (error) {
      console.error(`Failed to get prompt ${name}:`, error)
      throw error
    }
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  // Utility methods
  getMessageId() {
    return ++this.messageId
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.pendingRequests.clear()
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      tools: this.tools,
      resources: this.resources,
      prompts: this.prompts
    }
  }
}

// Mock MCP Client for demo purposes
export class MockMCPClient extends MCPClient {
  constructor() {
    super()
    this.mockTools = [
      {
        name: 'filesystem_read',
        description: 'Read contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to read'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'filesystem_write',
        description: 'Write contents to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to write'
            },
            content: {
              type: 'string',
              description: 'Content to write to the file'
            }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'web_search',
        description: 'Search the web for information',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            }
          },
          required: ['query']
        }
      }
    ]
  }

  async connect(serverUrl) {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    this.isConnected = true
    this.tools = this.mockTools
    this.emit('initialized', { protocolVersion: '2024-11-05' })
    this.emit('toolsUpdated', this.tools)
    return Promise.resolve()
  }

  async callTool(name, arguments_ = {}) {
    // Simulate tool execution delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock responses based on tool name
    switch (name) {
      case 'filesystem_read':
        return {
          content: [
            {
              type: 'text',
              text: `Mock file content for path: ${arguments_.path}`
            }
          ]
        }
      case 'filesystem_write':
        return {
          content: [
            {
              type: 'text',
              text: `Successfully wrote content to: ${arguments_.path}`
            }
          ]
        }
      case 'web_search':
        return {
          content: [
            {
              type: 'text',
              text: `Mock search results for query: "${arguments_.query}"`
            }
          ]
        }
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  }

  disconnect() {
    this.isConnected = false
    this.emit('disconnected')
  }
}
