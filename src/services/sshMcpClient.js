// SSH-based MCP Client for remote Ubuntu node connections
// This client communicates with a backend service that handles SSH connections
import { apiClient } from './api'

export class SSHMCPClient {
  constructor(sshConfig = {}) {
    this.sshConfig = {
      host: sshConfig.host || import.meta.env.VITE_SSH_REMOTE_HOST || '',
      port: sshConfig.port || parseInt(import.meta.env.VITE_SSH_REMOTE_PORT || '22'),
      user: sshConfig.user || import.meta.env.VITE_SSH_REMOTE_USER || '',
      keyPath: sshConfig.keyPath || import.meta.env.VITE_SSH_REMOTE_KEY_PATH || '',
      password: sshConfig.password || import.meta.env.VITE_SSH_REMOTE_PASSWORD || '',
      workDir: sshConfig.workDir || import.meta.env.VITE_SSH_REMOTE_WORK_DIR || '~/mcp-servers',
      cmdPrefix: sshConfig.cmdPrefix || import.meta.env.VITE_SSH_REMOTE_CMD_PREFIX || '',
      timeout: sshConfig.timeout || parseInt(import.meta.env.VITE_SSH_REMOTE_TIMEOUT || '30'),
      strictHostKeyCheck: sshConfig.strictHostKeyCheck ||
        (import.meta.env.VITE_SSH_REMOTE_STRICT_HOST_KEY_CHECK === 'true'),
      knownHostsPath: sshConfig.knownHostsPath || import.meta.env.VITE_SSH_REMOTE_KNOWN_HOSTS_PATH || ''
    }

    this.messageId = 0
    this.pendingRequests = new Map()
    this.tools = []
    this.resources = []
    this.prompts = []
    this.isConnected = false
    this.listeners = new Map()
    this.sessionId = null
    this.serverCommand = null
  }

  // Connect to MCP server via SSH on remote node
  async connect(serverConfig) {
    try {
      // Validate SSH configuration
      if (!this.sshConfig.host) {
        throw new Error('SSH remote host is not configured')
      }
      if (!this.sshConfig.user) {
        throw new Error('SSH remote user is not configured')
      }

      // Build server command from server configuration
      this.serverCommand = this.buildServerCommand(serverConfig)

      // Establish SSH connection and start MCP server via backend API
      const response = await apiClient.post('/playground/ssh/connect', {
        sshConfig: this.sshConfig,
        serverCommand: this.serverCommand,
        serverConfig: serverConfig
      })

      if (response.data && response.data.sessionId) {
        this.sessionId = response.data.sessionId
        this.isConnected = true

        // Initialize MCP session
        await this.initialize()

        return Promise.resolve()
      } else {
        throw new Error('Failed to establish SSH connection: ' + (response.data?.error || 'Unknown error'))
      }
    } catch (error) {
      this.isConnected = false
      throw error
    }
  }

  // Build the command to run the MCP server on the remote node
  buildServerCommand(serverConfig) {
    const { command, args, env } = serverConfig

    let cmd = ''

    // Add command prefix if configured
    if (this.sshConfig.cmdPrefix) {
      cmd += this.sshConfig.cmdPrefix + ' '
    }

    // Add the main command
    if (Array.isArray(command)) {
      cmd += command.join(' ')
    } else if (typeof command === 'string') {
      cmd += command
    }

    // Add arguments
    if (args && Array.isArray(args)) {
      cmd += ' ' + args.join(' ')
    }

    // Change to work directory
    const fullCmd = `cd ${this.sshConfig.workDir} && ${cmd}`

    return fullCmd
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
            name: 'mcpx-ui-playground-ssh',
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

  // Send JSON-RPC request via SSH proxy
  async sendRequest(message) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error('Not connected to server')
    }

    try {
      const response = await apiClient.post(`/playground/ssh/session/${this.sessionId}/request`, {
        message: message
      }, {
        timeout: this.sshConfig.timeout * 1000
      })

      if (response.data && response.data.error) {
        throw new Error(response.data.error.message || 'Request failed')
      }

      return response.data.result
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error.message || 'Request failed')
      }
      throw error
    }
  }

  // Send JSON-RPC notification via SSH proxy
  sendNotification(message) {
    if (!this.isConnected || !this.sessionId) {
      console.warn('Not connected to server')
      return
    }

    // Notifications are fire-and-forget, so we don't wait for response
    apiClient.post(`/playground/ssh/session/${this.sessionId}/notification`, {
      message: message
    }).catch(error => {
      console.warn('Failed to send notification:', error)
    })
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

  async disconnect() {
    if (this.sessionId) {
      try {
        await apiClient.post(`/playground/ssh/session/${this.sessionId}/disconnect`)
      } catch (error) {
        console.warn('Error disconnecting SSH session:', error)
      }
      this.sessionId = null
    }
    this.isConnected = false
    this.pendingRequests.clear()
    this.emit('disconnected')
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      tools: this.tools,
      resources: this.resources,
      prompts: this.prompts,
      sshConfig: {
        host: this.sshConfig.host,
        user: this.sshConfig.user,
        port: this.sshConfig.port
      }
    }
  }
}
