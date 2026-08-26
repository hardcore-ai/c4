# Services — SkillWall Live

## Service Architecture

SkillWall Live uses a simple 2-tier architecture (frontend → backend API) with no service orchestration layer. The backend Lambda acts as both router and service layer.

```
+------------------+     HTTPS/REST      +------------------+
|                  | ------------------> |                  |
|  Frontend        |   (traceparent)     |  Backend Lambda  |
|  (Next.js/Vercel)|                     |  (Node.js 22)   |
|                  | <------------------ |                  |
+------------------+     JSON            +--------+---------+
       |                                          |
       |  S3 pre-signed                  +--------+---------+
       |  upload (PUT)                   |                  |
       +--------------------+            |  DynamoDB        |
                            |            |  (participants)  |
                   +--------v---------+  +------------------+
                   |                  |
                   |  S3 Bucket       |
                   |  (photos)        |
                   +------------------+
```

## Service: Backend Lambda (Router + Handlers)

**Pattern**: Single Lambda with internal router (ADR-005)

**Orchestration**: Each route handler directly accesses DynamoDB/S3 — no intermediate service layer needed given the simplicity of the domain.

| Route | Handler | AWS Services Used |
|---|---|---|
| POST /upload-url | UploadUrlHandler | S3 (pre-signed) |
| POST /join | JoinHandler | DynamoDB (PutItem), S3 (pre-signed read) |
| GET /wall | WallHandler | DynamoDB (Query), S3 (pre-signed read) |
| POST /like | LikeHandler | DynamoDB (TransactWriteItems) |
| GET /leaderboard | LeaderboardHandler | DynamoDB (Query) |
| POST /admin/sessions | AdminCreateHandler | DynamoDB (PutItem) |
| DELETE /admin/sessions/:code | AdminDeleteHandler | DynamoDB (Query + BatchWrite) |
| GET /health | HealthHandler | DynamoDB (DescribeTable) |

## Service: Frontend (Next.js)

**Pattern**: Client-side SPA with App Router, server components for static layout, client components for interactive features.

| Feature | Component Type | Data Source |
|---|---|---|
| Join Form | Client Component | POST /upload-url, POST /join |
| Wall View | Client Component | GET /wall (polling ~2s) |
| Leaderboard | Client Component | GET /leaderboard (polling ~2s) |
| Like Button | Client Component | POST /like |

## Cross-Cutting: OTel Instrumentation

| Layer | Instrumentation |
|---|---|
| Frontend | OTel browser SDK: auto fetch/XHR, custom spans, web vitals → New Relic |
| API Requests | W3C traceparent header propagation |
| Backend | OTel Node SDK: traces per request, RED metrics, structured logs → New Relic OTLP/HTTP |
| API Gateway | Access logs → CloudWatch |
