<template>
  <div v-if="loading" class="loading-container">
    <el-skeleton :rows="10" animated />
  </div>

  <div v-else-if="error" class="error-container">
    <el-result
      icon="error"
      title="加载失败"
      :sub-title="error"
    >
      <template #extra>
        <el-button type="primary" @click="fetchServerData">重试</el-button>
        <el-button @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>

  <div v-else-if="server" class="server-detail-container">
    <div class="server-header">
      <div class="server-title-section">
        <div class="server-avatar">
          <el-avatar :size="60" :src="getServerIcon(server)">
            {{ getServerInitial(server.name) }}
          </el-avatar>
        </div>

        <div class="server-title-info">
          <h1>{{ formatServerName(server.name) }}</h1>
          <div class="server-meta">
            <el-tag size="small">{{ server.version || server.versionDetail?.version || 'Unknown' }}</el-tag>
            <span v-if="server.versionDetail?.isLatest" class="latest-tag">最新版本</span>
            <span v-if="server.versionDetail?.releaseDate && formatDate(server.versionDetail.releaseDate)" class="release-date">发布于 {{ formatDate(server.versionDetail.releaseDate) }}</span>
          </div>

          <div class="repository-link" v-if="server.repository">
            <el-button
              type="primary"
              size="small"
              :icon="Link"
              @click="openRepository(server.repository.url)"
            >
              {{ getRepositoryName(server.repository) }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="server-actions">
        <div class="action-buttons" v-if="authStore.isAuthenticated">
          <el-button
            type="primary"
            size="small"
            @click="showEditDialog"
            :disabled="server._meta?.status === 'deleted'"
          >
            <el-icon><edit /></el-icon>
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="showDeleteConfirm"
            :disabled="server._meta?.status === 'deleted'"
          >
            <el-icon><delete /></el-icon>
            删除
          </el-button>
        </div>
        <div v-if="server._meta?.status === 'deleted'" class="deleted-notice">
          <el-tag type="danger" size="small">已删除</el-tag>
        </div>
      </div>
    </div>

    <el-divider />

    <div class="server-description">
      <p>{{ server.description }}</p>
    </div>

    <div class="server-details">
      <el-tabs>
        <el-tab-pane label="安装信息">
          <div class="installation-info">
            <h3>安装包</h3>
            <div v-if="server.packages && server.packages.length > 0">
              <el-card v-for="(pkg, index) in server.packages" :key="`${pkg.identifier || pkg.registryType}-${index}`" class="package-card">
                <div class="package-header">
                  <el-tag size="small">{{ pkg.registryType || 'Unknown' }}</el-tag>
                </div>

                <div class="package-version">
                  <strong>版本:</strong> {{ pkg.version }}
                </div>

                <div v-if="pkg.runtimeHint" class="package-runtime">
                  <strong>运行时:</strong> {{ pkg.runtimeHint }}
                </div>

                <div v-if="pkg.transport?.type" class="package-transport">
                  <strong>传输类型:</strong> {{ pkg.transport.type }}
                </div>

                <div v-if="pkg.runtimeArguments && pkg.runtimeArguments.length > 0" class="package-runtime-args">
                  <h5>运行时参数:</h5>
                  <el-table :data="pkg.runtimeArguments" stripe style="width: 100%">
                    <el-table-column prop="name" label="名称" width="150" />
                    <el-table-column prop="type" label="类型" width="100" />
                    <el-table-column prop="description" label="描述" />
                    <el-table-column prop="isRequired" label="必需" width="80">
                      <template #default="{ row }">
                        <el-tag :type="row.isRequired ? 'danger' : 'info'" size="small">
                          {{ row.isRequired ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="default" label="默认值" width="120" />
                  </el-table>
                </div>

                <div v-if="pkg.environmentVariables && pkg.environmentVariables.length > 0" class="package-env-vars">
                  <h5>环境变量:</h5>
                  <el-table :data="pkg.environmentVariables" stripe style="width: 100%">
                    <el-table-column prop="name" label="名称" width="180" />
                    <el-table-column prop="description" label="描述" />
                    <el-table-column prop="format" label="格式" width="100" />
                    <el-table-column prop="isRequired" label="必需" width="80">
                      <template #default="{ row }">
                        <el-tag :type="row.isRequired ? 'danger' : 'info'" size="small">
                          {{ row.isRequired ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="default" label="默认值" width="120" />
                  </el-table>
                </div>

                <div v-if="getInstallCommand(pkg)" class="package-install">
                  <h5>安装命令:</h5>
                  <el-input
                    type="textarea"
                    :rows="1"
                    :value="getInstallCommand(pkg)"
                    readonly
                  >
                    <template #append>
                      <el-button @click="copyToClipboard(getInstallCommand(pkg))">
                        <el-icon><document-copy /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-card>
            </div>
            <el-empty v-else description="没有安装包信息" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="远程连接">
          <div class="remotes-info">
            <h3 style="color: #ffffff; margin-bottom: 20px;">
              <el-icon style="color: #8ab4f8; margin-right: 8px;"><Link /></el-icon>
              远程连接端点
            </h3>
            <div v-if="server.remotes && server.remotes.length > 0">
              <el-card v-for="(remote, index) in server.remotes" :key="index" class="remote-card">
                <div class="remote-header">
                  <h4 style="color: #8ab4f8; margin: 0; font-size: 16px;">
                    <el-icon style="margin-right: 6px;"><Link /></el-icon>
                    {{ remote.type || 'Unknown' }}
                  </h4>
                </div>

                <div class="remote-url" style="margin: 15px 0; color: #e8eaed;">
                  <strong style="color: #8ab4f8;">URL:</strong> {{ remote.url }}
                </div>

                <div v-if="remote.headers && remote.headers.length > 0" class="remote-headers">
                  <h5 style="color: #8ab4f8; margin: 15px 0 10px 0; font-size: 14px;">
                    <el-icon style="margin-right: 6px;"><Document /></el-icon>
                    请求头:
                  </h5>
                  <el-table :data="remote.headers" stripe style="width: 100%">
                    <el-table-column prop="name" label="名称" width="180" />
                    <el-table-column prop="description" label="描述" />
                    <el-table-column prop="value" label="值" width="200" />
                  </el-table>
                </div>
              </el-card>
            </div>
            <el-empty v-else description="没有远程连接信息" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <div v-else class="not-found-container">
    <el-result
      icon="info"
      title="未找到服务器"
      sub-title="请检查服务器名称是否正确"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>

  <!-- 服务器编辑器 -->
  <ServerEditor
    v-model:visible="showEditor"
    :server="server"
    :is-edit="true"
    @success="handleEditSuccess"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { useAuthStore } from '../stores/auth'
import { Link, ArrowDown, DocumentCopy, Edit, Delete, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ServerEditor from '../components/ServerEditor.vue'

const route = useRoute()
const store = useServersStore()
const authStore = useAuthStore()

const serverId = computed(() => route.params.name)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const server = computed(() => store.currentServer)

// 编辑相关状态
const showEditor = ref(false)

// 显示编辑对话框
const showEditDialog = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先进行身份认证')
    return
  }
  showEditor.value = true
}

// 显示删除确认
const showDeleteConfirm = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先进行身份认证')
    return
  }

  if (!server.value?.name || !server.value?.version) {
    ElMessage.error('无法获取服务器名称或版本，无法删除')
    return
  }

  ElMessageBox.confirm(
    `此操作将删除服务器版本 ${server.value.name}/${server.value.version}，是否继续？`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await store.deleteServerVersion(server.value.name, server.value.version)
      ElMessage.success('服务器版本已删除')
      // 重新获取服务器数据以显示更新后的状态
      await fetchServerData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 编辑成功后的处理
const handleEditSuccess = async () => {
  ElMessage.success('服务器更新成功')
  await fetchServerData()
}

// Get versions from server data or packages
const versions = computed(() => {
  if (!server.value) return []

  const versionSet = new Set()

  // Add current server version
  const serverVersion = server.value.version || server.value.versionDetail?.version
  if (serverVersion) {
    versionSet.add(serverVersion.trim())
  }

  // Add versions from packages
  if (server.value.packages) {
    server.value.packages.forEach(pkg => {
      if (pkg.version) {
        versionSet.add(pkg.version.trim())
      }
    })
  }

  // Convert Set to Array and filter out any empty strings
  const uniqueVersions = Array.from(versionSet).filter(version => version && version.length > 0)

  return uniqueVersions.sort((a, b) => {
    // Sort versions in descending order (newest first)
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })
  })
})

const hasMultipleVersions = computed(() => versions.value.length > 1)

const fetchServerData = async () => {
  try {
    await store.fetchServerDetail(decodeURIComponent(serverId.value))
  } catch (error) {
    console.error('Failed to load server details:', error)
  }
}

const formatServerName = (name) => {
  const parts = name.split('/')
  return parts[parts.length - 1] || name
}

const getServerInitial = (name) => {
  if (!name) return '?'
  const parts = name.split('/')
  const shortName = parts[parts.length - 1] || name
  return shortName.charAt(0).toUpperCase()
}

const getServerIcon = (server) => {
  if (server.repository && server.repository.source === 'github') {
    const repoName = getRepositoryName(server.repository)
    return `https://github.com/${repoName}.png`
  }
  return ''
}

const getRepositoryName = (repository) => {
  if (!repository || !repository.url) return ''

  try {
    const url = new URL(repository.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`
    }
    return url.hostname
  } catch (e) {
    return repository.url
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    console.error('Date formatting error:', e, 'for date:', dateString)
    return ''
  }
}

const openRepository = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

const getInstallCommand = (pkg) => {
  if (!pkg) return ''

  const registryType = pkg.registryType || ''
  const packageName = pkg.identifier || ''
  const version = pkg.version || ''

  const commands = {
    'npm': `npm install ${packageName}@${version}`,
    'pypi': `pip install ${packageName}==${version}`,
    'wheel': `curl -LO ${pkg.identifier}`,
    'binary': `curl -LO ${pkg.identifier}`,
    'homebrew': `brew install ${packageName}@${version}`,
    'nuget': `dotnet add package ${packageName} --version ${version}`,
    'oci': `docker pull ${packageName}:${version}`,
    'docker': `docker pull ${packageName}:${version}`,
    'mcpb': `Download from ${pkg.registryBaseUrl || 'registry'}: ${packageName} version ${version}`
  }

  return commands[registryType] || `# Install ${packageName} version ${version}`
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage({
      message: '已复制到剪贴板',
      type: 'success',
      duration: 2000
    })
  }).catch(() => {
    ElMessage({
      message: '复制失败',
      type: 'error',
      duration: 2000
    })
  })
}

onMounted(fetchServerData)

watch(() => route.params.name, (newId) => {
  if (newId) {
    fetchServerData()
  }
})
</script>

<style lang="scss" scoped>
.loading-container,
.error-container,
.not-found-container {
  padding: 2rem;
}

.server-detail-container {
  padding: 1rem 0;
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.server-title-section {
  display: flex;
  align-items: center;
}

.server-avatar {
  margin-right: 1.5rem;
}

.server-title-info {
  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
  }
}

.server-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;

  .latest-tag {
    color: #67c23a;
    font-weight: 500;
  }

  .release-date {
    color: #909399;
    font-size: 0.9rem;
  }
}


.repository-link {
  margin-top: 0.5rem;
}

.server-description {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.package-card,
.remote-card {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: #8ab4f8;
    box-shadow: 0 8px 24px rgba(138, 180, 248, 0.2);
    transform: translateY(-2px);
  }
}

.package-header,
.remote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #ffffff;
  }

  .package-name {
    font-weight: 500;
    color: #e8eaed;
  }
}

.package-version,
.package-runtime,
.package-transport,
.remote-url {
  margin-bottom: 0.75rem;
  color: #e8eaed;
}

.package-env-vars,
.package-runtime-args,
.package-install,
.remote-headers {
  margin-top: 1rem;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #30363d;

  h5 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #8ab4f8;
    font-weight: 600;
  }
}

.server-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

// Dark gradient table styling for remote headers
.remote-headers :deep(.el-table) {
  background: transparent;
  color: #e8eaed;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 0.5rem;

  th {
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%) !important;
    color: #8ab4f8 !important;
    border-bottom: 1px solid #30363d !important;
    font-weight: 600;
    padding: 8px 12px !important;
  }

  td {
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%) !important;
    color: #e8eaed !important;
    border-bottom: 1px solid #30363d !important;
    padding: 8px 12px !important;
  }

  tr:hover td {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;
  }
}

.package-runtime-args :deep(.el-table),
.package-env-vars :deep(.el-table) {
  background: transparent;
  color: #e8eaed;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 0.5rem;

  th {
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%) !important;
    color: #8ab4f8 !important;
    border-bottom: 1px solid #30363d !important;
    font-weight: 600;
    padding: 8px 12px !important;
  }

  td {
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%) !important;
    color: #e8eaed !important;
    border-bottom: 1px solid #30363d !important;
    padding: 8px 12px !important;
  }

  tr:hover td {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;
  }
}

.package-runtime-args :deep(.el-table .el-table__row--striped td),
.package-env-vars :deep(.el-table .el-table__row--striped td) {
  background: linear-gradient(135deg, #181f2a 0%, #20252c 100%) !important;
}

// Style el-tag components in table cells to match dark theme
.package-runtime-args :deep(.el-table),
.package-env-vars :deep(.el-table) {
  .el-tag {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;
    border-color: #30363d !important;
    color: #e8eaed !important;
    font-weight: 500;

    &.el-tag--danger {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%) !important;
      border-color: #dc2626 !important;
      color: #f87171 !important;
    }

    &.el-tag--info {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
      border-color: #3b82f6 !important;
      color: #60a5fa !important;
    }
  }

  td .el-tag {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%) !important;
    border-color: #30363d !important;
    color: #e8eaed !important;
    font-weight: 500;

    &.el-tag--danger {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%) !important;
      border-color: #dc2626 !important;
      color: #f87171 !important;
    }

    &.el-tag--info {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
      border-color: #3b82f6 !important;
      color: #60a5fa !important;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

// Dark gradient styling for remote cards
.remote-card {
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: #8ab4f8;
    box-shadow: 0 8px 24px rgba(138, 180, 248, 0.2);
    transform: translateY(-2px);
  }
}

// Dark gradient styling for empty states
.remotes-info :deep(.el-empty) {
  .el-empty__description {
    color: #e8eaed;
  }

  .el-empty__image {
    opacity: 0.6;
  }
}

// Dark gradient tabs styling
:deep(.el-tabs) {
  .el-tabs__header {
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border: 1px solid #30363d;
    border-radius: 12px 12px 0 0;
    margin: 0;
  }

  .el-tabs__nav-wrap {
    padding: 0 1rem;
  }

  .el-tabs__item {
    color: #e8eaed;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      color: #ffffff;
      background: rgba(138, 180, 248, 0.1);
      border-radius: 6px;
    }

    &.is-active {
      color: #8ab4f8;
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-radius: 6px;
    }
  }

  .el-tabs__active-bar {
    background: linear-gradient(90deg, #8ab4f8, #a8c7ff);
    height: 3px;
    border-radius: 2px;
  }

  .el-tabs__content {
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    border: 1px solid #30363d;
    border-top: none;
    border-radius: 0 0 12px 12px;
    padding: 2rem;
  }
}

.package-install :deep(.el-textarea__inner) {
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  color: #e8eaed;
  border: 1px solid #30363d;
  border-radius: 8px;
  caret-color: #8ab4f8;
}

.package-install :deep(.el-textarea__inner::placeholder) {
  color: #9aa0a6;
}

.package-install :deep(.el-textarea__inner:focus) {
  border-color: #8ab4f8;
  box-shadow: 0 0 0 2px rgba(138, 180, 248, 0.15);
}

.package-install :deep(.el-input-group__append) {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  border-color: #30363d;
}

.package-install :deep(.el-input-group__append .el-button) {
  color: #e8eaed;
}

.deleted-notice {
  font-size: 14px;
  color: #f56c6c;
}

// Dark gradient section headers
.installation-info h3,
.remotes-info h3 {
  color: #8ab4f8;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #8ab4f8;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.installation-info h3::before {
  content: "📦";
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.remotes-info h3::before {
  content: "🔗";
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

// Dark gradient input fields and form elements
:deep(.el-input) {
  .el-input__wrapper {
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border: 1px solid #30363d;
    border-radius: 6px;
    box-shadow: none;

    &:hover {
      border-color: #8ab4f8;
    }

    &.is-focus {
      border-color: #8ab4f8;
      box-shadow: 0 0 0 2px rgba(138, 180, 248, 0.2);
    }
  }

  .el-input__inner {
    color: #e8eaed;
    background: transparent;

    &::placeholder {
      color: #8b949e;
    }
  }
}

:deep(.el-button) {
  &.el-button--primary {
    background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
    border: 1px solid #8ab4f8;
    color: #8ab4f8;

    &:hover {
      background: linear-gradient(135deg, #21262d 0%, #2d3748 100%);
      border-color: #a8c7ff;
      color: #ffffff;
    }
  }

  &.el-button--default {
    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
    border: 1px solid #30363d;
    color: #e8eaed;

    &:hover {
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-color: #8ab4f8;
      color: #ffffff;
    }
  }
}
</style>
