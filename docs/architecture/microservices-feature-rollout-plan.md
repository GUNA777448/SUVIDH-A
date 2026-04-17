# Microservices Feature Rollout Plan (Schema-Aligned)

Date: 2026-04-15
Status: Execution Blueprint

## Objective

Define implementation plans for each service so that every feature is explicitly tied to service-owned tables, migration order, APIs, events, and delivery branches.

## Service Plan Index

1. Auth Service Plan: ../auth/plans/auth-feature-implementation-plan.md
2. Gas Service Plan: ../gas/plans/gas-action-plan.md
3. Electricity Service Plan: ../electricity/plans/electricity-feature-implementation-plan.md
4. Water Service Plan: ../water/plans/water-feature-implementation-plan.md
5. Waste Service Plan: ../waste/plans/waste-feature-implementation-plan.md
6. Payment Service Plan: ../payment/plans/payment-feature-implementation-plan.md

## Cross-Service Rules (Mandatory)

1. No cross-service foreign keys. Use auth_user_id as opaque reference in domain DBs.
2. Each domain service owns its own local user projection table.
3. Use outbox and inbox tables for inter-service consistency.
4. Every feature branch must include:

- Up migration + down migration
- Repository/service/controller updates
- API contract tests + integration tests
- Observability (logs, metrics, trace IDs)

## Recommended Delivery Sequence

1. Auth hardening and event contracts
2. Payment schema + core transaction orchestration
3. Gas full implementation on current advanced schema
4. Electricity schema + core billing flow
5. Water schema + core billing flow
6. Waste schema + pickup and complaint flow
7. Cross-service UAT, resilience tests, production rollout

## Product UI Design Principles (Google + Material)

Use these principles as non-negotiable UI standards across all citizen-facing pages.

### 1. Material Design Structure

1. Build all main content inside cards/surfaces with clear elevation levels.
2. Keep visual depth intentional: page background, section card, interactive element.
3. Use consistent radius, border, and spacing tokens for all cards.

### 2. Clean and Minimal Layout

1. One primary action per section.
2. Remove decorative elements that do not improve task completion.
3. Preserve whitespace between sections to avoid visual noise.

### 3. Strong Visual Hierarchy

1. Use large, clear page titles and short section labels.
2. Keep CTA buttons visually dominant over secondary actions.
3. Group related fields and controls with clear heading and spacing.

### 4. Consistent Components

1. Reuse the same button, input, badge, card, and tab variants across services.
2. Keep icon style and size consistent for all service modules.
3. Do not create one-off component styles unless added to shared UI primitives.

### 5. Bold and Meaningful Colors

1. Keep a limited palette and assign semantic meaning to each color.
2. Use color for state and action guidance (success, warning, pending, error).
3. Keep decorative color use minimal; clarity over aesthetics.

### 6. Motion with Purpose

1. Add subtle transitions for route changes, status updates, and success states.
2. Use motion to explain state change (processing to success), not for decoration.
3. Keep durations short and consistent to maintain responsiveness.

### 7. User-Friendly Navigation

1. Keep bottom navigation fixed and predictable on mobile.
2. Ensure each page has one clear back path.
3. Keep labels simple and action-oriented (Home, Services, Transactions, Profile).

### 8. Responsive Design

1. Design mobile first, then scale to tablet and desktop.
2. Avoid horizontal overflow at all breakpoints.
3. Ensure cards and forms reflow cleanly across screen sizes.

### 9. Accessibility First

1. Maintain readable typography and color contrast.
2. Ensure touch targets are large enough for mobile interaction.
3. Support keyboard focus states and clear status messaging.

## UI Quality Gate (Before Merge)

A feature is complete only if all checks pass:

1. Uses shared UI components and design tokens.
2. Has clear hierarchy: title, section labels, primary action.
3. Uses semantic status colors consistently.
4. Works on mobile, tablet, and desktop without layout breaks.
5. Provides loading, success, and error feedback.
6. Meets baseline accessibility: contrast, focus visibility, readable text.

## Immediate Application to SUVIDHA MVP

Apply now to high-impact screens first:

1. Home dashboard: reinforce hierarchy, spacing, and service status readability.
2. Gas booking flow: ensure primary CTA prominence and consistent status states.
3. Electricity billing flow: maintain clear selection, summary, and payment feedback.
4. Water tanker request flow: keep form simple, readable, and mobile friendly.
5. Transactions page: enforce consistent badges, icon sizing, and information density.
