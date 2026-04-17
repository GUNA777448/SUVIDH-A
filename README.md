# SUVIDHA - Smart Urban Virtual Interactive Digital Helpdesk Assistant

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Overview

SUVIDHA is a unified civic service kiosk platform for Indian urban utility offices, enabling citizens to access electricity, gas, water, waste management, payments, grievance, document, and notification services through a single self-service interface. The platform is built with a modern microservices architecture for scalability, security, and maintainability.

## 🏗️ Architecture

**Microservices-based architecture:**

- **Frontend:** React + Vite (touch-first, multilingual, accessible UI)
- **Backend:** Node.js/Express microservices (modular, SOLID, MVC)
- **API Gateway:** Kong (or Express-based) for routing, security, and orchestration
- **Database:** NeonDB (PostgreSQL)
- **Authentication:** OAuth2/JWT, OTP login, multi-identifier (mobile, aadhar, consumerid)
- **Monitoring & Logging:** OpenTelemetry, centralized logging
- **Deployment:** Docker, Docker Compose, CI/CD ready

## 📋 Active & Planned Services

| Service                      | Port | Purpose                                  | Status            |
| ---------------------------- | ---- | ---------------------------------------- | ----------------- |
| **API Gateway**              | 5000 | Request routing, orchestration, security | ✅ Active         |
| **Auth Service**             | 4009 | User authentication, OTP, JWT, profile   | ✅ Active         |
| **Electricity Service**      | 4001 | Electricity bills, payments, connections | 🔨 In Development |
| **Gas Distribution Service** | 4002 | Gas bills, connections, status           | 🔨 In Development |
| **Water Service**            | 4003 | Water bills, complaints, consumption     | 🔨 In Development |
| **Waste Management Service** | 4004 | Sanitation, scheduling, complaints       | 🔨 In Development |
| **Payment Gateway Service**  | 4005 | Secure payment processing, receipts      | 🔨 In Development |
| **Grievance Service**        | 4006 | Complaint filing, status, escalation     | 🔨 In Development |
| **Document Service**         | 4007 | Document upload, download, print         | 🔨 In Development |
| **Notification Service**     | 4008 | Real-time alerts, advisories, broadcasts | 🔨 In Development |

## 📁 Project Structure

```
SUVIDHA/
├── client/                       # React + Vite frontend
├── server/                       # Backend services
│   └── services/
│       └── auth/
├── docs/                         # Documentation
│   ├── architecture/
│   ├── database/
│   ├── deployment/
│   │   └── DOCKER-SETUP.md
│   └── scratch/
├── scripts/                      # Root-level utility scripts
│   ├── docker-helper.sh
│   └── docker-helper.bat
├── docker-compose.yml            # Container orchestration
├── .env.docker.example           # Docker environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & Docker Compose (optional, for containerized deployment)
- **PostgreSQL** 14+ (if running without Docker)
- **MongoDB** (for certain services)
- **Git**

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/GUNA777448/SUVIDHA-kiosk.git
   cd SUVIDHA
   ```

2. **Install dependencies**

   ```bash
   # Install all dependencies (root + client + server services)
   npm install
   ```

3. **Environment Configuration**

   Create `.env` files in the appropriate directories:

   ```bash
   # Copy example env files
   cp server/.env.example server/.env
   ```

4. **Start the Development Environment**

   **Option A: Using the Backend Launcher (Recommended)**

   Start all backend services with a single command:

   ```bash
   cd server
   node server.js
   ```

   This will start:
   - API Gateway on port 5000
   - Auth Service on port 3001
   - Electricity Service on port 3002
   - Payment Service on port 3003
   - Complain Service on port 3004

   **Option B: Start Services Individually**

   ```bash
   # Terminal 1 - Frontend
   cd client
   npm run dev

   # Terminal 2 - Auth Service
   cd server/services/auth-service
   npm run dev

   # ... and so on for other services
   ```

   **Option C: Using Docker Compose**

   ```bash
   docker-compose up -d
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Auth Service**: http://localhost:5001
   - **Health Check**: http://localhost:5001/health

## 📚 Documentation

- **[Architecture Diagrams](server/ARCHITECTURE_VISUAL.md)** — Visual system architecture
- **[Backend Launcher Guide](server/BACKEND_LAUNCHER_GUIDE.md)** — Using the backend launcher
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** — In-depth development reference
- **[Production Rollout Playbook](docs/production-rollout-phases.md)** — Phase-by-phase execution plan to reach production
- **[Production Phase Tracker](docs/production-phase-tracker.md)** — Execution tracker for branch status, ownership, and approvals
- **[Environment Variable Matrix](docs/env-matrix.md)** — Required and optional environment variables by component
- **[Secret Rotation Log Template](docs/secret-rotation-log-template.md)** — Internal template for credential rotation evidence
- **[DB Migration Policy](docs/db-migration-policy.md)** — Migration naming, pairing, and execution standards
- **[DB Backup and Restore Runbook](docs/db-backup-restore-runbook.md)** — Operational backup and recovery steps for migration windows
- **[Contributing Guidelines](CONTRIBUTING.md)** — Code standards and workflow

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run dev:client          # Start Vite dev server
npm run build:client        # Build for production

# Backend
cd server && node server.js # Start all backend services
```

### Backend Launcher

The backend launcher (`server/server.js`) provides:

- ✅ **One-command startup** for all microservices
- ✅ **Color-coded logging** for easy debugging
- ✅ **Automatic health checks**
- ✅ **Graceful shutdown** handling
- ✅ **Port management** and conflict detection

```bash
cd server
node server.js
```

## 🌐 Multi-Language Support

The platform supports multiple languages for greater accessibility:

- **English** (en) - Default
- **Hindi** (hi)
- **Tamil** (ta)

Add new translations in `client/src/locales/`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Data Encryption**: At rest and in transit (TLS/SSL)
- **Audit Logging**: Comprehensive activity tracking
- **Input Validation**: Protection against injection attacks
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Secure cross-origin requests

## 📊 Monitoring & Health Checks

### Service Health Endpoints

```bash
# API Gateway Health
curl http://localhost:5000/health

# All Services Status
curl http://localhost:5000/health/services

# Individual Service Health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Electricity Service
curl http://localhost:3003/health  # Payment Service
```

### Metrics & Logging

- **Centralized Logging**: All services log through the API Gateway
- **Request Tracking**: Unique request IDs for tracing
- **Performance Metrics**: Response times and throughput monitoring
- **Error Tracking**: Comprehensive error logging and alerting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Read the [CONTRIBUTING.md](CONTRIBUTING.md) guide
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Collaboration Branch Strategy

Use the following branch setup while working collaboratively:

- `main`: Production-ready code only. Direct pushes are not allowed.
- `develop`: Integration branch for completed feature work.
- `feature/<short-name>`: New features (for example: `feature/electricity-billing-api`).
- `bugfix/<short-name>`: Non-critical fixes during development.
- `hotfix/<short-name>`: Urgent fixes for production issues, branched from `main`.
- `release/<version>`: Release preparation and final QA (for example: `release/v1.2.0`).

Workflow note:

1. Create `feature/*` or `bugfix/*` from `develop`.
2. Open PR into `develop`.
3. Use `release/*` when preparing deployment.
4. Merge approved release into `main` and back-merge into `develop`.
5. Use `hotfix/*` from `main` only for urgent production fixes.

### Code Standards

- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Test Coverage**: Maintain >= 80% coverage
- **Documentation**: Update relevant docs with changes
- **Commit Messages**: Use conventional commit format

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GUNA777448/SUVIDHA-kiosk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GUNA777448/SUVIDHA-kiosk/discussions)

## 🎯 Roadmap

### Phase 1: Foundation (Completed)

- ✅ Project structure and architecture
- ✅ Core microservices setup
- ✅ API Gateway implementation
- ✅ Authentication service

### Phase 2: Core Services (In Progress)

- ✅ Electricity bill payment
- ✅ Payment processing integration
- ✅ Complaint management
- 🔨 Document services
- 🔨 Gas services
- 🔨 Water services

### Phase 3: Advanced Features (Planned)

- 📋 Admin dashboard and analytics
- 📋 SMS/Email notifications
- 📋 Hardware integration (printers, biometric devices)
- 📋 Multilingual voice assistance
- 📋 Mobile app integration

### Phase 4: Production Ready (Future)

- 📋 Load testing and optimization
- 📋 Security hardening
- 📋 Production deployment
- 📋 Monitoring and alerting setup

---

_Last updated: February 2026 · v1.0.0_
