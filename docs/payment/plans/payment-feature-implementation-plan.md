# Payment Service Feature Implementation Plan

Date: 2026-04-17
Status: Execution Blueprint
Owner Service: payment-service (new)

## Objective

Build a centralized payment module that can be reused by gas, electricity, water, waste, and future services without introducing tight coupling.

## Why This Service Is Required

1. Multiple domain services need a common and auditable payment workflow.
2. Payment success/failure must be published reliably to update domain order state.
3. Citizens should get a single transaction history and receipt model.

## Service Boundaries

Payment service owns:

1. Transaction lifecycle: created, authorized, captured, failed, refunded.
2. Provider integration abstraction (UPI/card/netbanking/wallet).
3. Payment receipts and reconciliation records.
4. Outbox events for downstream state updates.

Payment service does not own:

1. Domain billing logic (electricity/water/waste/gas).
2. Domain order fulfillment status.
3. User identity source of truth (auth service owns identity).

## Cross-Service Integration Map

Requesters of payment intent:

1. gas-distribution-service
2. electricity-service
3. water-service
4. waste-management-service

Supporting services:

1. auth service for user verification context.
2. notification service for payment confirmation and failure alerts.
3. grievance service for payment dispute linking.
4. document service for receipt archival and retrieval.

## Canonical API Contracts (v1)

1. POST /payments/intents

- Input: domain_service, domain_reference_id, amount_minor, currency, auth_user_id, payer_contact
- Output: payment_intent_id, provider_session_token, expires_at

2. POST /payments/:id/confirm

- Input: provider_reference, auth_user_id
- Output: payment_id, status, receipt_number (if captured)

3. GET /payments/:id

- Output: current payment status timeline

4. GET /payments/history?auth_user_id=&page=

- Output: paginated citizen transactions across services

5. POST /payments/:id/refund

- Input: reason, requested_by, amount_minor
- Output: refund_id, refund_status

## Database Ownership (payment DB)

Core tables:

1. payment_customers

- id, auth_user_id, full_name, mobile, email, created_at, updated_at

2. payment_intents

- id, intent_number, auth_user_id, domain_service, domain_reference_id, amount_minor, currency, status, expires_at, created_at, updated_at

3. payment_transactions

- id, intent_id, provider_name, provider_reference, payment_method, status, authorized_at, captured_at, failed_at, failure_code, failure_reason, created_at, updated_at

4. payment_receipts

- id, receipt_number, transaction_id, issued_at, receipt_payload_json, storage_reference

5. payment_refunds

- id, transaction_id, refund_number, amount_minor, status, reason, requested_by, processed_at, created_at

6. payment_outbox_events

- id, aggregate_type, aggregate_id, event_type, payload_json, status, retry_count, created_at, published_at

7. payment_inbox_events

- id, source_service, event_key, event_type, payload_json, processed_at, created_at

## Event Contracts (Mandatory)

Published by payment-service:

1. payment.intent.created
2. payment.captured
3. payment.failed
4. payment.refund.processed

Consumed by payment-service:

1. billing.invoice.generated (electricity/water)
2. gas.booking.created
3. waste.request.created
4. auth.user.updated (for profile projection sync)

Idempotency rules:

1. Every event includes event_id and occurred_at.
2. domain_service + domain_reference_id + attempt_no is unique for payment intent creation.
3. Provider callback processing uses provider_reference uniqueness guard.

## Security and Compliance Requirements

1. Never store full card PAN/CVV in service DB.
2. Hash or tokenize sensitive payer identifiers where required.
3. Validate webhook signatures for provider callbacks.
4. Enforce trace_id and request_id propagation from gateway.
5. Log all state transitions in immutable audit format.

## Phased Delivery Plan

### Phase 1: Foundation (Day 1-2)

1. Create payment service skeleton and health routes.
2. Add migrations for payment_intents, payment_transactions, payment_outbox_events.
3. Implement POST /payments/intents with idempotency key support.
4. Emit payment.intent.created outbox event.

Exit criteria:

1. Intent creation works from one domain service in local environment.
2. Duplicate request returns existing intent without double-create.

### Phase 2: Capture Flow (Day 3-4)

1. Implement provider adapter interface with mock adapter first.
2. Implement callback endpoint and signature verification middleware.
3. Implement POST /payments/:id/confirm and transaction state machine.
4. Emit payment.captured and payment.failed events.

Exit criteria:

1. End-to-end success and failure paths verified with contract tests.
2. Domain service receives event and updates order state.

### Phase 3: Receipt + History (Day 5)

1. Implement receipt number generation and receipt payload persistence.
2. Implement GET /payments/history for citizen UI.
3. Integrate notification trigger on captured and failed outcomes.

Exit criteria:

1. Citizen can view at least one successful and one failed payment record.
2. Receipt retrieval path is available and stable.

### Phase 4: Refund and Reconciliation (Day 6-7)

1. Implement POST /payments/:id/refund with policy checks.
2. Add reconciliation job against provider settlement reports.
3. Add dispute metadata hooks for grievance service.

Exit criteria:

1. Refund request lifecycle is auditable end-to-end.
2. Reconciliation report identifies unmatched items.

## One-Hour Quick Start Plan (Immediate)

1. Define final API payload for POST /payments/intents and payment.captured event.
2. Create migration files for payment_intents and payment_transactions.
3. Implement intent creation endpoint with idempotency key.
4. Add outbox write in same DB transaction.
5. Validate by calling from one service (recommended: electricity-service).

## Testing and Quality Gates

1. Contract tests for requester services against payment APIs.
2. Integration tests for event publish and consume behavior.
3. Failure-path tests: timeout, callback replay, provider error.
4. Metrics: intent_create_count, capture_success_rate, callback_latency_ms, refund_turnaround_ms.
5. Dashboards and alerts before production cutover.

## Branch and PR Strategy

1. feature/payment-service-foundation
2. feature/payment-capture-callback
3. feature/payment-receipt-history
4. feature/payment-refund-reconciliation

Each PR must include:

1. Up/down migrations
2. API examples and contract updates
3. Test evidence for happy and failure paths
4. Observability updates (logs, metrics, traces)

## Risks and Mitigations

1. Risk: duplicate payment creation during retries.

- Mitigation: enforce idempotency key unique index and safe upsert.

2. Risk: callback spoofing or replay.

- Mitigation: signature validation, timestamp tolerance, processed callback store.

3. Risk: domain service drift in event schema.

- Mitigation: versioned event contract and schema validation in CI.

4. Risk: reconciliation mismatch with provider.

- Mitigation: daily reconciliation job and unresolved mismatch queue.

## Environment and Migration Commands

Environment variable snippet:

```bash
PAYMENT_GATEWAY_SERVICE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/suvidha_auth
```

Migration command examples:

```bash
# Apply only payment service migrations
PAYMENT_GATEWAY_SERVICE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/suvidha_auth \
node server/scripts/db/apply-migrations.js --services=payment-gateway-service

# Dry-run payment service migrations
PAYMENT_GATEWAY_SERVICE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/suvidha_auth \
node server/scripts/db/dry-run-migrations.js --services=payment-gateway-service
```
