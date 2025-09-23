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
                    <el-icon><play /></el-icon>
                    Start Server
                  </el-button>
                  <el-button
                    v-if="isRunning"
                    type="danger"
                    size="small"
                    @click="stopServer"
                  >
                    <el-icon><stop /></el-icon>
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
                    <server />
                  </el-icon>
                </template>
              </el-empty>
            </div>

            <div v-else class="playground-content">
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

              <!-- Logs -->
              <div class="logs-section">
                <h4>Server Logs</h4>
                <div class="logs-container">
                  <div
                    v-for="(log, index) in logs"
                    :key="index"
                    class="log-entry"
                    :class="log.type"
                  >
                    <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                    <span class="log-message">{{ log.message }}</span>
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
  Play,
  Stop,
  Delete,
  Server
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

// Computed properties
const servers = computed(() => serversStore.servers)
const filteredServers = computed(() => {
  if (!searchQuery.value) return servers.value

  return servers.value.filter(server =>
    server.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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
    mcpClient.value.on('initialized', () => {
      addLog('success', 'MCP session initialized')
    })

    mcpClient.value.on('toolsUpdated', (tools) => {
      availableTools.value = tools
      addLog('info', `Found ${tools.length} available tools`)
    })

    mcpClient.value.on('disconnected', () => {
      isRunning.value = false
      addLog('warning', 'Server disconnected')
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
  addLog('info', `Arguments: ${JSON.stringify(toolArguments.value, null, 2)}`)

  try {
    const result = await mcpClient.value.callTool(selectedTool.value.name, toolArguments.value)

    addLog('success', `Tool ${selectedTool.value.name} executed successfully`)
    addLog('info', `Result: ${JSON.stringify(result, null, 2)}`)
    ElMessage.success(`Tool ${selectedTool.value.name} executed`)

    toolDialogVisible.value = false
  } catch (error) {
    addLog('error', `Tool ${selectedTool.value.name} failed: ${error.message}`)
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

const addLog = (type, message) => {
  logs.value.push({
    type,
    message,
    timestamp: new Date()
  })

  // Keep only last 100 logs
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100)
  }
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  try {
    await refreshServers()
  } catch (error) {
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
  height: 600px;

  .server-search {
    margin-bottom: 1rem;
  }

  .server-list {
    max-height: 500px;
    overflow-y: auto;

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
  height: 600px;

  .no-selection {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .playground-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .server-details {
    padding: 1rem;
    background-color: #f5f7fa;
    border-radius: 8px;

    h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }

    p {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .server-specs {
      display: flex;
      gap: 0.5rem;
    }
  }

  .server-status {
    margin-bottom: 1rem;
  }

  .mcp-tools {
    .tools-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .tool-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--primary-color);
          background-color: #f5f7fa;
        }

        .tool-info {
          h5 {
            margin: 0 0 0.25rem 0;
            font-size: 0.9rem;
            color: var(--text-color);
          }

          p {
            margin: 0;
            font-size: 0.8rem;
            color: #666;
          }
        }
      }
    }
  }

  .logs-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .logs-container {
      flex: 1;
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      overflow-y: auto;
      max-height: 200px;

      .log-entry {
        display: flex;
        margin-bottom: 0.25rem;

        .log-time {
          color: #888;
          margin-right: 0.5rem;
          min-width: 80px;
        }

        .log-message {
          flex: 1;
        }

        &.info .log-message {
          color: #4fc3f7;
        }

        &.success .log-message {
          color: #81c784;
        }

        &.warning .log-message {
          color: #ffb74d;
        }

        &.error .log-message {
          color: #f48fb1;
        }
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
</style>
