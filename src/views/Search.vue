<template>
  <div class="search-container">
    <div class="search-header">
      <h2>搜索结果: <span class="search-query">{{ query }}</span></h2>
      <p v-if="totalResults !== null">找到 {{ totalResults }} 个结果</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="error" class="error-container">
      <el-alert
        :title="error"
        type="error"
        show-icon
      />
      <el-button class="retry-button" type="primary" @click="searchServers">重试</el-button>
    </div>

    <div v-else-if="searchResults.length > 0" class="results-container">
      <el-row :gutter="20">
        <el-col
          v-for="server in searchResults"
          :key="server.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <server-card :server="server" />
        </el-col>
      </el-row>

      <div class="pagination-container" v-if="totalResults > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalResults"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <div v-else class="no-results-container">
      <el-empty description="没有找到匹配的服务器" />
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServersStore } from '../stores/servers'
import ServerCard from '../components/ServerCard.vue'

const route = useRoute()
const router = useRouter()
const store = useServersStore()

const query = computed(() => route.query.q || '')
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const searchResults = ref([])
const totalResults = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)

const searchServers = async () => {
  if (!query.value) {
    router.push('/')
    return
  }

  try {
    const cursor = currentPage.value > 1 ? null : null // Simplified cursor handling
    const response = await store.searchServers(query.value, pageSize.value, cursor)

    searchResults.value = response.servers || []
    totalResults.value = response.total_count || 0
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  searchServers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(searchServers)

watch(() => route.query.q, (newQuery) => {
  if (newQuery !== undefined) {
    currentPage.value = 1
    searchServers()
  }
})
</script>

<style lang="scss" scoped>
.search-container {
  width: 100%;
}

.search-header {
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 0.5rem;
  }

  .search-query {
    color: var(--primary-color);
  }

  p {
    color: #606266;
  }
}

.loading-container,
.error-container,
.no-results-container {
  margin: 2rem 0;
  text-align: center;
}

.retry-button {
  margin-top: 1rem;
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>