<template>
  <router-link :to="`/server/${encodeURIComponent(server.name)}`" class="extension-card-link">
    <el-card class="extension-card" shadow="hover">
      <div class="extension-header">
        <div class="extension-icon">
          <el-avatar :size="48" :src="getServerIcon(server)" class="extension-avatar">
            {{ getServerInitial(server.name) }}
          </el-avatar>
        </div>
        <div class="extension-title">
          <h3 class="extension-name">{{ formatServerName(server.name) }}</h3>
          <div class="extension-meta">
            <el-tag size="small" type="info" class="version-tag">
              {{ server.version || server.versionDetail?.version || 'Unknown' }}
            </el-tag>
            <span v-if="server.versionDetail?.isLatest" class="latest-badge">最新</span>
          </div>
        </div>
      </div>

      <p class="extension-description">{{ truncateDescription(server.description) }}</p>

      <div class="extension-footer">
        <div class="repository-info" v-if="server.repository">
          <el-icon class="repo-icon"><link /></el-icon>
          <a
            :href="server.repository.url"
            target="_blank"
            @click.stop
            class="repo-link"
          >
            {{ getRepositoryName(server.repository) }}
          </a>
        </div>
        <div class="extension-tags">
          <el-tag
            v-if="server.repository && server.repository.source"
            size="small"
            :type="getSourceTagType(server.repository.source)"
            :class="['source-tag', server.repository.source]"
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
    'github': 'primary',
    'gitlab': 'warning',
    'gerrit': 'info',
    'default': 'info'
  }

  return types[source] || types.default
}
</script>

<style lang="scss" scoped>
.extension-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: var(--spacing-lg);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
  }
}

.extension-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  
  &:hover {
    box-shadow: var(--card-hover-shadow);
    border-color: var(--border-hover);
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  }
}

.extension-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.extension-icon {
  flex-shrink: 0;
}

.extension-avatar {
  border: 1px solid var(--border-light);
  background: var(--background-secondary);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.extension-title {
  flex: 1;
  min-width: 0;

  .extension-name {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
    letter-spacing: -0.01em;
    font-family: var(--font-family);
    line-height: var(--line-height-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.extension-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .version-tag {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    background: var(--background-tertiary);
    border-color: var(--border-light);
    color: var(--text-secondary);
  }
  
  .latest-badge {
    font-size: var(--font-size-xs);
    color: var(--success-color);
    font-weight: var(--font-weight-medium);
    background: var(--success-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--success-bg);
  }
}

.extension-description {
  flex: 1;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-family);
}

.extension-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: var(--font-size-xs);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  gap: var(--spacing-sm);
}

.repository-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  min-width: 0;
  
  .repo-icon {
    flex-shrink: 0;
    color: var(--text-secondary);
  }

  .repo-link {
    color: var(--text-link);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
      color: var(--primary-hover);
    }
  }
}

.extension-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.source-tag {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
  
  &.github {
    background: var(--extension-github);
    border-color: var(--extension-github);
    color: white;
  }
  
  &.gitlab {
    background: var(--extension-gitlab);
    border-color: var(--extension-gitlab);
    color: white;
  }
  
  &.gerrit {
    background: var(--extension-gerrit);
    border-color: var(--border-color);
    color: var(--text-color);
  }
}

:deep(.el-card__body) {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-avatar) {
  background: var(--background-secondary);
  color: var(--text-secondary);
}
</style>