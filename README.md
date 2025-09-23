# mcpx-ui

Modern Vue 3 frontend for the **mcpx registry** with comprehensive authentication, CRUD operations, and enhanced user experience. This application provides an intuitive interface for managing Model Context Protocol (MCP) servers with full integration to the [mcpx backend](https://github.com/ai-mcpx/mcpx).

<img width="1246" alt="mcpx-ui interface" src="images/01.png" />

## ✨ Key Features

### 🔐 **Enhanced Authentication System**
- **GitHub OAuth** integration for repository-based permissions
- **GitHub OIDC** support for GitHub Actions workflows
- **Anonymous authentication** for public namespace access
- **DNS/HTTP authentication** for custom domain verification
- **JWT token management** with persistent sessions and auto-refresh
- **Permission-based UI** - features dynamically appear based on authentication status

### 📦 **Comprehensive Server Management**
- **Browse & Search** servers with advanced filtering and pagination
- **Publish New Servers** with guided form interface and validation
- **Edit Existing Servers** with full schema validation and real-time preview
- **Delete Server Versions** with version-based deletion and confirmation dialogs
- **Repository Support**: GitHub, GitLab, and Gerrit integration with smart URL parsing
- **Registry Type Support**: npm, PyPI, wheel, binary, OCI, NuGet, MCPB packages
- **Transport Types**: stdio, SSE (Server-Sent Events), streamable-http for different communication methods
- **Version Management** with latest version tracking and history
- **Server & Version IDs**: Display of unique server and version identifiers
- **Package Identification**: Modern schema with `identifier` field for package naming

### 🎨 **Modern User Experience**
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Real-time Validation** with comprehensive error handling and user feedback
- **Modern Vue 3** architecture with Composition API and TypeScript support
- **Element Plus UI** components for consistent, accessible interface
- **Hot Module Replacement** for lightning-fast development experience

### 🛠 **Developer & Production Features**
- **Docker Support** with nginx reverse proxy for production deployment
- **Environment Configuration** with development/production mode switching
- **CORS Handling** for seamless API integration across domains
- **Comprehensive API Documentation** with interactive examples and updated schema
- **State Management** with Pinia for predictable data flow
- **Schema Compatibility** with backward compatibility for legacy package fields
- **Modern Package Schema** supporting the latest mcpx registry specification

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)

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

### Full Stack Deployment

For a complete production setup with backend, database, and UI:

```bash
# Deploy the full mcpx stack
docker-compose -f docker-compose-mcpx.yml up -d

# Access the application
open http://localhost
```

This deployment includes:
- **mcpx backend** API server on port 8080
- **PostgreSQL database** with persistent storage
- **pgAdmin** database management on port 5050
- **mcpx-ui frontend** served through nginx on port 80
- **Prometheus metrics** collection on port 9187
- **Automatic TLS** configuration (production ready)

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

#### 1. GitHub OAuth
```bash
# Configure GitHub OAuth app
VITE_GITHUB_CLIENT_ID=your_github_client_id
# Callback URL: http://localhost:5173/auth/callback
```

#### 2. Anonymous Authentication
- Automatically enabled for public namespace access
- No configuration required
- Limited to `io.modelcontextprotocol.anonymous/*` namespace

#### 3. GitHub OIDC (Enterprise)
- Configure in GitHub Actions or enterprise environments
- Uses JWT tokens for automated workflows

#### 4. Custom Domain Authentication
- DNS verification for custom namespaces
- HTTP-based domain ownership verification

## 🛠 Technology Stack

**Frontend Framework:**
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Static type checking and enhanced developer experience
- **Vite** - Lightning-fast build tool and development server

**UI & Styling:**
- **Element Plus** - Comprehensive Vue 3 component library
- **SCSS** - Advanced CSS preprocessing with variables and mixins
- **Responsive Design** - Mobile-first approach with CSS Grid and Flexbox

**Package & Registry Support:**
- **Registry Types**: npm, PyPI, wheel, binary, OCI, NuGet, MCPB, Docker
- **Repository Sources**: GitHub, GitLab, Gerrit with smart URL detection and validation
- **Transport Types**: stdio (standard I/O), sse (Server-Sent Events), streamable-http
- **Runtime Hints**: npx, uvx, python, wheel, binary, docker, dnx
- **Schema Validation**: Real-time validation for package configuration with camelCase field names
- **Backward Compatibility**: Supports both legacy (snake_case) and modern (camelCase) field names
- **Version-based Operations**: Delete individual server versions using unique version IDs

**State Management & Routing:**
- **Pinia** - Intuitive, type-safe state management
- **Vue Router 4** - Official routing solution with dynamic imports

**HTTP & API:**
- **Axios** - Promise-based HTTP client with interceptors
- **REST API** - Full CRUD operations with authentication headers
- **Error Handling** - Comprehensive error boundary and user feedback

**Development & Production:**
- **Docker** - Containerization for consistent deployments
- **Nginx** - High-performance web server and reverse proxy
- **Hot Module Replacement** - Fast development with instant updates

## User Interface Features

### Authentication Panel
- **Multi-method Login**: GitHub OAuth, GitHub OIDC, Anonymous authentication
- **Session Management**: Persistent login sessions with auto-refresh
- **Permission Display**: Clear indication of authentication status and permissions

### Server Management Interface
- **Server Browser**: Paginated list with search and filtering capabilities
- **Publish Form**: Guided server creation with real-time validation
- **Edit Interface**: In-place editing with schema validation and preview
- **Version-based Deletion**: Delete individual server versions using unique version IDs
- **Server & Version Display**: Clear display of server IDs and version IDs for identification

### Repository Integration
- **Multi-Source Support**: GitHub, GitLab, and Gerrit repository integration
- **Smart URL Parsing**: Automatic repository name extraction and display
- **Visual Indicators**: Color-coded tags for different repository sources
- **Dynamic Help Text**: Context-aware URL format guidance for each repository type
- **Flexible Repository IDs**: Support for different ID formats per repository source

#### Supported Repository Sources

| Source | URL Format | Example | Visual Tag |
|--------|------------|---------|------------|
| **GitHub** | `https://github.com/user/repo` | `https://github.com/microsoft/vscode` | Green (Success) |
| **GitLab** | `https://gitlab.com/user/repo` | `https://gitlab.com/gitlab-org/gitlab` | Orange (Warning) |
| **Gerrit** | `http://host:port/project/path` | `http://gerrit.example.com/my-project` | Blue (Info) |

### Package Configuration Interface
- **Registry Type Selection**: Support for npm, PyPI, wheel, binary, OCI, NuGet, MCPB, Docker
- **Transport Type Configuration**: Choose between stdio, SSE, and streamable-http communication
- **Smart Runtime Hints**: Contextual runtime suggestions including npx, uvx, python, wheel, binary, docker, dnx
- **Package Identification**: Modern `identifier` field with legacy `name` fallback
- **Installation Commands**: Auto-generated installation instructions per package type
- **Multi-Package Support**: Configure multiple packages per server with different types
- **CamelCase Schema**: Modern JSON field naming convention (registryType, runtimeHint, etc.)

### Advanced Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Validation**: Form validation with immediate user feedback
- **Error Handling**: Comprehensive error messages and recovery suggestions
- **Loading States**: Elegant loading indicators for better user experience

## 🔐 Authentication & Security

### Supported Authentication Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **GitHub OAuth** | Standard OAuth flow | Repository owners, full permissions |
| **GitHub OIDC** | OpenID Connect | GitHub Actions, CI/CD workflows |
| **Anonymous** | No authentication | Public namespace publishing |
| **DNS** | Domain verification | Custom domain namespaces |
| **HTTP** | HTTP-based auth | Custom authentication systems |

### Security Features
- **JWT Token Management**: Secure token storage with automatic refresh
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Permission-based UI**: Features dynamically enabled based on user permissions
- **Secure Communication**: HTTPS enforcement in production environments

### Namespace Permissions
- **GitHub Namespaces**: `io.github.{username}/*` - requires GitHub authentication
- **Anonymous Namespace**: `io.modelcontextprotocol.anonymous/*` - no auth required
- **Custom Domains**: `your-domain.com/*` - requires domain verification

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

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

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

- **[mcpx](https://github.com/ai-mcpx/mcpx)**
- **[mcpx-cli](https://github.com/ai-mcpx/mcpx-cli)**
- **[Model Context Protocol](https://modelcontextprotocol.io)**
