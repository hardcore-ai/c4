# Units of Work — SkillWall Live

## Unit 1: infra

**Type**: Infrastructure as Code
**Directory**: `/infra`
**Deploy Target**: AWS (terraform apply)
**Runtime**: N/A (declarative)

**Responsibilities**:
- API Gateway HTTP API v2 with CORS, Lambda integration, throttling (5 TPS on join/like)
- Lambda function resource with IAM role and environment variables
- DynamoDB table `participants` (PK/SK, on-demand billing)
- S3 bucket with upload restrictions
- CloudWatch log groups (Lambda, API Gateway access logs)
- Terraform variables for environment (dev/demo/prod)

**Code Organization**:
```
/infra
  main.tf            # Provider, backend config
  variables.tf       # Input variables (env, region, admin token, cors origin, etc.)
  outputs.tf         # API URL, bucket name, table name, Lambda ARN
  api-gateway.tf     # HTTP API, routes, integrations, stage, throttling
  lambda.tf          # Function, IAM role, policies, log group
  dynamodb.tf        # Table definition
  s3.tf              # Bucket, CORS, lifecycle
  cloudwatch.tf      # API Gateway access logs
  terraform.tfvars   # Default values (dev)
```

---

## Unit 2: backend

**Type**: Service (Lambda)
**Directory**: `/backend`
**Deploy Target**: AWS Lambda (bash script + AWS CLI)
**Runtime**: Node.js 22

**Responsibilities**:
- Internal router mapping HTTP method + path to handlers
- 8 route handlers (upload-url, join, wall, like, leaderboard, admin create/delete, health)
- Input validation (displayName, skills, sessionCode, participantId, adminToken)
- DynamoDB operations (PutItem, Query, TransactWriteItems, BatchWriteItem)
- S3 pre-signed URL generation (write + read)
- OTel instrumentation (traces, RED metrics, structured logs with traceId)
- OTLP/HTTP export to New Relic
- Audit event logging (SESSION_CREATED, SESSION_DELETED, JOIN_CREATED, LIKE_CAST, RATE_LIMITED)

**Code Organization**:
```
/backend
  package.json
  tsconfig.json
  esbuild.config.mjs
  src/
    index.ts              # Lambda handler + router
    router.ts             # Route matching logic
    handlers/
      upload-url.ts
      join.ts
      wall.ts
      like.ts
      leaderboard.ts
      admin-create.ts
      admin-delete.ts
      health.ts
    services/
      dynamodb.ts         # DynamoDB client + operations
      s3.ts               # S3 client + pre-signed URL generation
    constants/
      skills.ts           # Skills catalog (shared constant)
    middleware/
      validation.ts       # Input validation utilities
      otel.ts             # OTel setup and instrumentation
      logger.ts           # Structured logging with traceId
    types/
      index.ts            # TypeScript types/interfaces
  tests/
    handlers/
      join.test.ts
      like.test.ts
      wall.test.ts
  scripts/
    deploy.sh             # esbuild → zip → aws lambda update-function-code
```

---

## Unit 3: frontend

**Type**: Web Application
**Directory**: `/frontend`
**Deploy Target**: Vercel
**Runtime**: Next.js 16 (App Router)

**Responsibilities**:
- Join page: form (displayName, photo, skills), upload to S3, submit join
- Wall page: participant cards with photo, name, skills chips, like counts, polling ~2s
- Leaderboard view: top participants, top skills, polling ~2s
- Like interaction: send participantId as voter, handle idempotency response
- localStorage: store/retrieve participantId after join
- OTel browser SDK: auto-instrumentation (fetch/XHR), custom spans, web vitals, export to New Relic
- W3C traceparent propagation on all API requests
- Security headers (CSP, nosniff, frame deny, referrer, permissions)
- Privacy notice ("No subas información sensible")

**Code Organization**:
```
/frontend
  package.json
  next.config.ts
  tailwind.config.ts
  src/
    app/
      layout.tsx          # Root layout, OTel init, security headers
      page.tsx            # Landing / Join page
      wall/
        page.tsx          # Wall + Leaderboard view
    components/
      join-form.tsx       # Join form with photo upload and skill selection
      participant-card.tsx # Wall card component
      leaderboard.tsx     # Leaderboard component
      skill-chip.tsx      # Skill badge with like button
    lib/
      api.ts              # API client with traceparent propagation
      otel.ts             # OTel browser SDK setup
      storage.ts          # localStorage helpers (participantId)
    constants/
      skills.ts           # Skills catalog (shared constant)
    types/
      index.ts            # TypeScript types
  tests/
    e2e/
      join-and-wall.spec.ts   # Playwright E2E
  public/
    default-avatar.png    # Fallback avatar
```
