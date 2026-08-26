# Component Dependencies — SkillWall Live

## Dependency Matrix

| Component | Depends On | Communication |
|---|---|---|
| Frontend | Backend API | HTTPS/REST (JSON), traceparent header |
| Frontend | S3 Bucket | HTTPS PUT (pre-signed upload) |
| Backend | DynamoDB | AWS SDK v3 |
| Backend | S3 | AWS SDK v3 (pre-signed URL generation) |
| Backend | New Relic | OTLP/HTTP (traces, metrics) |
| Infra | — | Provisions all AWS resources |
| Deploy Scripts | Backend (built artifact) | esbuild → zip → AWS CLI |

## Data Flow

```
Participant Join Flow:
  Frontend --POST /upload-url--> Backend --S3 getSignedUrl--> S3
  Frontend --PUT (pre-signed)--> S3
  Frontend --POST /join--> Backend --PutItem--> DynamoDB

Like Flow:
  Frontend --POST /like--> Backend --TransactWriteItems--> DynamoDB
    (put vote item + update participant likeCount + totalLikes)

Wall/Leaderboard Flow:
  Frontend --GET /wall--> Backend --Query--> DynamoDB
  Frontend --GET /leaderboard--> Backend --Query--> DynamoDB

Admin Flow:
  curl --POST /admin/sessions--> Backend --PutItem--> DynamoDB
  curl --DELETE /admin/sessions/:code--> Backend --Query+BatchWrite--> DynamoDB
```

## Deployment Dependencies

```
infra (terraform apply)
  |
  +--> Creates: API Gateway, Lambda, DynamoDB, S3, IAM, CloudWatch
  |
  +--> backend (deploy script)
  |      |
  |      +--> esbuild → zip → aws lambda update-function-code
  |
  +--> frontend (vercel deploy)
         |
         +--> Needs: API Gateway URL (env var NEXT_PUBLIC_API_URL)
```

**Order**: infra → backend → frontend

## Shared Constants

The skills catalog is shared between frontend and backend. Since the repo uses separate folders (not npm workspaces), the catalog will be defined in both:
- `/backend/src/constants/skills.ts`
- `/frontend/src/constants/skills.ts`

Both must be kept in sync manually (acceptable for 15-item static list in a demo).
