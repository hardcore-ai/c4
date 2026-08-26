# Business Logic Model — Backend

## Overview
Single Lambda function with internal router dispatching HTTP requests to 8 handlers. Stateless — all state persisted in DynamoDB and S3.

## Request Flow
```
API Gateway HTTP API → Lambda handler → Router → Handler → DynamoDB/S3 → JSON Response
```

## Handlers

### POST /upload-url
1. Parse body (handle base64 from API GW v2)
2. Validate sessionCode format
3. Generate non-predictable objectKey: `{sessionCode}/{random-hex}.jpg`
4. Create S3 pre-signed PUT URL (1h expiry, restricted to jpeg/png/webp)
5. Return `{ uploadUrl, objectKey }`

### POST /join
1. Parse body, validate sessionCode, displayName (1-200 chars), skills (3-5 from catalog)
2. photoObjectKey optional — empty string allowed for default avatar
3. Verify session exists (GetItem on METADATA)
4. Generate UUID participantId
5. Map skill IDs to `{ skillId, skillName, likeCount: 0 }`
6. PutItem participant record
7. Generate pre-signed GET URL for photo (skip if no photo)
8. Return `{ participantId, displayName, photoUrl, skills }`

### GET /wall
1. Validate sessionCode from query string
2. Query all participants in session (PK = `SESSION#{code}`, SK begins_with `PARTICIPANT#`)
3. Sort by `createdAt` desc (new) or `totalLikes` desc (top)
4. Generate pre-signed GET URLs for each participant's photo
5. Return `{ items: Participant[] }`

### POST /like
1. Validate sessionCode, voterId, targetParticipantId, skillId
2. Reject self-vote (voterId === targetParticipantId → 400)
3. Verify voter exists in session (GetItem → 403 if not found)
4. TransactWriteItems: conditional PutItem vote record + UpdateExpression increment likeCount
5. If transaction fails (vote exists) → idempotent, return current likeCount
6. Return `{ likeCount }`

### GET /leaderboard
1. Validate sessionCode
2. Query all participants
3. Sort by totalLikes desc → topParticipants (top 10)
4. Aggregate likes across all skills → topSkills (top 10)
5. Return `{ topParticipants, topSkills }`

### POST /admin/sessions
1. Validate adminToken from body (compare to env var)
2. PutItem session METADATA record
3. Return `{ sessionCode, createdAt }`

### DELETE /admin/sessions/{sessionCode}
1. Validate adminToken from header, authorization bearer, or query param
2. Query all items in session
3. BatchWriteItem delete all items
4. Return `{ ok: true }`

### GET /health
1. DescribeTable on DynamoDB
2. Return `{ status, dynamodb, timestamp }`
