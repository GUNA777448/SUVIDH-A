# Auth Service Postman Test Cases

This document describes the Postman test suite for the auth service login flow.

## Collection File

- `docs/auth-service.collection.json`

## Import Steps

1. Open Postman.
2. Click Import.
3. Select `docs/auth-service.collection.json`.
4. Ensure the auth service is running on `http://localhost:4009`.

## Variables Used

- `baseUrl`: API base URL.
- `identifierType`: default `M`.
- `identifierValue`: default `6300614592`.
- `otp`: OTP captured from OTP request response.
- `accessToken`: JWT captured after verify success.
- `aadhar`: seeded aadhar for A identifier tests.
- `consumerId`: seeded consumer ID for C identifier tests.

## Test Case Matrix

1. Service smoke checks:

- `GET /`
- `GET /health`

2. OTP request validation and behavior:

- Invalid identifier type returns `400 INVALID_IDENTIFIER`.
- Unknown user returns `404 USER_NOT_FOUND`.
- Valid mobile request returns `200` and stores `otp`.
- Valid aadhar request returns `200` and stores `otpAadhar`.
- Valid consumer ID request returns `200` and stores `otpConsumer`.

3. OTP verify validation and behavior:

- Invalid OTP format returns `400 INVALID_OTP`.
- Wrong OTP returns `401 OTP_*` error.
- Correct OTP returns `200` with JWT token.
- Reused OTP returns `401 OTP_NOT_FOUND`.

## Notes

- Run requests in collection order for chaining to work.
- In development mode, OTP is returned in API response and captured by tests.
- In production mode, OTP should not be returned by API; adjust the verify test flow accordingly.
