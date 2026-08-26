# Business Rules — Backend

## Validation Rules

| Field | Rule |
|---|---|
| sessionCode | `^[A-Za-z0-9_-]{1,64}$` |
| displayName | Non-empty string, max 200 chars, trimmed |
| skills | Array of 3-5 items, each must be a valid ID from the 15-skill catalog |
| participantId | UUID format `^[0-9a-f-]{36}$` |
| photoObjectKey | Optional. If present: `^[A-Za-z0-9/_.-]{1,512}$`, no `..` |
| contentType | One of: `image/jpeg`, `image/png`, `image/webp` |
| adminToken | Exact match against `ADMIN_TOKEN` env var |

## Business Rules

1. **Self-vote prohibition**: voterId === targetParticipantId → 400
2. **Vote idempotency**: Duplicate vote (same voter + target + skill) returns current count without incrementing. Enforced via conditional PutItem in TransactWriteItems.
3. **Session existence**: Join requires session METADATA to exist → 404 if not found
4. **Voter existence**: Like requires voter to be a registered participant → 403 if not found
5. **Photo optional**: Empty photoObjectKey allowed — frontend shows default avatar
6. **Pre-signed URL expiry**: 1 hour for both upload (PUT) and read (GET) URLs
7. **ObjectKey non-predictable**: Generated with `crypto.randomBytes(12).toString('hex')`

## CORS Rules
- API Gateway handles preflight OPTIONS with configured origin
- Lambda adds `Access-Control-Allow-Origin` header to all JSON responses
- Both must be synchronized to the frontend domain

## Authentication
- Admin endpoints protected by `adminToken` (not JWT — simple token comparison)
- DELETE accepts token via: body, `admintoken` header, `Authorization: Bearer` header, or `?adminToken=` query param
