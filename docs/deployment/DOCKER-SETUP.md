# Docker Setup Documentation

## Overview

This Docker setup containerizes the SUVIDHA application including:

- **Client**: React + Vite application served via Nginx
- **API Gateway**: Express middleware for routing
- **Auth Service**: Microservice for authentication
- **PostgreSQL**: Database service
- **Redis**: Caching service

## Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- At least 4GB RAM allocated to Docker

## Quick Start

### 1. Clone and Setup

```bash
cd /path/to/SUVIDHA
cp .env.docker.example .env.docker
# Edit .env.docker with your configuration
```

### 2. Build and Run

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access Services

- **Client**: http://localhost:3000
- **API Gateway**: http://localhost:4009
- **Auth Service**: http://localhost:5001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Individual Service Commands

### Run Specific Service

```bash
# Only client
docker-compose up -d client

# Only auth service with dependencies
docker-compose up -d auth-service
```

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f client
docker-compose logs -f auth-service
```

### Execute Commands in Container

```bash
# Access client container
docker-compose exec client sh

# Run migrations in auth service
docker-compose exec auth-service npm run prisma:migrate

# Access database
docker-compose exec postgres psql -U user -d suvidha_auth
```

### Rebuild Specific Service

```bash
docker-compose build --no-cache client
docker-compose up -d client
```

## Production Deployment

### Environment Configuration

1. Create `.env.docker` with production values
2. Set strong PostgreSQL and Redis passwords
3. Generate secure JWT_SECRET (use `openssl rand -hex 32`)
4. Update VITE_API_BASE_URL to production domain

### Production Build

```bash
# Use production environment file
docker-compose --env-file .env.docker.prod up -d

# Enable auto-restart
docker-compose up -d --remove-orphans
```

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U user suvidha_auth > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U user suvidha_auth < backup.sql
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Verify port availability
netstat -an | grep LISTEN

# Restart service
docker-compose restart <service-name>
```

### Database Connection Error

```bash
# Check database is healthy
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U user -d suvidha_auth -c "SELECT version();"

# Reset database
docker-compose down
docker volume rm suvidha_postgres_data
docker-compose up -d postgres
```

### Port Already in Use

Update ports in `docker-compose.yml`:

```yaml
ports:
  - "3001:80" # Changed from 3000
```

## Health Checks

All services include health checks. View status:

```bash
docker-compose ps
```

Healthy services show `(healthy)` status.

## Cleanup

### Remove All Containers

```bash
docker-compose down
```

### Remove Volumes (Database Reset)

```bash
docker-compose down -v
```

### Remove All Unused Images

```bash
docker image prune -a
```

## Development Tips

### Hot Reload

For development with hot reload, modify client service:

```yaml
services:
  client:
    volumes:
      - ./client/src:/app/src
      - ./client/public:/app/public
    command: npm run dev
```

### View Network

```bash
docker network ls
docker network inspect suvidha_suvidha-network
```

### Monitor Resources

```bash
docker stats
```

## Networking

All services communicate via the `suvidha-network` bridge network:

- Internal communication uses service names (e.g., `auth-service:5001`)
- External access uses `localhost` and mapped ports

## Security Notes

1. Never commit `.env.docker` with production secrets
2. Use environment variables for sensitive data
3. Rotate JWT_SECRET regularly
4. Use strong database passwords
5. Enable HTTPS in production (add reverse proxy)
6. Limit container resources in production

## File Structure

```
SUVIDHA/
├── client/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── ...
├── api-gateway/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── server/services/auth/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── docker-compose.yml
├── .env.docker.example
├── scripts/
│   ├── docker-helper.sh
│   └── docker-helper.bat
└── docs/deployment/DOCKER-SETUP.md (this file)
```

## Performance Optimization

### Image Size Reduction

- Using Alpine Linux for smaller images
- Multi-stage builds for client
- Production-only dependencies

### Resource Limits (Optional)

Add to services in docker-compose.yml:

```yaml
services:
  client:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

## Support

For issues:

1. Check logs: `docker-compose logs -f`
2. Verify configuration in `.env.docker`
3. Ensure all ports are available
4. Check Docker resource allocation
