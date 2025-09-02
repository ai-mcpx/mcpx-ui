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
          <span>{{ totalCount || 0 }} 个服务器</span>
          <el-button
            v-if="authStore.isAuthenticated"
            type="primary"
            size="small"
            @click="showPublishDialog"
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
          <div style="text-align: center; padding: 2rem; color: #666;">
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
const servers = computed(() => store.servers)
const totalCount = computed(() => store.totalCount || store.servers.length)
const nextPage = computed(() => store.nextPage)

const currentPage = ref(1)
const pageSize = ref(20)
const showPublisher = ref(false)

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
    await fetchServers()
  } catch (error) {
    console.error('Failed to load servers:', error)
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto;
  }
}

.servers-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      span {
        color: #666;
        font-size: 1rem;
      }
    }
  }
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>