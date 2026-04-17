# Auth Service Feature Implementation Plan

Date: 2026-04-15
Owner: Auth Service Team
Status: Ready for Branch Execution

## 1) Current Schema Baseline

Source: server/services/auth/src/db/init.sql

Existing tables:

1. users
2. auth_sessions
3. auth_otp_challenges
4. auth_outbox_events
5. auth_audit_log

## 2) Feature-to-Table Mapping

1. User Registration and Identity

- Tables: users, auth_audit_log, auth_outbox_events
- Outputs: user created, duplicate prevention, audit trail, UserRegistered event

2. OTP Login and Verification

- Tables: auth_otp_challenges, users, auth_audit_log
- Outputs: OTP issue/verify/retry limits, lockout behavior, LoginOTPVerified audit

3. Session and Token Lifecycle

- Tables: auth_sessions, auth_audit_log
- Outputs: refresh token rotation, revoke on logout/device reset, session expiry cleanup

4. Identity Update and Sync Events

- Tables: users, auth_outbox_events, auth_audit_log
- Outputs: profile update APIs, UserProfileUpdated event for domain services

5. Security and Audit Compliance

- Tables: auth_audit_log, auth_sessions
- Outputs: event classification, suspicious activity logging, admin view endpoints

## 3) Branch-by-Branch Plan

1. feature/auth-user-registration

- Implement register endpoints and validation.
- Add uniqueness and idempotency guards.
- Emit UserRegistered in auth_outbox_events.
- Tests: duplicate email/mobile/aadhar, success path, outbox payload correctness.

2. feature/auth-otp-login

- Implement OTP challenge create/verify endpoints.
- Add retry caps, expiry logic, and challenge invalidation.
- Insert audit entries for challenge issued/verified/failed.
- Tests: expiry, max attempts, invalid OTP.

3. feature/auth-session-management

- Implement login session creation and refresh rotation.
- Implement logout single-session and logout-all.
- Add revoked_at checks at middleware layer.
- Tests: token rotation replay prevention, revoke behavior.

4. feature/auth-profile-update-events

- Implement profile update API and conflict handling.
- Emit UserProfileUpdated in outbox with version metadata.
- Add event contract tests for downstream consumers.
- Tests: partial updates, optimistic conflict handling.

5. feature/auth-audit-observability

- Add standardized audit event catalog.
- Add metrics for login success/failure and OTP failures.
- Add correlation ID propagation in logs.
- Tests: log field assertions and audit insert verification.

6. chore/auth-release-hardening

- Run migration validation and rollback rehearsal.
- Complete load testing for login and OTP endpoints.
- Finalize runbook and incident playbook.

## 4) API and Event Contracts

1. Auth APIs

- POST /api/v1/auth/register
- POST /api/v1/auth/otp/challenge
- POST /api/v1/auth/otp/verify
- POST /api/v1/auth/session/refresh
- POST /api/v1/auth/logout
- PATCH /api/v1/auth/profile

2. Outbox Events

- auth.user.registered
- auth.user.profile.updated
- auth.user.deactivated

## 5) Definition of Done

1. All auth migrations applied and validated.
2. Integration tests pass for registration, OTP, and sessions.
3. Outbox messages published and consumed by at least one domain service in test.
4. Audit and metrics visible on dashboards.
