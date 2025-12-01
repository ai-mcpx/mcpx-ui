<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <h1>MCP Registry</h1>
        </router-link>
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索MCP服务..."
            prefix-icon="el-icon-search"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
        </div>
        <nav class="main-nav">
          <router-link to="/">首页</router-link>
          <router-link to="/docs">文档</router-link>
          <router-link to="/playground">Playground</router-link>
          <a href="https://github.com/ai-mcpx" target="_blank">GitHub</a>
          <AuthPanel />
        </nav>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>支持标准化集成，共建智能应用生态，支持动态注册，智能集成的 MCP Registry</p>
        <div class="version-info">
          <span class="version-item">mcpx: v{{ mcpxVersion }}</span>
          <span class="version-item">mcpx-ui: v{{ mcpxUiVersion }}</span>
          <span class="version-item">mcpx-cli: v{{ mcpxCliVersion }}</span>
        </div>
        <p>&copy; {{ new Date().getFullYear() }} MCP Registry. MIT License.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import AuthPanel from './components/AuthPanel.vue'

const router = useRouter()
const searchQuery = ref('')

// Version information from environment variables
const mcpxVersion = ref(import.meta.env.VITE_MCPX_VERSION || '1.0.0')
const mcpxUiVersion = ref(import.meta.env.VITE_MCPX_UI_VERSION || '1.0.0')
const mcpxCliVersion = ref(import.meta.env.VITE_MCPX_CLI_VERSION || '1.0.0')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    })
  }
}
</script>

<style lang="scss">
// Base styles matching exact Gemini CLI design
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  color: var(--text-color);
  line-height: var(--line-height-normal);
  background-color: var(--light-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: var(--font-weight-normal);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
}

.app-header {
  background: linear-gradient(90deg, #0d1117 0%, #161b22 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(8px);
  box-shadow: var(--elevation-1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
  color: #ffffff;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-2xl);
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
  font-family: var(--font-family);

  h1 {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
    color: #ffffff;
  }
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 var(--spacing-xl);
}

.main-nav {
  display: flex;
  gap: var(--spacing-lg);

  a {
    color: #e8eaed;
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    padding: var(--spacing-sm) 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    font-family: var(--font-family);

    &:hover {
      color: #8ab4f8;
    }

    &.router-link-active {
      color: #8ab4f8;
      border-bottom-color: #8ab4f8;
      font-weight: var(--font-weight-bold);
    }
  }
}

.app-main {
  flex: 1;
  padding: var(--spacing-2xl) var(--spacing-lg);
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
  color: #e8eaed;
  padding: var(--spacing-2xl) 0;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  text-align: center;
}

.version-info {
  margin: var(--spacing-lg) 0;
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.version-item {
  background: linear-gradient(135deg, #161b22 0%, #21262d 100%);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--border-color);
  color: #e8eaed;
  font-family: var(--font-family);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .app-main {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .version-info {
    gap: var(--spacing-sm);
  }

  .version-item {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

:deep(.search-input) {
  .el-input__wrapper {
    border-radius: var(--radius-full);
    border: 1px solid var(--border-color);
    box-shadow: none;
    background: linear-gradient(135deg, #161b22 0%, #21262d 100%);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-hover);
      background: linear-gradient(135deg, #21262d 0%, #30363d 100%);
    }

    &.is-focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px rgba(138, 180, 248, 0.2);
      background: linear-gradient(135deg, #21262d 0%, #30363d 100%);
    }
  }

  .el-input__inner {
    font-size: var(--font-size-base);
    color: var(--text-color);
    font-family: var(--font-family);
    font-weight: var(--font-weight-normal);

    &::placeholder {
      color: var(--text-secondary);
    }
  }

  .el-input__prefix {
    color: var(--text-secondary);
  }
}
</style>