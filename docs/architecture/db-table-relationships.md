# Database Table Relationship Diagram

Date: 2026-04-15
Scope: Auth service and Gas Distribution service

## Overview

This diagram maps relational links and logical cross-service links between auth and gas tables in the current microservices design.

- Solid relationship labels indicate database-level foreign-key relationships.
- Labels containing "logical" indicate non-FK, event-driven or replicated links.

```mermaid
erDiagram
    %% ----------------------------
    %% AUTH SERVICE TABLES
    %% ----------------------------
    users {
        UUID id PK
        TEXT name
        TEXT email
        TEXT mobile
        TEXT aadhar
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    auth_sessions {
        UUID id PK
        UUID user_id FK
        TEXT refresh_token_hash
        INET ip_address
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ revoked_at
        TIMESTAMPTZ created_at
    }

    auth_otp_challenges {
        UUID id PK
        UUID user_id FK
        TEXT mobile
        TEXT channel
        TEXT otp_hash
        INTEGER attempts
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ verified_at
        TIMESTAMPTZ created_at
    }

    auth_outbox_events {
        UUID id PK
        TEXT aggregate_type
        UUID aggregate_id
        TEXT event_type
        JSONB payload_json
        TEXT status
        INTEGER retry_count
        TIMESTAMPTZ created_at
        TIMESTAMPTZ published_at
    }

    auth_audit_log {
        UUID id PK
        UUID user_id FK
        TEXT event_type
        TEXT actor_service
        JSONB metadata_json
        TIMESTAMPTZ created_at
    }

    %% ----------------------------
    %% GAS SERVICE TABLES
    %% ----------------------------
    gas_user_profiles {
        UUID id PK
        UUID auth_user_id
        TEXT full_name
        TEXT mobile_number
        TEXT email
        TEXT aadhar_ref
        TEXT profile_state
        TIMESTAMPTZ last_synced_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_distributors {
        UUID id PK
        TEXT distributor_code
        TEXT name
        TEXT phone
        TEXT email
        TEXT address_line
        TEXT city
        TEXT state
        TEXT pincode
        NUMERIC service_quality_score
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_customers {
        UUID id PK
        UUID auth_user_id
        UUID user_profile_id FK
        TEXT customer_number
        TEXT full_name
        TEXT mobile_number
        TEXT email
        TEXT address_line
        TEXT pincode
        TEXT state
        TEXT aadhaar_ref
        BOOLEAN subsidy_opt_in
        UUID default_distributor_id FK
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_connections {
        UUID id PK
        UUID customer_id FK
        gas_connection_type connection_type
        UUID distributor_id FK
        gas_connection_status connection_status
        gas_kyc_status kyc_status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_booking_orders {
        UUID id PK
        TEXT booking_number
        UUID customer_id FK
        UUID connection_id FK
        TEXT cylinder_type
        TEXT payment_mode
        gas_payment_status payment_status
        gas_booking_status booking_status
        DATE expected_delivery_date
        TIMESTAMPTZ delivered_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_complaints {
        UUID id PK
        TEXT complaint_number
        UUID customer_id FK
        UUID booking_id FK
        TEXT complaint_type
        gas_severity_level severity
        TEXT description
        gas_complaint_status status
        TIMESTAMPTZ sla_due_at
        UUID assigned_to_user_profile_id FK
        TIMESTAMPTZ resolved_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    gas_event_log {
        UUID id PK
        TEXT entity_type
        UUID entity_id
        TEXT event_type
        UUID actor_user_profile_id FK
        UUID auth_user_id
        JSONB payload_json
        TIMESTAMPTZ created_at
    }

    gas_outbox_events {
        UUID id PK
        TEXT aggregate_type
        UUID aggregate_id
        TEXT event_type
        JSONB payload_json
        TEXT status
        INTEGER retry_count
        TIMESTAMPTZ created_at
        TIMESTAMPTZ published_at
    }

    gas_inbox_events {
        UUID id PK
        TEXT source_service
        TEXT event_key
        TEXT event_type
        JSONB payload_json
        TIMESTAMPTZ processed_at
        TIMESTAMPTZ created_at
    }

    %% ----------------------------
    %% FK RELATIONSHIPS (AUTH)
    %% ----------------------------
    users ||--o{ auth_sessions : "user_id FK"
    users ||--o{ auth_otp_challenges : "user_id FK"
    users ||--o{ auth_audit_log : "user_id FK"

    %% ----------------------------
    %% FK RELATIONSHIPS (GAS)
    %% ----------------------------
    gas_user_profiles ||--o{ gas_customers : "user_profile_id FK"
    gas_distributors ||--o{ gas_customers : "default_distributor_id FK"
    gas_customers ||--o{ gas_connections : "customer_id FK"
    gas_distributors ||--o{ gas_connections : "distributor_id FK"
    gas_customers ||--o{ gas_booking_orders : "customer_id FK"
    gas_connections ||--o{ gas_booking_orders : "connection_id FK"
    gas_customers ||--o{ gas_complaints : "customer_id FK"
    gas_booking_orders ||--o{ gas_complaints : "booking_id FK"
    gas_user_profiles ||--o{ gas_complaints : "assigned_to_user_profile_id FK"
    gas_user_profiles ||--o{ gas_event_log : "actor_user_profile_id FK"

    %% ----------------------------
    %% LOGICAL CROSS-SERVICE LINKS
    %% ----------------------------
    users ||--o{ gas_user_profiles : "auth_user_id logical sync"
    auth_outbox_events ||--o{ gas_inbox_events : "event stream logical"
```

## Notes

- Gas tables are decoupled from direct auth-table foreign keys.
- Identity replication into gas is handled by event-driven synchronization.
- This supports service-level database ownership in a microservices architecture.
