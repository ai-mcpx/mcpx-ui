<template>
  <div class="playground-container">
    <div class="playground-header">
      <h1>MCP Server Playground</h1>
      <p>Test and run MCP servers directly in your browser</p>
    </div>

    <div class="playground-content">
      <el-row :gutter="20">
        <!-- Server Selection Panel -->
        <el-col :span="8">
          <el-card class="server-selection-panel">
            <template #header>
              <div class="panel-header">
                <h3>Select Server</h3>
                <el-button
                  type="primary"
                  size="small"
                  @click="refreshServers"
                  :loading="loadingServers"
                >
                  <el-icon><refresh /></el-icon>
                  Refresh
                </el-button>
              </div>
            </template>

            <div class="server-search">
              <el-input
                v-model="searchQuery"
                placeholder="Search servers..."
                clearable
                @input="filterServers"
              >
                <template #prefix>
                  <el-icon><search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="server-list">
              <div
                v-for="server in filteredServers"
                :key="server.id"
                class="server-item"
                :class="{ active: selectedServer?.id === server.id }"
                @click="selectServer(server)"
              >
                <div class="server-info">
                  <h4>{{ formatServerName(server.name) }}</h4>
                  <p class="server-description">{{ server.description }}</p>
                  <div class="server-meta">
                    <el-tag size="small" type="info">{{ server.version }}</el-tag>
                    <el-tag
                      v-if="server.repository?.source"
                      size="small"
                      :type="getSourceTagType(server.repository.source)"
                    >
                      {{ server.repository.source }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <div v-if="filteredServers.length === 0" class="no-servers">
                <p>No servers found</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Playground Area -->
        <el-col :span="16">
          <el-card class="playground-area">
            <template #header>
              <div class="panel-header">
                <h3>Playground</h3>
                <div class="playground-actions">
                  <el-button
                    v-if="selectedServer"
                    type="success"
                    size="small"
                    @click="startServer"
                    :loading="isStarting"
                    :disabled="isRunning"
                  >
                    <el-icon><CaretRight /></el-icon>
                    Start Server
                  </el-button>
                  <el-button
                    v-if="isRunning"
                    type="danger"
                    size="small"
                    @click="stopServer"
                  >
                    <el-icon><CircleClose /></el-icon>
                    Stop Server
                  </el-button>
                  <el-button
                    v-if="isRunning"
                    type="warning"
                    size="small"
                    @click="clearLogs"
                  >
                    <el-icon><delete /></el-icon>
                    Clear Logs
                  </el-button>
                </div>
              </div>
            </template>

            <div v-if="!selectedServer" class="no-selection">
              <el-empty description="Select a server to start testing">
                <template #image>
                  <el-icon size="64" color="#409eff">
                    <Monitor />
                  </el-icon>
                </template>
              </el-empty>
            </div>

            <div v-else class="server-playground-area">
              <!-- Connection Mode Selection -->
              <div class="connection-mode">
                <el-radio-group v-model="connectionMode" size="small">
                  <el-radio-button label="local">Local/Mock</el-radio-button>
                  <el-radio-button
                    label="ssh"
                    :disabled="!sshEnabled"
                  >
                    SSH Remote Node
                  </el-radio-button>
                </el-radio-group>
                <el-button
                  v-if="connectionMode === 'ssh'"
                  type="text"
                  size="small"
                  @click="showSshConfigDialog = true"
                >
                  Configure SSH
                </el-button>
              </div>

              <!-- SSH Configuration Dialog -->
              <el-dialog
                v-model="showSshConfigDialog"
                title="SSH Remote Node Configuration"
                width="600px"
                :close-on-click-modal="false"
              >
                <el-form
                  :model="sshConfig"
                  label-width="180px"
                  label-position="left"
                >
                  <el-form-item label="Remote Host">
                    <el-input
                      v-model="sshConfig.host"
                      placeholder="e.g., ubuntu.example.com or 192.168.1.100"
                    />
                  </el-form-item>
                  <el-form-item label="SSH Port">
                    <el-input-number
                      v-model="sshConfig.port"
                      :min="1"
                      :max="65535"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item label="Username">
                    <el-input
                      v-model="sshConfig.user"
                      placeholder="e.g., ubuntu"
                    />
                  </el-form-item>
                  <el-form-item label="Private Key Path">
                    <el-input
                      v-model="sshConfig.keyPath"
                      placeholder="Leave empty to use ~/.ssh/id_rsa"
                    />
                  </el-form-item>
                  <el-form-item label="Password (optional)">
                    <el-input
                      v-model="sshConfig.password"
                      type="password"
                      show-password
                      placeholder="Only if not using key-based auth"
                    />
                  </el-form-item>
                  <el-form-item label="Working Directory">
                    <el-input
                      v-model="sshConfig.workDir"
                      placeholder="e.g., ~/mcp-servers"
                    />
                  </el-form-item>
                  <el-form-item label="Command Prefix">
                    <el-input
                      v-model="sshConfig.cmdPrefix"
                      placeholder="e.g., python3 -m or node"
                    />
                  </el-form-item>
                  <el-form-item label="Connection Timeout (s)">
                    <el-input-number
                      v-model="sshConfig.timeout"
                      :min="5"
                      :max="300"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item label="Strict Host Key Check">
                    <el-switch v-model="sshConfig.strictHostKeyCheck" />
                  </el-form-item>
                </el-form>
                <template #footer>
                  <el-button @click="showSshConfigDialog = false">Cancel</el-button>
                  <el-button type="primary" @click="saveSshConfig">Save</el-button>
                </template>
              </el-dialog>

              <!-- Server Info -->
              <div class="server-details">
                <h4>{{ selectedServer.name }}</h4>
                <p>{{ selectedServer.description }}</p>
                <div class="server-specs">
                  <el-tag v-if="selectedServer.version" size="small">
                    Version: {{ selectedServer.version }}
                  </el-tag>
                  <el-tag v-if="selectedServer.repository?.source" size="small">
                    Source: {{ selectedServer.repository.source }}
                  </el-tag>
                  <el-tag v-if="connectionMode === 'ssh'" type="success" size="small">
                    SSH: {{ sshConfig.host || 'Not configured' }}
                  </el-tag>
                </div>
              </div>

              <!-- Server Status -->
              <div class="server-status">
                <el-alert
                  v-if="!isRunning"
                  title="Server not running"
                  type="info"
                  :closable="false"
                />
                <el-alert
                  v-else-if="connectionStatus === 'connected'"
                  title="Server is running and connected"
                  type="success"
                  :closable="false"
                />
                <el-alert
                  v-else
                  title="Server starting..."
                  type="warning"
                  :closable="false"
                />
              </div>

              <!-- MCP Tools -->
              <div v-if="isRunning" class="mcp-tools">
                <h4>Available Tools</h4>
                <div class="tools-list">
                  <div
                    v-for="tool in availableTools"
                    :key="tool.name"
                    class="tool-item"
                  >
                    <div class="tool-info">
                      <h5>{{ tool.name }}</h5>
                      <p>{{ tool.description }}</p>
                    </div>
                    <el-button
                      type="primary"
                      size="small"
                      @click="openToolDialog(tool)"
                    >
                      Execute
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- Tool Execution Dialog -->
              <el-dialog
                v-model="toolDialogVisible"
                :title="`Execute Tool: ${selectedTool?.name}`"
                width="600px"
                :close-on-click-modal="false"
              >
                <div v-if="selectedTool" class="tool-dialog-content">
                  <p class="tool-description">{{ selectedTool.description }}</p>

                  <el-form
                    v-if="selectedTool.inputSchema"
                    :model="toolArguments"
                    label-width="120px"
                    class="tool-form"
                  >
                    <el-form-item
                      v-for="(prop, key) in selectedTool.inputSchema.properties"
                      :key="key"
                      :label="key"
                      :required="selectedTool.inputSchema.required?.includes(key)"
                    >
                      <el-input
                        v-if="prop.type === 'string'"
                        v-model="toolArguments[key]"
                        :placeholder="prop.description || `Enter ${key}`"
                        type="textarea"
                        :rows="3"
                      />
                      <el-input-number
                        v-else-if="prop.type === 'number'"
                        v-model="toolArguments[key]"
                        :placeholder="prop.description || `Enter ${key}`"
                        style="width: 100%"
                      />
                      <el-switch
                        v-else-if="prop.type === 'boolean'"
                        v-model="toolArguments[key]"
                      />
                      <el-input
                        v-else
                        v-model="toolArguments[key]"
                        :placeholder="prop.description || `Enter ${key}`"
                      />
                    </el-form-item>
                  </el-form>

                  <div v-else class="no-schema">
                    <p>No input schema available for this tool.</p>
                  </div>
                </div>

                <template #footer>
                  <el-button @click="toolDialogVisible = false">Cancel</el-button>
                  <el-button
                    type="primary"
                    @click="executeToolWithArguments"
                    :loading="toolExecuting"
                  >
                    Execute
                  </el-button>
                </template>
              </el-dialog>

              <!-- Logs - Always Visible -->
              <div class="logs-section">
                <div class="logs-header">
                  <h4>📋 Server Console (Logs)</h4>
                  <div class="logs-controls">
                    <el-select
                      v-model="logLevelFilter"
                      placeholder="Filter by level"
                      size="small"
                      style="width: 120px"
                      clearable
                    >
                      <el-option label="All" value="" />
                      <el-option label="Info" value="info" />
                      <el-option label="Success" value="success" />
                      <el-option label="Warning" value="warning" />
                      <el-option label="Error" value="error" />
                      <el-option label="Debug" value="debug" />
                    </el-select>
                    <el-button
                      size="small"
                      @click="exportLogs"
                      :disabled="filteredLogs.length === 0"
                    >
                      <el-icon><download /></el-icon>
                      Export
                    </el-button>
                    <el-button
                      size="small"
                      @click="clearLogs"
                    >
                      <el-icon><delete /></el-icon>
                      Clear
                    </el-button>
                  </div>
                </div>
                <div class="logs-container">
                  <div
                    v-for="(log, index) in filteredLogs"
                    :key="index"
                    class="log-entry"
                    :class="log.type"
                  >
                    <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                    <span class="log-level">{{ log.type.toUpperCase() }}</span>
                    <span class="log-message">{{ log.message }}</span>
                    <div v-if="log.data" class="log-data">
                      <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
                    </div>
                  </div>
                  <div v-if="filteredLogs.length === 0" class="no-logs">
                    <p>No logs to display</p>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useServersStore } from '../stores/servers'
import { MCPClient, MockMCPClient } from '../services/mcpClient'
import { SSHMCPClient } from '../services/sshMcpClient'
import {
  Refresh,
  Search,
  CaretRight,
  CircleClose,
  Delete,
  Monitor,
  Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const serversStore = useServersStore()

// Reactive state
const selectedServer = ref(null)
const searchQuery = ref('')
const isRunning = ref(false)
const isStarting = ref(false)
const loadingServers = ref(false)
const logs = ref([])
const availableTools = ref([])
const mcpClient = ref(null)
const connectionStatus = ref('disconnected')
const toolDialogVisible = ref(false)
const selectedTool = ref(null)
const toolArguments = ref({})
const toolExecuting = ref(false)
const logLevelFilter = ref('')
const connectionMode = ref('local') // 'local' or 'ssh'
const sshEnabled = ref(import.meta.env.VITE_ENABLE_SSH_REMOTE_NODE === 'true')
const showSshConfigDialog = ref(false)
const sshConfig = ref({
  host: import.meta.env.VITE_SSH_REMOTE_HOST || '',
  port: parseInt(import.meta.env.VITE_SSH_REMOTE_PORT || '22'),
  user: import.meta.env.VITE_SSH_REMOTE_USER || '',
  keyPath: import.meta.env.VITE_SSH_REMOTE_KEY_PATH || '',
  password: import.meta.env.VITE_SSH_REMOTE_PASSWORD || '',
  workDir: import.meta.env.VITE_SSH_REMOTE_WORK_DIR || '~/mcp-servers',
  cmdPrefix: import.meta.env.VITE_SSH_REMOTE_CMD_PREFIX || '',
  timeout: parseInt(import.meta.env.VITE_SSH_REMOTE_TIMEOUT || '30'),
  strictHostKeyCheck: import.meta.env.VITE_SSH_REMOTE_STRICT_HOST_KEY_CHECK === 'true',
  knownHostsPath: import.meta.env.VITE_SSH_REMOTE_KNOWN_HOSTS_PATH || ''
})

// Computed properties
const servers = computed(() => serversStore.servers)
const filteredServers = computed(() => {
  if (!searchQuery.value) return servers.value

  return servers.value.filter(server =>
    server.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredLogs = computed(() => {
  if (!logLevelFilter.value) return logs.value

  return logs.value.filter(log => log.type === logLevelFilter.value)
})

// Methods
const formatServerName = (name) => {
  const parts = name.split('/')
  return parts[parts.length - 1] || name
}

const getSourceTagType = (source) => {
  const types = {
    'github': 'success',
    'gitlab': 'warning',
    'gerrit': 'info'
  }
  return types[source] || 'info'
}

const selectServer = (server) => {
  selectedServer.value = server
  if (isRunning.value) {
    stopServer()
  }
  // Reset connection mode to local when selecting a new server
  if (!sshEnabled.value) {
    connectionMode.value = 'local'
  }
}

const refreshServers = async () => {
  loadingServers.value = true
  try {
    await serversStore.fetchServers(100) // Load more servers for playground
    ElMessage.success('Servers refreshed')
  } catch (error) {
    ElMessage.error('Failed to refresh servers')
    console.error('Error refreshing servers:', error)
  } finally {
    loadingServers.value = false
  }
}

const startServer = async () => {
  if (!selectedServer.value) return

  isStarting.value = true
  addLog('info', 'Starting server...')

  try {
    // Create MCP client based on connection mode
    if (connectionMode.value === 'ssh') {
      // Validate SSH configuration
      if (!sshConfig.value.host || !sshConfig.value.user) {
        throw new Error('SSH configuration is incomplete. Please configure SSH settings.')
      }

      addLog('info', `Connecting to remote node via SSH: ${sshConfig.value.user}@${sshConfig.value.host}`)
      mcpClient.value = new SSHMCPClient(sshConfig.value)

      // Build server configuration from selected server
      const serverConfig = buildServerConfig(selectedServer.value)
      addLog('info', `Server command: ${serverConfig.command}`, serverConfig)
    } else {
      // Use mock client for local mode
      addLog('info', 'Using local/mock MCP client')
      mcpClient.value = new MockMCPClient()
    }

    // Set up event listeners
    mcpClient.value.on('initialized', (sessionInfo) => {
      addLog('success', 'MCP session initialized', sessionInfo)
    })

    mcpClient.value.on('toolsUpdated', (tools) => {
      availableTools.value = tools
      addLog('info', `Found ${tools.length} available tools`, tools.map(t => ({ name: t.name, description: t.description })))
    })

    mcpClient.value.on('disconnected', (reason) => {
      isRunning.value = false
      addLog('warning', `Server disconnected: ${reason || 'Unknown reason'}`, { reason })
    })

    mcpClient.value.on('error', (error) => {
      addLog('error', `MCP Client Error: ${error.message}`, error)
    })

    mcpClient.value.on('message', (message) => {
      addLog('debug', `MCP Message: ${message.method || 'Unknown method'}`, message)
    })

    mcpClient.value.on('response', (response) => {
      addLog('debug', `MCP Response received`, response)
    })

    // Connect to server
    if (connectionMode.value === 'ssh') {
      const serverConfig = buildServerConfig(selectedServer.value)
      await mcpClient.value.connect(serverConfig)
    } else {
      await mcpClient.value.connect('ws://mock-server')
    }

    isRunning.value = true
    connectionStatus.value = 'connected'
    addLog('success', `Server ${selectedServer.value.name} started successfully via ${connectionMode.value === 'ssh' ? 'SSH' : 'local/mock'}`)

    ElMessage.success('Server started successfully')
  } catch (error) {
    addLog('error', `Failed to start server: ${error.message}`, error)
    ElMessage.error(`Failed to start server: ${error.message}`)
    if (mcpClient.value) {
      mcpClient.value = null
    }
  } finally {
    isStarting.value = false
  }
}

// Build server configuration from selected server
const buildServerConfig = (server) => {
  // Extract command and args from server configuration
  // This depends on how the server package is structured
  const config = {
    command: '',
    args: [],
    env: {}
  }

  // Try to extract from server.package or server.config
  if (server.package?.command) {
    if (Array.isArray(server.package.command)) {
      config.command = server.package.command[0]
      config.args = server.package.command.slice(1)
    } else if (typeof server.package.command === 'string') {
      const parts = server.package.command.split(' ')
      config.command = parts[0]
      config.args = parts.slice(1)
    }
  }

  // Extract environment variables if available
  if (server.package?.environmentVariables) {
    server.package.environmentVariables.forEach(envVar => {
      if (envVar.name && envVar.value) {
        config.env[envVar.name] = envVar.value
      }
    })
  }

  return config
}

// Save SSH configuration
const saveSshConfig = () => {
  // Validate required fields
  if (!sshConfig.value.host || !sshConfig.value.user) {
    ElMessage.warning('Please fill in at least Host and Username')
    return
  }

  showSshConfigDialog.value = false
  ElMessage.success('SSH configuration saved')
  addLog('info', 'SSH configuration updated', {
    host: sshConfig.value.host,
    user: sshConfig.value.user,
    port: sshConfig.value.port
  })
}

const stopServer = () => {
  if (mcpClient.value) {
    mcpClient.value.disconnect()
    mcpClient.value = null
  }
  isRunning.value = false
  connectionStatus.value = 'disconnected'
  availableTools.value = []
  addLog('warning', 'Server stopped')
  ElMessage.info('Server stopped')
}

const clearLogs = () => {
  logs.value = []
  ElMessage.info('Logs cleared')
}

const openToolDialog = (tool) => {
  selectedTool.value = tool
  toolArguments.value = {}
  toolDialogVisible.value = true
}

const executeToolWithArguments = async () => {
  if (!mcpClient.value || !selectedTool.value) {
    addLog('error', 'No MCP client connected or tool selected')
    return
  }

  toolExecuting.value = true
  addLog('info', `Executing tool: ${selectedTool.value.name}`)
  addLog('debug', `Tool arguments:`, toolArguments.value)

  try {
    const startTime = Date.now()
    const result = await mcpClient.value.callTool(selectedTool.value.name, toolArguments.value)
    const executionTime = Date.now() - startTime

    addLog('success', `Tool ${selectedTool.value.name} executed successfully in ${executionTime}ms`)
    addLog('info', `Tool result:`, result)
    ElMessage.success(`Tool ${selectedTool.value.name} executed`)

    toolDialogVisible.value = false
  } catch (error) {
    addLog('error', `Tool ${selectedTool.value.name} failed: ${error.message}`, error)
    ElMessage.error(`Tool ${selectedTool.value.name} failed`)
  } finally {
    toolExecuting.value = false
  }
}

const executeTool = async (tool) => {
  if (!mcpClient.value) {
    addLog('error', 'No MCP client connected')
    return
  }

  addLog('info', `Executing tool: ${tool.name}`)

  try {
    // For demo purposes, use mock arguments
    const mockArgs = getMockArguments(tool.name)
    const result = await mcpClient.value.callTool(tool.name, mockArgs)

    addLog('success', `Tool ${tool.name} executed successfully`)
    addLog('info', `Result: ${JSON.stringify(result, null, 2)}`)
    ElMessage.success(`Tool ${tool.name} executed`)
  } catch (error) {
    addLog('error', `Tool ${tool.name} failed: ${error.message}`)
    ElMessage.error(`Tool ${tool.name} failed`)
  }
}

const getMockArguments = (toolName) => {
  switch (toolName) {
    case 'filesystem_read':
      return { path: '/tmp/example.txt' }
    case 'filesystem_write':
      return { path: '/tmp/example.txt', content: 'Hello, MCP!' }
    case 'web_search':
      return { query: 'Model Context Protocol' }
    default:
      return {}
  }
}

const addLog = (type, message, data = null) => {
  const logEntry = {
    type,
    message,
    data,
    timestamp: new Date()
  }

  logs.value.push(logEntry)

  // Keep only last 200 logs for better performance
  if (logs.value.length > 200) {
    logs.value = logs.value.slice(-200)
  }

  // Also log to browser console for debugging
  const consoleMethod = type === 'error' ? 'error' :
                       type === 'warning' ? 'warn' :
                       type === 'debug' ? 'debug' : 'log'

  console[consoleMethod](`[MCP Playground] ${message}`, data || '')
}

const exportLogs = () => {
  if (filteredLogs.value.length === 0) {
    ElMessage.warning('No logs to export')
    return
  }

  const logContent = filteredLogs.value.map(log => {
    const timestamp = log.timestamp.toISOString()
    const level = log.type.toUpperCase()
    const message = log.message
    const data = log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''
    return `[${timestamp}] ${level}: ${message}${data}`
  }).join('\n\n')

  const blob = new Blob([logContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mcp-playground-logs-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('Logs exported successfully')
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  // Add initial console log to demonstrate functionality
  addLog('info', 'MCP Playground initialized')
  addLog('debug', 'Console logging enabled with enhanced features', {
    features: ['Level filtering', 'Data export', 'Browser console integration', 'Detailed MCP protocol logging']
  })

  try {
    await refreshServers()
    addLog('success', 'Servers loaded successfully')
  } catch (error) {
    addLog('error', 'Failed to load servers', error)
    console.error('Failed to load servers:', error)
  }
})

onUnmounted(() => {
  if (mcpClient.value) {
    mcpClient.value.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.playground-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  color: #ffffff;
  min-height: calc(100vh - 200px);
}

.playground-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #ffffff;
  }

  p {
    font-size: 1.2rem;
    color: #e8eaed;
  }
}

.playground-content {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #ffffff;
    }
  }
}

.server-selection-panel {
  height: calc(100vh - 280px);
  min-height: 500px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  border: 1px solid #30363d;

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
    border-bottom: 1px solid #30363d;
    color: #ffffff;
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    color: #e8eaed;
  }

  .server-search {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .server-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;

    .server-item {
      padding: 1rem;
      border: 1px solid #30363d;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.3s;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);

      &:hover {
        border-color: #8ab4f8;
        background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
      }

      &.active {
        border-color: #8ab4f8;
        background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      }

      .server-info {
        h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #ffffff;
        }

        .server-description {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #e8eaed;
          line-height: 1.4;
        }

        .server-meta {
          display: flex;
          gap: 0.5rem;
        }
      }
    }

    .no-servers {
      text-align: center;
      padding: 2rem;
      color: #e8eaed;
    }
  }
}

.playground-area {
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  border: 1px solid #30363d;

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
    border-bottom: 1px solid #30363d;
    color: #ffffff;
  }

  // Use fixed height with inner scrolling for better control
  :deep(.el-card__body) {
    padding: 1rem;
    height: calc(100vh - 280px);
    min-height: 500px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    color: #e8eaed;
  }

  .no-selection {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .server-playground-area {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // Compact upper sections
  .connection-mode {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border: 1px solid #30363d;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    .el-radio-group {
      flex: 1;
    }
  }

  .server-details {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border: 1px solid #30363d;

    h4 {
      margin: 0 0 0.25rem 0;
      color: #ffffff;
      font-size: 0.9rem;
    }

    p {
      margin: 0 0 0.25rem 0;
      color: #e8eaed;
      font-size: 0.85rem;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .server-specs {
      display: flex;
      gap: 0.5rem;
    }
  }

  .server-status {
    flex-shrink: 0;
    margin-bottom: 0.5rem;
  }

  .mcp-tools {
    flex-shrink: 0;
    max-height: 150px;
    overflow-y: auto;
    padding: 0.5rem;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border-radius: 6px;
    border: 1px solid #30363d;
    margin-bottom: 0.5rem;

    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #ffffff;
    }

    .tools-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .tool-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border: 1px solid #30363d;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);

        &:hover {
          border-color: #8ab4f8;
          background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
        }

        .tool-info {
          flex: 1;
          margin-right: 0.5rem;

          h5 {
            margin: 0 0 0.15rem 0;
            font-size: 0.85rem;
            color: #ffffff;
          }

          p {
            margin: 0;
            font-size: 0.75rem;
            color: #e8eaed;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }

  // Logs section takes all remaining space - ALWAYS VISIBLE
  .logs-section {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    padding: 0.5rem;
    border-radius: 6px;
    border: 3px solid #8ab4f8;
    min-height: 250px !important; // Force minimum height
    overflow: hidden;
    box-shadow: 0 0 10px rgba(138, 180, 248, 0.3);

    .logs-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-radius: 4px;
      color: white;

      h4 {
        margin: 0;
        font-size: 1rem;
        color: #ffffff;
        font-weight: 700;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
      }

      .logs-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    }

    .logs-container {
      flex: 1;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
      color: #e8eaed;
      padding: 0.75rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      overflow-y: auto;
      min-height: 0; // Important for flex scrolling

      .log-entry {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.5rem;
        padding: 0.25rem 0;
        border-bottom: 1px solid #30363d;

        &:last-child {
          border-bottom: none;
        }

        .log-time {
          color: #8b949e;
          font-size: 0.75rem;
          margin-right: 0.5rem;
          min-width: 80px;
        }

        .log-level {
          color: #8b949e;
          font-size: 0.75rem;
          margin-right: 0.5rem;
          min-width: 60px;
          font-weight: bold;
        }

        .log-message {
          flex: 1;
          margin-bottom: 0.25rem;
        }

        .log-data {
          margin-left: 1rem;
          margin-top: 0.25rem;

          pre {
            background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #e8eaed;
            overflow-x: auto;
            margin: 0;
          }
        }

        &.info .log-level {
          color: #8ab4f8;
        }

        &.success .log-level {
          color: #81c784;
        }

        &.warning .log-level {
          color: #ffb74d;
        }

        &.error .log-level {
          color: #f48fb1;
        }

        &.debug .log-level {
          color: #ba68c8;
        }
      }

      .no-logs {
        text-align: center;
        padding: 2rem;
        color: #e8eaed;
        font-style: italic;
      }
    }
  }
}

.playground-actions {
  display: flex;
  gap: 0.5rem;
}

.tool-dialog-content {
  .tool-description {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border-radius: 6px;
    color: #e8eaed;
    border: 1px solid #30363d;
  }

  .tool-form {
    .el-form-item {
      margin-bottom: 1rem;
    }
  }

  .no-schema {
    text-align: center;
    padding: 2rem;
    color: #e8eaed;
  }
}

// Responsive styles for vertical and mobile displays
@media (max-width: 1200px) {
  .playground-container {
    padding: 1rem;
  }

  .playground-content {
    .el-row {
      flex-direction: column !important;
      margin: 0 !important;
    }

    .el-col {
      max-width: 100% !important;
      width: 100% !important;
      padding: 0 !important;
      margin-bottom: 1rem;
    }
  }

  .server-selection-panel {
    height: 300px !important;
    min-height: 300px !important;
    margin-bottom: 1rem;
  }

  .playground-area {
    :deep(.el-card__body) {
      height: calc(100vh - 450px) !important;
      min-height: 500px !important;
    }

    .mcp-tools {
      max-height: 120px;
    }

    .logs-section {
      min-height: 220px !important;
    }
  }
}

// Additional adjustments for vertical orientation or small heights
@media (max-height: 800px) {
  .playground-area {
    :deep(.el-card__body) {
      height: calc(100vh - 250px);
      min-height: 400px;
    }

    .server-details p {
      -webkit-line-clamp: 1;
    }

    .mcp-tools {
      max-height: 100px;
    }

    .logs-section {
      // Ensure logs section is prominent - blue for medium screens
      border-width: 4px !important;
      border-color: #8ab4f8 !important;
      background: linear-gradient(135deg, #161b22 0%, #1f2937 100%) !important;
      min-height: 200px !important;

      .logs-header {
        background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;
      }
    }
  }
}

// Very small screens or landscape mobile
@media (max-height: 600px) {
  .playground-header {
    margin-bottom: 1rem;

    h1 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }

  .server-selection-panel {
    height: 300px;
  }

  .playground-area {
    :deep(.el-card__body) {
      height: calc(100vh - 180px);
      min-height: 350px;
    }

    .server-details {
      padding: 0.25rem 0.5rem;

      h4 {
        font-size: 0.85rem;
      }

      p {
        display: none; // Hide description on very small screens
      }
    }

    .mcp-tools {
      max-height: 80px;

      h4 {
        font-size: 0.85rem;
      }

      .tool-item {
        padding: 0.35rem;

        .tool-info {
          h5 {
            font-size: 0.8rem;
          }

          p {
            display: none; // Hide tool descriptions
          }
        }
      }
    }

    .logs-section {
      // Make logs section EXTREMELY prominent on small screens - BLUE ACCENT
      border-width: 4px !important;
      border-color: #8ab4f8 !important;
      background: linear-gradient(135deg, #161b22 0%, #1f2937 100%) !important;
      min-height: 180px !important;
      box-shadow: 0 0 15px rgba(138, 180, 248, 0.5) !important;

      .logs-header {
        background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;

        h4 {
          color: #ffffff !important;
        }
      }
    }
  }
}
</style>
