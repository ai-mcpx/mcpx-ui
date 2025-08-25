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
            <el-tag size="small">{{ server.version_detail.version }}</el-tag>
            <span v-if="server.version_detail.is_latest" class="latest-tag">最新版本</span>
            <span class="release-date">发布于 {{ formatDate(server.version_detail.release_date) }}</span>
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
              <el-card v-for="pkg in server.packages" :key="pkg.name" class="package-card">
                <div class="package-header">
                  <el-tag size="small">{{ pkg.registry_name }}</el-tag>
                </div>

                <div class="package-version">
                  <strong>版本:</strong> {{ pkg.version }}
                </div>

                <div v-if="pkg.runtime_hint" class="package-runtime">
                  <strong>运行时:</strong> {{ pkg.runtime_hint }}
                </div>

                <div v-if="pkg.runtime_arguments && pkg.runtime_arguments.length > 0" class="package-runtime-args">
                  <h5>运行时参数:</h5>
                  <el-table :data="pkg.runtime_arguments" stripe style="width: 100%">
                    <el-table-column prop="name" label="名称" width="150" />
                    <el-table-column prop="type" label="类型" width="100" />
                    <el-table-column prop="description" label="描述" />
                    <el-table-column prop="is_required" label="必需" width="80">
                      <template #default="{ row }">
                        <el-tag :type="row.is_required ? 'danger' : 'info'" size="small">
                          {{ row.is_required ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="default" label="默认值" width="120" />
                  </el-table>
                </div>

                <div v-if="pkg.environment_variables && pkg.environment_variables.length > 0" class="package-env-vars">
                  <h5>环境变量:</h5>
                  <el-table :data="pkg.environment_variables" stripe style="width: 100%">
                    <el-table-column prop="name" label="名称" width="180" />
                    <el-table-column prop="description" label="描述" />
                    <el-table-column prop="format" label="格式" width="100" />
                    <el-table-column prop="is_required" label="必需" width="80">
                      <template #default="{ row }">
                        <el-tag :type="row.is_required ? 'danger' : 'info'" size="small">
                          {{ row.is_required ? '是' : '否' }}
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
            <h3>远程连接端点</h3>
            <div v-if="server.remotes && server.remotes.length > 0">
              <el-card v-for="(remote, index) in server.remotes" :key="index" class="remote-card">
                <div class="remote-header">
                  <h4>{{ remote.transport_type }}</h4>
                </div>

                <div class="remote-url">
                  <strong>URL:</strong> {{ remote.url }}
                </div>

                <div v-if="remote.headers && remote.headers.length > 0" class="remote-headers">
                  <h5>请求头:</h5>
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
      sub-title="请检查服务器ID是否正确"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'
import { Link, ArrowDown, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const store = useServersStore()

const serverId = computed(() => route.params.id)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const server = computed(() => store.currentServer)

// Get versions from server data or packages
const versions = computed(() => {
  if (!server.value) return []

  const versionSet = new Set()

  // Add current server version
  if (server.value.version_detail?.version) {
    versionSet.add(server.value.version_detail.version.trim())
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
    await store.fetchServerDetail(serverId.value)
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
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const openRepository = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

const getInstallCommand = (pkg) => {
  if (!pkg) return ''

  const commands = {
    'npm': `npm install ${pkg.name}@${pkg.version}`,
    'pypi': `pip install ${pkg.name}==${pkg.version}`,
    'wheel': pkg.wheel_url ? `curl -O ${pkg.wheel_url} && pip install ${pkg.name}-*.whl` : `pip install ${pkg.name}==${pkg.version}`,
    'binary': pkg.binary_url ? `curl -O ${pkg.binary_url} && chmod +x ${pkg.name}` : `# Download binary for ${pkg.name} version ${pkg.version}`,
    'docker': `docker pull ${pkg.name}:${pkg.version}`,
    'homebrew': `brew install ${pkg.name}@${pkg.version}`,
    'nuget': `dotnet add package ${pkg.name} --version ${pkg.version}`
  }

  return commands[pkg.registry_name] || ''
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

watch(() => route.params.id, (newId) => {
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
  }
}

.package-version,
.package-runtime,
.remote-url {
  margin-bottom: 0.75rem;
}

.package-env-vars,
.package-runtime-args,
.package-install,
.remote-headers {
  margin-top: 1rem;

  h5 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}
</style>
