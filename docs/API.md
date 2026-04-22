# HCDC-X AI+ API Documentation

Base URL: `https://hcdcx-api.railway.app/api`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "user" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST `/auth/login`
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):** Same as register.

### POST `/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response (200):**
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST `/auth/logout`
Logout and invalidate refresh token.

**Request Body (optional):**
```json
{
  "refreshToken": "..."
}
```

### GET `/auth/profile`
Get current user profile.

**Response (200):**
```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "role": "...",
  "otpEnabled": false
}
```

### POST `/auth/otp/enable`
Generate TOTP secret and QR code.

**Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

### POST `/auth/otp/verify`
Verify TOTP and enable 2FA.

**Request Body:**
```json
{
  "token": "123456"
}
```

### POST `/auth/otp/disable`
Disable TOTP (requires valid token).

---

## Codes

### GET `/codes`
List all codes for authenticated user.

**Response (200):**
```json
[
  {
    "_id": "...",
    "name": "My Code",
    "type": "hybrid",
    "data": { "url": "https://..." },
    "imageUrl": "https://...",
    "scans": 42,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST `/codes/generate`
Generate a new hybrid code.

**Request Body:**
```json
{
  "name": "Product Link",
  "inputType": "url",
  "content": "https://example.com",
  "mode": "hybrid",
  "colorDepth": 2,
  "dynamic": true,
  "expiresIn": 30
}
```

**Response (201):** Returns created code object.

### GET `/codes/:id`
Get single code by ID.

### PATCH `/codes/:id`
Update code name or content.

### DELETE `/codes/:id`
Delete code and associated image.

### POST `/codes/:id/duplicate`
Create a copy of an existing code.

### POST `/codes/:id/regenerate`
Regenerate a dynamic code with a new timestamp.

---

## Scans

### POST `/scans/verify`
Verify a scanned code.

**Request Body:**
```json
{
  "code": "decoded_string_or_id",
  "deviceInfo": {
    "browser": "Chrome",
    "os": "Windows",
    "device": "Desktop"
  }
}
```

**Response (200):**
```json
{
  "valid": true,
  "riskScore": 15,
  "data": { "url": "https://..." }
}
```

### GET `/scans/recent?limit=20`
Get recent scan logs.

### GET `/scans/stats?range=week`
Get scan statistics (range: `day`, `week`, `month`).

---

## Analytics

### GET `/analytics?range=week`
Get dashboard analytics summary.

**Response (200):**
```json
{
  "summary": {
    "totalScans": 1250,
    "blockedScans": 12,
    "avgRiskScore": 23.5,
    "activeCodes": 8
  },
  "topCodes": [...],
  "hourlyScans": [...]
}
```

### GET `/analytics/admin`
Admin-only endpoint for platform-wide analytics.

---

## WebSocket Events

Connect to `wss://hcdcx-api.railway.app` with JWT authentication.

### Client → Server
- `dashboard:subscribe` – Subscribe to real-time dashboard updates.
- `code:subscribe` (codeId) – Subscribe to specific code updates.
- `analytics:subscribe` – Subscribe to analytics updates.

### Server → Client
- `stats:update` – Dashboard stats update.
- `scan:new` – New scan detected.
- `security:update` – Security metrics changed.
- `security:alert` – High-risk security alert.
```
