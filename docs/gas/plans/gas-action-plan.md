# Gas Service Action Plan (With Missing Critical Items)

Date: 2026-04-15
Owner: Gas Service Team
Status: Draft for Execution

## 1) Goal

Build and release the Gas Service feature set end-to-end with clear implementation sequencing, data model, quality gates, and operational readiness.

## 2) Feature Execution Sequence

1. Booking and Refill
2. New Connection
3. Order Tracking
4. OTP-Based Delivery and Instant Invoice
5. PNG Management
6. Distributor Change and Relocation
7. Nearest Distributors Map
8. Hyper-Local Rating System
9. Smart Refund (Conservation Subsidy)
10. Hardening, UAT, and Production Rollout

## 3) Branch-by-Branch Action Plan

1. feature/gas-booking-refill

- Build booking, refill, and quick-book user journeys.
- Add duplicate-booking prevention rules and stock-aware slot booking.
- Add booking confirmation and lifecycle states.

2. feature/gas-new-connection

- Build digital connection onboarding flow.
- Add status journey from submitted to verification to installation.
- Add tracking timeline and rejection reasons.

3. feature/gas-order-tracking

- Add full order lifecycle tracking and ETA visibility.
- Add delivery assignment and exception states.
- Add clear customer-facing status labels.

4. feature/gas-delivery-auth-invoice

- Add OTP/DAC delivery verification and delivery closure rules.
- Add instant invoice generation and retrieval.
- Add invoice correction and re-issue flow controls.

5. feature/gas-png-management

- Add meter reading capture, consumption timeline, and monthly bill generation.
- Add leakage complaint path with emergency priority.
- Add monthly statement and payment status journey.

6. feature/gas-distributor-transfer

- Add transfer-out and transfer-in workflows.
- Move active connection ownership and deposit records safely.
- Add transfer approval and cancellation steps.

7. feature/gas-distributor-discovery

- Add nearby distributor discovery and default distributor selection.
- Add stock availability and operating-hours visibility.
- Add service quality score visibility.

8. feature/gas-rating-system

- Add rating and review capture for delivery and distributor.
- Add score refresh logic and anti-abuse moderation controls.
- Add profile-level quality score display.

9. feature/gas-smart-refund

- Add booking interval comparison and subsidy credit calculation.
- Add wallet credit ledger and user-facing explanation.
- Add adjustment and reversal controls for admin.

10. chore/gas-release-hardening

- Add reliability, security, observability, and support runbooks.
- Complete test pass, UAT sign-off, release checklist, and go-live controls.

## 4) Missing Item Added: Database Schema

The previous action plan did not explicitly include data schema. Below is the baseline schema required for these features.

### 4.1 Core Entities

1. gas_user_profiles

- id
- auth_user_id
- full_name
- mobile_number
- email
- aadhar_ref
- profile_state
- last_synced_at
- created_at
- updated_at

2. gas_distributors

- id
- distributor_code
- name
- phone
- email
- address_line
- city
- state
- pincode
- service_quality_score
- is_active
- created_at
- updated_at

3. gas_customers

- id
- auth_user_id
- user_profile_id
- customer_number
- full_name
- mobile_number
- email
- address_line
- pincode
- state
- aadhaar_ref
- subsidy_opt_in
- default_distributor_id
- created_at
- updated_at

4. gas_outbox_events

- id
- aggregate_type
- aggregate_id
- event_type
- payload_json
- status
- retry_count
- created_at
- published_at

5. gas_inbox_events

- id
- source_service
- event_key
- event_type
- payload_json
- processed_at
- created_at

6. gas_connections

- id
- customer_id
- connection_type
- distributor_id
- connection_status
- kyc_status
- created_at
- updated_at

7. gas_booking_orders

- id
- booking_number
- customer_id
- connection_id
- cylinder_type
- payment_mode
- payment_status
- booking_status
- expected_delivery_date
- delivered_at
- created_at
- updated_at

8. gas_complaints

- id
- complaint_number
- customer_id
- booking_id
- complaint_type
- severity
- description
- status
- sla_due_at
- assigned_to_user_profile_id
- resolved_at
- created_at
- updated_at

9. delivery_assignments

- id
- booking_id
- agent_profile_id
- delivery_status
- eta_at
- route_meta
- updated_at

10. delivery_auth_codes

- id
- booking_id
- code_hash
- expires_at
- verified_at
- verification_attempts

11. invoices

- id
- booking_id
- invoice_number
- subtotal
- tax_cgst
- tax_sgst
- subsidy_amount
- total_amount
- invoice_url
- issued_at

12. png_meter_readings

- id
- customer_id
- reading_month
- previous_reading
- current_reading
- units_consumed
- submitted_at

13. png_bills

- id
- customer_id
- billing_month
- units_consumed
- slab_breakdown
- amount_due
- due_date
- bill_status
- generated_at

14. transfer_requests

- id
- customer_id
- from_distributor_id
- to_distributor_id
- transfer_status
- approved_by
- approved_at
- created_at
- updated_at

15. reviews

- id
- customer_id
- distributor_id
- booking_id
- rating
- feedback
- review_status
- created_at

16. smart_refund_credits

- id
- customer_id
- booking_id
- baseline_interval_days
- actual_interval_days
- credit_amount
- credit_status
- created_at

17. wallet_ledger

- id
- customer_id
- transaction_type
- amount
- reference_type
- reference_id
- balance_after
- created_at

18. audit_events

- id
- actor_user_profile_id
- auth_user_id
- entity_type
- entity_id
- event_type
- payload
- created_at

### 4.2 Required Indexes

1. booking_orders(customer_id, created_at)
2. booking_orders(distributor_id, order_status)
3. delivery_auth_codes(booking_id, expires_at)
4. complaints(customer_id, status)
5. transfer_requests(customer_id, transfer_status)
6. reviews(distributor_id, created_at)
7. distributors(geo_location)
8. gas_customers(customer_number)
9. gas_user_profiles(auth_user_id)
10. gas_outbox_events(status, created_at)
11. gas_inbox_events(source_service, created_at)

## 5) Missing Item Added: State Machines

1. Booking Order

- PLACED -> CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED
- PLACED -> CANCELLED
- CONFIRMED -> CANCELLED

2. New Connection

- SUBMITTED -> VERIFICATION -> APPROVED -> INSTALLATION_SCHEDULED -> INSTALLED
- SUBMITTED -> REJECTED
- VERIFICATION -> REJECTED

3. Complaint

- OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
- OPEN -> ESCALATED
- IN_PROGRESS -> ESCALATED

4. Transfer Request

- REQUESTED -> UNDER_REVIEW -> APPROVED -> COMPLETED
- REQUESTED -> REJECTED
- UNDER_REVIEW -> REJECTED

## 6) Missing Item Added: Important Non-Feature Requirements

1. API contract standard and error envelope consistency
2. Authentication and role-based authorization matrix
3. Idempotency for booking, payment callback, and invoice generation
4. Stock consistency and reconciliation jobs
5. Data privacy and retention policy for KYC documents
6. Audit trail for all status changes and admin actions
7. Alerting, dashboards, and incident runbooks
8. Retry and dead-letter handling for notifications
9. Backup, restore, and migration rollback runbook
10. UAT scripts and release go-live checklist

## 7) Acceptance Gates Per Phase

1. Functional gate: all user journeys pass happy and failure-path tests
2. Data gate: schema, indexes, and migrations validated in staging
3. Security gate: authz and abuse protections verified
4. Reliability gate: SLA and alert checks verified
5. Release gate: no open critical defects and rollback validated

## 8) Immediate Next Steps

1. Review and approve schema and state machine definitions.
2. Create tickets for each branch and map dependencies.
3. Start with feature/gas-booking-refill and feature/gas-new-connection in sequence.
4. Run weekly milestone demos with explicit exit-gate checks.

# Gas Service Action Plan (With Missing Critical Items)

Date: 2026-04-15
Owner: Gas Service Team
Status: Draft for Execution

## 1) Goal

Build and release the Gas Service feature set end-to-end with clear implementation sequencing, data model, quality gates, and operational readiness.

## 2) Feature Execution Sequence

1. Booking and Refill
2. New Connection
3. Order Tracking
4. OTP-Based Delivery and Instant Invoice
5. PNG Management
6. Distributor Change and Relocation
7. Nearest Distributors Map
8. Hyper-Local Rating System
9. Smart Refund (Conservation Subsidy)
10. Hardening, UAT, and Production Rollout

## 3) Branch-by-Branch Action Plan

1. feature/gas-booking-refill

- Build booking, refill, and quick-book user journeys.
- Add duplicate-booking prevention rules and stock-aware slot booking.
- Add booking confirmation and lifecycle states.

2. feature/gas-new-connection

- Build digital connection onboarding flow.
- Add status journey from submitted to verification to installation.
- Add tracking timeline and rejection reasons.

3. feature/gas-order-tracking

- Add full order lifecycle tracking and ETA visibility.
- Add delivery assignment and exception states.
- Add clear customer-facing status labels.

4. feature/gas-delivery-auth-invoice

- Add OTP/DAC delivery verification and delivery closure rules.
- Add instant invoice generation and retrieval.
- Add invoice correction and re-issue flow controls.

5. feature/gas-png-management

- Add meter reading capture, consumption timeline, and monthly bill generation.
- Add leakage complaint path with emergency priority.
- Add monthly statement and payment status journey.

6. feature/gas-distributor-transfer

- Add transfer-out and transfer-in workflows.
- Move active connection ownership and deposit records safely.
- Add transfer approval and cancellation steps.

7. feature/gas-distributor-discovery

- Add nearby distributor discovery and default distributor selection.
- Add stock availability and operating-hours visibility.
- Add service quality score visibility.

8. feature/gas-rating-system

- Add rating and review capture for delivery and distributor.
- Add score refresh logic and anti-abuse moderation controls.
- Add profile-level quality score display.

9. feature/gas-smart-refund

- Add booking interval comparison and subsidy credit calculation.
- Add wallet credit ledger and user-facing explanation.
- Add adjustment and reversal controls for admin.

10. chore/gas-release-hardening

- Add reliability, security, observability, and support runbooks.
- Complete test pass, UAT sign-off, release checklist, and go-live controls.

## 4) Missing Item Added: Database Schema

The previous action plan did not explicitly include data schema. Below is the baseline schema required for these features.

### 4.1 Core Entities

1. users

- id
- full_name

1. gas_user_profiles

- id
- auth_user_id
- full_name
- mobile_number
- email
- aadhar_ref
- profile_state
- last_synced_at
- created_at
- updated_at
- id
- name
- state
- pincode

4. gas_outbox_events

- id
- aggregate_type
- aggregate_id
- event_type
- payload_json
- status
- retry_count
- created_at
- published_at

5. gas_inbox_events

- id
- source_service
- event_key
- event_type
- payload_json
- processed_at
- created_at

6. kyc_documents

- subsidy_opt_in
- created_at
- reviewed_by
- reviewed_at
- delivered_at
- created_at
- available_units
- reserved_units
- eta_at
- route_meta
- expires_at
- verified_at
- total_amount
- invoice_url
- current_reading
- units_consumed
- due_date
- bill_status
- assigned_to
- created_at
- approved_at
- created_at
- feedback
- review_status
- credit_amount
- credit_status
- reference_id
- balance_after
- event_type
- payload
- created_at

### 4.2 Required Indexes

1. booking_orders(customer_id, created_at)
2. booking_orders(distributor_id, order_status)
3. delivery_auth_codes(booking_id, expires_at)
4. complaints(customer_id, status)
5. transfer_requests(customer_id, transfer_status)
6. gas_user_profiles(auth_user_id)
7. gas_outbox_events(status, created_at)
8. gas_inbox_events(source_service, created_at)
9. reviews(distributor_id, created_at)
10. distributors(geo_location)
11. gas_customers(customer_number)

## 5) Missing Item Added: State Machines

1. Booking Order

- PLACED -> CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED
- PLACED -> CANCELLED
- CONFIRMED -> CANCELLED

2. New Connection

- SUBMITTED -> VERIFICATION -> APPROVED -> INSTALLATION_SCHEDULED -> INSTALLED
- SUBMITTED -> REJECTED
- VERIFICATION -> REJECTED

3. Complaint

- OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
- OPEN -> ESCALATED
- IN_PROGRESS -> ESCALATED

4. Transfer Request

- REQUESTED -> UNDER_REVIEW -> APPROVED -> COMPLETED
- REQUESTED -> REJECTED
- UNDER_REVIEW -> REJECTED

## 6) Missing Item Added: Important Non-Feature Requirements

1. API contract standard and error envelope consistency
2. Authentication and role-based authorization matrix
3. Idempotency for booking, payment callback, and invoice generation
4. Stock consistency and reconciliation jobs
5. Data privacy and retention policy for KYC documents
6. Audit trail for all status changes and admin actions
7. Alerting, dashboards, and incident runbooks
8. Retry and dead-letter handling for notifications
9. Backup, restore, and migration rollback runbook
10. UAT scripts and release go-live checklist

## 7) Acceptance Gates Per Phase

1. Functional gate: all user journeys pass happy and failure-path tests
2. Data gate: schema, indexes, and migrations validated in staging
3. Security gate: authz and abuse protections verified
4. Reliability gate: SLA and alert checks verified
5. Release gate: no open critical defects and rollback validated

## 8) Immediate Next Steps

1. Review and approve schema and state machine definitions.
2. Create tickets for each branch and map dependencies.
3. Start with feature/gas-booking-refill and feature/gas-new-connection in sequence.
4. Run weekly milestone demos with explicit exit-gate checks.
