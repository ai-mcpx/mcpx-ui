# mcpx-ui

Modern Vue 3 frontend for the **MCP Registry** with browse, publish, edit, and soft-delete operations. By default the UI supports anonymous authentication; additional auth methods can be enabled when supported by your backend deployment. This application provides an intuitive interface for managing Model Context Protocol (MCP) servers and integrates with the [mcpx backend](https://github.com/ai-mcpx/mcpx).

> **🎉 Preview Release**: MCP Registry has launched in preview! While the system is now more stable, this is still a preview release and breaking changes or data resets may occur. We'd love your feedback in [GitHub discussions](https://github.com/modelcontextprotocol/registry/discussions) or in the [#registry-dev Discord](https://discord.com/channels/1358869848138059966/1369487942862504016).

<img width="1246" alt="mcpx-ui interface" src="images/01.png" />

## ✨ Key Features

### 🔐 **Authentication**
- **Anonymous authentication** for public namespace access (available by default)
- **GitHub OAuth / GitHub OIDC / DNS / HTTP** authentication can be exposed when the backend enables these endpoints (hidden by default in the UI)
- **JWT token usage** when authenticated; features like publish/edit/delete require a valid registry JWT

### 📦 **Comprehensive Server Management**
- **Browse & Search** servers with advanced filtering and pagination
- **Publish New Servers** with guided form interface and validation
- **Edit Existing Servers** with full schema validation and real-time preview
- **Delete Server Versions** via soft delete (PUT status=deleted) with confirmation dialogs
- **Repository Support**: GitHub, GitLab, and Gerrit integration with smart URL parsing
- **Registry Type Support**: npm, PyPI, wheel, binary, Docker, OCI, NuGet, MCPB packages
- **Transport Types**: stdio, SSE (Server-Sent Events), streamable-http for different communication methods
- **Version Management** with latest/specific version retrieval and version history
- **Package Identification**: Modern schema with `identifier` field for package naming

### 🎮 **Interactive Playground**
- **Live Server Testing** with real-time MCP protocol communication
- **Tool Execution** with dynamic form generation based on tool schemas
- **Mock Server Support** for demonstration and testing purposes
- **Interactive Logs** with real-time server output and debugging
- **Tool Discovery** with automatic tool listing and schema inspection
- **Argument Validation** with type-safe input forms for tool parameters
- **Vue 3 Components** with Element Plus UI and Pinia state management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Docker & Docker Compose** (for full stack deployment)
- **mcpx backend** running (see [mcpx repository](https://github.com/ai-mcpx/mcpx))

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd mcpx-ui
npm install
```

2. (Optional) **Configure environment:**
```bash
cp .env.example .env
# Note: The UI uses a fixed "/api" base path which is proxied to the backend's /v0 endpoints via nginx.
# Most features work without changing .env. You can keep defaults or add feature flags if you wire them in.
```

3. **Start development server:**
```bash
npm run dev
```
The application will be available at `http://localhost:5173` with hot module replacement.

### 🎮 Using the Playground

The MCP Registry includes an interactive playground for testing MCP servers:

1. **Access Playground**: Navigate to `/playground` or click "Playground" in the navigation
2. **Select Server**: Choose from available MCP servers in the left panel
3. **Start Connection**: Click "Start Server" to establish connection
4. **Execute Tools**: Use the dynamic forms to execute MCP tools with custom parameters
5. **View Results**: Monitor real-time logs and execution results
6. **Stop Server**: Disconnect when finished testing

**Playground Features:**
- **Mock Server Support**: Built-in mock server for demonstration and testing
- **Dynamic Forms**: Auto-generated input forms based on tool schemas
- **Live Logging**: Real-time server output and debugging information
- **Tool Discovery**: Automatic detection and listing of available tools
- **Vue 3 Implementation**: Modern reactive interface with Element Plus components

### Full Stack Deployment

For a complete production setup with backend, database, and UI (nginx proxies /api -> backend /v0):

```bash
# Deploy the full mcpx stack
docker-compose -f docker-compose-mcpx.yml up -d

# Access the application
open http://localhost
```

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## 🔧 Configuration

### Environment Variables

You can optionally provide a `.env` file for future feature flags. By default, the API base is fixed to "/api" and proxied to the backend's /v0; most deployments do not require environment changes.

Example (optional):
```bash
# Authentication (optional; backend-dependent)
VITE_GITHUB_CLIENT_ID=
VITE_AUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# Feature flags (optional; if you wire them in the UI)
VITE_ENABLE_PUBLISH=true
VITE_ENABLE_EDIT=true
VITE_ENABLE_DELETE=true

# Debug (optional)
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

### Authentication

- Anonymous authentication is available by default and sufficient for the `io.modelcontextprotocol.anonymous/*` namespace.
- GitHub OAuth/OIDC, DNS, and HTTP auth can be exposed only if your backend supports these endpoints; the UI hides them by default.

## 🐳 Docker Deployment

### Development Container
```bash
# Build and run development container
docker build -t mcpx-ui:dev .
docker run -p 5173:5173 -v $(pwd):/app mcpx-ui:dev
```

### Production Deployment
```bash
# Full stack deployment with backend
docker-compose -f docker-compose-mcpx.yml up -d

# UI only deployment
docker build -t mcpx-ui:latest .
docker run -p 80:80 mcpx-ui:latest

# nginx in this image proxies /api to your backend /v0 as configured in nginx.conf
```

## 🤝 Contributing

We welcome contributions! The MCP Registry project uses multiple channels for collaboration:

### Community Channels
- **[Discord](https://modelcontextprotocol.io/community/communication)** - Real-time community discussions
- **[GitHub Discussions](https://github.com/modelcontextprotocol/registry/discussions)** - Propose and discuss product/technical requirements
- **[GitHub Issues](https://github.com/modelcontextprotocol/registry/issues)** - Track well-scoped technical work
- **[Pull Requests](https://github.com/modelcontextprotocol/registry/pulls)** - Contribute work towards issues

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **Vue 3 Composition API**: Use modern Vue patterns
- **TypeScript**: Type safety for better code quality
- **ESLint/Prettier**: Consistent code formatting
- **Component Testing**: Unit tests for critical components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[MCP Registry](https://github.com/modelcontextprotocol/registry)** - The official MCP Registry backend
- **[mcpx](https://github.com/ai-mcpx/mcpx)** - Community MCP Registry implementation
- **[mcpx-cli](https://github.com/ai-mcpx/mcpx-cli)** - Command-line interface for MCP Registry
- **[Model Context Protocol](https://modelcontextprotocol.io)** - Official MCP documentation and resources
