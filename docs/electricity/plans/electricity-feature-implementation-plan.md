# Electricity Service Feature Implementation Plan

Date: 2026-04-15
Owner: Electricity Service Team
Status: Schema + Feature Plan Ready

## 1) Current State

Source: server/services/electricity-service/src/db/init.sql

Current DB script is placeholder. This plan defines the target schema and execution sequence per feature.

## 2) Proposed Schema (Service-Owned)

1. electricity_user_profiles

- id, auth_user_id, full_name, mobile_number, email, profile_state, created_at, updated_at

2. electricity_connections

- id, customer_profile_id, connection_number, meter_number, tariff_type, connection_status, created_at, updated_at

3. electricity_meter_readings

- id, connection_id, reading_month, previous_units, current_units, units_consumed, reading_source, captured_at

4. electricity_bills

- id, connection_id, bill_month, units_consumed, energy_charge, fixed_charge, tax_amount, total_due, due_date, bill_status, generated_at

5. electricity_payments

- id, bill_id, payment_reference, amount, payment_mode, payment_status, paid_at, created_at

6. electricity_outage_reports

- id, connection_id, outage_type, severity, status, reported_at, restored_at

7. electricity_complaints

- id, complaint_number, connection_id, complaint_type, description, status, assigned_to_profile_id, created_at, updated_at

8. electricity_outbox_events

- id, aggregate_type, aggregate_id, event_type, payload_json, status, created_at, published_at

9. electricity_inbox_events

- id, source_service, event_key, event_type, payload_json, processed_at, created_at

## 3) Feature-to-Table Mapping

1. New Connection Onboarding

- Tables: electricity_user_profiles, electricity_connections, electricity_outbox_events

2. Monthly Meter Reading and Billing

- Tables: electricity_meter_readings, electricity_bills

3. Bill Payment and Receipt

- Tables: electricity_payments, electricity_bills, electricity_outbox_events

4. Outage Reporting and Restoration

- Tables: electricity_outage_reports, electricity_complaints

5. Complaint and SLA Tracking

- Tables: electricity_complaints, electricity_outbox_events

## 4) Branch-by-Branch Plan

1. feature/electricity-schema-foundation

- Create enum/types if needed, all base tables, FKs, indexes, update triggers.
- Add migration rollback scripts.

2. feature/electricity-user-projection-sync

- Build inbox consumer for auth.user.registered and auth.user.profile.updated.
- Upsert electricity_user_profiles idempotently.

3. feature/electricity-connection-onboarding

- Implement connection apply/approve/reject flows.
- Add connection history and status transitions.

4. feature/electricity-meter-reading-billing

- Implement reading capture APIs and validation.
- Generate monthly bills with slab logic.

5. feature/electricity-payments

- Implement payment capture and reconciliation.
- Emit electricity.bill.paid events.

6. feature/electricity-outage-complaints

- Implement outage report APIs and status timeline.
- Implement complaint lifecycle and assignment.

7. chore/electricity-release-hardening

- Add observability, contract tests, and load tests.
- Prepare production runbook.

## 5) Required Migrations by Priority

1. Base tables + indexes
2. User projection sync infrastructure
3. Billing and payment integrity constraints
4. Outage/complaint SLA indexes
5. Outbox/inbox reliability indexes

## 6) Definition of Done

1. Placeholder init.sql replaced with executable schema.
2. End-to-end flow works: connection -> reading -> bill -> payment.
3. Event sync works from auth to electricity profile.
4. Rollback verified in staging.
