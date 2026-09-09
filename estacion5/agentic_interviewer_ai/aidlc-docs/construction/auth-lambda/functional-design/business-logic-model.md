# Business Logic Model — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Design Basis**: FD-AUTH-01 through FD-AUTH-15 answers

---

## Core Business Flows

---

### Flow 1: Operator Login

**Trigger**: Dashboard sends `POST /api/v1/auth/login` with `{ email, password, tenant_id }`

**Steps**:

```
1. NORMALIZE email to lowercase

2. CHECK brute-force lock
   - Query LoginAttempt collection: count failures for (email, tenant_id)
     within the last 15 minutes
   - IF count >= 5:
       Compute lockout_remaining = (earliest_failure.attempted_at + 15min) - now
       RETURN 429 Too Many Requests
              Header: Retry-After: <lockout_remaining_seconds>
              Body: { error: "too_many_requests" }
       STOP

3. LOAD operator by (email, tenant_id)
   - IF not found:
       Run dummy argon2id comparison (constant-time defense)
       RECORD LoginAttempt(success=false)
       RETURN 401 { error: "invalid_credentials" }
       STOP

4. CHECK is_active
   - IF is_active == false:
       Run dummy argon2id comparison (constant-time defense)
       RECORD LoginAttempt(success=false)
       RETURN 401 { error: "invalid_credentials" }
       STOP

5. VERIFY password
   - Run argon2id.verify(password, operator.password_hash)
   - IF fails:
       RECORD LoginAttempt(success=false)
       RETURN 401 { error: "invalid_credentials" }
       STOP

6. RESET brute-force counter
   - RECORD LoginAttempt(success=true)
   - (The TTL index handles cleanup; no explicit delete needed)

7. ISSUE tokens
   - access_token  = JWT(sub=operator_id, tenant_id, role, jti=uuid4, exp=now+3600)
   - refresh_token = uuid4() stored as SHA-256(token) in RefreshToken collection
   - Store RefreshToken document

8. EMIT audit event to compliance-lambda (async, fire-and-forget)
   - Event: LOGIN_SUCCESS { operator_id, tenant_id, timestamp }

9. RETURN 200 TokenPair { access_token, refresh_token, expires_in: 3600, token_type: "Bearer" }
```

---

### Flow 2: Token Refresh

**Trigger**: Dashboard sends `POST /api/v1/auth/refresh` with `{ refresh_token }`

**Steps**:

```
1. HASH the incoming refresh_token: lookup_hash = SHA-256(refresh_token)

2. LOAD RefreshToken by token_hash
   - IF not found OR revoked == true:
       RETURN 401 { error: "invalid_token" }
       STOP
   - IF expires_at < now:
       RETURN 401 { error: "token_expired" }
       STOP

3. LOAD operator by RefreshToken.operator_id
   - IF not found OR is_active == false:
       RETURN 401 { error: "invalid_token" }
       STOP

4. ROTATE refresh token
   - Mark old RefreshToken: revoked = true, revoked_at = now
   - Issue new RefreshToken document (new jti, new token value, expires_at = now+7days)

5. ISSUE new access token
   - JWT(sub=operator_id, tenant_id, role, jti=new_jti, exp=now+3600)

6. RETURN 200 TokenPair { new access_token, new refresh_token, expires_in: 3600 }
```

---

### Flow 3: Logout

**Trigger**: Dashboard sends `POST /api/v1/auth/logout` with `{ refresh_token }` + Bearer access token in header

**Steps**:

```
1. VALIDATE access token (signature + expiry)
   - Extract operator_id, jti from payload

2. ADD access token JTI to revoked_tokens collection
   - RevokedToken { jti, operator_id, revoked_at=now, expires_at=token.exp, reason=LOGOUT }

3. HASH the incoming refresh_token
   - LOAD RefreshToken by token_hash
   - IF found AND revoked == false:
       Mark revoked = true, revoked_at = now

4. EMIT audit event (async, fire-and-forget)
   - Event: LOGOUT { operator_id, tenant_id, timestamp }

5. RETURN 204 No Content
```

---

### Flow 4: Create Operator (ADMIN only)

**Trigger**: ADMIN sends `POST /api/v1/operators` with `{ email, name, role, password }`

**Steps**:

```
1. AUTHENTICATE caller — validate Bearer access token
   - CHECK that caller.role == ADMIN; else RETURN 403

2. VALIDATE request body
   - email: valid format, lowercase
   - name: 1–100 chars
   - role: must be ADMIN or RECRUITER
   - password: must meet PasswordPolicy (8+ chars, 1 upper, 1 lower, 1 digit)

3. CHECK email uniqueness within tenant
   - IF operator with (email, tenant_id) exists: RETURN 409 { error: "email_conflict" }

4. HASH password
   - password_hash = argon2id.hash(password)

5. PERSIST Operator document
   - is_active = true, created_by = caller.operator_id

6. EMIT audit event (async, fire-and-forget)
   - Event: OPERATOR_CREATED { operator_id, tenant_id, created_by, role, timestamp }

7. RETURN 201 Operator (without password_hash field)
```

---

### Flow 5: Deactivate Operator (ADMIN only)

**Trigger**: ADMIN sends `POST /api/v1/operators/{operator_id}/deactivate`

**Steps**:

```
1. AUTHENTICATE caller — validate Bearer access token
   - CHECK caller.role == ADMIN; else RETURN 403
   - CHECK caller.operator_id != operator_id (cannot self-deactivate); else RETURN 400

2. LOAD operator by (operator_id, tenant_id)
   - IF not found: RETURN 404
   - IF already inactive: RETURN 409 { error: "already_deactivated" }

3. SET is_active = false, updated_at = now

4. REVOKE all active refresh tokens for this operator
   - Update RefreshToken collection: set revoked=true for all non-revoked tokens of operator

5. EMIT audit event (async, fire-and-forget)
   - Event: OPERATOR_DEACTIVATED { operator_id, tenant_id, deactivated_by, timestamp }

6. RETURN 204 No Content
```

---

### Flow 6: Change Own Password

**Trigger**: Operator sends `PATCH /api/v1/operators/{operator_id}/password` with `{ current_password, new_password }`

**Steps**:

```
1. AUTHENTICATE caller — validate Bearer access token
   - CHECK caller.operator_id == operator_id (can only change own password);
     else RETURN 403

2. LOAD operator by (operator_id, tenant_id)
   - IF not found OR is_active == false: RETURN 404

3. VERIFY current_password against stored hash
   - IF fails: RETURN 400 { error: "current_password_incorrect" }

4. VALIDATE new_password meets PasswordPolicy
   - IF fails: RETURN 400 { error: "password_policy_violation", details: [...] }

5. HASH new password with argon2id

6. UPDATE password_hash and updated_at

7. REVOKE all refresh tokens for this operator (force re-login on all sessions)

8. RETURN 204 No Content
```

---

### Flow 7: Bootstrap First Admin

**Trigger**: `POST /api/v1/operators/bootstrap` with `{ email, name, password, tenant_id }`

**Steps**:

```
1. CHECK that Operator collection for this tenant_id is EMPTY
   - IF any operator exists for tenant: RETURN 409 { error: "bootstrap_already_done" }

2. VALIDATE request body (same rules as Create Operator)

3. HASH password with argon2id

4. PERSIST Operator document
   - role = ADMIN
   - is_active = true
   - created_by = null (no parent operator)

5. RETURN 201 Operator (without password_hash)
```

> Security: This endpoint is callable without authentication. The only guard is the empty-collection check. Infrastructure-level IP allowlisting (VPC-only access during initial deploy) is enforced at the Infrastructure Design stage.

---

### Flow 8: Access Token Validation (used by other lambdas)

**Trigger**: Any downstream lambda (dashboard API, future internal calls) validates a Bearer token

**Steps**:

```
1. PARSE JWT header and verify RS256 signature using the public key
   - Public key loaded from environment variable (not Secrets Manager — read-only, safe to expose)
   - IF signature invalid: raise 401

2. CHECK exp claim > now
   - IF expired: raise 401

3. CHECK jti not in revoked_tokens collection
   - IF revoked: raise 401

4. RETURN decoded JWTPayload { sub, tenant_id, role, jti, iat, exp }
```

> Note: Other lambdas (dashboard) do their own token validation using the public key. auth-lambda does not serve as a token introspection gateway — it only issues and revokes tokens. This keeps auth-lambda out of the hot path for every API request.

---

## Constant-Time Login Defense

To prevent email enumeration via timing analysis, the login flow **always** executes argon2id regardless of whether the email exists:

```
DUMMY_HASH = argon2id.hash("dummy_placeholder_never_matches")

def safe_login(email, password, operator):
    if operator is None:
        argon2id.verify(password, DUMMY_HASH)   # always runs
        return False
    return argon2id.verify(password, operator.password_hash)
```

The dummy hash is pre-computed at Lambda cold-start and reused. This ensures the response time for "email not found" is indistinguishable from "wrong password."

---

## Audit Event Emission Pattern

All audit events are emitted **asynchronously** (fire-and-forget) to compliance-lambda via HTTP POST. The auth operation succeeds regardless of whether the audit emission succeeds.

```
Event structure:
{
  "event_type": "LOGIN_SUCCESS" | "LOGIN_FAILURE" | "LOGOUT"
              | "OPERATOR_CREATED" | "OPERATOR_DEACTIVATED",
  "source": "auth-lambda",
  "operator_id": str,
  "tenant_id": str,
  "timestamp": ISO8601,
  "metadata": { ... event-specific fields ... }
}
```

Events emitted per flow:
| Flow | Event |
|------|-------|
| Login success | `LOGIN_SUCCESS` |
| Login failure (wrong password, not found, locked, deactivated) | `LOGIN_FAILURE` |
| Logout | `LOGOUT` |
| Create operator | `OPERATOR_CREATED` |
| Deactivate operator | `OPERATOR_DEACTIVATED` |

---

*End of business-logic-model.md*
