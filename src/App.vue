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
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
        </div>
        <nav class="main-nav">
          <router-link to="/">首页</router-link>
          <router-link to="/docs">文档</router-link>
          <a href="https://github.com/LouisCan/mcp-registry-frontend" target="_blank">GitHub</a>
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
:root {
  --primary-color: #3a7bd5;
  --secondary-color: #00d2ff;
  --text-color: #333;
  --light-bg: #f8f9fa;
  --border-color: #e0e0e0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--light-bg);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  
  a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.8;
    }
    
    &.router-link-active {
      font-weight: 700;
      border-bottom: 2px solid white;
    }
  }
}

.app-main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.version-info {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.version-item {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .version-info {
    gap: 1rem;
  }

  .version-item {
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
  }
}
</style>