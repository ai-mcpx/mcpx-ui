<template>
  <router-link :to="`/server/${server.id}`" class="server-card-link">
    <el-card class="server-card" shadow="hover">
      <div class="server-header">
        <div class="server-icon">
          <el-avatar :size="40" :src="getServerIcon(server)">
            {{ getServerInitial(server.name) }}
          </el-avatar>
        </div>
        <div class="server-title">
          <h3>{{ formatServerName(server.name) }}</h3>
          <div class="server-meta">
            <el-tag size="small" type="info">{{ server.version || server.version_detail?.version || 'Unknown' }}</el-tag>
            <span v-if="server.version_detail.is_latest" class="latest-tag">最新</span>
          </div>
        </div>
      </div>
      
      <p class="server-description">{{ truncateDescription(server.description) }}</p>
      
      <div class="server-footer">
        <div class="repository-info" v-if="server.repository">
          <el-icon><link /></el-icon>
          <a 
            :href="server.repository.url" 
            target="_blank" 
            @click.stop
            class="repo-link"
          >
            {{ getRepositoryName(server.repository) }}
          </a>
        </div>
        <div class="server-tags">
          <el-tag 
            v-if="server.repository && server.repository.source" 
            size="small" 
            :type="getSourceTagType(server.repository.source)"
          >
            {{ server.repository.source }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Link } from '@element-plus/icons-vue'

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
})

const formatServerName = (name) => {
  // 从完整名称中提取简短名称
  const parts = name.split('/')
  return parts[parts.length - 1] || name
}

const truncateDescription = (description, maxLength = 100) => {
  if (!description) return ''
  if (description.length <= maxLength) return description
  return `${description.substring(0, maxLength)}...`
}

const getServerInitial = (name) => {
  if (!name) return '?'
  const parts = name.split('/')
  const shortName = parts[parts.length - 1] || name
  return shortName.charAt(0).toUpperCase()
}

const getServerIcon = (server) => {
  // 这里可以根据服务器信息生成图标URL
  // 例如，可以使用GitHub头像API等
  if (server.repository && server.repository.source === 'github') {
    const repoName = getRepositoryName(server.repository)
    return `https://github.com/${repoName}.png`
  }
  if (server.repository && server.repository.source === 'gitlab') {
    const repoName = getRepositoryName(server.repository)
    return `https://gitlab.com/${repoName}/-/avatar.png`
  }
  // For Gerrit and other sources, we don't have a standard avatar API
  // so we'll fall back to the initial letter
  return ''
}

const getRepositoryName = (repository) => {
  if (!repository || !repository.url) return ''
  
  try {
    const url = new URL(repository.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // For GitHub and GitLab: username/repo format
    if (repository.source === 'github' || repository.source === 'gitlab') {
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`
      }
    }

    // For Gerrit: show hostname and project path
    if (repository.source === 'gerrit') {
      if (pathParts.length >= 1) {
        return `${url.hostname}/${pathParts[0]}`
      }
      return url.hostname
    }

    // Default fallback: show hostname and first path component if available
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`
    }
    return url.hostname
  } catch (e) {
    return repository.url
  }
}

const getSourceTagType = (source) => {
  const types = {
    'github': 'success',
    'gitlab': 'warning',
    'gerrit': 'info',
    'default': 'info'
  }
  
  return types[source] || types.default
}
</script>

<style lang="scss" scoped>
.server-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 20px;
}

.server-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.server-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.server-icon {
  margin-right: 12px;
}

.server-title {
  flex: 1;
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
  }
}

.server-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .latest-tag {
    font-size: 0.75rem;
    color: #67c23a;
    font-weight: 500;
  }
}

.server-description {
  flex: 1;
  margin-bottom: 16px;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
}

.server-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 0.85rem;
}

.repository-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  
  .repo-link {
    color: #409eff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.server-tags {
  display: flex;
  gap: 4px;
}
</style>