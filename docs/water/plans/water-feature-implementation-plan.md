# Water Service Feature Implementation Plan

Date: 2026-04-15
Owner: Water Service Team
Status: Schema + Feature Plan Ready

## 1) Current State

Source: server/services/water-service/src/db/init.sql

Current DB script is placeholder. This plan defines target schema and implementation sequence.

## 2) Proposed Schema (Service-Owned)

1. water_user_profiles

- id, auth_user_id, full_name, mobile_number, email, profile_state, created_at, updated_at

2. water_connections

- id, customer_profile_id, connection_number, meter_number, connection_type, connection_status, created_at, updated_at

3. water_meter_readings

- id, connection_id, reading_month, previous_units, current_units, units_consumed, submitted_at

4. water_bills

- id, connection_id, billing_month, units_consumed, water_charge, sewer_charge, tax_amount, total_due, due_date, bill_status, generated_at

5. water_payments

- id, bill_id, payment_reference, amount, payment_mode, payment_status, paid_at, created_at

6. tanker_requests

- id, requester_profile_id, address_line, locality, priority_level, request_status, scheduled_at, delivered_at, created_at

7. water_quality_complaints

- id, complaint_number, connection_id, issue_type, description, severity, status, assigned_to_profile_id, resolved_at, created_at, updated_at

8. water_outbox_events

- id, aggregate_type, aggregate_id, event_type, payload_json, status, created_at, published_at

9. water_inbox_events

- id, source_service, event_key, event_type, payload_json, processed_at, created_at

## 3) Feature-to-Table Mapping

1. Connection Management

- Tables: water_user_profiles, water_connections

2. Meter Reading and Billing

- Tables: water_meter_readings, water_bills

3. Payment Collection

- Tables: water_payments, water_bills

4. Tanker Booking and Fulfillment

- Tables: tanker_requests, water_outbox_events

5. Water Quality Complaint Resolution

- Tables: water_quality_complaints, water_outbox_events

## 4) Branch-by-Branch Plan

1. feature/water-schema-foundation

- Create all core tables, constraints, indexes, and triggers.
- Add rollback migration scripts.

2. feature/water-user-projection-sync

- Consume auth user events into water_user_profiles.
- Add idempotent event handling via water_inbox_events.

3. feature/water-connection-flow

- Implement connection request, verification, activation flows.
- Add connection status transition rules.

4. feature/water-billing-flow

- Implement meter reading ingestion and monthly bill generation.
- Add late fee and due date policies.

5. feature/water-payments

- Implement payment capture and bill status reconciliation.
- Emit water.bill.paid events.

6. feature/water-tanker-management

- Implement tanker request creation, assignment, and completion flow.
- Track SLA and delays.

7. feature/water-complaints

- Implement complaint lifecycle, assignment, and closure.
- Add escalation rules for high severity.

8. chore/water-release-hardening

- Add observability, runbooks, and resilience tests.
- Finalize UAT and production cutover checklist.

## 5) Required Migrations by Priority

1. Base tables + profile projection
2. Billing and payment consistency constraints
3. Tanker and complaint SLA indexes
4. Outbox/inbox event reliability indexes

## 6) Definition of Done

1. Placeholder init.sql replaced with executable schema.
2. End-to-end flow works: connection -> reading -> bill -> payment.
3. Tanker and complaint SLAs are trackable in DB and API.
4. Auth-to-water profile sync validated.
