# mcpx-ui

Modern Vue 3 frontend for the **MCP Registry** with comprehensive authentication, CRUD operations, and enhanced user experience. This application provides an intuitive interface for managing Model Context Protocol (MCP) servers with full integration to the [mcpx backend](https://github.com/ai-mcpx/mcpx).

> **🎉 Preview Release**: MCP Registry has launched in preview! While the system is now more stable, this is still a preview release and breaking changes or data resets may occur. We'd love your feedback in [GitHub discussions](https://github.com/modelcontextprotocol/registry/discussions) or in the [#registry-dev Discord](https://discord.com/channels/1358869848138059966/1369487942862504016).

<img width="1246" alt="mcpx-ui interface" src="images/01.png" />

## ✨ Key Features

### 🔐 **Enhanced Authentication System**
- **Anonymous authentication** for public namespace access (available)
- **GitHub OAuth** integration for repository-based permissions (available)
- **GitHub OIDC** support for GitHub Actions workflows (available)
- **DNS/HTTP authentication** for custom domain verification (available)
- **JWT token management** with persistent sessions and auto-refresh
- **Permission-based UI** - features dynamically appear based on authentication status

### 📦 **Comprehensive Server Management**
- **Browse & Search** servers with advanced filtering and pagination
- **Publish New Servers** with guided form interface and validation
- **Edit Existing Servers** with full schema validation and real-time preview
- **Delete Server Versions** with version-based deletion and confirmation dialogs
- **Repository Support**: GitHub, GitLab, and Gerrit integration with smart URL parsing
- **Registry Type Support**: npm, PyPI, wheel, binary, Docker, OCI, NuGet, MCPB packages
- **Transport Types**: stdio, SSE (Server-Sent Events), streamable-http for different communication methods
- **Version Management** with latest version tracking and history
- **Smart ID Generation**: Automatic generation of consistent server IDs and version IDs for better tracking
- **Server & Version IDs**: Display of unique server and version identifiers with fallback generation
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

- **Node.js 18+** and npm/yarn
- **Docker & Docker Compose** (for full stack deployment)
- **mcpx backend** running (see [mcpx repository](https://github.com/ai-mcpx/mcpx))

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd mcpx-ui
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration:
# VITE_API_BASE_URL=http://localhost:8080
# VITE_GITHUB_CLIENT_ID=your_github_client_id
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

For a complete production setup with backend, database, and UI:

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

Configure the application using `.env` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:8080

# Authentication Configuration
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_AUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# Feature Flags
VITE_ENABLE_AUTH=true
VITE_ENABLE_PUBLISH=true
VITE_ENABLE_EDIT=true
VITE_ENABLE_DELETE=true

# Repository Configuration
VITE_ENABLE_GITHUB=true
VITE_ENABLE_GITLAB=true
VITE_ENABLE_GERRIT=true

# Development Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

### Authentication Setup

The application supports multiple authentication methods:

#### 1. Anonymous Authentication (Currently Available)
- Automatically enabled for public namespace access
- No configuration required
- Limited to `io.modelcontextprotocol.anonymous/*` namespace

#### 2. GitHub OAuth (Available)
```bash
# Configure GitHub OAuth app
VITE_GITHUB_CLIENT_ID=your_github_client_id
# Callback URL: http://localhost:5173/auth/callback
```

#### 3. GitHub OIDC (Available)
- Configure in GitHub Actions or enterprise environments
- Uses JWT tokens for automated workflows

#### 4. Custom Domain Authentication (Available)
- DNS verification for custom namespaces
- HTTP-based domain ownership verification

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
