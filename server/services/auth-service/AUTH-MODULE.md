# SUVIDHA-KIOSK Authentication Module Documentation

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Security Features](#security-features)
- [Configuration](#configuration)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Overview

The SUVIDHA-KIOSK Authentication Module is a secure, OTP-based authentication service designed for public kiosks and utility service platforms. It provides passwordless authentication using multiple identifier types (Mobile, Aadhar, Consumer ID) with email-delivered OTP verification.

### Key Components

- **OTP Generation & Verification**: 6-digit OTP with email delivery
- **Multi-Identifier Support**: Mobile Number, Aadhar Number, Consumer ID
- **JWT Token Management**: Access tokens (1h) and Refresh tokens (7d) with rotation
- **Role-Based Authorization**: User, Admin, and Operator roles
- **Comprehensive Security**: Rate limiting, attempt tracking, audit logging
- **Email Integration**: Google Apps Script for OTP delivery

## Features

### 🔐 Authentication Features

- **Passwordless Login**: OTP-based authentication via email
- **Multiple Login Types**: Support for Mobile (M), Aadhar (A), and Consumer ID (C)
- **JWT Token Management**: Secure access and refresh token handling
- **Token Rotation**: Automatic refresh token rotation for enhanced security

### 🛡️ Security Features

- **Rate Limiting**: Configurable limits on OTP requests and verification attempts
- **OTP Attempt Tracking**: Maximum 5 attempts per OTP before locking
- **Audit Logging**: Comprehensive activity tracking for security monitoring
- **CORS & Helmet**: Cross-origin and security header protection
- **Input Validation**: Joi-based request validation

### 📊 Management Features

- **Profile Integration**: Seamless integration with profile service
- **Health Monitoring**: Health check endpoints for service monitoring
- **Swagger Documentation**: Auto-generated API documentation
- **Comprehensive Testing**: Jest-based unit and integration tests

## Architecture

```mermaid
graph TD
    A[Client Application] --> B[API Gateway]
    B --> C[Auth Service :3001]
    C --> D[MongoDB - Auth DB]
    C --> E[MongoDB - Profile DB]
    C --> F[Google Apps Script]
    F --> G[Email Service]

    C --> H[JWT Tokens]
    C --> I[Rate Limiter]
    C --> J[Audit Logger]

    subgraph "Auth Service Components"
        K[Auth Controller]
        L[Auth Service]
        M[Profile Service]
        N[Audit Service]
        K --> L
        K --> M
        L --> N
    end
```

### Service Architecture

- **Port**: 3001 (configurable)
- **Database**: MongoDB with separate collections for auth and profile data
- **External Dependencies**: Google Apps Script for email delivery
- **Middleware**: Rate limiting, CORS, Helmet, JWT verification

## API Endpoints

### Base URL

```bash
http://localhost:3001/api/v1/auth
```

### Authentication Endpoints

#### 1. Health Check

```bash
GET /health
```

**Description**: Service health status  
**Response**: `{ "status": "OK", "timestamp": "2026-02-10T..." }`

#### 2. Request OTP

```bash
POST /get-otp
```

**Description**: Request OTP for login (rate-limited: 5 requests/10 minutes)

**Request Body**:

```json
{
  "identifier": "1234567890",
  "loginType": "M"
}
```

**Parameters**:

- `identifier` (string, required): Mobile (10 digits), Aadhar (12 digits), or Consumer ID
- `loginType` (string, required): "M" (Mobile), "A" (Aadhar), "C" (Consumer ID)

**Response**:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "identifier": "1234567890",
    "loginType": "M",
    "emailSent": true,
    "otpExpiry": "2026-02-10T12:10:00.000Z"
  }
}
```

#### 3. Verify OTP

```bash
POST /verify-otp
```

**Description**: Verify OTP and receive JWT tokens (rate-limited: 5 requests/15 minutes)

**Request Body**:

```json
{
  "identifier": "1234567890",
  "loginType": "M",
  "otp": "123456"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "role": "user",
      "primaryLoginType": "M"
    }
  }
}
```

#### 4. Refresh Token

```bash
POST /refresh-token
```

**Description**: Get new access token using refresh token

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 5. Logout

```bash
POST /logout
```

**Description**: Logout and invalidate refresh token  
**Headers**: `Authorization: Bearer <access_token>`

**Response**:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Profile Management Endpoints

#### 6. Get Profile

```bash
GET /profile
```

**Description**: Get user profile  
**Headers**: `Authorization: Bearer <access_token>`

#### 7. Update Profile

```bash
PUT /profile
```

**Description**: Update user profile  
**Headers**: `Authorization: Bearer <access_token>`

#### 8. Get Active Sessions

```bash
GET /sessions
```

**Description**: Get active user sessions  
**Headers**: `Authorization: Bearer <access_token>`

### Swagger Documentation

Interactive API documentation available at:

```bash
http://localhost:3001/api-docs
```

## Database Models

### User Model

```javascript
{
  // Identifiers (at least one required)
  mobileNumber: String,    // 10 digits, unique
  aadharNumber: String,    // 12 digits, unique
  consumerId: String,      // Uppercase, unique

  // Authentication
  primaryLoginType: String, // "M", "A", "C"
  role: String,            // "user", "admin", "operator"
  isActive: Boolean,       // Account status
  refreshToken: String,    // Current refresh token (hashed)

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### OTP Model

```javascript
{
  identifier: String,      // User identifier
  loginType: String,       // "M", "A", "C"
  consumerId: String,      // Associated consumer ID
  otp: String,            // 6-digit OTP code
  expiresAt: Date,        // TTL - auto-delete when expired
  verified: Boolean,      // OTP verification status
  attempts: Number,       // Verification attempts (max 5)
  maxAttempts: Number,    // Maximum allowed attempts
  locked: Boolean,        // Locked after max attempts

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Model

```javascript
{
  userId: ObjectId,       // Reference to User
  fullName: String,
  email: String,
  dateOfBirth: Date,
  gender: String,         // "Male", "Female", "Other"
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Audit Log Model

```javascript
{
  userId: ObjectId,       // User performing action
  action: String,         // Action performed
  resource: String,       // Resource affected
  details: Object,        // Additional details
  ipAddress: String,      // Client IP
  userAgent: String,      // Client user agent

  // Timestamps
  createdAt: Date
}
```

## Security Features

### Rate Limiting

- **OTP Request**: 5 requests per 10 minutes per IP
- **OTP Verification**: 5 requests per 15 minutes per IP
- **Sliding Window**: Uses memory store (consider Redis for production)

### OTP Security

- **6-digit numeric codes**: Secure random generation
- **10-minute expiry**: Configurable via environment
- **Maximum 5 attempts**: Auto-lock after exceeded attempts
- **Single-use**: OTPs are deleted after verification or expiry

### JWT Security

- **Access Tokens**: 1-hour expiry for short-lived access
- **Refresh Tokens**: 7-day expiry with automatic rotation
- **HMAC SHA256**: Secure signing algorithm
- **Secure Storage**: Refresh tokens hashed in database

### Input Validation

```javascript
// Example validation schemas
const OTPRequestSchema = Joi.object({
  identifier: Joi.string().required().trim(),
  loginType: Joi.string().valid("M", "A", "C").required(),
});

const OTPVerifySchema = Joi.object({
  identifier: Joi.string().required().trim(),
  loginType: Joi.string().valid("M", "A", "C").required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});
```

## Configuration

### Environment Variables

Create a `.env` file in the auth-service directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
AUTH_DB_URI=mongodb://localhost:27017/suvidha_auth
PROFILE_DB_URI=mongodb://localhost:27017/suvidha_profile

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Email Service (Google Apps Script)
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Google Apps Script Setup

1. **Create Apps Script Project**:

   ```javascript
   // Deploy as Web App with these settings:
   // Execute as: Me
   // Who has access: Anyone
   ```

2. **Apps Script Code**: Use the provided `doPost` function that expects:
   ```json
   {
     "email": "user@example.com",
     "name": "User Name",
     "otp": "123456"
   }
   ```

## Installation & Setup

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Google Apps Script project for email delivery

### Installation Steps

1. **Clone and Install**:

   ```bash
   cd server/services/auth-service
   npm install
   ```

2. **Configure Environment**:

   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:

   ```bash
   mongod --dbpath /path/to/your/data
   ```

4. **Run Database Migrations** (if any):

   ```bash
   npm run migrate
   ```

5. **Start the Service**:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify Installation**:
   ```bash
   curl http://localhost:3001/api/v1/auth/health
   ```

## Usage Examples

### Frontend Integration

#### React/JavaScript Example

```javascript
// Request OTP
const requestOTP = async (identifier, loginType) => {
  try {
    const response = await fetch("http://localhost:3001/api/v1/auth/get-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, loginType }),
    });
    return await response.json();
  } catch (error) {
    console.error("OTP request failed:", error);
  }
};

// Verify OTP
const verifyOTP = async (identifier, loginType, otp) => {
  try {
    const response = await fetch(
      "http://localhost:3001/api/v1/auth/verify-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, loginType, otp }),
      },
    );
    const data = await response.json();

    if (data.success) {
      // Store tokens securely
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
    }
    return data;
  } catch (error) {
    console.error("OTP verification failed:", error);
  }
};

// Make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, try refresh
    await refreshAccessToken();
    // Retry original request
  }

  return response;
};
```

### Backend Integration

#### Middleware Usage

```javascript
const { verifyToken, requireRole } = require("./middlewares/auth.middleware");

// Protect routes that require authentication
app.use("/api/v1/protected", verifyToken);

// Protect routes that require specific roles
app.use("/api/v1/admin", verifyToken, requireRole(["admin"]));
app.use("/api/v1/operator", verifyToken, requireRole(["admin", "operator"]));
```

### Testing Examples

#### Unit Test Example

```javascript
describe("Auth Service", () => {
  test("should generate valid OTP", async () => {
    const authService = new AuthService();
    const result = await authService.requestOTP("1234567890", "M");

    expect(result.success).toBe(true);
    expect(result.data.identifier).toBe("1234567890");
  });
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.service.test.js

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
tests/
├── auth.controller.test.js    # Controller tests
├── auth.service.test.js       # Service logic tests
├── auth.middleware.test.js    # Middleware tests
├── auth.validation.test.js    # Validation schema tests
├── profile.service.test.js    # Profile service tests
└── integration/               # Integration tests
    ├── auth.integration.test.js
    └── profile.integration.test.js
```

### Test Coverage

The authentication module includes:

- **25+ Unit Tests**: Covering all core functionality
- **5+ Integration Tests**: End-to-end authentication flows
- **Validation Tests**: Input validation and error scenarios
- **Security Tests**: Rate limiting and token validation

## Error Handling

### Common Error Responses

#### 400 - Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "identifier",
      "message": "Mobile number must be 10 digits"
    }
  ]
}
```

#### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 403 - Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### 429 - Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 600
}
```

#### 500 - Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### Error Categories

1. **Validation Errors**: Invalid input format or missing required fields
2. **Authentication Errors**: Invalid credentials, expired tokens
3. **Authorization Errors**: Insufficient permissions for resource access
4. **Rate Limiting Errors**: Exceeded request limits
5. **Service Errors**: Database connectivity, external service failures

## Environment Variables

### Complete Configuration Reference

```bash
# ── Server Configuration ──
PORT=3001                           # Service port number
NODE_ENV=development               # Environment (development/production)

# ── Database Configuration ──
AUTH_DB_URI=mongodb://localhost:27017/suvidha_auth      # Auth database URI
PROFILE_DB_URI=mongodb://localhost:27017/suvidha_profile  # Profile database URI

# ── JWT Configuration ──
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production  # JWT signing secret
JWT_ACCESS_EXPIRY=1h              # Access token expiry (e.g., '15m', '1h', '1d')
JWT_REFRESH_EXPIRY=7d             # Refresh token expiry (e.g., '7d', '30d')

# ── OTP Configuration ──
OTP_EXPIRY_MINUTES=10             # OTP expiry time in minutes

# ── Email Service Configuration ──
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# ── Optional: CORS Configuration ──
CORS_ORIGIN=http://localhost:3000  # Frontend origin (comma-separated for multiple)

# ── Optional: Rate Limiting ──
RATE_LIMIT_OTP_REQUESTS=5         # Max OTP requests per window
RATE_LIMIT_OTP_WINDOW=600000      # OTP rate limit window (ms)
RATE_LIMIT_VERIFY_ATTEMPTS=5     # Max verify attempts per window
RATE_LIMIT_VERIFY_WINDOW=900000   # Verify rate limit window (ms)
```

### Security Considerations

#### Production Environment Variables

```bash
# Always use strong secrets in production
JWT_SECRET=$(openssl rand -base64 64)

# Use MongoDB connection with authentication
AUTH_DB_URI=mongodb://username:password@host:port/suvidha_auth?authSource=admin
```

## Contributing

### Development Setup

1. **Fork & Clone**:

   ```bash
   git clone https://github.com/your-fork/suvidha-kiosk.git
   cd suvidha-kiosk/server/services/auth-service
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run Tests**:

   ```bash
   npm test
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Contributing Guidelines

- Write tests for new features
- Follow existing code style and conventions
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Add meaningful commit messages

### Code Style

- Use ESLint configuration
- Follow JavaScript Standard Style
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Keep functions small and focused

---

## Support

For questions, issues, or contributions:

1. **Issues**: Create a GitHub issue for bugs or feature requests
2. **Documentation**: Check this documentation first for common questions
3. **Testing**: Run `npm test` to verify your setup
4. **Logs**: Check service logs for detailed error information

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0  
**Service**: SUVIDHA-KIOSK Authentication Module