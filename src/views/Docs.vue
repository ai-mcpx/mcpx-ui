<template>
  <div class="docs-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="docs-sidebar">
          <h3>文档导航</h3>
          <el-menu
            :default-active="activeSection"
            class="docs-menu"
            @select="scrollToSection"
          >
            <el-menu-item index="overview">概述</el-menu-item>
            <el-menu-item index="api">API 参考</el-menu-item>
            <el-menu-item index="server-json">服务器 JSON 格式</el-menu-item>
            <el-menu-item index="publishing">发布服务器</el-menu-item>
            <el-menu-item index="faq">常见问题</el-menu-item>
          </el-menu>

          <div class="external-links">
            <h4>外部链接</h4>
            <ul>
              <li>
                <a href="https://github.com/LouisCan/mcp-registry-frontend" target="_blank">
                  GitHub 仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/LouisCan/mcp-registry-frontend/issues" target="_blank">
                  问题反馈
                </a>
              </li>
            </ul>
          </div>
        </div>
      </el-col>

      <el-col :span="18">
        <div class="docs-content">
          <section id="overview" class="docs-section">
            <h2>概述</h2>
            <p>MCP Registry 是一个社区驱动的 Model Context Protocol (MCP) 服务器注册表。它提供了一个集中式的存储库，用于发现和管理各种 MCP 实现及其相关的元数据、配置和功能。</p>

            <h3>主要功能</h3>
            <ul>
              <li>用于管理 MCP 注册表条目的 RESTful API（列表、获取、创建、更新、删除）</li>
              <li>服务监控的健康检查端点</li>
              <li>支持各种环境配置</li>
              <li>优雅的关闭处理</li>
              <li>MongoDB 和内存数据库支持</li>
              <li>全面的 API 文档</li>
              <li>列出注册表条目的分页支持</li>
            </ul>
          </section>

          <section id="api" class="docs-section">
            <h2>API 参考</h2>
            <p>MCP Registry 提供了一个 RESTful API，用于与注册表进行交互。以下是主要的 API 端点：</p>

            <h3>获取服务器列表</h3>
            <el-card class="api-card">
              <div class="api-method">GET</div>
              <div class="api-path">/v0/servers</div>
              <p>返回所有注册的 MCP 服务器列表。</p>

              <h4>参数</h4>
              <el-table :data="listServersParams" style="width: 100%">
                <el-table-column prop="name" label="名称" width="120" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="描述" />
              </el-table>

              <h4>响应示例</h4>
              <pre><code>{
  "servers": [
    {
      "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1",
      "name": "@modelcontextprotocol/servers/src/filesystem",
      "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
      "repository": {
        "url": "https://github.com/modelcontextprotocol/servers",
        "source": "github",
        "id": "b94b5f7e-c7c6-d760-2c78-a5e9b8a5b8c9"
      },
      "version_detail": {
        "version": "1.0.2",
        "release_date": "2023-06-15T10:30:00Z",
        "is_latest": true
      }
    }
  ]
}</code></pre>
            </el-card>

            <h3>获取服务器详情</h3>
            <el-card class="api-card">
              <div class="api-method">GET</div>
              <div class="api-path">/v0/servers/{id}</div>
              <p>返回特定 MCP 服务器的详细信息。</p>

              <h4>参数</h4>
              <el-table :data="getServerParams" style="width: 100%">
                <el-table-column prop="name" label="名称" width="120" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="描述" />
              </el-table>

              <h4>响应示例</h4>
              <pre><code>{
  "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1",
  "name": "@modelcontextprotocol/servers/src/filesystem",
  "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
  "repository": {
    "url": "https://github.com/modelcontextprotocol/servers",
    "source": "github",
    "id": "b94b5f7e-c7c6-d760-2c78-a5e9b8a5b8c9"
  },
  "version_detail": {
    "version": "1.0.2",
    "release_date": "2023-06-15T10:30:00Z",
    "is_latest": true
  }
}</code></pre>
            </el-card>

            <h3>更新服务器</h3>
            <el-card class="api-card">
              <div class="api-method put">PUT</div>
              <div class="api-path">/v0/servers/{id}</div>
              <p>更新已注册的 MCP 服务器的详细信息。此端点允许更新服务器的元数据，包括版本信息。当更新版本时，新版本必须大于现有版本以保持版本排序。</p>

              <h4>路径参数</h4>
              <el-table :data="updateServerParams" style="width: 100%">
                <el-table-column prop="name" label="名称" width="120" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="描述" />
              </el-table>

              <h4>请求体示例</h4>
              <pre><code>{
  "name": "ai-mcpx.mcp-hello-updated",
  "description": "An updated Hello World MCP server with enhanced features",
  "repository": {
    "url": "https://github.com/ai-mcpx/mcp-hello",
    "source": "github",
    "id": "ai-mcpx/mcp-hello"
  },
  "version_detail": {
    "version": "1.1.0",
    "release_date": "2025-08-10T12:00:00Z",
    "is_latest": true
  },
  "packages": [
    {
      "registry_name": "pypi",
      "name": "mcp-hello",
      "version": "1.1.0",
      "runtime_hint": "python",
      "runtime_arguments": [
        {
          "type": "named",
          "name": "--module",
          "description": "Run as Python module",
          "format": "string",
          "is_required": true,
          "default": "-m",
          "value_hint": "-m"
        },
        {
          "type": "positional",
          "name": "module_name",
          "description": "Module name to run",
          "format": "string",
          "is_required": true,
          "default": "mcp_hello.server",
          "value_hint": "mcp_hello.server"
        }
      ],
      "environment_variables": [
        {
          "name": "MCP_HOST",
          "description": "Server host address",
          "format": "string",
          "is_required": false,
          "default": "0.0.0.0"
        },
        {
          "name": "MCP_PORT",
          "description": "Server port number",
          "format": "number",
          "is_required": false,
          "default": "8000"
        }
      ]
    }
  ]
}</code></pre>

              <h4>响应示例</h4>
              <pre><code>{
  "message": "Server updated successfully",
  "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1"
}</code></pre>

              <h4>错误响应</h4>
              <ul>
                <li><strong>400 Bad Request</strong> - 请求数据无效或版本号无效（不能更新到较旧的版本）</li>
                <li><strong>404 Not Found</strong> - 指定的服务器 ID 不存在</li>
                <li><strong>409 Conflict</strong> - 具有此版本的服务器已存在</li>
                <li><strong>500 Internal Server Error</strong> - 服务器内部错误</li>
              </ul>
            </el-card>

            <h3>发布服务器</h3>
            <el-card class="api-card">
              <div class="api-method post">POST</div>
              <div class="api-path">/v0/publish</div>
              <p>发布一个新的 MCP 服务器到注册表。</p>

              <h4>请求体示例</h4>
              <pre><code>{
  "name": "ai-mcpx.mcp-hello",
  "description": "A simple Hello World MCP (Model Context Protocol) server built with the FastMCP framework in Python using HTTP transport. Features multi-language greetings, server information, and resource serving.",
  "repository": {
    "url": "https://github.com/ai-mcpx/mcp-hello",
    "source": "github",
    "id": "ai-mcpx/mcp-hello"
  },
  "version_detail": {
    "version": "1.0.0",
    "release_date": "2025-07-20T12:00:00Z",
    "is_latest": true
  },
  "packages": [
    {
      "registry_name": "pypi",
      "name": "mcp-hello",
      "version": "1.0.0",
      "runtime_hint": "python",
      "runtime_arguments": [
        {
          "type": "named",
          "name": "--module",
          "description": "Run as Python module",
          "format": "string",
          "is_required": true,
          "default": "-m",
          "value_hint": "-m"
        },
        {
          "type": "positional",
          "name": "module_name",
          "description": "Module name to run",
          "format": "string",
          "is_required": true,
          "default": "mcp_hello.server",
          "value_hint": "mcp_hello.server"
        }
      ],
      "environment_variables": [
        {
          "name": "MCP_HOST",
          "description": "Server host address",
          "format": "string",
          "is_required": false,
          "default": "0.0.0.0"
        },
        {
          "name": "MCP_PORT",
          "description": "Server port number",
          "format": "number",
          "is_required": false,
          "default": "8000"
        }
      ]
    },
    {
      "registry_name": "docker",
      "name": "mcp-hello",
      "version": "1.0.0",
      "runtime_hint": "docker",
      "runtime_arguments": [
        {
          "type": "named",
          "name": "--port",
          "description": "Port mapping for HTTP server",
          "format": "string",
          "is_required": true,
          "default": "-p",
          "value_hint": "-p 8000:8000"
        }
      ],
      "environment_variables": [
        {
          "name": "MCP_HOST",
          "description": "Server host address",
          "format": "string",
          "is_required": false,
          "default": "0.0.0.0"
        },
        {
          "name": "MCP_PORT",
          "description": "Server port number",
          "format": "number",
          "is_required": false,
          "default": "8000"
        }
      ]
    }
  ],
  "remotes": [
    {
      "transport_type": "http",
      "url": "http://localhost:8000",
      "headers": [
        {
          "description": "Content type for JSON requests",
          "format": "string",
          "default": "application/json",
          "value": "Content-Type: application/json"
        }
      ]
    }
  ]
}</code></pre>
            </el-card>
          </section>

          <section id="server-json" class="docs-section">
            <h2>服务器 JSON 格式</h2>
            <p>MCP 服务器在注册表中使用标准化的 JSON 格式进行表示。以下是主要的数据结构：</p>

            <h3>Server</h3>
            <p>表示基本的服务器信息。</p>
            <pre><code>{
  "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1",
  "name": "@modelcontextprotocol/servers/src/filesystem",
  "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
  "repository": {
    "url": "https://github.com/modelcontextprotocol/servers",
    "source": "github",
    "id": "b94b5f7e-c7c6-d760-2c78-a5e9b8a5b8c9"
  },
  "version_detail": {
    "version": "1.0.2",
    "release_date": "2023-06-15T10:30:00Z",
    "is_latest": true
  }
}</code></pre>

            <h3>ServerDetail</h3>
            <p>包含服务器的详细信息，包括包和远程连接端点。</p>
          </section>

          <section id="publishing" class="docs-section">
            <h2>发布服务器</h2>
            <p>要将 MCP 服务器发布到注册表，您需要准备一个符合规范的服务器 JSON 文件，并使用 API 提交。</p>

            <h3>发布步骤</h3>
            <ol>
              <li>准备服务器 JSON 文件</li>
              <li>验证 JSON 格式是否符合规范</li>
              <li>使用 API 提交服务器信息</li>
              <li>验证服务器是否已成功发布</li>
            </ol>
          </section>

          <section id="faq" class="docs-section">
            <h2>常见问题</h2>

            <el-collapse>
              <el-collapse-item title="什么是 MCP？" name="1">
                <p>Model Context Protocol (MCP) 是一种标准化协议，用于在模型和上下文之间进行通信。它允许模型访问外部工具、数据和服务，从而增强其功能。</p>
              </el-collapse-item>

              <el-collapse-item title="如何贡献到 MCP Registry 项目？" name="2">
                <p>您可以通过以下方式贡献：</p>
                <ul>
                  <li>提交问题和功能请求</li>
                  <li>提交代码改进的拉取请求</li>
                  <li>改进文档</li>
                  <li>分享和推广项目</li>
                </ul>
                <p>详细信息请参阅 <a href="https://github.com/LouisCan/mcp-registry-frontend/README.md" target="_blank">贡献指南</a>。</p>
              </el-collapse-item>

              <el-collapse-item title="如何报告问题？" name="3">
                <p>如果您发现了问题或有改进建议，请在 <a href="https://github.com/LouisCan/mcp-registry-frontend/issues" target="_blank">GitHub Issues</a> 页面提交问题。</p>
              </el-collapse-item>
            </el-collapse>
          </section>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeSection = ref('overview')
const sections = ['overview', 'api', 'server-json', 'publishing', 'faq']

const listServersParams = [
  {
    name: 'limit',
    type: '整数',
    description: '每页结果数量（最大 5000）'
  },
  {
    name: 'offset',
    type: '整数',
    description: '用于分页的跳过结果数量'
  }
]

const getServerParams = [
  {
    name: 'id',
    type: '字符串',
    description: '服务器的唯一 ID'
  },
  {
    name: 'version',
    type: '字符串',
    description: '所需的 MCP 服务器版本（可选）'
  }
]

const updateServerParams = [
  {
    name: 'id',
    type: '字符串',
    description: '要更新的服务器的唯一 UUID'
  }
]

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  for (const section of sections) {
    const element = document.getElementById(section)
    if (!element) continue

    const rect = element.getBoundingClientRect()
    if (rect.top <= 100 && rect.bottom >= 100) {
      activeSection.value = section
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.docs-container {
  display: flex;
  min-height: calc(100vh - 200px);
}

.docs-sidebar {
  position: sticky;
  top: 100px;
  height: calc(100vh - 150px);
  padding-right: 1rem;

  h3 {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }
}

.docs-menu {
  border-right: none;
}

.external-links {
  margin-top: 2rem;

  h4 {
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 0.5rem;

      a {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

.docs-content {
  padding-left: 1rem;
}

.docs-section {
  margin-bottom: 3rem;

  h2 {
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  h3 {
    margin: 1.5rem 0 1rem;
  }

  p, ul, ol {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul, ol {
    padding-left: 1.5rem;
  }
}

.api-card {
  margin-bottom: 1.5rem;

  .api-method {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #67c23a;
    color: white;
    border-radius: 4px;
    font-weight: bold;
    margin-right: 0.5rem;

    &.post {
      background-color: #409eff;
    }

    &.put {
      background-color: #e6a23c;
    }
  }

  .api-path {
    display: inline-block;
    font-family: monospace;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  h4 {
    margin: 1rem 0 0.5rem;
  }

  pre {
    background-color: #f5f7fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;

    code {
      font-family: monospace;
    }
  }
}
</style>