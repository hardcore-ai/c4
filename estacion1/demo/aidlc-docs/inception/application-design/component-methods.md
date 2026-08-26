# Component Methods — SkillWall Live

> Note: Detailed business rules will be defined in Functional Design (per-unit, CONSTRUCTION phase).

## C2: Backend — Route Handlers

### POST /upload-url
```
generateUploadUrl(sessionCode: string) → { uploadUrl: string, objectKey: string }
```
- Generates S3 pre-signed PUT URL with session prefix and non-predictable key
- Restricts content type to jpeg/png/webp, max 2MB

### POST /join
```
joinSession(body: { sessionCode, displayName, skills[], photoObjectKey }) → { participantId, displayName, photoUrl, skills[] }
```
- Validates sessionCode exists, displayName non-empty, 3-5 skills from catalog
- Creates participant item in DynamoDB
- Generates pre-signed read URL for photo
- Logs JOIN_CREATED

### GET /wall
```
getWall(sessionCode: string, sort: "new" | "top") → { items: Participant[] }
```
- Queries all participants for session (PK = SESSION#sessionCode, SK begins_with PARTICIPANT#)
- Sorts by createdAt (new) or totalLikes (top)
- Generates pre-signed read URLs for photos

### POST /like
```
castLike(body: { targetParticipantId, skillId, voterId }) → { likeCount: number }
```
- Validates voter is registered participant in session
- Prevents self-vote
- TransactWriteItems: put vote item (idempotency) + update skill likeCount + totalLikes
- Logs LIKE_CAST

### GET /leaderboard
```
getLeaderboard(sessionCode: string) → { topParticipants: LeaderEntry[], topSkills: SkillEntry[] }
```
- Queries all participants, sorts by totalLikes for topParticipants
- Aggregates likes across all participants per skillId for topSkills

### POST /admin/sessions
```
createSession(body: { sessionCode, adminToken }) → { sessionCode, createdAt }
```
- Validates adminToken against env var
- Creates session metadata item (PK=SESSION#code, SK=METADATA)
- Logs SESSION_CREATED

### DELETE /admin/sessions/{sessionCode}
```
deleteSession(sessionCode: string, adminToken: string) → { ok: true }
```
- Validates adminToken
- Queries all items with PK=SESSION#sessionCode
- BatchWriteItem to delete all (participants, votes, metadata)
- Logs SESSION_DELETED

### GET /health
```
healthCheck() → { status: "ok", dynamodb: "ok", timestamp: string }
```
- Verifies Lambda is running, DynamoDB is accessible

---

## C1: Frontend — Key Functions

### Join Flow
```
requestUploadUrl() → { uploadUrl, objectKey }
uploadPhotoToS3(uploadUrl, file) → void
submitJoin(sessionCode, displayName, skills, objectKey) → { participantId, ... }
storeParticipantId(participantId) → void  // localStorage
```

### Wall & Leaderboard
```
fetchWall(sessionCode, sort) → Participant[]  // polling every ~2s
fetchLeaderboard(sessionCode) → { topParticipants, topSkills }  // polling every ~2s
```

### Likes
```
castLike(targetParticipantId, skillId) → { likeCount }  // sends own participantId as voterId
```

### OTel
```
initOtelSdk(config) → void  // auto-instrumentation, web vitals, custom spans
```
