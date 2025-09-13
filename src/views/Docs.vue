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
            <el-menu-item index="cli">CLI 工具</el-menu-item>
            <el-menu-item index="publishing">发布服务器</el-menu-item>
            <el-menu-item index="faq">常见问题</el-menu-item>
          </el-menu>

          <div class="external-links">
            <h4>外部链接</h4>
            <ul>
              <li>
                <a href="https://github.com/ai-mcpx/mcpx" target="_blank">
                  mcpx 注册表 - GitHub 仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/ai-mcpx/mcpx-cli" target="_blank">
                  mcpx-cli 工具 - GitHub 仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/ai-mcpx/mcpx-ui" target="_blank">
                  mcpx-ui 前端 - GitHub 仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/ai-mcpx" target="_blank">
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
              <li>支持多种包注册表类型（npm、PyPI、wheel、binary、OCI、nuget、mcpb 等）</li>
              <li>支持多种代码仓库源（GitHub、GitLab、Gerrit）</li>
              <li>支持各种环境配置和运行时参数</li>
              <li>优雅的关闭处理</li>
              <li>PostgreSQL 和内存数据库支持</li>
              <li>全面的 API 文档</li>
              <li>基于游标的分页支持</li>
              <li>多种认证方式：GitHub OAuth、GitHub OIDC、匿名访问、DNS 验证、HTTP 验证</li>
              <li>命名空间管理和权限控制</li>
              <li>完整的 CRUD 操作支持</li>
              <li>支持 streamable-http 传输类型</li>
              <li>增强的运行时提示支持（包括 wheel 运行时）</li>
              <li>现代 Vue 3 前端界面</li>
              <li>功能强大的命令行工具 (mcpx-cli)</li>
            </ul>
          </section>

          <section id="api" class="docs-section">
            <h2>API 参考</h2>
            <p>MCP Registry 提供了一个 RESTful API，用于与注册表进行交互。以下是主要的 API 端点：</p>

            <h3>API 响应格式</h3>
            <p>API 使用标准化的 ServerJSON 格式返回数据，包含服务器信息和注册表元数据：</p>
            <ul>
              <li><code>name</code>: 服务器名称（如 "io.github.example/test-server"）</li>
              <li><code>description</code>: 服务器描述</li>
              <li><code>status</code>: 服务器状态（"active"、"deprecated"、"deleted"）</li>
              <li><code>repository</code>: 源代码仓库信息（支持 GitHub、GitLab、Gerrit）</li>
              <li><code>version_detail</code>: 版本信息</li>
              <li><code>packages</code>: 包配置数组</li>
              <li><code>remotes</code>: 远程连接配置数组</li>
              <li><code>_meta</code>: 注册表元数据，包含 ID、发布时间等</li>
            </ul>

            <h3>分页</h3>
            <p>API 使用基于游标的分页系统，提供更好的性能和一致性：</p>
            <ul>
              <li><code>limit</code>: 每页结果数量（默认 30，最大 100）</li>
              <li><code>cursor</code>: 分页游标令牌（UUID 格式）</li>
              <li><code>metadata.next_cursor</code>: 下一页的游标（如果有）</li>
              <li><code>metadata.count</code>: 当前页面结果数量</li>
            </ul>

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
      "server": {
        "name": "io.modelcontextprotocol/filesystem",
        "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
        "status": "active",
        "repository": {
          "url": "https://github.com/modelcontextprotocol/servers",
          "source": "github",
          "id": "b94b5f7e-c7c6-d760-2c78-a5e9b8a5b8c9"
        },
        "version_detail": {
          "version": "1.0.2"
        },
        "packages": [
          {
            "registry_type": "npm",
            "identifier": "@modelcontextprotocol/server-filesystem",
            "version": "1.0.2",
            "package_arguments": [
              {
                "type": "positional",
                "value_hint": "target_dir",
                "description": "Path to access",
                "default": "/Users/username/Desktop",
                "is_required": true
              }
            ]
          }
        ]
      },
      "x-io.modelcontextprotocol.registry": {
        "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1",
        "published_at": "2023-06-15T10:30:00Z",
        "updated_at": "2023-06-15T10:30:00Z",
        "is_latest": true
      }
    }
  ],
  "metadata": {
    "count": 1,
    "next_cursor": null
  }
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
  "server": {
    "name": "io.modelcontextprotocol/filesystem",
    "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
    "status": "active",
    "repository": {
      "url": "https://github.com/modelcontextprotocol/servers",
      "source": "github",
      "id": "b94b5f7e-c7c6-d760-2c78-a5e9b8a5b8c9"
    },
    "version_detail": {
      "version": "1.0.2"
    },
    "packages": [
      {
        "registry_type": "npm",
        "identifier": "@modelcontextprotocol/server-filesystem",
        "version": "1.0.2",
        "package_arguments": [
          {
            "type": "positional",
            "value_hint": "target_dir",
            "description": "Path to access",
            "default": "/Users/username/Desktop",
            "is_required": true
          }
        ]
      },
      {
        "registry_type": "binary",
        "identifier": "filesystem-binary",
        "version": "1.0.2",
        "binary_url": "https://github.com/example/mcp-filesystem/releases/download/v1.0.2/filesystem-linux-x64",
        "runtime_hint": "binary",
        "runtime_arguments": [
          {
            "type": "named",
            "name": "--path",
            "description": "Root path for filesystem access",
            "is_required": true,
            "value_hint": "directory_path"
          }
        ]
      }
    ]
  },
  "x-io.modelcontextprotocol.registry": {
    "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1",
    "published_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z",
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
  "name": "io.github.example/filesystem-server",
  "description": "An updated Node.js server implementing Model Context Protocol (MCP) for filesystem operations with enhanced features.",
  "status": "active",
  "repository": {
    "url": "https://github.com/example/filesystem-server",
    "source": "github",
    "id": "example/filesystem-server"
  },
  "version_detail": {
    "version": "1.1.0"
  },
  "packages": [
    {
      "registry_type": "npm",
      "identifier": "@example/filesystem-server",
      "version": "1.1.0",
      "runtime_hint": "npx",
      "runtime_arguments": [
        {
          "type": "positional",
          "name": "target_dir",
          "value_hint": "target_dir",
          "description": "Path to access",
          "default": "/Users/username/Desktop",
          "is_required": true
        }
      ],
      "environment_variables": [
        {
          "name": "LOG_LEVEL",
          "description": "Logging level (debug, info, warn, error)",
          "format": "string",
          "default": "info"
        }
      ]
    },
    {
      "registry_type": "binary",
      "identifier": "filesystem-server",
      "version": "1.1.0",
      "registry_base_url": "https://github.com/example/filesystem-server/releases",
      "runtime_hint": "binary",
      "runtime_arguments": [
        {
          "type": "named",
          "name": "--path",
          "description": "Root path for filesystem access",
          "is_required": true,
          "value_hint": "directory_path"
        }
      ]
    }
  ]
}</code></pre>
            </el-card>

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

            <h3>删除服务器</h3>
            <el-card class="api-card">
              <div class="api-method delete">DELETE</div>
              <div class="api-path">/v0/servers/{id}</div>
              <p>从注册表中永久删除指定的 MCP 服务器。此操作不可撤销，将完全移除服务器及其所有相关信息。</p>

              <h4>路径参数</h4>
              <el-table :data="deleteServerParams" style="width: 100%">
                <el-table-column prop="name" label="名称" width="120" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="description" label="描述" />
              </el-table>

              <h4>响应示例</h4>
              <h5>成功响应 (200 OK)</h5>
              <pre><code>{
  "message": "Server deleted successfully",
  "id": "a5e8a7f0-d4e4-4a1d-b12f-2896a23fd4f1"
}</code></pre>

              <h4>错误响应</h4>
              <ul>
                <li><strong>400 Bad Request</strong> - 服务器 ID 格式无效（必须是有效的 UUID）</li>
                <li><strong>404 Not Found</strong> - 指定的服务器 ID 不存在</li>
                <li><strong>405 Method Not Allowed</strong> - HTTP 方法不被允许</li>
                <li><strong>500 Internal Server Error</strong> - 服务器内部错误，删除失败</li>
              </ul>

              <h4>注意事项</h4>
              <ul>
                <li>⚠️ <strong>此操作无法撤销</strong>：一旦删除，服务器信息将永久丢失</li>
                <li>🔒 <strong>权限要求</strong>：删除操作可能需要适当的授权</li>
                <li>📋 <strong>依赖检查</strong>：删除前请确认没有其他系统依赖此服务器</li>
                <li>💾 <strong>数据备份</strong>：建议在删除前备份重要的服务器配置信息</li>
              </ul>
            </el-card>

            <h3>发布服务器</h3>
            <el-card class="api-card">
              <div class="api-method post">POST</div>
              <div class="api-path">/v0/publish</div>
              <p>发布一个新的 MCP 服务器到注册表。</p>

              <h4>请求体示例</h4>
              <pre><code>{
  "server": {
    "name": "io.modelcontextprotocol/filesystem",
    "description": "Node.js server implementing Model Context Protocol (MCP) for filesystem operations.",
    "status": "active",
    "repository": {
      "url": "https://github.com/modelcontextprotocol/servers",
      "source": "github"
    },
    "version_detail": {
      "version": "1.0.0"
    },
    "packages": [
      {
        "registry_type": "npm",
        "identifier": "@modelcontextprotocol/server-filesystem",
        "version": "1.0.0",
        "package_arguments": [
          {
            "type": "positional",
            "value_hint": "target_dir",
            "description": "Path to access",
            "default": "/Users/username/Desktop",
            "is_required": true
          }
        ],
        "environment_variables": [
          {
            "name": "LOG_LEVEL",
            "description": "Logging level (debug, info, warn, error)",
            "default": "info"
          }
        ]
      },
      {
        "registry_type": "binary",
        "identifier": "filesystem-server",
        "version": "1.0.0",
        "binary_url": "https://github.com/example/mcp-filesystem/releases/download/v1.0.0/filesystem-linux-x64",
        "runtime_hint": "binary",
        "runtime_arguments": [
          {
            "type": "named",
            "name": "--path",
            "description": "Root path for filesystem access",
            "is_required": true,
            "value_hint": "directory_path"
          }
        ],
        "environment_variables": [
          {
            "name": "LOG_LEVEL",
            "description": "Logging level",
            "default": "info"
          }
        ]
      }
    ]
  },
  "x-publisher": {
    "tool": "mcp-publisher",
    "version": "1.0.0",
    "build_info": {
      "timestamp": "2025-08-25T12:00:00Z"
    }
  }
}</code></pre>
            </el-card>
          </section>

          <section id="server-json" class="docs-section">
            <h2>服务器 JSON 格式</h2>
            <p>MCP 服务器在注册表中使用标准化的 JSON 格式进行表示。以下是主要的数据结构：</p>

            <h3>支持的代码仓库源</h3>
            <p>MCP Registry 支持多种代码仓库源，为开发者提供灵活的代码托管选择：</p>

            <h4>GitHub</h4>
            <ul>
              <li><code>source</code>: "github"</li>
              <li><code>url</code>: GitHub 仓库 URL（如：https://github.com/owner/repo）</li>
              <li>支持公开和私有仓库</li>
              <li>与 GitHub OAuth 集成，支持命名空间权限管理</li>
            </ul>

            <h4>GitLab</h4>
            <ul>
              <li><code>source</code>: "gitlab"</li>
              <li><code>url</code>: GitLab 仓库 URL（如：https://gitlab.com/owner/repo）</li>
              <li>支持 GitLab.com 和自托管 GitLab 实例</li>
              <li>支持公开和私有仓库</li>
            </ul>

            <h4>Gerrit</h4>
            <ul>
              <li><code>source</code>: "gerrit"</li>
              <li><code>url</code>: Gerrit 实例 URL（支持多种 URL 格式）</li>
              <li>支持企业级代码审查工作流</li>
              <li>灵活的 URL 格式支持，包括 Gitiles 和其他 Gerrit 前端</li>
            </ul>

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

            <h4>仓库源示例</h4>
            <p>不同代码仓库源的配置示例：</p>

            <h5>GitHub 仓库</h5>
            <pre><code>{
  "repository": {
    "url": "https://github.com/example/mcp-server",
    "source": "github",
    "id": "example/mcp-server"
  }
}</code></pre>

            <h5>GitLab 仓库</h5>
            <pre><code>{
  "repository": {
    "url": "https://gitlab.com/example/mcp-server",
    "source": "gitlab",
    "id": "example/mcp-server"
  }
}</code></pre>

            <h5>Gerrit 仓库</h5>
            <pre><code>{
  "repository": {
    "url": "https://gerrit.example.com/plugins/gitiles/project/+/refs/heads/main",
    "source": "gerrit",
    "id": "project"
  }
}</code></pre>

            <h3>ServerDetail</h3>
            <p>包含服务器的详细信息，包括包和远程连接端点。</p>

            <h3>支持的注册表类型</h3>
            <p>MCP Registry 支持多种包注册表类型，每种类型都有特定的字段和配置：</p>

            <h4>Python 包 (PyPI)</h4>
            <ul>
              <li><code>registry_type</code>: "pypi"</li>
              <li><code>runtime_hint</code>: "uvx" （推荐）或 "python"</li>
              <li>通过 pip 安装：<code>pip install package_name==version</code></li>
              <li>通过 uvx 运行：<code>uvx package_name@version</code></li>
            </ul>

            <h4>Node.js 包 (NPM)</h4>
            <ul>
              <li><code>registry_type</code>: "npm"</li>
              <li><code>identifier</code>: 包名（如 "@example/server-name"）</li>
              <li><code>runtime_hint</code>: "npx" （推荐）或 "node"</li>
              <li>通过 npm 安装：<code>npm install package_name@version</code></li>
              <li>通过 npx 运行：<code>npx package_name@version</code></li>
            </ul>

            <h4>Python 包 (PyPI)</h4>
            <ul>
              <li><code>registry_type</code>: "pypi"</li>
              <li><code>identifier</code>: 包名</li>
              <li><code>runtime_hint</code>: "python"</li>
              <li>通过 pip 安装：<code>pip install package_name==version</code></li>
            </ul>

            <h4>Python Wheel 包</h4>
            <ul>
              <li><code>registry_type</code>: "wheel"</li>
              <li><code>identifier</code>: wheel 文件名</li>
              <li><code>runtime_hint</code>: "python" 或 "wheel"</li>
              <li><code>registry_base_url</code>: wheel 文件下载地址</li>
              <li>下载并安装：<code>curl -O wheel_url && pip install *.whl</code></li>
            </ul>

            <h4>二进制包 (Binary)</h4>
            <ul>
              <li><code>registry_type</code>: "binary"</li>
              <li><code>identifier</code>: 二进制文件名</li>
              <li><code>runtime_hint</code>: "binary"</li>
              <li><code>registry_base_url</code>: 二进制文件下载地址</li>
              <li>下载并执行：<code>curl -L -o binary_name binary_url && chmod +x binary_name</code></li>
              <li>支持跨平台二进制文件分发</li>
            </ul>

            <h4>OCI 容器</h4>
            <ul>
              <li><code>registry_type</code>: "oci"</li>
              <li><code>identifier</code>: 镜像名称</li>
              <li><code>runtime_hint</code>: "docker"</li>
              <li>通过 docker 运行：<code>docker pull image_name:version && docker run image_name:version</code></li>
            </ul>

            <h4>.NET 包 (NuGet)</h4>
            <ul>
              <li><code>registry_type</code>: "nuget"</li>
              <li><code>identifier</code>: 包名</li>
              <li><code>runtime_hint</code>: "dotnet"</li>
              <li>通过 dotnet 工具安装：<code>dotnet tool install --global package_name --version version</code></li>
            </ul>

            <h4>其他支持的类型</h4>
            <ul>
              <li><strong>MCPB</strong>: 专用的 MCP 二进制格式</li>
            </ul>

            <h3>支持的传输类型</h3>
            <p>MCP Registry 支持多种传输类型，用于不同的通信方式：</p>

            <h4>Stdio (标准输入输出)</h4>
            <ul>
              <li><code>transport_type</code>: "stdio"</li>
              <li>通过标准输入输出进行通信</li>
              <li>适用于本地进程和脚本</li>
              <li>最常用的传输方式</li>
            </ul>

            <h4>SSE (服务器发送事件)</h4>
            <ul>
              <li><code>transport_type</code>: "sse"</li>
              <li>基于 HTTP 的服务器发送事件</li>
              <li>支持实时数据流</li>
              <li>适用于 Web 应用</li>
            </ul>

            <h4>Streamable HTTP</h4>
            <ul>
              <li><code>transport_type</code>: "streamable-http"</li>
              <li>支持流式 HTTP 通信</li>
              <li>适用于需要流式数据传输的场景</li>
              <li>支持大文件和实时数据流</li>
            </ul>
          </section>

          <section id="cli" class="docs-section">
            <h2>CLI 工具 (mcpx-cli)</h2>
            <p>mcpx-cli 是一个功能强大的命令行工具，用于与 mcpx 注册表 API 进行交互。它提供了管理 MCP 服务器的完整功能，包括查看、发布、更新和删除服务器，并支持多种认证方式。</p>

            <h3>主要特性</h3>
            <ul>
              <li><strong>多种认证方式</strong>: 支持 GitHub OAuth、GitHub OIDC 和匿名访问</li>
              <li><strong>自动令牌管理</strong>: 安全的凭据存储和自动令牌刷新</li>
              <li><strong>健康检查</strong>: 验证 API 连接状态</li>
              <li><strong>服务器管理</strong>: 完整的 CRUD 操作支持</li>
              <li><strong>交互式模式</strong>: 提供 Node.js、Python、Binary 和 Gerrit 模板的交互式创建</li>
              <li><strong>JSON 输出</strong>: 所有响应支持结构化输出</li>
              <li><strong>分页支持</strong>: 支持基于游标的分页浏览</li>
              <li><strong>多仓库源支持</strong>: 支持 GitHub、GitLab 和 Gerrit 仓库</li>
              <li><strong>多包类型支持</strong>: 支持 npm、PyPI、wheel、binary、OCI、NuGet、MCPB</li>
              <li><strong>传输类型支持</strong>: 支持 stdio、SSE 和 streamable-http</li>
            </ul>

            <h3>安装</h3>
            <p>从源码构建 mcpx-cli：</p>
            <pre><code># 克隆项目
git clone https://github.com/ai-mcpx/mcpx-cli.git
cd mcpx-cli

# 构建二进制文件
make build

# 或直接使用 Go
go build -o mcpx-cli .

# 系统安装
make install</code></pre>

            <h3>认证方式</h3>
            <p>mcpx-cli 支持多种认证方法：</p>
            <ul>
              <li><strong>匿名访问</strong>: 基本访问，无需 GitHub 认证</li>
              <li><strong>GitHub OAuth</strong>: 完整的 GitHub OAuth 流程</li>
              <li><strong>GitHub OIDC</strong>: 企业环境的 GitHub OpenID Connect</li>
              <li><strong>DNS 认证</strong>: 基于域名的认证（计划中）</li>
              <li><strong>HTTP 认证</strong>: 基于 HTTP 的认证（计划中）</li>
            </ul>

            <h3>基本用法</h3>
            <pre><code>mcpx-cli [全局标志] &lt;命令&gt; [命令标志]</code></pre>

            <h4>全局标志</h4>
            <ul>
              <li><code>--base-url=string</code>: mcpx API 的基础 URL（默认：http://localhost:8080）</li>
              <li><code>--version</code>: 显示版本信息</li>
              <li><code>--help</code>: 显示帮助信息</li>
            </ul>

            <h4>可用命令</h4>

            <h5>1. 健康检查</h5>
            <p>验证 API 连接状态和服务健康：</p>
            <pre><code>mcpx-cli health</code></pre>
            <p>输出示例：</p>
            <pre><code>=== Health Check ===
Status Code: 200
Status: ok
GitHub Client ID: your-github-client-id</code></pre>

            <h5>2. 列出服务器</h5>
            <p>浏览可用的 MCP 服务器：</p>
            <pre><code># 基本列表
mcpx-cli servers

# 分页控制
mcpx-cli servers --limit 10 --cursor &lt;pagination-cursor&gt;

# JSON 输出
mcpx-cli servers --json

# 详细信息（包括包和远程配置）
mcpx-cli servers --json --detailed</code></pre>

            <h5>3. 获取服务器详情</h5>
            <p>获取特定服务器的完整信息：</p>
            <pre><code># 人类可读格式
mcpx-cli server &lt;server-id&gt;

# JSON 格式
mcpx-cli server &lt;server-id&gt; --json</code></pre>

            <h5>4. 发布服务器</h5>
            <p>将新的 MCP 服务器发布到注册表：</p>
            <pre><code># 从文件发布
mcpx-cli publish server.json

# GitHub 命名空间服务器（需要认证）
mcpx-cli publish server.json --token &lt;github-token&gt;

# 交互式模式（支持多种模板）
mcpx-cli publish --interactive

# 交互式模式 + GitHub 认证
mcpx-cli publish --interactive --token &lt;github-token&gt;

# 交互式模式支持以下模板：
# - node: Node.js 服务器模板
# - python-pypi: Python PyPI 包模板
# - python-wheel: Python Wheel 包模板
# - binary: 二进制包模板
# - gerrit: Gerrit 仓库模板</code></pre>

            <h5>5. 更新服务器</h5>
            <p>更新现有服务器的信息：</p>
            <pre><code># 基本更新
mcpx-cli update &lt;server-id&gt; server.json

# GitHub 服务器更新（需要认证）
mcpx-cli update &lt;server-id&gt; server.json --token &lt;github-token&gt;

# JSON 输出
mcpx-cli update &lt;server-id&gt; server.json --json</code></pre>

            <h5>6. 删除服务器</h5>
            <p>从注册表中删除服务器：</p>
            <pre><code># 基本删除
mcpx-cli delete &lt;server-id&gt;

# 带认证删除
mcpx-cli delete &lt;server-id&gt; --token &lt;token&gt;

# JSON 输出
mcpx-cli delete &lt;server-id&gt; --json</code></pre>

            <h3>服务器 JSON 文件格式</h3>
            <p>服务器配置使用标准化的 JSON 格式。mcpx-cli 支持完整的 ServerJSON 格式：</p>

            <h4>ServerJSON 格式</h4>
            <p>这是当前使用的标准格式，直接对应 API 的服务器对象：</p>
            <pre><code>{
  "name": "io.github.example/test-server-node",
  "description": "A test MCP server in Node.js",
  "status": "active",
  "repository": {
    "url": "https://github.com/example/test-server-node",
    "source": "github",
    "id": "example/test-server-node"
  },
  "version_detail": {
    "version": "1.0.0"
  },
  "packages": [
    {
      "registry_type": "npm",
      "identifier": "@example/test-server-node",
      "version": "1.0.0",
      "runtime_hint": "npx",
      "runtime_arguments": [
        {
          "type": "positional",
          "name": "config_path",
          "value_hint": "config_path",
          "description": "Path to configuration file",
          "default": "./config.json",
          "is_required": true
        }
      ],
        "environment_variables": [
          {
            "name": "MCP_HOST",
            "description": "Server host address",
            "format": "string",
            "is_required": false,
            "default": "0.0.0.0"
          }
        ]
      }
    ],
    "remotes": [
      {
        "transport_type": "streamable-http",
        "url": "http://localhost:8000",
        "headers": [
          {
            "name": "Content-Type",
            "description": "Content type for JSON requests",
            "value": "application/json"
          }
        ]
      }
    ]
  },
  "x-publisher": {
    "tool": "mcpx-cli",
    "version": "1.0.0",
    "build_info": {
      "timestamp": "2025-08-25T12:00:00Z"
    }
  }
}</code></pre>

            <h4>字段说明</h4>
            <ul>
              <li><code>name</code>: 服务器唯一标识符，GitHub 服务器使用 io.github.* 格式</li>
              <li><code>description</code>: 服务器的简短描述</li>
              <li><code>status</code>: 服务器状态（"active"、"deprecated"、"deleted"）</li>
              <li><code>repository</code>: 源代码仓库信息，支持多种仓库源</li>
              <li><code>version_detail</code>: 版本信息</li>
              <li><code>packages</code>: 服务器的包分发信息，支持多个包类型</li>
              <li><code>runtime_arguments</code>: 运行时参数配置</li>
              <li><code>environment_variables</code>: 环境变量设置</li>
              <li><code>remotes</code>: 远程连接配置（可选）</li>
            </ul>

            <h4>仓库源配置详解</h4>
            <p>根据不同的代码托管平台，repository 字段的配置略有不同：</p>

            <h5>GitHub 仓库配置</h5>
            <pre><code>{
  "repository": {
    "url": "https://github.com/owner/repository-name",
    "source": "github",
    "id": "owner/repository-name"
  }
}</code></pre>
            <ul>
              <li><code>url</code>: 完整的 GitHub 仓库 URL</li>
              <li><code>source</code>: 必须为 "github"</li>
              <li><code>id</code>: GitHub 仓库标识符（owner/repo 格式）</li>
            </ul>

            <h5>GitLab 仓库配置</h5>
            <pre><code>{
  "repository": {
    "url": "https://gitlab.com/owner/repository-name",
    "source": "gitlab",
    "id": "owner/repository-name"
  }
}</code></pre>
            <ul>
              <li><code>url</code>: 完整的 GitLab 仓库 URL（支持 gitlab.com 和自托管实例）</li>
              <li><code>source</code>: 必须为 "gitlab"</li>
              <li><code>id</code>: GitLab 仓库标识符</li>
            </ul>

            <h5>Gerrit 仓库配置</h5>
            <pre><code>{
  "repository": {
    "url": "https://gerrit.example.com/plugins/gitiles/project-name/+/refs/heads/main",
    "source": "gerrit",
    "id": "project-name"
  }
}</code></pre>
            <ul>
              <li><code>url</code>: Gerrit 仓库 URL（支持多种格式，包括 Gitiles 和其他前端）</li>
              <li><code>source</code>: 必须为 "gerrit"</li>
              <li><code>id</code>: Gerrit 项目标识符</li>
            </ul>
          </section>

          <section id="publishing" class="docs-section">
            <h2>发布服务器</h2>
            <p>发布 MCP 服务器到注册表需要遵循特定的流程和认证要求。</p>

            <h3>认证要求</h3>
            <p>根据服务器命名空间的不同，发布需要不同级别的认证：</p>

            <h4>匿名发布</h4>
            <ul>
              <li>适用于命名空间：<code>io.modelcontextprotocol.anonymous/*</code></li>
              <li>无需 GitHub 认证</li>
              <li>适合测试和原型开发</li>
              <li>使用命令：<code>mcpx-cli publish server.json</code></li>
            </ul>

            <h4>GitHub 认证发布</h4>
            <ul>
              <li>适用于命名空间：<code>io.github.username/*</code></li>
              <li>需要 GitHub OAuth 或 OIDC 认证</li>
              <li>只有仓库拥有者可以发布和更新</li>
              <li>使用命令：<code>mcpx-cli publish server.json --token &lt;github-token&gt;</code></li>
            </ul>

            <h4>GitLab/Gerrit 仓库发布</h4>
            <ul>
              <li>适用于 GitLab 和 Gerrit 托管的代码仓库</li>
              <li>支持多种 URL 格式和实例</li>
              <li>目前使用匿名发布流程</li>
              <li>支持企业级 Gerrit 代码审查工作流</li>
              <li>使用命令：<code>mcpx-cli publish server.json</code></li>
            </ul>

            <h4>企业认证发布</h4>
            <ul>
              <li>适用于企业环境和 CI/CD 工作流</li>
              <li>支持 GitHub OIDC 认证</li>
              <li>支持 DNS 和 HTTP 验证（计划中）</li>
              <li>适用于自动化发布流程</li>
              <li>使用命令：<code>mcpx-cli publish server.json --token &lt;oidc-token&gt;</code></li>
            </ul>

            <h3>发布步骤</h3>
            <ol>
              <li><strong>准备服务器 JSON 文件</strong>
                <p>创建符合 ServerJSON 格式的配置文件，参考上面的示例。</p>
              </li>
              <li><strong>验证 JSON 格式</strong>
                <p>确保 JSON 文件格式正确，所有必需字段都已填写。</p>
              </li>
              <li><strong>选择认证方式</strong>
                <p>根据命名空间选择匿名或 GitHub 认证。</p>
              </li>
              <li><strong>使用 CLI 发布</strong>
                <pre><code># 匿名发布
mcpx-cli publish server.json

# GitHub 认证发布
mcpx-cli publish server.json --token &lt;your-github-token&gt;

# 交互式发布（支持多种模板）
mcpx-cli publish --interactive

# 交互式发布 + GitHub 认证
mcpx-cli publish --interactive --token &lt;your-github-token&gt;</code></pre>
              </li>
              <li><strong>验证发布结果</strong>
                <p>发布成功后，可以使用以下命令验证：</p>
                <pre><code># 列出服务器查看是否包含新发布的服务器
mcpx-cli servers

# 获取特定服务器详情
mcpx-cli server &lt;server-id&gt;</code></pre>
              </li>
            </ol>

            <h3>更新和删除</h3>
            <p>发布后的服务器可以进行更新和删除操作：</p>

            <h4>更新服务器</h4>
            <pre><code># 更新服务器（需要相应权限）
mcpx-cli update &lt;server-id&gt; updated-server.json --token &lt;token&gt;</code></pre>
            <p><strong>注意</strong>：更新时新版本必须大于现有版本。</p>

            <h4>删除服务器</h4>
            <pre><code># 删除服务器（需要相应权限）
mcpx-cli delete &lt;server-id&gt; --token &lt;token&gt;</code></pre>
            <p><strong>警告</strong>：删除操作不可撤销，请谨慎操作。</p>

            <h3>最佳实践</h3>
            <ul>
              <li>使用语义化版本控制（如 1.0.0, 1.1.0, 2.0.0）</li>
              <li>提供清晰的服务器描述和文档</li>
              <li>包含完整的运行时参数和环境变量配置</li>
              <li>测试所有包类型的安装和运行</li>
              <li>保持仓库信息准确和最新</li>
              <li>选择合适的传输类型（stdio 用于本地，streamable-http 用于流式数据）</li>
              <li>为不同平台提供相应的包类型（npm、PyPI、binary 等）</li>
              <li>使用交互式模式快速创建和测试服务器配置</li>
              <li>利用 CLI 的 JSON 输出进行自动化集成</li>
              <li>定期更新和维护已发布的服务器</li>
            </ul>
          </section>

          <section id="faq" class="docs-section">
            <h2>常见问题</h2>

            <el-collapse>
              <el-collapse-item title="什么是 MCP？" name="1">
                <p>Model Context Protocol (MCP) 是一种标准化协议，用于在 AI 模型和上下文提供者之间进行通信。它允许模型访问外部工具、数据源和服务，从而增强其功能。MCP 支持本地和远程服务器，通过标准化的接口提供一致的集成体验。</p>
              </el-collapse-item>

              <el-collapse-item title="支持哪些代码仓库源？" name="2">
                <p>MCP Registry 支持以下代码仓库源：</p>
                <ul>
                  <li><strong>GitHub</strong>: 支持 github.com 上的公开和私有仓库</li>
                  <li><strong>GitLab</strong>: 支持 GitLab.com 和自托管 GitLab 实例</li>
                  <li><strong>Gerrit</strong>: 支持企业级 Gerrit 代码审查系统，包括多种 URL 格式</li>
                </ul>
                <p>每种仓库源都有对应的 URL 验证规则和配置格式，详见文档的"服务器 JSON 格式"部分。</p>
              </el-collapse-item>

              <el-collapse-item title="支持哪些包注册表？" name="3">
                <p>MCP Registry 目前支持以下包注册表：</p>
                <ul>
                  <li><strong>npm</strong>: Node.js 包管理器</li>
                  <li><strong>PyPI</strong>: Python 包索引</li>
                  <li><strong>wheel</strong>: Python wheel 文件</li>
                  <li><strong>binary</strong>: 直接二进制文件分发</li>
                  <li><strong>oci</strong>: OCI 容器注册表</li>
                  <li><strong>nuget</strong>: .NET 包管理器</li>
                  <li><strong>mcpb</strong>: 专用的 MCP 二进制格式</li>
                </ul>
                <p>每种包类型都支持相应的运行时提示和传输类型配置。</p>
              </el-collapse-item>

              <el-collapse-item title="如何贡献到 MCP Registry 项目？" name="4">
                <p>您可以通过以下方式贡献：</p>
                <ul>
                  <li>在 GitHub Issues 提交问题和功能请求</li>
                  <li>提交代码改进的拉取请求</li>
                  <li>改进文档和示例</li>
                  <li>分享和推广项目</li>
                  <li>贡献新的 MCP 服务器实现</li>
                </ul>
              </el-collapse-item>

              <el-collapse-item title="如何报告问题？" name="5">
                <p>如果您发现了问题或有改进建议，请通过以下渠道联系：</p>
                <ul>
                  <li>GitHub Issues 页面提交技术问题</li>
                  <li>GitHub Discussions 参与产品讨论</li>
                  <li>查看项目文档和 FAQ</li>
                </ul>
              </el-collapse-item>

              <el-collapse-item title="注册表是否存储源代码？" name="6">
                <p>不存储。MCP Registry 是一个<strong>元注册表</strong>，它只存储关于 MCP 服务器的元数据，而不托管实际的源代码或包。实际的代码托管在各自的包注册表中（如 npm、PyPI、Docker Hub 等）。</p>
              </el-collapse-item>

              <el-collapse-item title="支持哪些认证方式？" name="7">
                <p>MCP Registry 支持多种认证方式：</p>
                <ul>
                  <li><strong>GitHub OAuth</strong>: 标准的 GitHub OAuth 流程，适用于 GitHub 托管的项目</li>
                  <li><strong>GitHub OIDC</strong>: GitHub OpenID Connect，适用于企业环境和 CI/CD 工作流</li>
                  <li><strong>匿名访问</strong>: 无需认证的访问方式，适用于公共命名空间</li>
                  <li><strong>DNS 验证</strong>: 基于域名验证的认证方式（计划中）</li>
                  <li><strong>HTTP 验证</strong>: 基于 HTTP 的认证方式（计划中）</li>
                </ul>
                <p>不同的命名空间可能需要不同的认证方式，GitHub 命名空间通常需要 GitHub 认证，而匿名命名空间可以使用匿名访问。</p>
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
const sections = ['overview', 'api', 'server-json', 'cli', 'publishing', 'faq']

const listServersParams = [
  {
    name: 'limit',
    type: '整数',
    description: '每页结果数量（最大 5000）'
  },
  {
    name: 'cursor',
    type: '字符串',
    description: '用于分页的游标令牌（可选）'
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

const deleteServerParams = [
  {
    name: 'id',
    type: '字符串',
    description: '要删除的服务器的唯一 UUID'
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
    font-size: 1.75rem;
    font-weight: 600;
  }

  h3 {
    margin: 1.5rem 0 1rem;
    font-size: 1.4rem;
    font-weight: 600;
  }

  h4 {
    margin: 1.2rem 0 0.8rem;
    font-size: 1.2rem;
    font-weight: 600;
  }

  h5 {
    margin: 1rem 0 0.6rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  p, ul, ol {
    margin-bottom: 1rem;
    line-height: 1.6;
    font-size: 1rem;
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

    &.delete {
      background-color: #f56c6c;
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