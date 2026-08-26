# Code Summary — Unit: backend

## Files Generated

| File | Purpose |
|------|---------|
| `backend/package.json` | Node 22, ESM, deps: AWS SDK v3, OTel, Jest |
| `backend/tsconfig.json` | TypeScript ES2022, strict |
| `backend/esbuild.config.mjs` | Bundle to dist/index.js for Lambda |
| `backend/src/index.ts` | Lambda handler + router dispatch |
| `backend/src/router.ts` | Route key from API GW payload 2.0 (method + path) |
| `backend/src/http.ts` | jsonResponse, parseBody, getQuery |
| `backend/src/types/index.ts` | Participant, Skill, JoinBody, LikeBody, etc. |
| `backend/src/constants/skills.ts` | SKILLS_CATALOG (15 items), getSkillName |
| `backend/src/services/dynamodb.ts` | Client, session/participant/vote ops, TransactWrite, BatchWrite |
| `backend/src/services/s3.ts` | Presigned PUT/GET URLs, generateObjectKey |
| `backend/src/middleware/validation.ts` | validateSessionCode, displayName, skills 3–5, photoObjectKey, etc. |
| `backend/src/middleware/logger.ts` | logInfo, logError, getTraceIdFromHeaders |
| `backend/src/middleware/otel.ts` | initOtel, shutdownOtel (OTLP/HTTP New Relic) |
| `backend/src/handlers/upload-url.ts` | POST /upload-url — presigned PUT |
| `backend/src/handlers/join.ts` | POST /join — validate, PutItem participant, photoUrl |
| `backend/src/handlers/wall.ts` | GET /wall — Query participants, sort new/top |
| `backend/src/handlers/like.ts` | POST /like — idempotent vote, TransactWrite |
| `backend/src/handlers/leaderboard.ts` | GET /leaderboard — topParticipants, topSkills |
| `backend/src/handlers/admin-create.ts` | POST /admin/sessions — adminToken, PutItem METADATA |
| `backend/src/handlers/admin-delete.ts` | DELETE /admin/sessions/{sessionCode} — Query + BatchDelete |
| `backend/src/handlers/health.ts` | GET /health — DescribeTable DynamoDB |
| `backend/scripts/deploy.sh` | esbuild → zip → aws lambda update-function-code |
| `backend/tests/handlers/join.test.ts` | Validation: sessionCode, displayName, skills, photoObjectKey |
| `backend/tests/handlers/like.test.ts` | Validation: participantId, skillId |
| `backend/tests/handlers/wall.test.ts` | Router: GET /wall, GET /leaderboard |

## Stories Covered

- US-01 Session Management: admin-create, admin-delete
- US-02 Photo Upload: upload-url (presigned PUT)
- US-03 Join: join handler, validation, DynamoDB PutItem, S3 presigned read
- US-04 Wall: wall handler, Query, sort new/top
- US-05 Likes: like handler, voter validation, idempotent TransactWrite
- US-06 Leaderboard: leaderboard handler, topParticipants, topSkills
- US-07 Health: health handler

## Audit Events (logs)

- SESSION_CREATED, SESSION_DELETED, JOIN_CREATED, LIKE_CAST (traceId when available)
