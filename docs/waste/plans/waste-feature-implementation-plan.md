# Waste Management Service Feature Implementation Plan

Date: 2026-04-15
Owner: Waste Management Service Team
Status: Schema + Feature Plan Ready

## 1) Current State

Source: server/services/waste-management-service/src/db/init.sql

Current DB script is placeholder. This plan defines the target schema and feature rollout.

## 2) Proposed Schema (Service-Owned)

1. waste_user_profiles

- id, auth_user_id, full_name, mobile_number, email, profile_state, created_at, updated_at

2. waste_addresses

- id, user_profile_id, address_line, locality, city, state, pincode, is_default, created_at, updated_at

3. waste_pickup_requests

- id, request_number, user_profile_id, address_id, waste_type, quantity_estimate, pickup_status, scheduled_at, picked_at, created_at, updated_at

4. waste_pickup_assignments

- id, pickup_request_id, staff_profile_id, vehicle_ref, assignment_status, eta_at, completed_at, created_at

5. waste_staff_profiles

- id, auth_user_id, full_name, mobile_number, role_type, is_active, created_at, updated_at

6. waste_complaints

- id, complaint_number, user_profile_id, pickup_request_id, complaint_type, description, severity, status, assigned_to_staff_id, resolved_at, created_at, updated_at

7. waste_recycling_credits

- id, user_profile_id, pickup_request_id, credit_points, credit_reason, credit_status, created_at

8. waste_outbox_events

- id, aggregate_type, aggregate_id, event_type, payload_json, status, created_at, published_at

9. waste_inbox_events

- id, source_service, event_key, event_type, payload_json, processed_at, created_at

## 3) Feature-to-Table Mapping

1. On-Demand Pickup Booking

- Tables: waste_user_profiles, waste_addresses, waste_pickup_requests

2. Pickup Assignment and Field Execution

- Tables: waste_pickup_assignments, waste_staff_profiles, waste_pickup_requests

3. Complaint and Escalation Management

- Tables: waste_complaints

4. Recycling Rewards and Incentives

- Tables: waste_recycling_credits, waste_outbox_events

5. Service Analytics and Auditability

- Tables: waste_outbox_events, waste_inbox_events, waste_pickup_requests

## 4) Branch-by-Branch Plan

1. feature/waste-schema-foundation

- Create all base tables, constraints, indexes, update triggers.
- Add reversible migrations.

2. feature/waste-user-projection-sync

- Consume auth events to maintain waste_user_profiles.
- Add event dedup with waste_inbox_events.

3. feature/waste-pickup-booking

- Implement pickup request APIs with address resolution.
- Add status transitions and schedule windows.

4. feature/waste-assignment-operations

- Implement staff assignment, ETA updates, pickup completion.
- Add staff workload visibility queries.

5. feature/waste-complaint-sla

- Implement complaint APIs and SLA tracking.
- Add escalation on severity/time breach.

6. feature/waste-recycling-credits

- Implement credit award rules by waste type/quantity.
- Emit waste.credit.awarded events.

7. chore/waste-release-hardening

- Add observability, alerting, load tests, and runbooks.
- Complete UAT and production readiness checklist.

## 5) Required Migrations by Priority

1. Core profile/address/request tables
2. Assignment and staff operations
3. Complaint SLA and escalation indexes
4. Credits and event tables

## 6) Definition of Done

1. Placeholder init.sql replaced with executable schema.
2. End-to-end flow works: request -> assignment -> completion.
3. Complaint and reward flows are test-covered.
4. Auth-to-waste profile sync is validated.
