# Integration Test Instructions

## Backend Integration Tests

Included in the backend Jest suite (`tests/integration/api.integration.test.ts`). Tests the full Lambda handler with mocked AWS services.

### Run
```bash
cd backend && nvm use 22 && npx jest tests/integration --verbose
```

### Scenarios Covered
| Scenario | Endpoint | Validates |
|---|---|---|
| Health check OK | GET /health | DynamoDB connectivity |
| Health check degraded | GET /health | Error handling |
| Upload URL generation | POST /upload-url | S3 presigner, sessionCode validation |
| Session creation | POST /admin/sessions | Admin auth, DynamoDB write |
| Session creation unauthorized | POST /admin/sessions | 401 on invalid token |
| Join success | POST /join | Full registration flow |
| Join invalid session | POST /join | 404 on missing session |
| Join invalid skills | POST /join | 400 on <3 skills |
| Wall query | GET /wall | Query + photo URL generation |
| Wall missing session | GET /wall | 400 on missing sessionCode |
| Like success | POST /like | TransactWriteItems |
| Like self-vote | POST /like | 400 self-vote rejection |
| Like invalid voter | POST /like | 403 voter not found |
| Leaderboard | GET /leaderboard | Aggregation logic |
| Session deletion | DELETE /admin/sessions/{code} | Batch delete |
| Session deletion unauthorized | DELETE /admin/sessions/{code} | 401 |
| Unknown route | GET /unknown | 404 |
| CORS header | Any | Access-Control-Allow-Origin |

### Setup
- DynamoDB and S3 mocked with `aws-sdk-client-mock`
- `process.env` set in `setup.ts` (ADMIN_TOKEN, CORS_ORIGIN, table/bucket names)
- S3 presigner mocked to avoid Node 22 dynamic import crash
