# Code Summary — Backend

## Files Generated (17 source + 4 test + 2 config + 1 script)

### Source (`/backend/src/`)
| File | Purpose | Stories |
|---|---|---|
| `index.ts` | Lambda handler, router dispatch, env var loading | All |
| `router.ts` | Route matching (method + path → handler key) | All |
| `http.ts` | JSON response builder, body parser (base64-aware), query parser | All |
| `handlers/upload-url.ts` | Pre-signed PUT URL generation | US-02 |
| `handlers/join.ts` | Participant registration | US-03 |
| `handlers/wall.ts` | Wall query with sort + photo URLs | US-04 |
| `handlers/like.ts` | Vote casting with idempotency | US-05 |
| `handlers/leaderboard.ts` | Top participants + top skills aggregation | US-06 |
| `handlers/admin-create.ts` | Session creation | US-01 |
| `handlers/admin-delete.ts` | Session deletion (batch) | US-01 |
| `handlers/health.ts` | Health check (DynamoDB connectivity) | US-07 |
| `services/dynamodb.ts` | DynamoDB client + all operations | All |
| `services/s3.ts` | S3 client + pre-signed URL generation | US-02, US-03, US-04 |
| `constants/skills.ts` | 15-skill catalog | US-03, US-05 |
| `middleware/validation.ts` | Input validation functions | All |
| `middleware/otel.ts` | OpenTelemetry SDK setup | TS-02 |
| `middleware/logger.ts` | Structured logging with traceId | TS-02 |
| `types/index.ts` | TypeScript interfaces | All |

### Tests (`/backend/tests/`)
| File | Tests | Status |
|---|---|---|
| `handlers/join.test.ts` | Join validation | 35 pass |
| `handlers/like.test.ts` | Like logic | 35 pass |
| `handlers/wall.test.ts` | Wall query | 35 pass |
| `integration/api.integration.test.ts` | Full API integration | 35 pass |

### Config
| File | Purpose |
|---|---|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript config (ESM, strict) |
| `esbuild.config.mjs` | Bundle config (CJS output) |
| `jest.config.js` | Test config (ESM + ts-jest) |
| `scripts/deploy.sh` | Build + zip + Lambda deploy |
