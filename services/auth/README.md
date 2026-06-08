# Authentication Service API Documentation

## Overview
The Authentication Service handles user authentication, authorization, and token management for the NBFC Multi-Application platform.

## Base URL
```
http://localhost:3001/api/auth
```

## Endpoints

### 1. Login
**POST** `/login`

Authenticates a user and returns a JWT token.

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response (200 OK)
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "branchId": null
  }
}
```

#### Error Responses
- **401 Unauthorized**: Invalid credentials
- **500 Internal Server Error**: Server error

---

### 2. Verify Token
**POST** `/verify`

Verifies the validity of a JWT token.

#### Request Body
```json
{
  "token": "jwt_token_string"
}
```

#### Response (200 OK)
```json
{
  "valid": true,
  "user": {
    "userId": 1,
    "username": "admin",
    "role": "admin",
    "branchId": null
  }
}
```

---

### 3. Get Profile
**GET** `/profile`

Returns the authenticated user's profile. Requires Bearer token in Authorization header.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "branchId": null
}
```

---

### 4. Get Permissions
**GET** `/permissions`

Returns the authenticated user's permissions based on their role.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
{
  "permissions": ["read", "write", "delete", "manage_users", "manage_branches"]
}
```

## User Roles and Permissions

| Role | Permissions |
|------|-------------|
| admin | read, write, delete, manage_users, manage_branches |
| branch_manager | read, write, manage_customers, manage_loans |
| field_agent | read, write, collect_payments, update_customer_info |
| customer | read, make_payments |
| collections | read, collect_payments, view_delinquent_accounts |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| AUTH_SERVICE_PORT | 3001 | Port the service runs on |
| JWT_SECRET | your-jwt-secret-key-change-in-production | Secret key for JWT signing |

## Dependencies
- express: ^4.18.0
- jsonwebtoken: ^9.0.0
- bcrypt: ^5.0.0
- cors: ^2.8.0
- dotenv: ^16.0.0