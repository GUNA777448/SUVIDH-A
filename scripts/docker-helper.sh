#!/bin/bash
# Docker helper script for SUVIDHA project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Help function
show_help() {
    cat << EOF
SUVIDHA Docker Helper

Usage: ./scripts/docker-helper.sh [command] [options]

Commands:
    build              Build all images
    build-client       Build only client image
    build-api          Build only API gateway image
    build-auth         Build only auth service image
    
    up                 Start all services
    down               Stop all services
    restart            Restart all services
    logs               View logs from all services
    logs-client        View client logs
    logs-api           View API gateway logs
    logs-auth          View auth service logs
    
    ps                 Show running containers
    shell-client       Enter client container shell
    shell-api          Enter API gateway shell
    shell-auth         Enter auth service shell
    shell-db           Enter database shell
    
    db-backup          Backup PostgreSQL database
    db-restore [file]  Restore PostgreSQL database from file
    db-reset           Reset database (destructive!)
    
    clean              Remove containers and volumes (destructive!)
    clean-images       Remove all SUVIDHA images
    
    health             Check health of all services
    init               Initialize project (first-time setup)
    
    help               Show this help message

Examples:
    ./scripts/docker-helper.sh up
    ./scripts/docker-helper.sh logs -f
    ./scripts/docker-helper.sh db-backup
    ./scripts/docker-helper.sh shell-auth
EOF
}

# Build functions
build_all() {
    print_header "Building all images"
    docker-compose build
    print_success "All images built"
}

build_client() {
    print_header "Building client image"
    docker-compose build client
    print_success "Client image built"
}

build_api() {
    print_header "Building API gateway image"
    docker-compose build api-gateway
    print_success "API gateway image built"
}

build_auth() {
    print_header "Building auth service image"
    docker-compose build auth-service
    print_success "Auth service image built"
}

# Service functions
start_services() {
    print_header "Starting all services"
    docker-compose up -d
    print_success "All services started"
    sleep 3
    docker-compose ps
}

stop_services() {
    print_header "Stopping all services"
    docker-compose down
    print_success "All services stopped"
}

restart_services() {
    print_header "Restarting all services"
    docker-compose restart
    print_success "All services restarted"
}

view_logs() {
    print_header "Viewing logs (Press Ctrl+C to exit)"
    docker-compose logs -f "$@"
}

check_health() {
    print_header "Health Check Status"
    docker-compose ps
    echo ""
    
    print_header "Running health checks"
    
    if docker-compose exec -T client curl -f http://localhost:80/health > /dev/null 2>&1; then
        print_success "Client health check passed"
    else
        print_error "Client health check failed"
    fi
    
    if docker-compose exec -T api-gateway wget --quiet --tries=1 --spider http://localhost:4009/health > /dev/null 2>&1; then
        print_success "API Gateway health check passed"
    else
        print_error "API Gateway health check failed"
    fi
}

# Shell functions
enter_client_shell() {
    print_header "Entering client container (type 'exit' to exit)"
    docker-compose exec client sh
}

enter_api_shell() {
    print_header "Entering API gateway container (type 'exit' to exit)"
    docker-compose exec api-gateway sh
}

enter_auth_shell() {
    print_header "Entering auth service container (type 'exit' to exit)"
    docker-compose exec auth-service sh
}

enter_db_shell() {
    print_header "Entering PostgreSQL shell (type '\\q' to exit)"
    docker-compose exec postgres psql -U user -d suvidha_auth
}

# Database functions
backup_database() {
    print_header "Backing up PostgreSQL database"
    local backup_file="suvidha_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U user suvidha_auth > "$backup_file"
    print_success "Database backed up to $backup_file"
}

restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Usage: ./scripts/docker-helper.sh db-restore [backup_file]"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "Restoring database from $backup_file"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_header "Restoring database"
        docker-compose exec -T postgres psql -U user suvidha_auth < "$backup_file"
        print_success "Database restored"
    else
        print_warning "Restore cancelled"
    fi
}

reset_database() {
    print_error "WARNING: This will DELETE all data from the database!"
    read -p "Are you sure you want to reset the database? (yes/no) " confirmation
    
    if [ "$confirmation" = "yes" ]; then
        print_header "Resetting database"
        docker-compose down -v
        docker-compose up -d postgres redis
        sleep 5
        docker-compose up -d
        print_success "Database reset complete"
    else
        print_warning "Database reset cancelled"
    fi
}

# Cleanup functions
clean_all() {
    print_error "WARNING: This will DELETE all containers and volumes!"
    read -p "Are you sure you want to clean everything? (yes/no) " confirmation
    
    if [ "$confirmation" = "yes" ]; then
        print_header "Cleaning up"
        docker-compose down -v
        print_success "Cleanup complete"
    else
        print_warning "Cleanup cancelled"
    fi
}

clean_images() {
    print_warning "Removing all SUVIDHA images"
    docker-compose down
    docker image rm suvidha-client suvidha-api-gateway suvidha-auth-service 2>/dev/null || true
    print_success "Images removed"
}

# Initialize project
init_project() {
    print_header "Initializing SUVIDHA Docker setup"
    
    if [ ! -f ".env.docker" ]; then
        print_warning "Creating .env.docker from .env.docker.example"
        cp .env.docker.example .env.docker
        print_success ".env.docker created - please edit it with your configuration"
    else
        print_success ".env.docker already exists"
    fi
    
    print_header "Building images"
    build_all
    
    print_header "Starting services"
    start_services
    
    print_success "SUVIDHA is ready!"
    print_header "Access points:"
    echo "  Client:       http://localhost:3000"
    echo "  API Gateway:  http://localhost:4009"
    echo "  Auth Service: http://localhost:5001"
    echo "  Database:     localhost:5432"
    echo "  Redis:        localhost:6379"
}

# Main script
main() {
    local command="${1:-help}"
    
    case "$command" in
        build)
            build_all
            ;;
        build-client)
            build_client
            ;;
        build-api)
            build_api
            ;;
        build-auth)
            build_auth
            ;;
        up)
            start_services
            ;;
        down)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs "${@:2}"
            ;;
        logs-client)
            view_logs client
            ;;
        logs-api)
            view_logs api-gateway
            ;;
        logs-auth)
            view_logs auth-service
            ;;
        ps)
            docker-compose ps
            ;;
        health)
            check_health
            ;;
        shell-client)
            enter_client_shell
            ;;
        shell-api)
            enter_api_shell
            ;;
        shell-auth)
            enter_auth_shell
            ;;
        shell-db)
            enter_db_shell
            ;;
        db-backup)
            backup_database
            ;;
        db-restore)
            restore_database "$2"
            ;;
        db-reset)
            reset_database
            ;;
        clean)
            clean_all
            ;;
        clean-images)
            clean_images
            ;;
        init)
            init_project
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
