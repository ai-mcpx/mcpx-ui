### English | [中文](README_ZH.md)


# 👋 mcp-registry-frontend
MCP Registry Frontend: A Vue 3 Application  This repository contains the frontend application for the MCP Registry project, built with Vue 3.

Here's a refined `README.md` for your MCP Registry Frontend project:

<img width="1246" alt="17771741589061_ pic" src="images/01.png" />

# 🚀 MCP Registry Frontend

This repository houses the **frontend application** for the **MCP Registry project**, built with **Vue 3**. It serves as the user interface for the enhanced [mcpx registry](https://github.com/ai-mcpx/mcpx) backend with full CRUD operations and authentication support.

-----

## Project Overview

The MCP Registry Frontend provides an intuitive and responsive interface for browsing, searching, publishing, editing, and managing Model Context Protocol (MCP) servers within the registry ecosystem.

-----

## ✨ Key Features

### 🔐 **Authentication System**
- **GitHub OAuth** integration for repository-based permissions
- **GitHub OIDC** support for GitHub Actions workflows
- **Anonymous authentication** for public namespaces
- **DNS/HTTP authentication** for custom domain verification
- **JWT token management** with persistent sessions

### 📦 **Server Management**
- **Browse servers** with pagination and search
- **Publish new servers** with guided form interface
- **Edit existing servers** with full schema validation
- **Soft delete** functionality (sets status to "deleted")
- **Package type support**: npm, pypi, wheel, binary, OCI, NuGet

### 🎨 **User Experience**
- **Responsive design** for all device sizes
- **Real-time validation** with comprehensive error handling
- **Permission-based UI** - features appear based on auth status
- **Modern Vue 3** with Composition API and Element Plus
- **Comprehensive documentation** with API examples

### 🛠 **Developer Features**
- **Hot module replacement** for fast development
- **Docker support** with nginx reverse proxy
- **Environment configuration** with development/production modes
- **CORS handling** for seamless API integration

-----

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── assets/           # Styles, images, and other assets
│   ├── components/       # Reusable Vue components
│   ├── router/           # Vue Router configuration
│   ├── services/         # API service definitions
│   ├── stores/           # Pinia state management modules
│   ├── views/            # Page-level components
│   ├── App.vue           # Root Vue component
│   └── main.js           # Application entry point
├── index.html            # Main HTML entry file
├── package.json          # Project dependencies and scripts
-----

## 🏗 Project Structure

```
mcpx-ui/
├── public/               # Static assets
├── src/
│   ├── assets/           # Styles, images, and other assets
│   ├── components/       # Reusable Vue components
│   │   ├── AuthPanel.vue     # Authentication interface
│   │   ├── ServerCard.vue    # Server list item display
│   │   └── ServerEditor.vue  # Server create/edit form
│   ├── router/           # Vue Router configuration
│   ├── services/         # API service definitions
│   │   └── api.js            # Enhanced API client with CRUD operations
│   ├── stores/           # Pinia state management modules
│   │   ├── auth.js           # Authentication state management
│   │   └── servers.js        # Server data management
│   ├── views/            # Page-level components
│   │   ├── Home.vue          # Server listing with publish option
│   │   ├── ServerDetail.vue  # Server details with edit/delete
│   │   ├── Search.vue        # Server search interface
│   │   └── Docs.vue          # API documentation
│   ├── App.vue           # Root Vue component with auth integration
│   └── main.js           # Application entry point
├── docker-compose-mcpx.yml  # Full stack deployment
├── nginx.conf                # Production nginx configuration
├── .env.example             # Environment configuration template
└── vite.config.js           # Vite build tool configuration
```

-----

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)

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
# Edit .env with your configuration
```

3. **Start development server:**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Full Stack Deployment

For a complete setup with backend, database, and UI:

```bash
# Deploy the full stack
docker-compose -f docker-compose-mcpx.yml up -d

# Access the application
open http://localhost
```

This includes:
- **mcpx backend** on port 8080
- **PostgreSQL database** with pgAdmin on port 5050
- **mcpx-ui frontend** through nginx on port 80
- **Prometheus metrics** on port 9187

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run serve
```

-----

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# API Configuration
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:8080

# Feature Flags
VITE_ENABLE_AUTH=true
VITE_ENABLE_PUBLISH=true
VITE_ENABLE_EDIT=true

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### Authentication Setup

1. **GitHub OAuth**: Configure client ID in environment variables
2. **Anonymous Auth**: Enabled by default for `io.modelcontextprotocol.anonymous/*` namespace
3. **Custom Domains**: Use DNS/HTTP authentication for your domain namespace

-----

## 🛠 Technology Stack

  * **Vue 3**: Progressive JavaScript framework with Composition API
  * **Element Plus**: Comprehensive Vue 3 component library
  * **Pinia**: Intuitive state management for Vue
  * **Vue Router**: Official routing solution for Vue.js
  * **Axios**: Promise-based HTTP client for API requests
  * **Vite**: Fast build tool and development server
  * **Docker**: Containerization for consistent deployments
  * **Nginx**: High-performance web server and reverse proxy

-----

## 🔐 Authentication & Permissions

The application supports multiple authentication methods:

### GitHub Integration
- **OAuth Flow**: Standard GitHub OAuth for user authentication
- **OIDC Flow**: GitHub Actions integration with OIDC tokens
- **Permissions**: Automatic namespace permissions based on GitHub username

### Anonymous Publishing
- **No Auth Required**: Publish to `io.modelcontextprotocol.anonymous/*`
- **Temporary Tokens**: Short-lived JWT tokens for anonymous operations

### Custom Domains
- **DNS Authentication**: Verify domain ownership via TXT records
- **HTTP Authentication**: Verify domain control via hosted public keys

-----

## 📡 API Integration

The frontend integrates with the mcpx backend API:

### Core Endpoints
- `GET /v0/servers` - List servers with pagination
- `GET /v0/servers/{id}` - Get server details
- `PUT /v0/servers/{id}` - Update server (authenticated)
- `POST /v0/publish` - Publish new server (authenticated)

### Authentication Endpoints
- `POST /v0/auth/github-at` - GitHub OAuth token exchange
- `POST /v0/auth/github-oidc` - GitHub OIDC token exchange
- `POST /v0/auth/none` - Anonymous token generation
- `POST /v0/auth/dns` - DNS-based authentication
- `POST /v0/auth/http` - HTTP-based authentication
  * **Vue Router**: The official routing library for Vue.js.
  * **Pinia**: A lightweight and intuitive state management library for Vue.js.
  * **Element Plus**: A popular Vue 3 UI component library for building rich web applications.
  * **Axios**: A promise-based HTTP client for making API requests.
  * **Vite**: A next-generation frontend tooling that provides an extremely fast development experience.

-----

## API Integration

The frontend communicates with the backend API via a `/api` proxy. In the development environment, API requests are automatically proxied to `http://localhost:8080/v0`.

-----

## Styling and Theming

The project uses **SCSS** for styling. You can customize the application's theme colors and variables in the `src/assets/styles/main.scss` file.
