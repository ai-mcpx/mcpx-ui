<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>MCP Registry</h1>
        <p>支持标准化集成，共建智能应用生态，支持动态注册，智能集成的 MCP Registry</p>
      </div>
    </section>

    <section class="servers-section">
      <div class="section-header">
        <h2>热门 MCP Servers</h2>
        <div class="section-actions">
          <span>{{ totalCount || 0 }} 个服务器（最新版本）</span>
          <el-button
            v-if="authStore.isAuthenticated"
            type="primary"
            size="default"
            @click="showPublishDialog"
            class="publish-button"
          >
            <el-icon><plus /></el-icon>
            发布服务器
          </el-button>
        </div>
      </div>

      <el-row :gutter="20" v-loading="loading">
        <el-col
          v-for="server in servers"
          :key="server.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <server-card :server="server" />
        </el-col>

        <!-- Show message when no servers are loaded -->
        <el-col v-if="!loading && servers.length === 0" :span="24">
          <div style="text-align: center; padding: 2rem; color: #e8eaed;">
            <p>暂无可用的 MCP 服务器</p>
          </div>
        </el-col>
      </el-row>

      <div class="pagination-container" v-if="totalCount > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalCount"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </section>
  </div>

  <!-- 服务器发布器 -->
  <ServerEditor
    v-model:visible="showPublisher"
    :is-edit="false"
    @success="handlePublishSuccess"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useServersStore } from '../stores/servers'
import { useAuthStore } from '../stores/auth'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ServerCard from '../components/ServerCard.vue'
import ServerEditor from '../components/ServerEditor.vue'

const store = useServersStore()
const authStore = useAuthStore()
const loading = computed(() => store.loading)

// Filter servers to show only the latest version of each server
const servers = computed(() => {
  if (!store.servers || store.servers.length === 0) {
    return []
  }

  // Group servers by server name
  const serverMap = new Map()

  store.servers.forEach(server => {
    const serverName = server.name
    if (!serverName) return

    // If this server is not in the map, or if this version is newer, add/update it
    if (!serverMap.has(serverName)) {
      serverMap.set(serverName, server)
    } else {
      const existingServer = serverMap.get(serverName)
      // Compare versions - if current server has a newer version, replace it
      const currentVersion = server.version || server.versionDetail?.version || '0.0.0'
      const existingVersion = existingServer.version || existingServer.versionDetail?.version || '0.0.0'

      if (compareVersions(currentVersion, existingVersion) > 0) {
        serverMap.set(serverName, server)
      }
    }
  })

  return Array.from(serverMap.values())
})

const totalCount = computed(() => servers.value.length)
const nextPage = computed(() => store.nextPage)

const currentPage = ref(1)
const pageSize = ref(20)
const showPublisher = ref(false)

// Version comparison function for semantic versioning
const compareVersions = (version1, version2) => {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)

  const maxLength = Math.max(v1Parts.length, v2Parts.length)

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0
    const v2Part = v2Parts[i] || 0

    if (v1Part > v2Part) return 1
    if (v1Part < v2Part) return -1
  }

  return 0
}

// 显示发布对话框
const showPublishDialog = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先进行身份认证')
    return
  }
  showPublisher.value = true
}

// 发布成功后的处理
const handlePublishSuccess = async () => {
  ElMessage.success('服务器发布成功')
  await fetchServers() // 重新获取服务器列表
}

const fetchServers = async (cursor = null) => {
  try {
    await store.fetchServers(pageSize.value, cursor)
    console.log('Total count:', store.totalCount)
  } catch (error) {
    console.error('Error fetching servers:', error)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  // For cursor-based pagination, we would need to track cursors for each page
  // For now, keep the existing offset-based approach in the UI
  const offset = (page - 1) * pageSize.value
  store.fetchServers(pageSize.value, null) // Reset to first page for simplicity
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  try {
    // Try to fetch servers directly first (servers endpoint is public)
    await fetchServers()
  } catch (error) {
    console.error('Failed to load servers:', error)
    // If that fails, try with authentication as fallback
    try {
      if (!authStore.isAuthenticated) {
        console.log('Auto-authenticating with anonymous auth...')
        await authStore.getAnonymousAuth()
      }
      await fetchServers()
    } catch (authError) {
      console.error('Failed to load servers with auth:', authError)
    }
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
}

.hero-section {
  background: linear-gradient(135deg, var(--background-secondary) 0%, var(--info-bg) 100%);
  color: #ffffff;
  padding: var(--spacing-3xl) var(--spacing-2xl);
  text-align: center;
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-3xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--elevation-1);

  h1 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-medium);
    letter-spacing: -0.02em;
    color: #ffffff;
    font-family: var(--font-family);
  }

  p {
    font-size: var(--font-size-xl);
    max-width: 600px;
    margin: 0 auto;
    color: #e8eaed;
    line-height: var(--line-height-relaxed);
    font-family: var(--font-family);
  }
}

.servers-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-light);

    h2 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-medium);
      color: #ffffff;
      letter-spacing: -0.01em;
      font-family: var(--font-family);
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      span {
        color: #e8eaed;
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        font-family: var(--font-family);
      }
    }
  }
}

.pagination-container {
  margin-top: var(--spacing-3xl);
  display: flex;
  justify-content: center;
}

// Dark gradient pagination styling
:deep(.el-pagination) {
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  .el-pager li {
    background: transparent;
    color: #e8eaed;
    border: 1px solid #30363d;
    margin: 0 4px;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;

    &:hover {
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-color: #8ab4f8;
      color: #ffffff;
    }

    &.active {
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-color: #8ab4f8;
      color: #8ab4f8;
      font-weight: 600;
    }
  }

  .el-pagination button {
    background: transparent;
    color: #e8eaed;
    border: 1px solid #30363d;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #1f2937 0%, #21262d 100%);
      border-color: #8ab4f8;
      color: #ffffff;
    }

    &:disabled {
      background: rgba(48, 54, 61, 0.5);
      color: #8b949e;
      border-color: #21262d;
      cursor: not-allowed;
    }

    // 左右箭头按钮特殊样式
    &.btn-prev,
    &.btn-next {
      background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
      border: 1px solid #30363d;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
        border-color: #8ab4f8;
        color: #8ab4f8;
      }

      &:disabled {
        background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
        opacity: 0.6;
      }

      // 箭头图标样式
      .el-icon {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }

  .el-pagination__total {
    color: #e8eaed;
    font-weight: 500;
  }
}

:deep(.el-row) {
  margin-left: calc(var(--spacing-md) * -1) !important;
  margin-right: calc(var(--spacing-md) * -1) !important;
}

:deep(.el-col) {
  padding-left: var(--spacing-md) !important;
  padding-right: var(--spacing-md) !important;
  margin-bottom: var(--spacing-lg);
}

:deep(.publish-button) {
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--elevation-1);
    transform: translateY(-1px);
  }
}

// Extension card grid styling similar to Gemini CLI
.extension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);

    h1 {
      font-size: var(--font-size-2xl);
    }

    p {
      font-size: var(--font-size-lg);
    }
  }

  .servers-section .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .extension-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>