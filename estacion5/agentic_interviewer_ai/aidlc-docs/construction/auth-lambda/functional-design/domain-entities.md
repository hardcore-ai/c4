# Domain Entities — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Design Basis**: FD-AUTH-01 through FD-AUTH-15 answers

---

## Entity Overview

```
+---------------------+        +----------------------+
|      Operator       |        |    RefreshToken       |
|---------------------|        |----------------------|
| _id: ObjectId        |<----->| _id: ObjectId         |
| tenant_id: str       |       | operator_id: str (FK) |
| email: str (unique)  |       | token_hash: str       |
| name: str            |       | jti: str              |
| role: OperatorRole   |       | issued_at: datetime   |
| password_hash: str   |       | expires_at: datetime  |
| is_active: bool      |       | revoked: bool         |
| created_by: str|None |       | revoked_at: datetime? |
| created_at: datetime |       +----------------------+
| updated_at: datetime |
+---------------------+

+---------------------+        +----------------------+
|    RevokedToken     |        |    LoginAttempt       |
|---------------------|        |----------------------|
| _id: ObjectId        |       | _id: ObjectId         |
| jti: str (unique)    |       | email: str            |
| operator_id: str     |       | tenant_id: str        |
| revoked_at: datetime |       | attempted_at: datetime|
| expires_at: datetime |       | success: bool         |
| reason: RevokeReason |       | ip_address: str?      |
+---------------------+        +----------------------+
```

---

## Entity: Operator

**Collection**: `operators`

**Description**: Represents a human user of the recruiter dashboard. Always scoped to a tenant. Two roles only: ADMIN and RECRUITER.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | PK, auto | MongoDB document ID |
| `tenant_id` | string | required, indexed | Tenant scope; all queries must filter by this |
| `email` | string | required, unique per tenant, lowercase | Indexed: `{ tenant_id, email }` unique |
| `name` | string | required, 1–100 chars | Display name |
| `role` | OperatorRole | required, enum | `ADMIN` or `RECRUITER` |
| `password_hash` | string | required | argon2id hash; never exposed in API responses |
| `is_active` | boolean | required, default: true | Soft-delete flag; false = deactivated |
| `created_by` | string \| null | optional | operator_id of creator; null for bootstrap account |
| `created_at` | datetime | required, auto | ISO 8601 UTC |
| `updated_at` | datetime | required, auto | Updated on any field change |

**Indexes**:
- `{ tenant_id: 1, email: 1 }` — unique compound index
- `{ tenant_id: 1 }` — for tenant-scoped listing

**OperatorRole enum**:
```
ADMIN     — Full access: operator management, all views, all operations
RECRUITER — Read + review queue access; cannot manage other operators
```

---

## Entity: RefreshToken

**Collection**: `refresh_tokens`

**Description**: Stores issued refresh tokens. Each refresh call issues a new token and marks the old one as revoked (rotating policy).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | PK, auto | |
| `operator_id` | string | required, indexed | FK to Operator._id |
| `tenant_id` | string | required, indexed | Denormalized for query efficiency |
| `token_hash` | string | required | SHA-256 hash of the opaque refresh token; never store plaintext |
| `jti` | string | required, unique | UUID v4; also embedded in access tokens issued with this refresh |
| `issued_at` | datetime | required | |
| `expires_at` | datetime | required | `issued_at + 7 days` |
| `revoked` | boolean | required, default: false | Set to true on rotation or logout |
| `revoked_at` | datetime | optional | Set when revoked = true |

**Indexes**:
- `{ jti: 1 }` — unique; used for revocation lookup
- `{ operator_id: 1 }` — for session listing/cleanup
- `{ expires_at: 1 }` — TTL index (MongoDB auto-deletes expired documents)

---

## Entity: RevokedToken

**Collection**: `revoked_tokens`

**Description**: Deny-list for JWT access token JTIs (not refresh tokens — those are tracked in RefreshToken). Used for logout and compromised token scenarios.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | PK, auto | |
| `jti` | string | required, unique | Access token JTI being revoked |
| `operator_id` | string | required | For audit purposes |
| `revoked_at` | datetime | required | |
| `expires_at` | datetime | required | Same as token's original `exp`; used by TTL index |
| `reason` | RevokeReason | required | `LOGOUT` or `SECURITY` |

**Indexes**:
- `{ jti: 1 }` — unique; hot lookup path for every authenticated request
- `{ expires_at: 1 }` — TTL index (auto-purges entries when original token would have expired anyway)

**RevokeReason enum**:
```
LOGOUT    — Normal operator logout
SECURITY  — Admin-forced revocation (future use)
```

---

## Entity: LoginAttempt

**Collection**: `login_attempts`

**Description**: Records every login attempt for brute-force detection. Window: 15 minutes. Threshold: 5 failures → 15-minute lockout.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | PK, auto | |
| `email` | string | required, indexed | Normalized lowercase; keyed by email (not operator_id, since invalid emails are also tracked) |
| `tenant_id` | string | required | For isolation between tenants with same email |
| `attempted_at` | datetime | required | |
| `success` | boolean | required | true = successful login (used to reset window) |
| `ip_address` | string | optional | For future analytics; not used in lockout logic |

**Indexes**:
- `{ email: 1, tenant_id: 1, attempted_at: 1 }` — compound; drives the "count failures in window" query
- `{ attempted_at: 1 }` — TTL index; auto-purges documents older than 30 minutes (2x the window)

---

## Value Objects

### TokenPair

```
TokenPair {
  access_token: str    # Signed JWT (RS256)
  refresh_token: str   # Opaque UUID stored hashed in DB
  expires_in: int      # Access token TTL in seconds (3600)
  token_type: str      # Always "Bearer"
}
```

### JWTPayload (Access Token Claims)

```
JWTPayload {
  sub: str         # operator_id
  tenant_id: str   # tenant scope
  role: str        # "ADMIN" or "RECRUITER"
  jti: str         # UUID v4; unique per token; used for revocation
  iat: int         # Issued-at (Unix timestamp)
  exp: int         # Expiry (Unix timestamp; iat + 3600)
}
```

### PasswordPolicy

```
PasswordPolicy {
  min_length: 8
  require_uppercase: true   # at least 1 [A-Z]
  require_lowercase: true   # at least 1 [a-z]
  require_digit: true       # at least 1 [0-9]
}
```

### BruteForcePolicy

```
BruteForcePolicy {
  failure_threshold: 5       # max failures before lockout
  window_minutes: 15         # rolling window for counting failures
  lockout_minutes: 15        # duration of lockout after threshold
}
```

---

*End of domain-entities.md*
