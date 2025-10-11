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
    // Create MCP client (using mock for demo)
    mcpClient.value = new MockMCPClient()

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

    // Connect to server (mock connection)
    await mcpClient.value.connect('ws://mock-server')

    isRunning.value = true
    connectionStatus.value = 'connected'
    addLog('success', `Server ${selectedServer.value.name} started successfully`)

    ElMessage.success('Server started successfully')
  } catch (error) {
    addLog('error', `Failed to start server: ${error.message}`)
    ElMessage.error('Failed to start server')
  } finally {
    isStarting.value = false
  }
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
}

.playground-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
  }

  p {
    font-size: 1.2rem;
    color: #666;
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
    }
  }
}

.server-selection-panel {
  height: calc(100vh - 280px);
  min-height: 500px;
  max-height: 600px;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
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
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--primary-color);
        background-color: #f5f7fa;
      }

      &.active {
        border-color: var(--primary-color);
        background-color: #ecf5ff;
      }

      .server-info {
        h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: var(--text-color);
        }

        .server-description {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
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
      color: #999;
    }
  }
}

.playground-area {
  // Use fixed height with inner scrolling for better control
  :deep(.el-card__body) {
    padding: 1rem;
    height: calc(100vh - 280px);
    min-height: 500px;
    display: flex;
    flex-direction: column;
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
  .server-details {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    background-color: #f5f7fa;
    border-radius: 6px;
    margin-bottom: 0.5rem;

    h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text-color);
      font-size: 0.9rem;
    }

    p {
      margin: 0 0 0.25rem 0;
      color: #666;
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
    background-color: #fafbfc;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    margin-bottom: 0.5rem;

    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
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
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        background-color: white;

        &:hover {
          border-color: var(--primary-color);
          background-color: #f5f7fa;
        }

        .tool-info {
          flex: 1;
          margin-right: 0.5rem;

          h5 {
            margin: 0 0 0.15rem 0;
            font-size: 0.85rem;
            color: var(--text-color);
          }

          p {
            margin: 0;
            font-size: 0.75rem;
            color: #666;
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
    background-color: #e6f7ff;
    padding: 0.5rem;
    border-radius: 6px;
    border: 3px solid #409eff;
    min-height: 250px !important; // Force minimum height
    overflow: hidden;
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);

    .logs-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background-color: #409eff;
      border-radius: 4px;
      color: white;

      h4 {
        margin: 0;
        font-size: 1rem;
        color: white;
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
      background-color: #1e1e1e;
      color: #d4d4d4;
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
        border-bottom: 1px solid #333;

        &:last-child {
          border-bottom: none;
        }

        .log-time {
          color: #888;
          font-size: 0.75rem;
          margin-right: 0.5rem;
          min-width: 80px;
        }

        .log-level {
          color: #666;
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
            background-color: #2d2d2d;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #e0e0e0;
            overflow-x: auto;
            margin: 0;
          }
        }

        &.info .log-level {
          color: #4fc3f7;
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
        color: #666;
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
    background-color: #f5f7fa;
    border-radius: 6px;
    color: #666;
  }

  .tool-form {
    .el-form-item {
      margin-bottom: 1rem;
    }
  }

  .no-schema {
    text-align: center;
    padding: 2rem;
    color: #999;
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
      // Ensure logs section is prominent - green for medium screens
      border-width: 4px !important;
      border-color: #67c23a !important;
      background-color: #f0f9ff !important;
      min-height: 200px !important;

      .logs-header {
        background-color: #67c23a !important;
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
      // Make logs section EXTREMELY prominent on small screens - RED ALERT
      border-width: 4px !important;
      border-color: #f56c6c !important;
      background-color: #fff0f0 !important;
      min-height: 180px !important;
      box-shadow: 0 0 15px rgba(245, 108, 108, 0.5) !important;

      .logs-header {
        background-color: #f56c6c !important;

        h4 {
          color: white !important;
        }
      }
    }
  }
}
</style>
