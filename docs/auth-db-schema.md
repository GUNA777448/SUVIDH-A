# Auth Service Database Schema (v1.0)

This document describes the normalized database schema for the Auth Service, designed for use with NeonDB (PostgreSQL).

## Tables

### 1. `users`

Core anchor table for all user accounts.

| Column     | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| id         | UUID (PK)   | Unique user identifier (gen_random_uuid()) |
| status     | VARCHAR(20) | 'active', 'suspended', 'unverified'        |
| created_at | TIMESTAMP   | Record creation timestamp                  |
| updated_at | TIMESTAMP   | Last update timestamp                      |

MOVE FILE: /Users/abhiramtatta/Documents/GUNA/SUVIDHA/docs/database/auth-db-schema.md

### 2. `auth_identities`

Handles multiple login methods per user (e.g., phone, consumer ID).

| Column     | Type         | Description                            |
| ---------- | ------------ | -------------------------------------- |
| id         | UUID (PK)    | Unique identifier (gen_random_uuid())  |
| user_id    | UUID (FK)    | References users(id)                   |
| provider   | VARCHAR(32)  | 'mobile', 'aadhar_vault', 'consumerid' |
| identifier | VARCHAR(128) | Unique login identifier                |
| created_at | TIMESTAMP    | Record creation timestamp              |

### 3. `user_sessions`

Stores stateful refresh tokens for session management.

| Column        | Type         | Description                           |
| ------------- | ------------ | ------------------------------------- |
| id            | UUID (PK)    | Unique identifier (gen_random_uuid()) |
| user_id       | UUID (FK)    | References users(id)                  |
| refresh_token | VARCHAR(255) | Hashed refresh token                  |
| expires_at    | TIMESTAMP    | Expiry timestamp                      |
| is_revoked    | BOOLEAN      | Token revoked status (default: false) |

### 4. `profiles`

Stores user personal details.

| Column     | Type         | Description                           |
| ---------- | ------------ | ------------------------------------- |
| id         | UUID (PK)    | Unique identifier (gen_random_uuid()) |
| user_id    | UUID (FK)    | References users(id), unique          |
| name       | VARCHAR(128) | User's full name                      |
| dob        | DATE         | Date of birth                         |
| gender     | VARCHAR(16)  | Gender                                |
| updated_at | TIMESTAMP    | Last update timestamp                 |

### 5. `contacts`

Stores user contact and address information.

| Column       | Type         | Description                           |
| ------------ | ------------ | ------------------------------------- |
| id           | UUID (PK)    | Unique identifier (gen_random_uuid()) |
| user_id      | UUID (FK)    | References users(id)                  |
| phone        | VARCHAR(16)  | Mobile number (unique, 10 digits)     |
| email        | VARCHAR(128) | Email address (unique)                |
| address_line | TEXT         | Street address                        |
| city         | VARCHAR(64)  | City                                  |
| state        | VARCHAR(64)  | State                                 |
| pincode      | VARCHAR(16)  | Postal code                           |
| updated_at   | TIMESTAMP    | Last update timestamp                 |₹

## Constraints & Notes

- All primary keys are UUIDs generated with `gen_random_uuid()`
- Foreign keys reference the `users` table
- Unique constraints on `auth_identities.identifier`, `contacts.phone`, and `contacts.email`
- Mobile number: 10 digits
- Consumer ID: 8 digits
- Aadhar: 12 digits

## Usage

- The `users` table anchors all user data
- `auth_identities` allows multiple login methods per user
- `user_sessions` supports refresh token-based session management
- `profiles` and `contacts` store personal and contact details

# Auth Service Database Schema

This document describes the database schema for the Auth Service, designed for use with NeonDB (PostgreSQL).

## Tables

### 1. `auth`

Stores authentication-related data and OTPs for login.

| Column           | Type        | Description                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| id               | SERIAL (PK) | Unique identifier                                    |
| identifier_type  | VARCHAR(32) | Type of identifier: 'mobile', 'aadhar', 'consumerid' |
| identifier_value | VARCHAR(64) | Value of the identifier                              |
| otp              | VARCHAR(6)  | One-time password (6 digits)                         |
| otp_expires_at   | TIMESTAMP   | OTP expiry timestamp                                 |
| jwt_token        | TEXT        | Last issued JWT token                                |
| created_at       | TIMESTAMP   | Record creation timestamp                            |

### 2. `profile`

Stores user profile and basic details.

| Column     | Type         | Description               |
| ---------- | ------------ | ------------------------- |
| id         | SERIAL (PK)  | Unique identifier         |
| name       | VARCHAR(128) | User's full name          |
| dob        | DATE         | Date of birth             |
| gender     | VARCHAR(16)  | Gender                    |
| created_at | TIMESTAMP    | Record creation timestamp |

### 3. `contact`

Stores user contact and address details.

| Column     | Type         | Description               |
| ---------- | ------------ | ------------------------- |
| id         | SERIAL (PK)  | Unique identifier         |
| user_id    | INTEGER (FK) | References profile(id)    |
| address    | TEXT         | Street address            |
| city       | VARCHAR(64)  | City                      |
| state      | VARCHAR(64)  | State                     |
| pincode    | VARCHAR(16)  | Postal code               |
| phone      | VARCHAR(16)  | Mobile number (10 digits) |
| email      | VARCHAR(128) | Email address             |
| created_at | TIMESTAMP    | Record creation timestamp |

## Constraints

- Mobile number: 10 digits
- Consumer ID: 8 digits
- Aadhar: 12 digits
- Foreign key: `contact.user_id` references `profile.id`

## Usage

- The `auth` table is used for OTP-based authentication and JWT issuance.
- The `profile` and `contact` tables store user details for registration and profile management.
