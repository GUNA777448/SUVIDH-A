# Render Deployment Steps for SUVIDHA Gateway

This guide deploys Kong Gateway on Render in a low-cost style (Render Postgres + Kong web service, with migrations run from local machine).

## 1. Prerequisites

- A Render account.
- Your Git repository connected to Render.
- Auth service deployed and reachable via public URL (HTTPS).
- This gateway folder in repo: `gateway/`.

## 2. Create Render PostgreSQL (for Kong)

1. In Render dashboard, create a new PostgreSQL instance.
2. Name it (example: `kong-db`).
3. Save these values from the database info page:

- Host
- Port
- Database name
- User
- Password

## 3. Run Kong Migration Once (no paid Render job)

If Render Jobs/Workers are paid in your plan, skip creating a migration worker.
Run Kong migrations from your local machine one-time against Render Postgres.

### 3.1 Bootstrap migration (first time only)

```bash
docker run --rm \
  -e KONG_DATABASE=postgres \
  -e KONG_PG_HOST=<render-postgres-host> \
  -e KONG_PG_PORT=<render-postgres-port> \
  -e KONG_PG_DATABASE=<render-postgres-database> \
  -e KONG_PG_USER=<render-postgres-user> \
  -e KONG_PG_PASSWORD=<render-postgres-password> \
  kong:latest kong migrations bootstrap
```

### 3.2 Future upgrades (only when Kong version changes)

```bash
docker run --rm \
  -e KONG_DATABASE=postgres \
  -e KONG_PG_HOST=<render-postgres-host> \
  -e KONG_PG_PORT=<render-postgres-port> \
  -e KONG_PG_DATABASE=<render-postgres-database> \
  -e KONG_PG_USER=<render-postgres-user> \
  -e KONG_PG_PASSWORD=<render-postgres-password> \
  kong:latest kong migrations up

docker run --rm \
  -e KONG_DATABASE=postgres \
  -e KONG_PG_HOST=<render-postgres-host> \
  -e KONG_PG_PORT=<render-postgres-port> \
  -e KONG_PG_DATABASE=<render-postgres-database> \
  -e KONG_PG_USER=<render-postgres-user> \
  -e KONG_PG_PASSWORD=<render-postgres-password> \
  kong:latest kong migrations finish
```

### 3.3 Verify migration success

- You should see success logs from the migration commands.
- If bootstrap already ran earlier, do not rerun bootstrap.
- Keep this as a manual release step to avoid paid worker usage.

## 4. Create Kong Web Service on Render

1. Create a new Web Service on Render.
2. Use Docker image:
   - `kong:latest`
3. Set Start Command (optional if image default works):
   - `kong docker-start`
4. Set environment variables:
   - `KONG_DATABASE=postgres`
   - `KONG_PG_HOST=<render-postgres-host>`
   - `KONG_PG_PORT=<render-postgres-port>`
   - `KONG_PG_DATABASE=<render-postgres-database>`
   - `KONG_PG_USER=<render-postgres-user>`
   - `KONG_PG_PASSWORD=<render-postgres-password>`
   - `KONG_PROXY_LISTEN=0.0.0.0:8000`
   - `KONG_ADMIN_LISTEN=0.0.0.0:8001`
   - `KONG_PROXY_ACCESS_LOG=/dev/stdout`
   - `KONG_ADMIN_ACCESS_LOG=/dev/stdout`
   - `KONG_PROXY_ERROR_LOG=/dev/stderr`
   - `KONG_ADMIN_ERROR_LOG=/dev/stderr`
5. Port settings:
   - Expose `8000` publicly.
   - Keep `8001` private/restricted if possible.

## 5. Configure Auth Service in Kong

After Kong is up, call Kong Admin API from your machine (or trusted env).

Replace placeholders:

- `<KONG_ADMIN_URL>` = your Kong admin URL
- `<AUTH_PUBLIC_URL>` = your deployed auth service URL

### 5.1 Create Auth Service

```bash
curl -X PUT "<KONG_ADMIN_URL>/services/auth-service" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-service",
    "url": "<AUTH_PUBLIC_URL>"
  }'
```

### 5.2 Create Auth Routes

```bash
curl -X PUT "<KONG_ADMIN_URL>/services/auth-service/routes/auth-route" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-route",
    "paths": ["/api/v1/auth"],
    "methods": ["GET", "POST", "OPTIONS"],
    "strip_path": false
  }'

curl -X PUT "<KONG_ADMIN_URL>/services/auth-service/routes/auth-otp-request-route" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-otp-request-route",
    "paths": ["/api/v1/auth/request/otp"],
    "methods": ["POST", "OPTIONS"],
    "strip_path": false
  }'

curl -X PUT "<KONG_ADMIN_URL>/services/auth-service/routes/auth-otp-verify-route" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-otp-verify-route",
    "paths": ["/api/v1/auth/verify/otp"],
    "methods": ["POST", "OPTIONS"],
    "strip_path": false
  }'

curl -X PUT "<KONG_ADMIN_URL>/services/auth-service/routes/auth-profile-route" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "auth-profile-route",
    "paths": ["/api/v1/auth/profile"],
    "methods": ["GET", "OPTIONS"],
    "strip_path": false
  }'
```

### 5.3 Add CORS Plugin for Client

```bash
curl -X POST "<KONG_ADMIN_URL>/services/auth-service/plugins" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cors",
    "config": {
      "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
      "methods": ["GET", "POST", "OPTIONS"],
      "headers": [
        "Accept",
        "Accept-Version",
        "Content-Length",
        "Content-MD5",
        "Content-Type",
        "Date",
        "Authorization",
        "X-Requested-With"
      ],
      "credentials": true,
      "max_age": 3600,
      "preflight_continue": false
    }
  }'
```

## 6. Update Client to Use Kong URL

In client environment:

- `VITE_API_BASE_URL=<KONG_PUBLIC_PROXY_URL>`
- `VITE_AUTH_API_PREFIX=/api/v1/auth`

## 7. Verification Checklist

- Kong proxy health:
  - `GET <KONG_PROXY_URL>/health`
- Auth OTP request path through Kong:
  - `POST <KONG_PROXY_URL>/api/v1/auth/request/otp`
- Auth OTP verify path through Kong:
  - `POST <KONG_PROXY_URL>/api/v1/auth/verify/otp`
- Auth profile path through Kong:
  - `GET <KONG_PROXY_URL>/api/v1/auth/profile/<mobile>`
- CORS preflight:
  - `OPTIONS <KONG_PROXY_URL>/api/v1/auth/request/otp` with `Origin` header

## 8. Important Notes

- `gateway/docker-compose.yml` is for local development/testing.
- Render production should use separate managed services, not local `docker compose up`.
- Keep Kong Admin API private/restricted.
- If auth service URL changes, update Kong service `auth-service` URL.

## 9. Optional: Deploy Konga on Render

Konga is optional and not required for runtime traffic.
If deployed, run it as a separate service with its own DB config and keep access restricted.
