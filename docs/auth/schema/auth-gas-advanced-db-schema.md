# Auth + Gas DB Schema for Loose-Coupled Microservices

Date: 2026-04-15
Status: Proposed service-owned schema aligned with a loosely coupled microservices architecture

## 1. Current Auth Schema (Extracted from running auth service)

Source: `server/services/auth/src/db/init.sql`

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL UNIQUE,
  aadhar TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_aadhar_unique_not_null
ON users (aadhar)
WHERE aadhar IS NOT NULL;
```

## 2. Microservice Boundary Rules

1. Auth owns identity, sessions, OTP lifecycle, and identity event publishing.
2. Gas owns customers, connections, bookings, complaints, and operational events.
3. Gas never foreign-keys into auth tables.
4. Auth never foreign-keys into gas tables.
5. Cross-service consistency happens through events and replicated local views.

## 3. Advanced Auth + Gas Schema Design

### 3.1 Auth model

1. `users` remains the identity source.
2. `auth_sessions` stores refresh/session state and revocation metadata.
3. `auth_otp_challenges` stores OTP lifecycle data for auditing and anti-abuse.
4. `auth_outbox_events` publishes user lifecycle events to other services.
5. `auth_audit_log` records auth operations and security events.

### 3.2 Gas model

1. `gas_user_profiles` is the local replicated identity view consumed from auth events.
2. `gas_customers` references `gas_user_profiles`, not auth directly.
3. `gas_connections` stays service-owned and handles lifecycle/KYC.
4. `gas_booking_orders` stores order and payment state.
5. `gas_complaints` stores incident handling and SLA state.
6. `gas_outbox_events` and `gas_inbox_events` support event-driven consistency and idempotency.
7. `gas_event_log` stores domain events and operational traces.
8. `gas_distributors` remains gas-owned reference data.

## 4. Implemented SQL Bootstrap Location

The loose-coupling schema has been implemented in:

- `server/services/gas-distribution-service/src/db/init.sql`
- `server/services/auth/src/db/init.sql`

It includes:

- lifecycle enums for gas service state machines
- service-owned identity replication through `gas_user_profiles`
- auth outbox and gas inbox/outbox event tables for async synchronization
- no cross-service foreign keys between auth and gas
- local indexes for status filtering, identity lookup, and event processing
- updated-at triggers for mutable entities

## 5. Suggested Event Flow

1. Auth inserts into `auth_outbox_events` when a user is created or updated.
2. A worker or relay publishes those events to the event bus or gateway stream.
3. Gas consumes the event and upserts `gas_user_profiles`.
4. Gas writes its own customer/booking/complaint rows against local tables only.
5. Gas publishes operational events to `gas_outbox_events`.

## 6. Why This Is Loosely Coupled

- Each service owns its own schema.
- No table in gas depends on auth at the database level.
- No table in auth depends on gas at the database level.
- Event tables create eventual consistency instead of hard cross-service joins.
- Schema changes in one service do not require foreign-key changes in the other service.

## 7. Compatibility Notes

- Existing auth repository queries on `users` remain valid.
- Gas service should be migrated from direct `users` lookups to `gas_user_profiles`.
- If the gateway or backend still expects synchronous profile reads, it should read from auth API, not via DB joins.
- OTP Redis flow can coexist with `auth_otp_challenges` until cutover is complete.

## 8. Suggested Next Auth Migration (Optional but Recommended)

Below SQL is the next-step extension for auth persistence hardening.

```sql
CREATE TABLE IF NOT EXISTS auth_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE CASCADE,
  scope_service TEXT NOT NULL DEFAULT 'platform',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id, scope_service)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_expires_idx
ON auth_sessions (user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS auth_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mobile TEXT NOT NULL,
  channel TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_otp_challenges_mobile_created_idx
ON auth_otp_challenges (mobile, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor_service TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_audit_log_user_event_idx
ON auth_audit_log (user_id, event_type, created_at DESC);
```

This doc intentionally omits cross-service foreign keys. That is the key change required for a clean microservices split.
