# Auth Service Structure

This folder follows a layered Node.js service architecture designed for maintainability and scaling.

## Directory Layout

```text
auth/
  src/
    config/        # Environment and runtime configuration
    constants/     # App-wide constants and enums
    controllers/   # HTTP handlers (request/response)
    middleware/    # Express middleware (auth, validation, errors)
    models/        # Data schemas/types
    repositories/  # Database access layer
    routes/        # Route registration
    services/      # Business logic
    utils/         # Pure helper utilities
    validators/    # Input validation schemas
  prisma/
    migrations/    # Prisma migrations
  tests/
    unit/          # Fast isolated unit tests
    integration/   # API and DB integration tests
  docs/            # Auth module documentation
  scripts/         # Operational scripts (seed, cleanup, etc.)
```

## Suggested Entry Points

- `src/app.js`: express app setup
- `src/server.js`: server bootstrap/listen
- `src/routes/index.js`: central route mounting

## Notes

- Keep controllers thin and move logic to `src/services`.
- Keep SQL/Prisma queries in `src/repositories`.
- Put request validation in `src/validators` and apply via middleware.
